import React, { useEffect, useState } from 'react';
import { getPayments } from '../services/payments.service';
import PaymentsForm from './PaymentsForm';
import PaymentsImportExport from './PaymentsImportExport';

const PaymentsList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    setLoading(true);
    getPayments(companyId)
      .then(setPayments)
      .catch(e => setError(e.message || 'Failed to load payments'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  const filtered = payments.filter(p => {
    const matchesSearch =
      !search ||
      p.type?.toLowerCase().includes(search.toLowerCase()) ||
      p.staff_id?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || p.type === filterType;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(payments.map(p => p.type))).filter(Boolean);

  return (
    <div className="payments-list">
      <h2>Payments</h2>
      <PaymentsForm companyId={companyId} onAdded={() => setRefresh(r => r + 1)} />
      <PaymentsImportExport
        companyId={companyId}
        onImported={() => setRefresh(r => r + 1)}
        payments={payments}
      />
      <div className="payments-table-controls">
        <input
          type="search"
          placeholder="Search by type or employee ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="payments-search"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="payments-type-filter"
        >
          <option value="">All Types</option>
          {uniqueTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="payments-loading">Loading payments...</div>
      ) : error ? (
        <div className="payments-error" role="alert">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="payments-empty">No payments found.</div>
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Employee</th>
                <th>Gross/Net</th>
                <th>Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
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
        </div>
      )}
    </div>
  );
};

export default PaymentsList;
