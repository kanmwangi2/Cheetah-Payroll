import React, { useState, useEffect } from 'react';
import { createPayment } from '../services/payments.service';
import { getStaff } from '../../staff/services/staff.service';
import { PaymentType, Staff } from '../../../shared/types';
import Button from '../../../shared/components/ui/Button';

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: 'basic_salary', label: 'Basic Salary' },
  { value: 'transport_allowance', label: 'Transport Allowance' },
  { value: 'overtime_allowance', label: 'Overtime Allowance' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'commission', label: 'Commission' },
  { value: 'other_allowance', label: 'Other Allowance' },
];

const initialState = {
  type: '',
  amount: '',
  staffId: '',
  isGross: true,
  isRecurring: false,
  effectiveDate: '',
  endDate: '',
  description: '',
};

interface PaymentsFormProps {
  companyId: string;
  onAdded: () => void;
  paymentData?: any;
  isEditMode?: boolean;
}

const PaymentsForm: React.FC<PaymentsFormProps> = ({
  companyId,
  onAdded,
  paymentData,
  isEditMode = false,
}) => {
  const [form, setForm] = useState<any>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  useEffect(() => {
    const loadStaff = async () => {
      try {
        const staffData = await getStaff(companyId);
        // Ensure staffData is cast to the shared Staff type
        const sharedStaff: Staff[] = Array.isArray(staffData)
          ? staffData.map(s => ({
              id: s.id,
              companyId: s.companyId,
              personalDetails: s.personalDetails,
              employmentDetails: s.employmentDetails,
              bankDetails: s.bankDetails,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt
            }))
          : (staffData.data ?? []).map((s: any) => ({
              id: s.id,
              companyId: s.companyId,
              personalDetails: s.personalDetails,
              employmentDetails: s.employmentDetails,
              bankDetails: s.bankDetails,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt
            }));
        setStaff(sharedStaff);
      } catch (error) {
        // Silently handle staff loading error - form can still work without staff list
        setStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    };
    loadStaff();
  }, [companyId]);

  // Populate form with existing data in edit mode
  useEffect(() => {
    if (isEditMode && paymentData) {
      setForm({
        type: paymentData.type || '',
        amount: paymentData.amount?.toString() || '',
        staffId: paymentData.staffId || '',
        isGross: paymentData.isGross ?? true,
        isRecurring: paymentData.isRecurring ?? false,
        effectiveDate: paymentData.effectiveDate || '',
        endDate: paymentData.endDate || '',
        description: paymentData.description || '',
      });
    }
  }, [isEditMode, paymentData]);

  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!form.type.trim()) {errs.type = 'Payment type is required';}
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0)
      {errs.amount = 'Amount must be a positive number';}
    if (!form.staffId.trim()) {errs.staffId = 'Employee is required';}
    if (!form.effectiveDate) {errs.effectiveDate = 'Effective date is required';}
    if (form.endDate && form.endDate <= form.effectiveDate) {
      errs.endDate = 'End date must be after effective date';
    }
    return errs;
  };

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
    setFieldErrors(prev => {
      const { [field]: _unused, ...rest } = prev;
      void _unused;
      return rest;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) {return;}
    setLoading(true);
    setError(null);
    try {
      const submitData = {
        ...form,
        amount: parseFloat(form.amount),
        status: 'active' as const,
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode && paymentData) {
        // Update existing payment
        const { updatePayment } = await import('../services/payments.service');
        await updatePayment(companyId, paymentData.id, submitData);
      } else {
        // Create new payment
        submitData.createdAt = new Date().toISOString();
        await createPayment(companyId, submitData);
      }
      
      if (!isEditMode) {
        setForm(initialState);
      }
      onAdded();
    } catch (err: unknown) {
      setError((err as Error).message || `Failed to ${isEditMode ? 'update' : 'add'} payment`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isEditMode) {
      setForm(initialState);
    }
    onAdded(); // This closes the modal
  };

  return (
    <form className="payments-form" onSubmit={handleSubmit} autoComplete="off">
      <h3>{isEditMode ? 'Edit Payment' : 'Add Payment'}</h3>
      <div className="form-row">
        <label>
          Payment Type
          <select
            className={fieldErrors.type ? 'error' : ''}
            value={form.type}
            onChange={e => handleChange('type', e.target.value)}
            required
            aria-invalid={!!fieldErrors.type}
            aria-describedby="type-error"
          >
            <option value="">Select payment type...</option>
            {PAYMENT_TYPES.map(pt => (
              <option key={pt.value} value={pt.value}>{pt.label}</option>
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
          Amount
          <input
            className={fieldErrors.amount ? 'error' : ''}
            placeholder="e.g. 500000"
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
      <div className="form-row">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isGross}
              onChange={e => handleChange('isGross', e.target.checked)}
            />
            Gross Amount
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={e => handleChange('isRecurring', e.target.checked)}
            />
            Recurring Payment
          </label>
        </div>
      </div>
      <div className="form-row">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label>
              Effective Date
              <input
                className={fieldErrors.effectiveDate ? 'error' : ''}
                value={form.effectiveDate}
                onChange={e => handleChange('effectiveDate', e.target.value)}
                required
                aria-invalid={!!fieldErrors.effectiveDate}
                aria-describedby="effectivedate-error"
                type="date"
              />
            </label>
            {fieldErrors.effectiveDate && (
              <div className="field-error" id="effectivedate-error">
                {fieldErrors.effectiveDate}
              </div>
            )}
          </div>
          <div>
            <label>
              End Date (Optional)
              <input
                className={fieldErrors.endDate ? 'error' : ''}
                value={form.endDate}
                onChange={e => handleChange('endDate', e.target.value)}
                aria-invalid={!!fieldErrors.endDate}
                aria-describedby="enddate-error"
                type="date"
              />
            </label>
            {fieldErrors.endDate && (
              <div className="field-error" id="enddate-error">
                {fieldErrors.endDate}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="form-row">
        <label>
          Description (Optional)
          <textarea
            value={form.description}
            onChange={e => handleChange('description', e.target.value)}
            placeholder="Additional details about this payment..."
            rows={3}
          />
        </label>
      </div>
      <div className="form-row">
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} variant="primary" loading={loading}>
            {isEditMode ? 'Update Payment' : 'Add Payment'}
          </Button>
        </div>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
    </form>
  );
};

export default PaymentsForm;
