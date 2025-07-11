import React, { useState } from 'react';
import { createDeduction } from '../services/deductions.service';

const initialState = {
  type: '',
  amount: '',
  staff_id: '',
  balance: '',
};

const DeductionsForm: React.FC<{ companyId: string; onAdded: () => void }> = ({
  companyId,
  onAdded,
}) => {
  const [form, setForm] = useState<any>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.type.trim()) errs.type = 'Type is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0)
      errs.amount = 'Amount must be a non-negative number';
    if (!form.staff_id.trim()) errs.staff_id = 'Employee ID is required';
    if (form.balance && (isNaN(Number(form.balance)) || Number(form.balance) < 0))
      errs.balance = 'Balance must be a non-negative number';
    return errs;
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    setFieldErrors(prev => {
      const { [field]: omit, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;
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
    <form className="deductions-form" onSubmit={handleSubmit} autoComplete="off">
      <h3>Add Deduction</h3>
      <div className="form-row">
        <label>
          Type
          <input
            className={fieldErrors.type ? 'error' : ''}
            placeholder="e.g. Loan, Tax"
            value={form.type}
            onChange={e => handleChange('type', e.target.value)}
            required
            aria-invalid={!!fieldErrors.type}
            aria-describedby="type-error"
          />
        </label>
        {fieldErrors.type && (
          <div className="field-error" id="type-error">
            {fieldErrors.type}
          </div>
        )}
      </div>
      <div className="form-row">
        <label>
          Amount
          <input
            className={fieldErrors.amount ? 'error' : ''}
            placeholder="e.g. 100000"
            value={form.amount}
            onChange={e => handleChange('amount', e.target.value)}
            required
            aria-invalid={!!fieldErrors.amount}
            aria-describedby="amount-error"
            inputMode="decimal"
          />
        </label>
        {fieldErrors.amount && (
          <div className="field-error" id="amount-error">
            {fieldErrors.amount}
          </div>
        )}
      </div>
      <div className="form-row">
        <label>
          Employee ID
          <input
            className={fieldErrors.staff_id ? 'error' : ''}
            placeholder="e.g. EMP001"
            value={form.staff_id}
            onChange={e => handleChange('staff_id', e.target.value)}
            required
            aria-invalid={!!fieldErrors.staff_id}
            aria-describedby="staffid-error"
          />
        </label>
        {fieldErrors.staff_id && (
          <div className="field-error" id="staffid-error">
            {fieldErrors.staff_id}
          </div>
        )}
      </div>
      <div className="form-row">
        <label>
          Balance
          <input
            className={fieldErrors.balance ? 'error' : ''}
            placeholder="e.g. 50000"
            value={form.balance}
            onChange={e => handleChange('balance', e.target.value)}
            aria-invalid={!!fieldErrors.balance}
            aria-describedby="balance-error"
            inputMode="decimal"
          />
        </label>
        {fieldErrors.balance && (
          <div className="field-error" id="balance-error">
            {fieldErrors.balance}
          </div>
        )}
      </div>
      <div className="form-row">
        <button type="submit" className="primary-btn" disabled={loading} aria-busy={loading}>
          {loading ? 'Adding...' : 'Add Deduction'}
        </button>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
    </form>
  );
};

export default DeductionsForm;
