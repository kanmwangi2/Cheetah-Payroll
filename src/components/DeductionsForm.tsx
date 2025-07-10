import React, { useState } from 'react';
import { createDeduction } from '../deductions';

const initialState = {
  type: '',
  amount: '',
  staff_id: '',
  balance: '',
};

const DeductionsForm: React.FC<{ companyId: string; onAdded: () => void }> = ({ companyId, onAdded }) => {
  const [form, setForm] = useState<any>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createDeduction(companyId, form);
      setForm(initialState);
      onAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add deduction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Deduction</h3>
      <input placeholder="Type" value={form.type} onChange={e => handleChange('type', e.target.value)} required />
      <input placeholder="Amount" value={form.amount} onChange={e => handleChange('amount', e.target.value)} required />
      <input placeholder="Employee ID" value={form.staff_id} onChange={e => handleChange('staff_id', e.target.value)} required />
      <input placeholder="Balance" value={form.balance} onChange={e => handleChange('balance', e.target.value)} />
      <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Deduction'}</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default DeductionsForm;
