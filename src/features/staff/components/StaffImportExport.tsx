import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createStaff } from '../services/staff.service';
import { normalizeDate } from '../../../shared/utils/date.utils';
import Button from '../../../shared/components/ui/Button';

const staffTemplate = [
  'firstName,lastName,idNumber,rssbNumber,staffNumber,dateOfBirth,gender,maritalStatus,nationality,phone,email,address,emergencyContactName,emergencyContactPhone,emergencyContactRelationship,startDate,endDate,position,employmentType,department,bankName,accountNumber',
  'John,Doe,123456789012345,RSSB123456,EMP001,01/01/1990,Male,Single,Rwanda,0780123456,john.doe@example.com,123 Main St Kigali,Jane Doe,0780654321,Spouse,01/01/2022,,Manager,Full-time,HR,Bank of Kigali,1234567890123',
  'Alice,Smith,987654321098765,RSSB789012,EMP002,15/03/1985,Female,Married,Uganda,+256701234567,alice.smith@example.com,456 Business Ave Kigali,Bob Smith,+256701987654,Spouse,15/02/2021,,Developer,Full-time,IT,Equity Bank,9876543210987',
  'David,Johnson,456789123456789,RSSB345678,EMP003,22/07/1992,Male,Single,Kenya,254712345678,david.j@example.com,789 Tech Road Kigali,Mary Johnson,254798765432,Mother,10/06/2023,31/12/2023,Consultant,Contract,Finance,KCB Bank,4567891234567'
].join('\n');

const REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'idNumber',
  'rssbNumber',
  'staffNumber',
  'dateOfBirth',
  'gender',
  'maritalStatus',
  'nationality',
  'phone',
  'email',
  'address',
  'emergencyContactName',
  'emergencyContactPhone',
  'emergencyContactRelationship',
  'startDate',
  'position',
  'employmentType',
  'department',
  'bankName',
  'accountNumber',
];

interface ImportHistoryEntry {
  date: string;
  filename: string;
  total: number;
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

const StaffImportExport: React.FC<{ companyId: string; onImported: () => void; staff: any[] }> = ({
  companyId,
  onImported,
  staff,
}) => {
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

  // Enhanced validation for imported rows
  function validateRow(row: any, idx: number, idNumbers: Set<string>, staffNumbers: Set<string>): string | null {
    for (const field of REQUIRED_FIELDS) {
      if (!row[field] || String(row[field]).trim() === '') {
        return `Missing required field "${field}"`;
      }
    }
    // Duplicate ID number in file
    if (idNumbers.has(row.idNumber)) {
      return `Duplicate ID number in file (${row.idNumber})`;
    }
    idNumbers.add(row.idNumber);
    
    // Duplicate staff number in file
    if (staffNumbers.has(row.staffNumber)) {
      return `Duplicate staff number in file (${row.staffNumber})`;
    }
    staffNumbers.add(row.staffNumber);
    // Date format check and conversion (accepts DD/MM/YYYY or YYYY-MM-DD)
    const normalizedDateOfBirth = normalizeDate(row.dateOfBirth);
    if (!normalizedDateOfBirth) {
      return `Invalid dateOfBirth format (expected DD/MM/YYYY or YYYY-MM-DD)`;
    }
    row.dateOfBirth = normalizedDateOfBirth;
    
    const normalizedStartDate = normalizeDate(row.startDate);
    if (!normalizedStartDate) {
      return `Invalid startDate format (expected DD/MM/YYYY or YYYY-MM-DD)`;
    }
    row.startDate = normalizedStartDate;
    
    // End date validation (optional field)
    if (row.endDate && row.endDate.trim() !== '') {
      const normalizedEndDate = normalizeDate(row.endDate);
      if (!normalizedEndDate) {
        return `Invalid endDate format (expected DD/MM/YYYY or YYYY-MM-DD)`;
      }
      row.endDate = normalizedEndDate;
      
      // Validate end date is after start date
      if (new Date(normalizedEndDate) <= new Date(normalizedStartDate)) {
        return `End date must be after start date`;
      }
    }
    
    // Email format check
    if (!/^\S+@\S+\.\S+$/.test(row.email)) {
      return `Invalid email address`;
    }
    // Phone validation (simple number check)
    if (!/^\+?[\d\s\-\(\)]+$/.test(row.phone.toString().trim())) {
      return `Invalid phone number format`;
    }
    
    // Emergency contact phone validation
    if (!/^\+?[\d\s\-\(\)]+$/.test(row.emergencyContactPhone.toString().trim())) {
      return `Invalid emergency contact phone number format`;
    }
    
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
        const idNumbers = new Set<string>();
        const staffNumbers = new Set<string>();
        const errors: { row: number; error: string }[] = [];
        setImportProgress({ processed: 0, total: rows.length });
        let success = 0;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const validationError = validateRow(row, i, idNumbers, staffNumbers);
          if (validationError) {
            errors.push({ row: i + 2, error: validationError });
            setRowErrors([...errors]);
            setImportProgress(p => ({ ...p, processed: i + 1 }));
            continue;
          }
          try {
            // Transform CSV data to match service interface
            const transformedData = {
              staffNumber: row.staffNumber,
              name: `${row.firstName} ${row.lastName}`.trim(),
              email: row.email,
              phone: row.phone,
              position: row.position,
              department: row.department,
              startDate: row.startDate,
              endDate: row.endDate || undefined,
              status: 'active' as const,
              // Keep all original fields for backward compatibility
              ...row,
              // Combine emergency contact fields for backward compatibility
              emergencyContact: `${row.emergencyContactName} (${row.emergencyContactRelationship}) - ${row.emergencyContactPhone}`
            };
            const result = await createStaff({ companyId, data: transformedData });
            if (!result.success) {
              throw new Error(result.error || 'Failed to create staff');
            }
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
    const csv = Papa.unparse(staff);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  // Download template
  const handleTemplate = () => {
    const blob = new Blob([staffTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'staff_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="staff-import-export">
      <h4>Import/Export Staff</h4>
      <div className="staff-import-row" role="group" aria-label="Import/Export Actions">
        <label htmlFor="staff-import-file" className="visually-hidden">
          Import Staff CSV
        </label>
        <input
          id="staff-import-file"
          type="file"
          accept=".csv"
          ref={fileInput}
          onChange={handleImport}
          disabled={importing}
          aria-busy={importing}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleExport}
          disabled={exporting || staff.length === 0}
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
        <div className="staff-import-progress" aria-live="polite">
          Importing: {importProgress.processed} / {importProgress.total}
        </div>
      )}
      {error && (
        <div className="staff-import-error" role="alert">
          {error}
        </div>
      )}
      {rowErrors.length > 0 && (
        <div className="staff-import-row-errors">
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
        <div className="staff-import-history">
          <h5>Import History</h5>
          {importHistory.length === 0 ? (
            <div>No imports yet.</div>
          ) : (
            <table className="staff-import-history-table">
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

export default StaffImportExport;
