import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createPayment } from '../services/payments.service';
import { normalizeDate } from '../../../shared/utils/date.utils';
import { isValidBoolean, parseBoolean, createBooleanValidationError, createNumberValidationError } from '../../../shared/utils/import-validation';
import Button from '../../../shared/components/ui/Button';

const paymentTemplate = [
  'staff_id,basic_salary_amount,basic_salary_gross,basic_salary_recurring,transport_allowance_amount,transport_allowance_gross,transport_allowance_recurring,overtime_allowance_amount,overtime_allowance_gross,overtime_allowance_recurring,housing_allowance_amount,housing_allowance_gross,housing_allowance_recurring,medical_allowance_amount,medical_allowance_gross,medical_allowance_recurring,performance_bonus_amount,performance_bonus_gross,performance_bonus_recurring,commission_amount,commission_gross,commission_recurring,effective_date,end_date,status',
  'EMP001,500000,true,true,50000,false,true,25000,false,false,100000,false,true,50000,false,true,0,false,false,0,false,false,01/07/2025,,active',
  'EMP002,600000,true,true,50000,false,true,0,false,false,0,false,false,0,false,false,100000,false,false,75000,false,false,01/07/2025,,active',
  'EMP003,450000,true,true,50000,false,true,30000,false,false,80000,false,true,30000,false,true,50000,false,false,25000,false,false,01/07/2025,,active',
  '',
  '# Instructions:',
  '# 1. Required columns: staff_id, basic_salary_amount, basic_salary_gross, basic_salary_recurring, transport_allowance_amount, transport_allowance_gross, transport_allowance_recurring, effective_date, status',
  '# 2. For any other allowances, add three columns: [allowance_name]_amount, [allowance_name]_gross, [allowance_name]_recurring',
  '# 3. Example: housing_allowance_amount, housing_allowance_gross, housing_allowance_recurring',
  '# 4. You can add as many allowances as needed - just follow the pattern: [name]_amount, [name]_gross, [name]_recurring',
  '# 5. Set amount to 0 if staff member does not receive that allowance',
  '# 6. Boolean columns (gross, recurring): Use TRUE/FALSE, true/false, yes/no, or 1/0',
  '# 7. gross: true = gross pay, false = net pay',
  '# 8. recurring: true = monthly recurring payment, false = one-time payment',
  '# 9. All allowances except basic_salary and transport_allowance are treated as "other allowances" in tax calculations',
].join('\n');

const REQUIRED_FIELDS = ['staff_id', 'basic_salary_amount', 'basic_salary_gross', 'basic_salary_recurring', 'transport_allowance_amount', 'transport_allowance_gross', 'transport_allowance_recurring', 'effective_date', 'status'];

// Helper function to detect allowance columns dynamically
function detectAllowanceColumns(headers: string[]): string[] {
  const allowanceTypes = new Set<string>();
  
  headers.forEach(header => {
    if (header.endsWith('_amount') && header !== 'basic_salary_amount' && header !== 'transport_allowance_amount') {
      const allowanceType = header.replace('_amount', '');
      allowanceTypes.add(allowanceType);
    }
  });
  
  return Array.from(allowanceTypes);
}


interface ImportHistoryEntry {
  date: string;
  filename: string;
  total: number;
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

const PaymentsImportExport: React.FC<{
  companyId: string;
  onImported: () => void;
  payments: any[];
}> = ({ companyId, onImported, payments }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ processed: number; total: number }>({
    processed: 0,
    total: 0,
  });
  const [rowErrors, setRowErrors] = useState<{ row: number; error: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportHistoryEntry[]>([]);

  function validateRow(row: any, idx: number, staffIds: Set<string>, headers: string[]): string | null {
    // Check required fields
    for (const field of REQUIRED_FIELDS) {
      if (!row[field] || String(row[field]).trim() === '') {
        return `Missing required field "${field}"`;
      }
    }
    
    // Validate status
    if (row.status !== 'active' && row.status !== 'inactive') {
      return `status must be either 'active' or 'inactive'`;
    }
    
    // Date format check and conversion (accepts DD/MM/YYYY or YYYY-MM-DD)
    const normalizedEffectiveDate = normalizeDate(row.effective_date);
    if (!normalizedEffectiveDate) {
      return `Invalid effective_date format (expected DD/MM/YYYY or YYYY-MM-DD)`;
    }
    row.effective_date = normalizedEffectiveDate;
    
    // end_date is optional but if provided, validate format
    if (row.end_date && row.end_date.trim()) {
      const normalizedEndDate = normalizeDate(row.end_date);
      if (!normalizedEndDate) {
        return `Invalid end_date format (expected DD/MM/YYYY or YYYY-MM-DD)`;
      }
      row.end_date = normalizedEndDate;
    }
    
    // Validate basic salary and transport allowance (required)
    const basicSalaryAmount = Number(row.basic_salary_amount);
    if (isNaN(basicSalaryAmount) || basicSalaryAmount <= 0) {
      return createNumberValidationError('basic_salary_amount', row.basic_salary_amount, 'must be positive');
    }
    if (!isValidBoolean(row.basic_salary_gross)) {
      return createBooleanValidationError('basic_salary_gross', row.basic_salary_gross);
    }
    if (!isValidBoolean(row.basic_salary_recurring)) {
      return createBooleanValidationError('basic_salary_recurring', row.basic_salary_recurring);
    }
    
    const transportAmount = Number(row.transport_allowance_amount);
    if (isNaN(transportAmount) || transportAmount < 0) {
      return createNumberValidationError('transport_allowance_amount', row.transport_allowance_amount, 'must be non-negative');
    }
    if (!isValidBoolean(row.transport_allowance_gross)) {
      return createBooleanValidationError('transport_allowance_gross', row.transport_allowance_gross);
    }
    if (!isValidBoolean(row.transport_allowance_recurring)) {
      return createBooleanValidationError('transport_allowance_recurring', row.transport_allowance_recurring);
    }
    
    // Dynamically validate other allowances
    const allowanceTypes = detectAllowanceColumns(headers);
    for (const allowanceType of allowanceTypes) {
      const amountField = `${allowanceType}_amount`;
      const grossField = `${allowanceType}_gross`;
      const recurringField = `${allowanceType}_recurring`;
      
      if (row[amountField] && row[amountField] !== '0') {
        const amount = Number(row[amountField]);
        if (isNaN(amount) || amount <= 0) {
          return createNumberValidationError(amountField, row[amountField], 'must be positive');
        }
        
        // Check gross flag
        if (!isValidBoolean(row[grossField])) {
          return createBooleanValidationError(grossField, row[grossField]);
        }
        
        // Check recurring flag
        if (!isValidBoolean(row[recurringField])) {
          return createBooleanValidationError(recurringField, row[recurringField]);
        }
      }
    }
    
    // Check for duplicate staff_id for same date in file
    const key = row.staff_id + '-' + row.effective_date;
    if (staffIds.has(key)) {
      return `Duplicate entry for staff_id ${row.staff_id} on ${row.effective_date}`;
    }
    staffIds.add(key);
    return null;
  }

  // Import CSV with validation and progress
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {return;}
    setImporting(true);
    setError(null);
    setRowErrors([]);
    setImportProgress({ processed: 0, total: 0 });
    const filename = file.name;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async results => {
        const rows = results.data as any[];
        const headers = Object.keys(rows[0] || {});
        const staffIds = new Set<string>();
        const errors: { row: number; error: string }[] = [];
        setImportProgress({ processed: 0, total: rows.length });
        let success = 0;
        
        // Detect allowance columns dynamically
        const allowanceTypes = detectAllowanceColumns(headers);
        
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const validationError = validateRow(row, i, staffIds, headers);
          if (validationError) {
            errors.push({ row: i + 2, error: validationError });
            setRowErrors([...errors]);
            setImportProgress(p => ({ ...p, processed: i + 1 }));
            continue;
          }
          try {
            // Create multiple payment records from single staff row
            const paymentPromises = [];
            
            // Process basic salary (required)
            const basicSalaryAmount = parseFloat(row.basic_salary_amount);
            if (basicSalaryAmount > 0) {
              const paymentData = {
                companyId,
                type: 'basic_salary' as const,
                amount: basicSalaryAmount,
                staffId: row.staff_id,
                isGross: parseBoolean(row.basic_salary_gross),
                isRecurring: parseBoolean(row.basic_salary_recurring),
                effectiveDate: row.effective_date,
                endDate: row.end_date && row.end_date.trim() ? row.end_date : undefined,
                description: 'Basic salary payment',
                status: row.status || 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              paymentPromises.push(createPayment(companyId, paymentData));
            }
            
            // Process transport allowance (required)
            const transportAmount = parseFloat(row.transport_allowance_amount);
            if (transportAmount > 0) {
              const paymentData = {
                companyId,
                type: 'transport_allowance' as const,
                amount: transportAmount,
                staffId: row.staff_id,
                isGross: parseBoolean(row.transport_allowance_gross),
                isRecurring: parseBoolean(row.transport_allowance_recurring),
                effectiveDate: row.effective_date,
                endDate: row.end_date && row.end_date.trim() ? row.end_date : undefined,
                description: 'Transport allowance payment',
                status: row.status || 'active',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              paymentPromises.push(createPayment(companyId, paymentData));
            }
            
            // Process other allowances dynamically
            for (const allowanceType of allowanceTypes) {
              const amountField = `${allowanceType}_amount`;
              const grossField = `${allowanceType}_gross`;
              const recurringField = `${allowanceType}_recurring`;
              
              if (row[amountField] && row[amountField] !== '0') {
                const amount = parseFloat(row[amountField]);
                if (amount > 0) {
                  const paymentData = {
                    companyId,
                    type: 'other_allowance' as const,
                    amount: amount,
                    staffId: row.staff_id,
                    isGross: parseBoolean(row[grossField]),
                    isRecurring: parseBoolean(row[recurringField]),
                    effectiveDate: row.effective_date,
                    endDate: row.end_date && row.end_date.trim() ? row.end_date : undefined,
                    description: `${allowanceType.replace(/_/g, ' ')} payment`,
                    status: row.status || 'active',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  paymentPromises.push(createPayment(companyId, paymentData));
                }
              }
            }
            
            await Promise.all(paymentPromises);
            success++;
          } catch (err: unknown) {
            errors.push({ row: i + 2, error: (err as Error).message || 'Import failed' });
            setRowErrors([...errors]);
          }
          setImportProgress(p => ({ ...p, processed: i + 1 }));
        }
        setRowErrors(errors);
        setImporting(false);
        setImportHistory(hist => [
          {
            date: new Date().toLocaleString(),
            filename,
            total: rows.length,
            success,
            failed: errors.length,
            errors,
          },
          ...hist,
        ]);
        if (errors.length === 0) {
          onImported();
        } else {
          setError('Some rows failed to import. See details below.');
        }
      },
      error: err => {
        setError((err as Error).message || 'CSV parse error');
        setImporting(false);
      },
    });
  };

  // Export CSV
  const handleExport = () => {
    setExporting(true);
    
    // Get all unique payment types to create dynamic columns
    const allPaymentTypes = Array.from(new Set(payments.map(p => p.type)));
    
    // Group payments by staff member
    const paymentsByStaff = payments.reduce((acc: Record<string, any>, payment) => {
      const staffId = payment.staffId;
      if (!acc[staffId]) {
        // Initialize with basic required fields
        acc[staffId] = {
          staff_id: staffId,
          basic_salary_amount: 0,
          basic_salary_gross: false,
          basic_salary_recurring: false,
          transport_allowance_amount: 0,
          transport_allowance_gross: false,
          transport_allowance_recurring: false,
          effective_date: payment.effectiveDate,
          end_date: payment.endDate || '',
          status: payment.status
        };
        
        // Initialize all other payment types found in the data
        allPaymentTypes.forEach(type => {
          if (type !== 'basic_salary' && type !== 'transport_allowance') {
            acc[staffId][`${type}_amount`] = 0;
            acc[staffId][`${type}_gross`] = false;
            acc[staffId][`${type}_recurring`] = false;
          }
        });
      }
      
      // Add payment amount, gross flag, and recurring flag for this payment type
      const amountField = `${payment.type}_amount`;
      const grossField = `${payment.type}_gross`;
      const recurringField = `${payment.type}_recurring`;
      acc[staffId][amountField] = payment.amount;
      acc[staffId][grossField] = payment.isGross;
      acc[staffId][recurringField] = payment.isRecurring;
      
      return acc;
    }, {});
    
    // Convert to array for CSV export
    const exportData = Object.values(paymentsByStaff);
    
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  // Download template
  const handleTemplate = () => {
    const blob = new Blob([paymentTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payments_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="payments-import-export">
      <h4>Import/Export Payments</h4>
      <div className="payments-import-row">
        <input
          type="file"
          accept=".csv"
          ref={fileInput}
          onChange={handleImport}
          disabled={importing}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleExport}
          disabled={exporting || payments.length === 0}
          loading={exporting}
        >
          Export CSV
        </Button>
        <Button variant="secondary" size="sm" onClick={handleTemplate}>
          Download Template
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowHistory(h => !h)}
        >
          Import History
        </Button>
      </div>
      {importing && (
        <div className="payments-import-progress">
          <span>
            Importing: {importProgress.processed} / {importProgress.total}
          </span>
        </div>
      )}
      {error && <div className="payments-import-error">{error}</div>}
      {rowErrors.length > 0 && (
        <div className="payments-import-row-errors">
          <b>Row Errors:</b>
          <ul>
            {rowErrors.map((e, i) => (
              <li key={i} style={{ color: 'var(--color-error-text)' }}>
                Row {e.row}: {e.error}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showHistory && (
        <div className="payments-import-history">
          <h5>Import History</h5>
          {importHistory.length === 0 ? (
            <div>No imports yet.</div>
          ) : (
            <table className="payments-import-history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>File</th>
                  <th>Total</th>
                  <th>Success</th>
                  <th>Failed</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {importHistory.map((h, i) => (
                  <tr key={i}>
                    <td>{h.date}</td>
                    <td>{h.filename}</td>
                    <td>{h.total}</td>
                    <td style={{ color: h.failed === 0 ? 'green' : undefined }}>{h.success}</td>
                    <td style={{ color: h.failed > 0 ? 'crimson' : undefined }}>{h.failed}</td>
                    <td>
                      {h.errors.length > 0 ? (
                        <details>
                          <summary>View</summary>
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {h.errors.map((e, j) => (
                              <li key={j} style={{ color: 'var(--color-error-text)' }}>
                                Row {e.row}: {e.error}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <span style={{ color: 'var(--color-success-text)' }}>OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default PaymentsImportExport;
