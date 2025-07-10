import React, { useEffect, useState } from 'react';
import { getPayments } from '../payments';
import PaymentsForm from './PaymentsForm';
import PaymentsImportExport from './PaymentsImportExport';

const PaymentsList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    getPayments(companyId)
      .then(setPayments)
      .catch(e => setError(e.message || 'Failed to load payments'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  if (loading) return <div>Loading payments...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Payments</h2>
      <PaymentsForm companyId={companyId} onAdded={() => setRefresh(r => r + 1)} />
      <PaymentsImportExport companyId={companyId} onImported={() => setRefresh(r => r + 1)} payments={payments} />
      {payments.length === 0 ? (
        <div>No payments found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Employee</th>
              <th>Gross/Net</th>
              <th>Effective Dates</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id}>
                <td>{p.type}</td>
                <td>{p.amount}</td>
                <td>{p.staff_id}</td>
                <td>{p.is_gross ? 'Gross' : 'Net'}</td>
                <td>{p.effective_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PaymentsList;
