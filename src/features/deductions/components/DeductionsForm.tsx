import React, { useState, useEffect } from 'react';
import { createDeduction } from '../services/deductions.service';
import { getStaff } from '../../staff/services/staff.service';
import { DeductionType, Deduction, Staff } from '../../../shared/types';
import Button from '../../../shared/components/ui/Button';

const DEDUCTION_TYPES: { value: DeductionType; label: string }[] = [
  { value: 'advance', label: 'Advance' },
  { value: 'loan', label: 'Loan' },
  { value: 'other_charge', label: 'Other Charge' },
  { value: 'disciplinary_deduction', label: 'Disciplinary Deduction' },
];

interface DeductionFormState {
  type: string;
  originalAmount: string;
  staffId: string;
  description: string;
  numberOfInstallments: string;
  monthlyInstallment: string;
}

const initialState: DeductionFormState = {
  type: '',
  originalAmount: '',
  staffId: '',
  description: '',
  numberOfInstallments: '',
  monthlyInstallment: '',
};

const DeductionsForm: React.FC<{ companyId: string; onAdded: () => void }> = ({
  companyId,
  onAdded,
}) => {
  const [form, setForm] = useState<DeductionFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const staffData = await getStaff(companyId);
        setStaff(Array.isArray(staffData) ? staffData : []);
      } catch (error) {
        console.error('Failed to load staff:', error);
      } finally {
        setLoadingStaff(false);
      }
    };
    loadStaff();
  }, [companyId]);

  // Auto-calculate monthly installment when loan details change
  useEffect(() => {
    if (form.type === 'loan' && form.originalAmount && form.numberOfInstallments) {
      const amount = parseFloat(form.originalAmount);
      const installments = parseInt(form.numberOfInstallments, 10);
      if (!isNaN(amount) && !isNaN(installments) && installments > 0) {
        const monthlyAmount = Math.ceil(amount / installments);
        setForm(prev => ({ ...prev, monthlyInstallment: monthlyAmount.toString() }));
      }
    }
  }, [form.originalAmount, form.numberOfInstallments, form.type]);

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.type.trim()) {errs.type = 'Deduction type is required';}
    if (!form.originalAmount || isNaN(Number(form.originalAmount)) || Number(form.originalAmount) <= 0)
      {errs.originalAmount = 'Amount must be a positive number';}
    if (!form.staffId.trim()) {errs.staffId = 'Employee is required';}
    
    if (form.type === 'loan') {
      if (form.numberOfInstallments) {
        const installments = parseInt(form.numberOfInstallments, 10);
        if (isNaN(installments) || installments <= 0) {
          errs.numberOfInstallments = 'Number of installments must be a positive number';
        }
      }
      if (form.monthlyInstallment) {
        const monthly = parseFloat(form.monthlyInstallment);
        if (isNaN(monthly) || monthly <= 0) {
          errs.monthlyInstallment = 'Monthly installment must be a positive number';
        }
      }
    }
    
    return errs;
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => {
      const { [field]: _, ...rest } = prev;
      return rest;
    });
    
    // Reset loan-specific fields when type changes
    if (field === 'type' && value !== 'loan') {
      setForm(prev => ({
        ...prev,
        numberOfInstallments: '',
        monthlyInstallment: '',
      }));
    }
  };

  const isLoan = form.type === 'loan';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {return;}
    setLoading(true);
    setError(null);
    try {
      const deductionData: Partial<Deduction> = {
        type: form.type as DeductionType,
        staffId: form.staffId,
        originalAmount: parseFloat(form.originalAmount),
        description: form.description || undefined,
      };
      if (form.type === 'loan') {
        if (form.numberOfInstallments) {
          deductionData.numberOfInstallments = parseInt(form.numberOfInstallments, 10);
        }
        if (form.monthlyInstallment) {
          deductionData.monthlyInstallment = parseFloat(form.monthlyInstallment);
        }
      }
      await createDeduction(companyId, deductionData as Deduction);
      setForm(initialState);
      onAdded();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to add deduction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="deductions-form" onSubmit={handleSubmit} autoComplete="off">
      <h3>Add Deduction</h3>
      <div className="form-row">
        <label>
          Deduction Type
          <select
            className={fieldErrors.type ? 'error' : ''}
            value={form.type}
            onChange={e => handleChange('type', e.target.value)}
            required
            aria-invalid={!!fieldErrors.type}
            aria-describedby="type-error"
          >
            <option value="">Select deduction type...</option>
            {DEDUCTION_TYPES.map(dt => (
              <option key={dt.value} value={dt.value}>{dt.label}</option>
            ))}
          </select>
        </label>
        {fieldErrors.type && (
          <div className="field-error" id="type-error">
            {fieldErrors.type}
          </div>
        )}
      </div>
      <div className="form-row">
        <label>
          {isLoan ? 'Loan Amount' : 'Deduction Amount'}
          <input
            className={fieldErrors.originalAmount ? 'error' : ''}
            placeholder="e.g. 100000"
            value={form.originalAmount}
            onChange={e => handleChange('originalAmount', e.target.value)}
            required
            aria-invalid={!!fieldErrors.originalAmount}
            aria-describedby="amount-error"
            inputMode="decimal"
          />
        </label>
        {fieldErrors.originalAmount && (
          <div className="field-error" id="amount-error">
            {fieldErrors.originalAmount}
          </div>
        )}
      </div>
      <div className="form-row">
        <label>
          Employee
          <select
            className={fieldErrors.staffId ? 'error' : ''}
            value={form.staffId}
            onChange={e => handleChange('staffId', e.target.value)}
            required
            aria-invalid={!!fieldErrors.staffId}
            aria-describedby="staffid-error"
            disabled={loadingStaff}
          >
            <option value="">
              {loadingStaff ? 'Loading employees...' : 'Select employee...'}
            </option>
            {staff.filter(s => s !== null).map(s => (
              <option key={s?.id} value={s?.id}>
                {s?.personalDetails?.firstName} {s?.personalDetails?.lastName} ({s?.personalDetails?.employeeId || s?.id})
              </option>
            ))}
          </select>
        </label>
        {fieldErrors.staffId && (
          <div className="field-error" id="staffid-error">
            {fieldErrors.staffId}
          </div>
        )}
      </div>
      {isLoan && (
        <>
          <div className="form-row">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label>
                  Number of Installments
                  <input
                    className={fieldErrors.numberOfInstallments ? 'error' : ''}
                    placeholder="e.g. 12"
                    value={form.numberOfInstallments}
                    onChange={e => handleChange('numberOfInstallments', e.target.value)}
                    aria-invalid={!!fieldErrors.numberOfInstallments}
                    aria-describedby="installments-error"
                    inputMode="numeric"
                    type="number"
                    min="1"
                  />
                </label>
                {fieldErrors.numberOfInstallments && (
                  <div className="field-error" id="installments-error">
                    {fieldErrors.numberOfInstallments}
                  </div>
                )}
              </div>
              <div>
                <label>
                  Monthly Installment (Auto-calculated)
                  <input
                    className={fieldErrors.monthlyInstallment ? 'error' : ''}
                    placeholder="Auto-calculated"
                    value={form.monthlyInstallment}
                    onChange={e => handleChange('monthlyInstallment', e.target.value)}
                    aria-invalid={!!fieldErrors.monthlyInstallment}
                    aria-describedby="monthly-error"
                    inputMode="decimal"
                    readOnly={!!form.numberOfInstallments}
                  />
                </label>
                {fieldErrors.monthlyInstallment && (
                  <div className="field-error" id="monthly-error">
                    {fieldErrors.monthlyInstallment}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
      
      <div className="form-row">
        <label>
          Description (Optional)
          <textarea
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder={`Additional details about this ${isLoan ? 'loan' : 'deduction'}...`}
            rows={3}
          />
        </label>
      </div>
      <div className="form-row">
        <Button type="submit" disabled={loading} variant="primary" loading={loading}>
          Add Deduction
        </Button>
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
