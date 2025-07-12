import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createStaff } from '../services/staff.service';

const staffTemplate = [
  'firstName,lastName,idNumber,rssbNumber,dateOfBirth,gender,maritalStatus,phone,email,address,emergencyContact,startDate,position,employmentType,department,bankName,accountNumber',
  'John,Doe,123456789,RSSB123,1990-01-01,male,single,0780000000,john@example.com,123 Main St,Jane Doe,2022-01-01,Manager,Full-time,HR,Bank of Kigali,1234567890',
].join('\n');

const REQUIRED_FIELDS = [
  'firstName',
  'lastName',
  'idNumber',
  'rssbNumber',
  'dateOfBirth',
  'gender',
  'maritalStatus',
  'phone',
  'email',
  'address',
  'emergencyContact',
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
  function validateRow(row: any, idx: number, idNumbers: Set<string>): string | null {
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
    // Date format check (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.dateOfBirth)) {
      return `Invalid dateOfBirth format (expected YYYY-MM-DD)`;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.startDate)) {
      return `Invalid startDate format (expected YYYY-MM-DD)`;
    }
    // Email format check
    if (!/^\S+@\S+\.\S+$/.test(row.email)) {
      return `Invalid email address`;
    }
    // Phone format (Rwanda: 07XXXXXXXX)
    if (!/^07\d{8}$/.test(row.phone)) {
      return `Invalid phone number (expected 07XXXXXXXX)`;
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
        const errors: { row: number; error: string }[] = [];
        setImportProgress({ processed: 0, total: rows.length });
        let success = 0;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const validationError = validateRow(row, i, idNumbers);
          if (validationError) {
            errors.push({ row: i + 2, error: validationError });
            setRowErrors([...errors]);
            setImportProgress(p => ({ ...p, processed: i + 1 }));
            continue;
          }
          try {
            await createStaff({ companyId, data: row });
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
        <button
          className="staff-import-btn"
          onClick={handleExport}
          disabled={exporting || staff.length === 0}
          aria-disabled={exporting || staff.length === 0}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
        <button className="staff-import-btn" onClick={handleTemplate}>
          Download Template
        </button>
        <button
          className="staff-import-btn"
          onClick={() => setShowHistory(h => !h)}
          aria-pressed={showHistory}
        >
          Import History
        </button>
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
