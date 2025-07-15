import React, { useEffect, useState, useRef } from 'react';
import { getPaymentById, updatePayment } from '../services/payments.service';
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

interface PaymentData {
  id: string;
  type: PaymentType;
  amount: number;
  staffId: string;
  isGross: boolean;
  isRecurring: boolean;
  effectiveDate: string;
  endDate?: string;
  description?: string;
  status: 'active' | 'inactive';
  [key: string]: any;
}

const PaymentProfile: React.FC<{ 
  companyId: string; 
  paymentId: string; 
  onClose: () => void;
  onUpdated?: () => void;
}> = ({
  companyId,
  paymentId,
  onClose,
  onUpdated
}) => {
  const [originalPayment, setOriginalPayment] = useState<PaymentData | null>(null);
  const [form, setForm] = useState<PaymentData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);

  // Focus trap for modal
  const modalRef = useRef<HTMLDivElement>(null);

  // Load staff data
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const staffData = await getStaff(companyId);
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
        setStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    };
    loadStaff();
  }, [companyId]);

  // Load payment data
  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadPayment = async () => {
      try {
        const paymentData = await getPaymentById(companyId, paymentId);
        if (!paymentData) {
          setError('Payment not found');
          return;
        }

        setOriginalPayment(paymentData);
        setForm(paymentData);
      } catch (e: any) {
        const errorMessage = e.message || 'Failed to load payment';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadPayment();

    // Focus first focusable element in modal
    const focusFirst = () => {
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0].focus();
    };
    setTimeout(focusFirst, 0);
  }, [companyId, paymentId]);

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) return 'Unknown Employee';
    return `${staffMember.personalDetails?.firstName || ''} ${staffMember.personalDetails?.lastName || ''}`.trim();
  };

  const validate = () => {
    if (!form) return {};
    
    const errs: { [k: string]: string } = {};
    if (!form.type?.trim()) errs.type = 'Payment type is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      errs.amount = 'Amount must be a positive number';
    }
    if (!form.staffId?.trim()) errs.staffId = 'Employee is required';
    if (!form.effectiveDate) errs.effectiveDate = 'Effective date is required';
    if (form.endDate && form.endDate <= form.effectiveDate) {
      errs.endDate = 'End date must be after effective date';
    }
    return errs;
  };

  const handleChange = (field: string, value: string | boolean | number) => {
    setForm((prev: PaymentData | null) => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    setFieldErrors(prev => {
      const { [field]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const handleSave = async () => {
    if (!form) {
      setError('No data to save');
      return;
    }

    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setError(null);
    try {
      const updateData = {
        ...form,
        amount: typeof form.amount === 'string' ? parseFloat(form.amount) : form.amount,
        updatedAt: new Date().toISOString(),
      };
      
      await updatePayment(companyId, paymentId, updateData);
      setOriginalPayment(form);
      setEditMode(false);
      if (onUpdated) onUpdated();
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to update payment';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(originalPayment);
    setEditMode(false);
    setError(null);
    setFieldErrors({});
  };

  // Focus trap logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Tab') {
      const modal = modalRef.current;
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  if (loading) {
    return (
      <div
        className="staff-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close payment dialog">
            &times;
          </button>
          <div aria-live="polite" style={{color: 'var(--color-text-secondary)', padding: '40px', textAlign: 'center'}}>
            Loading payment...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="staff-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close payment dialog">
            &times;
          </button>
          <div style={{ color: 'var(--color-error-text)', padding: '40px', textAlign: 'center' }} role="alert" aria-live="assertive">
            <h3>Error Loading Payment</h3>
            <p>{error}</p>
            <Button onClick={onClose} variant="primary" style={{ marginTop: '10px' }}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div
        className="staff-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close payment dialog">
            &times;
          </button>
          <div aria-live="polite" style={{color: 'var(--color-text-secondary)', padding: '40px', textAlign: 'center'}}>
            <h3>Payment Not Found</h3>
            <p>The requested payment could not be found.</p>
            <Button onClick={onClose} variant="primary" style={{ marginTop: '10px' }}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="staff-profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-profile-title"
      tabIndex={-1}
      ref={modalRef}
      onKeyDown={handleKeyDown}
    >
      <div className="staff-profile-card">
        <button className="staff-profile-close" onClick={onClose} aria-label="Close payment dialog">
          &times;
        </button>
        
        <form className="staff-form" onSubmit={(e) => { e.preventDefault(); if (editMode) handleSave(); }}>
          <h3 id="payment-profile-title">{editMode ? 'Edit Payment' : 'Payment Details'}</h3>
          
          <div className="staff-form-row">
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Payment Type*
              </label>
              <select
                value={form.type || ''}
                onChange={e => handleChange('type', e.target.value)}
                required
                disabled={!editMode}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${fieldErrors.type ? 'var(--color-error-border)' : 'var(--color-input-border)'}`,
                  borderRadius: 4,
                  fontSize: '14px',
                  backgroundColor: editMode ? 'var(--color-input-bg)' : 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <option value="">Select payment type...</option>
                {PAYMENT_TYPES.map(pt => (
                  <option key={pt.value} value={pt.value}>{pt.label}</option>
                ))}
              </select>
              {fieldErrors.type && (
                <div style={{ color: 'var(--color-error-text)', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.type}
                </div>
              )}
            </div>
          </div>

          <div className="staff-form-row">
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Amount*
              </label>
              <input
                placeholder="e.g. 500000"
                value={form.amount || ''}
                onChange={e => handleChange('amount', e.target.value)}
                required
                disabled={!editMode}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${fieldErrors.amount ? 'var(--color-error-border)' : 'var(--color-input-border)'}`,
                  borderRadius: 4,
                  fontSize: '14px',
                  backgroundColor: editMode ? 'var(--color-input-bg)' : 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)'
                }}
              />
              {fieldErrors.amount && (
                <div style={{ color: 'var(--color-error-text)', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.amount}
                </div>
              )}
            </div>
          </div>

          <div className="staff-form-row">
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Employee*
              </label>
              <select
                value={form.staffId || ''}
                onChange={e => handleChange('staffId', e.target.value)}
                required
                disabled={!editMode || loadingStaff}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${fieldErrors.staffId ? 'var(--color-error-border)' : 'var(--color-input-border)'}`,
                  borderRadius: 4,
                  fontSize: '14px',
                  backgroundColor: editMode ? 'var(--color-input-bg)' : 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)'
                }}
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
              {fieldErrors.staffId && (
                <div style={{ color: 'var(--color-error-text)', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.staffId}
                </div>
              )}
              {!editMode && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Employee: {getStaffName(form.staffId)}
                </div>
              )}
            </div>
          </div>

          <div className="staff-form-row">
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '10px 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: editMode ? 'pointer' : 'default' }}>
                <input
                  type="checkbox"
                  checked={form.isGross || false}
                  onChange={e => handleChange('isGross', e.target.checked)}
                  disabled={!editMode}
                  style={{ cursor: editMode ? 'pointer' : 'default' }}
                />
                <span style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>Gross Amount</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: editMode ? 'pointer' : 'default' }}>
                <input
                  type="checkbox"
                  checked={form.isRecurring || false}
                  onChange={e => handleChange('isRecurring', e.target.checked)}
                  disabled={!editMode}
                  style={{ cursor: editMode ? 'pointer' : 'default' }}
                />
                <span style={{ color: 'var(--color-text-primary)', fontSize: '14px' }}>Recurring Payment</span>
              </label>
            </div>
          </div>

          <div className="staff-form-row">
            <div style={{ width: '50%' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Effective Date*
              </label>
              <input
                type="date"
                value={form.effectiveDate || ''}
                onChange={e => handleChange('effectiveDate', e.target.value)}
                required
                disabled={!editMode}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${fieldErrors.effectiveDate ? 'var(--color-error-border)' : 'var(--color-input-border)'}`,
                  borderRadius: 4,
                  fontSize: '14px',
                  backgroundColor: editMode ? 'var(--color-input-bg)' : 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)'
                }}
              />
              {fieldErrors.effectiveDate && (
                <div style={{ color: 'var(--color-error-text)', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.effectiveDate}
                </div>
              )}
            </div>
            <div style={{ width: '50%' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                End Date (Optional)
              </label>
              <input
                type="date"
                value={form.endDate || ''}
                onChange={e => handleChange('endDate', e.target.value)}
                disabled={!editMode}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${fieldErrors.endDate ? 'var(--color-error-border)' : 'var(--color-input-border)'}`,
                  borderRadius: 4,
                  fontSize: '14px',
                  backgroundColor: editMode ? 'var(--color-input-bg)' : 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)'
                }}
              />
              {fieldErrors.endDate && (
                <div style={{ color: 'var(--color-error-text)', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.endDate}
                </div>
              )}
            </div>
          </div>

          <div className="staff-form-row">
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Description (Optional)
              </label>
              <textarea
                value={form.description || ''}
                onChange={e => handleChange('description', e.target.value)}
                placeholder="Additional details about this payment..."
                rows={3}
                disabled={!editMode}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid var(--color-input-border)',
                  borderRadius: 4,
                  fontSize: '14px',
                  backgroundColor: editMode ? 'var(--color-input-bg)' : 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  resize: 'vertical',
                  minHeight: '80px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            {editMode ? (
              <>
                <Button 
                  type="submit" 
                  disabled={saving} 
                  variant="primary" 
                  loading={saving}
                >
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  onClick={handleCancel} 
                  variant="secondary"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button 
                type="button" 
                onClick={() => setEditMode(true)} 
                variant="primary"
              >
                Edit
              </Button>
            )}
          </div>
          
          {error && (
            <div className="staff-form-error" role="alert" aria-live="assertive" style={{ marginTop: '12px' }}>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default PaymentProfile;