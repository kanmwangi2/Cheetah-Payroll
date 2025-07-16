import React, { useEffect, useState, useRef } from 'react';
import { getDeductionById, updateDeduction } from '../services/deductions.service';
import { getStaff } from '../../staff/services/staff.service';
import { DeductionType, Staff } from '../../../shared/types';
import Button from '../../../shared/components/ui/Button';

const DEDUCTION_TYPES: { value: DeductionType; label: string }[] = [
  { value: 'advance', label: 'Advance' },
  { value: 'loan', label: 'Loan' },
  { value: 'other_charge', label: 'Other Charge' },
  { value: 'disciplinary_deduction', label: 'Disciplinary Deduction' },
];

interface DeductionData {
  id: string;
  type: DeductionType;
  originalAmount: number;
  remainingBalance: number;
  monthlyInstallment?: number;
  numberOfInstallments?: number;
  remainingInstallments?: number;
  staffId: string;
  description?: string;
  status: 'active' | 'completed' | 'cancelled';
  [key: string]: any;
}

const DeductionProfile: React.FC<{ 
  companyId: string; 
  deductionId: string; 
  onClose: () => void;
  onUpdated?: () => void;
}> = ({
  companyId,
  deductionId,
  onClose,
  onUpdated
}) => {
  const [originalDeduction, setOriginalDeduction] = useState<DeductionData | null>(null);
  const [form, setForm] = useState<DeductionData | null>(null);
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
        setStaff(Array.isArray(staffData) ? staffData : []);
      } catch (error) {
        setStaff([]);
      } finally {
        setLoadingStaff(false);
      }
    };
    loadStaff();
  }, [companyId]);

  // Auto-calculate monthly installment when loan details change
  useEffect(() => {
    if (editMode && form?.type === 'loan' && form.originalAmount && form.numberOfInstallments) {
      const amount = form.originalAmount;
      const installments = form.numberOfInstallments;
      if (!isNaN(amount) && !isNaN(installments) && installments > 0) {
        const monthlyAmount = Math.ceil(amount / installments);
        setForm(prev => prev ? { ...prev, monthlyInstallment: monthlyAmount } : null);
      }
    }
  }, [form?.originalAmount, form?.numberOfInstallments, form?.type, editMode]);

  // Load deduction data
  useEffect(() => {
    setLoading(true);
    setError(null);

    const loadDeduction = async () => {
      try {
        const deductionData = await getDeductionById(companyId, deductionId);
        if (!deductionData) {
          setError('Deduction not found');
          return;
        }

        setOriginalDeduction(deductionData);
        setForm(deductionData);
      } catch (e: any) {
        const errorMessage = e.message || 'Failed to load deduction';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadDeduction();

    // Focus first focusable element in modal
    const focusFirst = () => {
      const modal = modalRef.current;
      if (!modal) {return;}
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) {focusable[0].focus();}
    };
    setTimeout(focusFirst, 0);
  }, [companyId, deductionId]);

  const getStaffName = (staffId: string) => {
    const staffMember = staff.find(s => s.id === staffId);
    if (!staffMember) {return 'Unknown Employee';}
    return `${staffMember.personalDetails?.firstName || ''} ${staffMember.personalDetails?.lastName || ''}`.trim();
  };

  const validate = () => {
    if (!form) {return {};}
    
    const errs: { [k: string]: string } = {};
    if (!form.type?.trim()) {errs.type = 'Deduction type is required';}
    if (!form.originalAmount || isNaN(Number(form.originalAmount)) || Number(form.originalAmount) <= 0) {
      errs.originalAmount = 'Amount must be a positive number';
    }
    if (!form.staffId?.trim()) {errs.staffId = 'Employee is required';}
    
    if (form.type === 'loan') {
      if (form.numberOfInstallments !== undefined) {
        const installments = form.numberOfInstallments;
        if (isNaN(installments) || installments <= 0) {
          errs.numberOfInstallments = 'Number of installments must be a positive number';
        }
      }
      if (form.monthlyInstallment !== undefined) {
        const monthly = form.monthlyInstallment;
        if (isNaN(monthly) || monthly <= 0) {
          errs.monthlyInstallment = 'Monthly installment must be a positive number';
        }
      }
    }
    
    return errs;
  };

  const handleChange = (field: string, value: string | number) => {
    setForm((prev: DeductionData | null) => {
      if (!prev) {return null;}
      
      const newValue = typeof value === 'string' && !isNaN(Number(value)) && field !== 'description' && field !== 'staffId' && field !== 'type' 
        ? Number(value) 
        : value;
      
      let newForm = { ...prev, [field]: newValue };
      
      // Reset loan-specific fields when type changes
      if (field === 'type' && value !== 'loan') {
        newForm = {
          ...newForm,
          numberOfInstallments: undefined,
          monthlyInstallment: undefined,
        };
      }
      
      return newForm;
    });
    
    setFieldErrors(prev => {
      const { [field]: _unused, ...rest } = prev;
      void _unused;
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
    if (Object.keys(errs).length > 0) {return;}

    setSaving(true);
    setError(null);
    try {
      const updateData = {
        ...form,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDeduction(companyId, deductionId, updateData);
      setOriginalDeduction(form);
      setEditMode(false);
      if (onUpdated) {onUpdated();}
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to update deduction';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(originalDeduction);
    setEditMode(false);
    setError(null);
    setFieldErrors({});
  };

  // Focus trap logic
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {onClose();}
    if (e.key === 'Tab') {
      const modal = modalRef.current;
      if (!modal) {return;}
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) {return;}
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
        aria-labelledby="deduction-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close deduction dialog">
            &times;
          </button>
          <div aria-live="polite" style={{color: 'var(--color-text-secondary)', padding: '40px', textAlign: 'center'}}>
            Loading deduction...
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
        aria-labelledby="deduction-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close deduction dialog">
            &times;
          </button>
          <div style={{ color: 'var(--color-error-text)', padding: '40px', textAlign: 'center' }} role="alert" aria-live="assertive">
            <h3>Error Loading Deduction</h3>
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
        aria-labelledby="deduction-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close deduction dialog">
            &times;
          </button>
          <div aria-live="polite" style={{color: 'var(--color-text-secondary)', padding: '40px', textAlign: 'center'}}>
            <h3>Deduction Not Found</h3>
            <p>The requested deduction could not be found.</p>
            <Button onClick={onClose} variant="primary" style={{ marginTop: '10px' }}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isLoan = form.type === 'loan';

  return (
    <div
      className="staff-profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="deduction-profile-title"
      tabIndex={-1}
      ref={modalRef}
      onKeyDown={handleKeyDown}
    >
      <div className="staff-profile-card">
        <button className="staff-profile-close" onClick={onClose} aria-label="Close deduction dialog">
          &times;
        </button>
        
        <form className="staff-form" onSubmit={(e) => { e.preventDefault(); if (editMode) {handleSave();} }}>
          <h3 id="deduction-profile-title">{editMode ? 'Edit Deduction' : 'Deduction Details'}</h3>
          
          <div className="staff-form-row">
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Deduction Type*
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
                <option value="">Select deduction type...</option>
                {DEDUCTION_TYPES.map(dt => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
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
                {isLoan ? 'Loan Amount*' : 'Deduction Amount*'}
              </label>
              <input
                placeholder="e.g. 100000"
                value={form.originalAmount || ''}
                onChange={e => handleChange('originalAmount', e.target.value)}
                required
                disabled={!editMode}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${fieldErrors.originalAmount ? 'var(--color-error-border)' : 'var(--color-input-border)'}`,
                  borderRadius: 4,
                  fontSize: '14px',
                  backgroundColor: editMode ? 'var(--color-input-bg)' : 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)'
                }}
              />
              {fieldErrors.originalAmount && (
                <div style={{ color: 'var(--color-error-text)', fontSize: '12px', marginTop: '4px' }}>
                  {fieldErrors.originalAmount}
                </div>
              )}
              {!editMode && (
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Remaining Balance: RWF {form.remainingBalance?.toLocaleString() || '0'}
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

          {isLoan && (
            <div className="staff-form-row">
              <div style={{ width: '50%' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Number of Installments
                </label>
                <input
                  placeholder="e.g. 12"
                  type="number"
                  min="1"
                  value={form.numberOfInstallments || ''}
                  onChange={e => handleChange('numberOfInstallments', e.target.value)}
                  disabled={!editMode}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${fieldErrors.numberOfInstallments ? 'var(--color-error-border)' : 'var(--color-input-border)'}`,
                    borderRadius: 4,
                    fontSize: '14px',
                    backgroundColor: editMode ? 'var(--color-input-bg)' : 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)'
                  }}
                />
                {fieldErrors.numberOfInstallments && (
                  <div style={{ color: 'var(--color-error-text)', fontSize: '12px', marginTop: '4px' }}>
                    {fieldErrors.numberOfInstallments}
                  </div>
                )}
                {!editMode && form.remainingInstallments !== undefined && (
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                    Remaining: {form.remainingInstallments} payments
                  </div>
                )}
              </div>
              <div style={{ width: '50%' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Monthly Installment {editMode && form.numberOfInstallments ? '(Auto-calculated)' : ''}
                </label>
                <input
                  placeholder="Auto-calculated"
                  value={form.monthlyInstallment || ''}
                  onChange={e => handleChange('monthlyInstallment', e.target.value)}
                  disabled={!editMode || !!form.numberOfInstallments}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: `1px solid ${fieldErrors.monthlyInstallment ? 'var(--color-error-border)' : 'var(--color-input-border)'}`,
                    borderRadius: 4,
                    fontSize: '14px',
                    backgroundColor: editMode && !form.numberOfInstallments ? 'var(--color-input-bg)' : 'var(--color-bg-secondary)',
                    color: 'var(--color-text-primary)'
                  }}
                />
                {fieldErrors.monthlyInstallment && (
                  <div style={{ color: 'var(--color-error-text)', fontSize: '12px', marginTop: '4px' }}>
                    {fieldErrors.monthlyInstallment}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="staff-form-row">
            <div style={{ width: '100%' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                Description (Optional)
              </label>
              <textarea
                value={form.description || ''}
                onChange={e => handleChange('description', e.target.value)}
                placeholder={`Additional details about this ${isLoan ? 'loan' : 'deduction'}...`}
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

export default DeductionProfile;