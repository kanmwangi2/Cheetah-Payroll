
import React, { useState } from 'react';
import PDFExport from './PDFExport';
import AdvancedCharts from './AdvancedCharts';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import Papa from 'papaparse';

const db = getFirestore();

async function fetchCollection(companyId: string, sub: string) {
  const snapshot = await getDocs(collection(db, 'companies', companyId, sub));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

const kpiLabels: Record<string, string> = {
  staff: 'Staff',
  payrolls: 'Payrolls',
  payments: 'Payments',
  deductions: 'Deductions',
};

const Reports: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<{ [k: string]: number }>({});
  const [showKPIs, setShowKPIs] = useState(false);

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

  const handleShowKPIs = async () => {
    setShowKPIs(true);
    setLoading(true);
    setError(null);
    try {
      const results = await Promise.all([
        fetchCollection(companyId, 'staff'),
        fetchCollection(companyId, 'payrolls'),
        fetchCollection(companyId, 'payments'),
        fetchCollection(companyId, 'deductions'),
      ]);
      setKpis({
        staff: results[0].length,
        payrolls: results[1].length,
        payments: results[2].length,
        deductions: results[3].length,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load KPIs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-module">
      <h2>Reports & Analytics</h2>
      <div className="reports-actions">
        <button onClick={handleShowKPIs} disabled={loading} className="primary-btn">Show KPIs</button>
        <button onClick={() => handleExport('payrolls')} disabled={loading}>Export Payrolls</button>
        <button onClick={() => handleExport('staff')} disabled={loading}>Export Staff</button>
        <button onClick={() => handleExport('payments')} disabled={loading}>Export Payments</button>
        <button onClick={() => handleExport('deductions')} disabled={loading}>Export Deductions</button>
        <PDFExport data={[]} type="report" />
      </div>
      {showKPIs && (
        <div className="reports-kpis" aria-live="polite">
          <h3>Key Metrics</h3>
          <div className="kpi-row">
            {Object.entries(kpiLabels).map(([k, label]) => (
              <div className="kpi-card" key={k}>
                <div className="kpi-label">{label}</div>
                <div className="kpi-value">{kpis[k] ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      <AdvancedCharts data={{}} />
      {error && <div className="reports-error" role="alert">{error}</div>}
    </div>
  );
};

export default Reports;
