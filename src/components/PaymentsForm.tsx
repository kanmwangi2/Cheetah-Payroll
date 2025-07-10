import React, { useState } from 'react';
import { createPayment } from '../payments';

const initialState = {
  type: '',
  amount: '',
  staff_id: '',
  is_gross: true,
  effective_date: '',
};

const PaymentsForm: React.FC<{ companyId: string; onAdded: () => void }> = ({ companyId, onAdded }) => {
  const [form, setForm] = useState<any>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createPayment(companyId, form);
      setForm(initialState);
      onAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Payment</h3>
      <input placeholder="Type" value={form.type} onChange={e => handleChange('type', e.target.value)} required />
      <input placeholder="Amount" value={form.amount} onChange={e => handleChange('amount', e.target.value)} required />
      <input placeholder="Employee ID" value={form.staff_id} onChange={e => handleChange('staff_id', e.target.value)} required />
      <label>
        <input type="checkbox" checked={form.is_gross} onChange={e => handleChange('is_gross', e.target.checked)} /> Gross
      </label>
      <input placeholder="Effective Date" value={form.effective_date} onChange={e => handleChange('effective_date', e.target.value)} required />
      <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Payment'}</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default PaymentsForm;
