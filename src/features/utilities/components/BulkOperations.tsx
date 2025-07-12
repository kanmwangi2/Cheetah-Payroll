import React, { useState } from 'react';
import {
  bulkUpdateStaff,
  bulkDeleteStaff,
  bulkUpdatePayrolls,
  bulkDeletePayrolls,
} from '../services/bulkOpsUtils';

export default function BulkOperations({ type, companyId }: { type: string; companyId?: string }) {
  const [ids, setIds] = useState('');
  const [field, setField] = useState('');
  const [value, setValue] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setResult(null);
    setError(null);
    const idArr = ids
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    try {
      if (type === 'staff') {await bulkUpdateStaff(companyId!, idArr, { [field]: value });}
      else if (type === 'payroll') {await bulkUpdatePayrolls(companyId!, idArr, { [field]: value });}
      setResult('Update successful');
    } catch (e: any) {
      setError(e.message || 'Update failed');
    }
  };
  const handleDelete = async () => {
    setResult(null);
    setError(null);
    const idArr = ids
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    try {
      if (type === 'staff') {await bulkDeleteStaff(companyId!, idArr);}
      else if (type === 'payroll') {await bulkDeletePayrolls(companyId!, idArr);}
      setResult('Delete successful');
    } catch (e: any) {
      setError(e.message || 'Delete failed');
    }
  };

  return (
    <div className="bulk-operations">
      <h4>Bulk Operations ({type})</h4>
      <div style={{ marginBottom: 8 }}>
        <input
          type="text"
          placeholder="Comma-separated {type} IDs"
          value={ids}
          onChange={e => setIds(e.target.value)}
          style={{ width: 220, marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Field to update"
          value={field}
          onChange={e => setField(e.target.value)}
          style={{ width: 120, marginRight: 8 }}
        />
        <input
          type="text"
          placeholder="Value"
          value={value}
          onChange={e => setValue(e.target.value)}
          style={{ width: 120, marginRight: 8 }}
        />
        <button onClick={handleUpdate} disabled={!ids || !field}>
          Bulk Update
        </button>
        <button onClick={handleDelete} disabled={!ids}>
          Bulk Delete
        </button>
      </div>
      {result && <div style={{ color: 'var(--color-success-text)' }}>{result}</div>}
      {error && <div style={{ color: 'var(--color-error-text)' }}>{error}</div>}
    </div>
  );
}
