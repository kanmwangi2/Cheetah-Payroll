import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createPayroll } from '../services/payroll.service';
import Button from '../../../shared/components/ui/Button';

const payrollTemplate = [
  'period,status,totalGrossPay,totalNetPay,totalEmployeeTax,staffCount,createdBy',
  '2023-01,draft,5000000,4000000,500000,10,admin@company.com',
  '2023-02,approved,5200000,4100000,520000,10,admin@company.com',
  '2023-03,processed,5100000,4050000,510000,12,hr@company.com',
].join('\n');

const REQUIRED_FIELDS = ['period', 'status', 'totalGrossPay', 'totalNetPay', 'staffCount', 'createdBy'];

interface ImportHistoryEntry {
  date: string;
  filename: string;
  total: number;
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

const PayrollImportExport: React.FC<{
  companyId: string;
  onImported: () => void;
  payrolls: any[];
}> = ({ companyId, onImported, payrolls }) => {
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

  function validateRow(row: any, idx: number, periodSet: Set<string>): string | null {
    for (const field of REQUIRED_FIELDS) {
      if (!row[field] || String(row[field]).trim() === '') {
        return `Missing required field "${field}"`;
      }
    }
    // Status validation
    if (!['draft', 'pending_approval', 'approved', 'processed'].includes(row.status)) {
      return `Invalid status (must be: draft, pending_approval, approved, or processed)`;
    }
    // Numeric checks
    if (isNaN(Number(row.totalGrossPay)) || Number(row.totalGrossPay) <= 0) {
      return `Invalid totalGrossPay (must be positive number)`;
    }
    if (isNaN(Number(row.totalNetPay)) || Number(row.totalNetPay) < 0) {
      return `Invalid totalNetPay (must be non-negative number)`;
    }
    if (row.totalEmployeeTax && (isNaN(Number(row.totalEmployeeTax)) || Number(row.totalEmployeeTax) < 0)) {
      return `Invalid totalEmployeeTax (must be non-negative number)`;
    }
    if (isNaN(Number(row.staffCount)) || Number(row.staffCount) <= 0) {
      return `Invalid staffCount (must be positive number)`;
    }
    // Duplicate period in file
    if (periodSet.has(row.period)) {
      return `Duplicate period ${row.period} in file`;
    }
    periodSet.add(row.period);
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
        const periodSet = new Set<string>();
        const errors: { row: number; error: string }[] = [];
        setImportProgress({ processed: 0, total: rows.length });
        let success = 0;
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const validationError = validateRow(row, i, periodSet);
          if (validationError) {
            errors.push({ row: i + 2, error: validationError });
            setRowErrors([...errors]);
            setImportProgress(p => ({ ...p, processed: i + 1 }));
            continue;
          }
          try {
            // Transform row data to match Payroll interface
            const payrollData = {
              companyId,
              period: row.period,
              status: row.status as 'draft' | 'pending_approval' | 'approved' | 'processed',
              totalGrossPay: parseFloat(row.totalGrossPay),
              totalNetPay: parseFloat(row.totalNetPay),
              totalEmployeeTax: row.totalEmployeeTax ? parseFloat(row.totalEmployeeTax) : 0,
              totalEmployerContributions: row.totalEmployerContributions ? parseFloat(row.totalEmployerContributions) : 0,
              staffCount: parseInt(row.staffCount, 10),
              createdBy: row.createdBy,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await createPayroll(companyId, payrollData);
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
        <Button
          variant="primary"
          size="sm"
          onClick={handleExport}
          disabled={exporting || payrolls.length === 0}
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
        <div className="payroll-import-progress">
          <span>
            Importing: {importProgress.processed} / {importProgress.total}
          </span>
        </div>
      )}
      {error && <div className="payroll-import-error">{error}</div>}
      {rowErrors.length > 0 && (
        <div className="payroll-import-row-errors">
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

export default PayrollImportExport;
