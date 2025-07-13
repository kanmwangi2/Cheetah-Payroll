import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createPayment } from '../services/payments.service';
import { normalizeDate } from '../../../shared/utils/date.utils';
import Button from '../../../shared/components/ui/Button';

const paymentTemplate = [
  'type,amount,staff_id,is_gross,is_recurring,effective_date,end_date,description,status',
  'basic_salary,500000,EMP001,true,true,01/07/2025,,Monthly basic salary,active',
  'transport_allowance,50000,EMP001,false,true,01/07/2025,,Transport allowance,active',
  'bonus,100000,EMP002,false,false,01/07/2025,31/07/2025,Performance bonus,active',
].join('\n');

const REQUIRED_FIELDS = ['type', 'amount', 'staff_id', 'is_gross', 'is_recurring', 'effective_date', 'status'];

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

  function validateRow(row: any, idx: number, staffIds: Set<string>): string | null {
    for (const field of REQUIRED_FIELDS) {
      if (!row[field] || String(row[field]).trim() === '') {
        return `Missing required field "${field}"`;
      }
    }
    // Amount must be a positive number
    if (isNaN(Number(row.amount)) || Number(row.amount) <= 0) {
      return `Invalid amount (must be positive number)`;
    }
    // is_gross must be true/false
    if (
      !(row.is_gross === 'true' || row.is_gross === 'false' || typeof row.is_gross === 'boolean')
    ) {
      return `is_gross must be true or false`;
    }
    // is_recurring must be true/false
    if (
      !(row.is_recurring === 'true' || row.is_recurring === 'false' || typeof row.is_recurring === 'boolean')
    ) {
      return `is_recurring must be true or false`;
    }
    // status must be active or inactive
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
    
    // Duplicate staff_id for same date in file
    const key = row.staff_id + '-' + row.effective_date;
    if (staffIds.has(key)) {
      return `Duplicate payment for staff_id ${row.staff_id} on ${row.effective_date}`;
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
        const staffIds = new Set<string>();
        const errors: { row: number; error: string }[] = [];
        setImportProgress({ processed: 0, total: rows.length });
        let success = 0;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const validationError = validateRow(row, i, staffIds);
          if (validationError) {
            errors.push({ row: i + 2, error: validationError });
            setRowErrors([...errors]);
            setImportProgress(p => ({ ...p, processed: i + 1 }));
            continue;
          }
          try {
            // Transform row data to match Payment interface
            const paymentData = {
              companyId,
              type: row.type,
              amount: parseFloat(row.amount),
              staffId: row.staff_id,
              isGross: row.is_gross === 'true' || row.is_gross === true,
              isRecurring: row.is_recurring === 'true' || row.is_recurring === true,
              effectiveDate: row.effective_date,
              endDate: row.end_date && row.end_date.trim() ? row.end_date : undefined,
              description: row.description && row.description.trim() ? row.description : undefined,
              status: row.status || 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await createPayment(companyId, paymentData);
            success++;
          } catch (err: any) {
            errors.push({ row: i + 2, error: err.message || 'Import failed' });
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
        setError(err.message || 'CSV parse error');
        setImporting(false);
      },
    });
  };

  // Export CSV
  const handleExport = () => {
    setExporting(true);
    // Transform payments data to match import template format
    const exportData = payments.map(payment => ({
      type: payment.type,
      amount: payment.amount,
      staff_id: payment.staffId,
      is_gross: payment.isGross,
      is_recurring: payment.isRecurring,
      effective_date: payment.effectiveDate,
      end_date: payment.endDate || '',
      description: payment.description || '',
      status: payment.status
    }));
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
