import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createDeduction } from '../services/deductions.service';

const deductionTemplate = [
  'type,amount,staff_id,balance',
  'Loan,100000,EMP001,50000',
  'Tax,20000,EMP002,0',
].join('\n');

const REQUIRED_FIELDS = ['type', 'amount', 'staff_id', 'balance'];

interface ImportHistoryEntry {
  date: string;
  filename: string;
  total: number;
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

const DeductionsImportExport: React.FC<{
  companyId: string;
  onImported: () => void;
  deductions: any[];
}> = ({ companyId, onImported, deductions }) => {
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

  function validateRow(row: any, idx: number, staffTypeSet: Set<string>): string | null {
    for (const field of REQUIRED_FIELDS) {
      if (!row[field] || String(row[field]).trim() === '') {
        return `Missing required field "${field}"`;
      }
    }
    // Amount and balance must be numbers
    if (isNaN(Number(row.amount)) || Number(row.amount) < 0) {
      return `Invalid amount (must be a non-negative number)`;
    }
    if (isNaN(Number(row.balance)) || Number(row.balance) < 0) {
      return `Invalid balance (must be a non-negative number)`;
    }
    // Duplicate deduction for staff_id and type in file
    const key = row.staff_id + '-' + row.type;
    if (staffTypeSet.has(key)) {
      return `Duplicate deduction for staff_id ${row.staff_id} and type ${row.type}`;
    }
    staffTypeSet.add(key);
    return null;
  }

  // Import CSV with validation and progress
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
        const staffTypeSet = new Set<string>();
        const errors: { row: number; error: string }[] = [];
        setImportProgress({ processed: 0, total: rows.length });
        let success = 0;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const validationError = validateRow(row, i, staffTypeSet);
          if (validationError) {
            errors.push({ row: i + 2, error: validationError });
            setRowErrors([...errors]);
            setImportProgress(p => ({ ...p, processed: i + 1 }));
            continue;
          }
          try {
            await createDeduction(companyId, row);
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
    const csv = Papa.unparse(deductions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deductions_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  // Download template
  const handleTemplate = () => {
    const blob = new Blob([deductionTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'deductions_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="deductions-import-export">
      <h4>Import/Export Deductions</h4>
      <div className="deductions-import-row">
        <input
          type="file"
          accept=".csv"
          ref={fileInput}
          onChange={handleImport}
          disabled={importing}
        />
        <button
          className="deductions-import-btn"
          onClick={handleExport}
          disabled={exporting || deductions.length === 0}
        >
          Export CSV
        </button>
        <button className="deductions-import-btn" onClick={handleTemplate}>
          Download Template
        </button>
        <button className="deductions-import-btn" onClick={() => setShowHistory(h => !h)}>
          Import History
        </button>
      </div>
      {importing && (
        <div className="deductions-import-progress">
          <span>
            Importing: {importProgress.processed} / {importProgress.total}
          </span>
        </div>
      )}
      {error && <div className="deductions-import-error">{error}</div>}
      {rowErrors.length > 0 && (
        <div className="deductions-import-row-errors">
          <b>Row Errors:</b>
          <ul>
            {rowErrors.map((e, i) => (
              <li key={i} style={{ color: 'crimson' }}>
                Row {e.row}: {e.error}
              </li>
            ))}
          </ul>
        </div>
      )}
      {showHistory && (
        <div className="deductions-import-history">
          <h5>Import History</h5>
          {importHistory.length === 0 ? (
            <div>No imports yet.</div>
          ) : (
            <table className="deductions-import-history-table">
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
                              <li key={j} style={{ color: 'crimson' }}>
                                Row {e.row}: {e.error}
                              </li>
                            ))}
                          </ul>
                        </details>
                      ) : (
                        <span style={{ color: 'green' }}>OK</span>
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

export default DeductionsImportExport;
