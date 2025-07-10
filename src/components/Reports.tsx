import React, { useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Papa from 'papaparse';

const db = getFirestore();

async function fetchCollection(companyId: string, sub: string) {
  const snapshot = await getDocs(collection(db, 'companies', companyId, sub));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

const Reports: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (type: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCollection(companyId, type);
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_report.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Reports</h2>
      <button onClick={() => handleExport('payrolls')} disabled={loading}>Export Payrolls</button>
      <button onClick={() => handleExport('staff')} disabled={loading}>Export Staff</button>
      <button onClick={() => handleExport('payments')} disabled={loading}>Export Payments</button>
      <button onClick={() => handleExport('deductions')} disabled={loading}>Export Deductions</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default Reports;
