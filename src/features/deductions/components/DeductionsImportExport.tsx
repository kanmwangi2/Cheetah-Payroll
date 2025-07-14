import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createDeduction } from '../services/deductions.service';
import Button from '../../../shared/components/ui/Button';

const deductionTemplate = [
  'type,originalAmount,staffId,remainingBalance,monthlyInstallment,description',
  'loan,100000,EMP001,50000,10000,Employee loan',
  'advance,20000,EMP002,15000,5000,Salary advance',
  'equipment,75000,EMP003,60000,15000,Laptop purchase deduction',
].join('\n');

const REQUIRED_FIELDS = ['type', 'originalAmount', 'staffId', 'remainingBalance'];

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
    // Amounts must be numbers
    if (isNaN(Number(row.originalAmount)) || Number(row.originalAmount) < 0) {
      return `Invalid originalAmount (must be a non-negative number)`;
    }
    if (isNaN(Number(row.remainingBalance)) || Number(row.remainingBalance) < 0) {
      return `Invalid remainingBalance (must be a non-negative number)`;
    }
    if (row.monthlyInstallment && (isNaN(Number(row.monthlyInstallment)) || Number(row.monthlyInstallment) <= 0)) {
      return `Invalid monthlyInstallment (must be a positive number)`;
    }
    // Duplicate deduction for staffId and type in file
    const key = row.staffId + '-' + row.type;
    if (staffTypeSet.has(key)) {
      return `Duplicate deduction for staffId ${row.staffId} and type ${row.type}`;
    }
    staffTypeSet.add(key);
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
            // Transform row data to match Deduction interface
            const deductionData = {
              companyId,
              type: row.type,
              originalAmount: parseFloat(row.originalAmount),
              staffId: row.staffId,
              remainingBalance: parseFloat(row.remainingBalance),
              monthlyInstallment: row.monthlyInstallment ? parseFloat(row.monthlyInstallment) : undefined,
              description: row.description && row.description.trim() ? row.description : undefined,
              status: 'active' as const,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await createDeduction(companyId, deductionData);
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
        <Button
          variant="primary"
          size="sm"
          onClick={handleExport}
          disabled={exporting || deductions.length === 0}
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
              <li key={i} style={{ color: 'var(--color-error-text)' }}>
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

export default DeductionsImportExport;
