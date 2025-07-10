import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { createStaff } from '../staff';

const StaffImportExport: React.FC<{ companyId: string; onImported: () => void; staff: any[] }> = ({ companyId, onImported, staff }) => {
  const fileInput = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Import CSV
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setError(null);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          for (const row of results.data) {
            await createStaff(companyId, row);
          }
          onImported();
        } catch (err: any) {
          setError(err.message || 'Import failed');
        } finally {
          setImporting(false);
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

  return (
    <div style={{ margin: '16px 0' }}>
      <h4>Import/Export Staff</h4>
      <input type="file" accept=".csv" ref={fileInput} onChange={handleImport} disabled={importing} />
      <button onClick={handleExport} disabled={exporting || staff.length === 0}>Export CSV</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default StaffImportExport;
