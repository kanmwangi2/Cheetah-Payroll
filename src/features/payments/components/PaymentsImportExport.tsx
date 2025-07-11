import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createPayment } from '../services/payments.service';

const paymentTemplate = [
  'type,amount,staff_id,is_gross,effective_date',
  'Salary,500000,EMP001,true,2025-07-01',
  'Bonus,100000,EMP002,false,2025-07-01',
].join('\n');

const REQUIRED_FIELDS = ['type', 'amount', 'staff_id', 'is_gross', 'effective_date'];

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
    // Date format check (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.effective_date)) {
      return `Invalid effective_date format (expected YYYY-MM-DD)`;
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
            await createPayment(companyId, row);
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
    const csv = Papa.unparse(payments);
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
        <button
          className="payments-import-btn"
          onClick={handleExport}
          disabled={exporting || payments.length === 0}
        >
          Export CSV
        </button>
        <button className="payments-import-btn" onClick={handleTemplate}>
          Download Template
        </button>
        <button className="payments-import-btn" onClick={() => setShowHistory(h => !h)}>
          Import History
        </button>
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
              <li key={i} style={{ color: 'crimson' }}>
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

export default PaymentsImportExport;
