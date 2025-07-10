import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createPayroll } from '../payroll';

const payrollTemplate = [
  'gross,basic,transport,otherDeductions',
  '500000,300000,50000,20000',
  '400000,250000,40000,10000',
].join('\n');

const REQUIRED_FIELDS = ['gross', 'basic', 'transport', 'otherDeductions'];

interface ImportHistoryEntry {
  date: string;
  filename: string;
  total: number;
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

const PayrollImportExport: React.FC<{ companyId: string; onImported: () => void; payrolls: any[] }> = ({ companyId, onImported, payrolls }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ processed: number; total: number }>({ processed: 0, total: 0 });
  const [rowErrors, setRowErrors] = useState<{ row: number; error: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [importHistory, setImportHistory] = useState<ImportHistoryEntry[]>([]);

  function validateRow(row: any, idx: number, grossSet: Set<string>): string | null {
    for (const field of REQUIRED_FIELDS) {
      if (!row[field] || String(row[field]).trim() === '') {
        return `Missing required field "${field}"`;
      }
    }
    // Numeric checks
    if (isNaN(Number(row.gross)) || Number(row.gross) <= 0) {
      return `Invalid gross (must be positive number)`;
    }
    if (isNaN(Number(row.basic)) || Number(row.basic) < 0) {
      return `Invalid basic (must be non-negative number)`;
    }
    if (isNaN(Number(row.transport)) || Number(row.transport) < 0) {
      return `Invalid transport (must be non-negative number)`;
    }
    if (isNaN(Number(row.otherDeductions)) || Number(row.otherDeductions) < 0) {
      return `Invalid otherDeductions (must be non-negative number)`;
    }
    // Duplicate gross+basic+transport+otherDeductions in file
    const key = `${row.gross}-${row.basic}-${row.transport}-${row.otherDeductions}`;
    if (grossSet.has(key)) {
      return `Duplicate payroll row in file`;
    }
    grossSet.add(key);
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
      complete: async (results) => {
        const rows = results.data as any[];
        const grossSet = new Set<string>();
        const errors: { row: number; error: string }[] = [];
        setImportProgress({ processed: 0, total: rows.length });
        let success = 0;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const validationError = validateRow(row, i, grossSet);
          if (validationError) {
            errors.push({ row: i + 2, error: validationError });
            setRowErrors([...errors]);
            setImportProgress((p) => ({ ...p, processed: i + 1 }));
            continue;
          }
          try {
            await createPayroll(companyId, row);
            success++;
          } catch (err: any) {
            errors.push({ row: i + 2, error: err.message || 'Import failed' });
            setRowErrors([...errors]);
          }
          setImportProgress((p) => ({ ...p, processed: i + 1 }));
        }
        setRowErrors(errors);
        setImporting(false);
        setImportHistory((hist) => [
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
      error: (err) => {
        setError(err.message || 'CSV parse error');
        setImporting(false);
      },
    });
  };

  // Export CSV
  const handleExport = () => {
    setExporting(true);
    const csv = Papa.unparse(payrolls);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payrolls_export.csv';
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  // Download template
  const handleTemplate = () => {
    const blob = new Blob([payrollTemplate], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payrolls_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="payroll-import-export">
      <h4>Import/Export Payrolls</h4>
      <div className="payroll-import-row">
        <input
          type="file"
          accept=".csv"
          ref={fileInput}
          onChange={handleImport}
          disabled={importing}
        />
        <button
          className="payroll-import-btn"
          onClick={handleExport}
          disabled={exporting || payrolls.length === 0}
        >
          Export CSV
        </button>
        <button className="payroll-import-btn" onClick={handleTemplate}>
          Download Template
        </button>
        <button
          className="payroll-import-btn"
          onClick={() => setShowHistory((h) => !h)}
        >
          Import History
        </button>
      </div>
      {importing && (
        <div className="payroll-import-progress">
          <span>Importing: {importProgress.processed} / {importProgress.total}</span>
        </div>
      )}
      {error && <div className="payroll-import-error">{error}</div>}
      {rowErrors.length > 0 && (
        <div className="payroll-import-row-errors">
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
        <div className="payroll-import-history">
          <h5>Import History</h5>
          {importHistory.length === 0 ? (
            <div>No imports yet.</div>
          ) : (
            <table className="payroll-import-history-table">
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

export default PayrollImportExport;
