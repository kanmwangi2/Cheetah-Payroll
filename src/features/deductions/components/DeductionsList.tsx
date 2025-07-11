import React, { useEffect, useState } from 'react';
import { getDeductions } from '../services/deductions.service';
import DeductionsForm from './DeductionsForm';
import DeductionsImportExport from './DeductionsImportExport';

const DeductionsList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [deductions, setDeductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    setLoading(true);
    getDeductions(companyId)
      .then(setDeductions)
      .catch(e => setError(e.message || 'Failed to load deductions'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  const filtered = deductions.filter(d => {
    const matchesSearch =
      !search ||
      d.type?.toLowerCase().includes(search.toLowerCase()) ||
      d.staff_id?.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || d.type === filterType;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(deductions.map(d => d.type))).filter(Boolean);

  return (
    <div className="deductions-list">
      <h2>Deductions</h2>
      <DeductionsForm companyId={companyId} onAdded={() => setRefresh(r => r + 1)} />
      <DeductionsImportExport
        companyId={companyId}
        onImported={() => setRefresh(r => r + 1)}
        deductions={deductions}
      />
      <div className="deductions-table-controls">
        <input
          type="search"
          placeholder="Search by type or employee ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="deductions-search"
        />
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="deductions-type-filter"
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
        <div className="deductions-loading">Loading deductions...</div>
      ) : error ? (
        <div className="deductions-error" role="alert">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="deductions-empty">No deductions found.</div>
      ) : (
        <div className="deductions-table-wrapper">
          <table className="deductions-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Employee</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id}>
                  <td>{d.type}</td>
                  <td>{d.amount}</td>
                  <td>{d.staff_id}</td>
                  <td>{d.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeductionsList;
