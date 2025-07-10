import React, { useEffect, useState } from 'react';
import { getDeductions } from '../deductions';
import DeductionsForm from './DeductionsForm';
import DeductionsImportExport from './DeductionsImportExport';

const DeductionsList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [deductions, setDeductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    getDeductions(companyId)
      .then(setDeductions)
      .catch(e => setError(e.message || 'Failed to load deductions'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  if (loading) return <div>Loading deductions...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Deductions</h2>
      <DeductionsForm companyId={companyId} onAdded={() => setRefresh(r => r + 1)} />
      <DeductionsImportExport companyId={companyId} onImported={() => setRefresh(r => r + 1)} deductions={deductions} />
      {deductions.length === 0 ? (
        <div>No deductions found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Employee</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {deductions.map(d => (
              <tr key={d.id}>
                <td>{d.type}</td>
                <td>{d.amount}</td>
                <td>{d.staff_id}</td>
                <td>{d.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default DeductionsList;
