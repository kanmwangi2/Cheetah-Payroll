import React, { useEffect, useState, useRef } from 'react';
import { getStaffProfile, updateStaff } from '../services/staff.service';

interface StaffData {
  id: string;
  firstName?: string;
  lastName?: string;
  idNumber?: string;
  rssbNumber?: string;
  staffNumber?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  startDate?: string;
  endDate?: string;
  status?: 'active' | 'inactive';
  personalDetails?: {
    firstName?: string;
    lastName?: string;
    idNumber?: string;
    rssbNumber?: string;
    email?: string;
    phone?: string;
    [key: string]: any;
  };
  employmentDetails?: {
    staffNumber?: string;
    position?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'inactive';
    [key: string]: any;
  };
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    [key: string]: any;
  };
  emergencyContact?: {
    name?: string;
    phone?: string;
    relationship?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

const StaffProfile: React.FC<{ companyId: string; staffId: string; onClose: () => void }> = ({
  companyId,
  staffId,
  onClose,
}) => {
  const [profile, setProfile] = useState<StaffData | null>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<StaffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Focus trap for modal
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Helper function to normalize staff data structure
  const normalizeStaffData = (data: any): StaffData | null => {
    if (!data) return null;
    
    // Handle both flat and nested data structures
    return {
      id: data.id,
      firstName: data.firstName || data.personalDetails?.firstName || '',
      lastName: data.lastName || data.personalDetails?.lastName || '',
      idNumber: data.idNumber || data.personalDetails?.idNumber || '',
      rssbNumber: data.rssbNumber || data.personalDetails?.rssbNumber || '',
      staffNumber: data.staffNumber || data.employmentDetails?.staffNumber || '',
      email: data.email || data.personalDetails?.email || '',
      phone: data.phone || data.personalDetails?.phone || '',
      department: data.department || data.employmentDetails?.department || '',
      position: data.position || data.employmentDetails?.position || '',
      startDate: data.startDate || data.employmentDetails?.startDate || '',
      endDate: data.endDate || data.employmentDetails?.endDate || '',
      status: data.status || data.employmentDetails?.status || 'active',
      personalDetails: data.personalDetails || {
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        idNumber: data.idNumber || '',
        rssbNumber: data.rssbNumber || '',
        email: data.email || '',
        phone: data.phone || ''
      },
      employmentDetails: data.employmentDetails || {
        staffNumber: data.staffNumber || '',
        position: data.position || '',
        department: data.department || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        status: data.status || 'active'
      },
      bankDetails: data.bankDetails || {
        bankName: data.bankName || '',
        accountNumber: data.accountNumber || '',
        accountName: data.accountName || ''
      },
      emergencyContact: data.emergencyContact || {
        name: data.emergencyContactName || '',
        phone: data.emergencyContactPhone || '',
        relationship: data.emergencyContactRelationship || ''
      }
    };
  };
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    getStaffProfile({ companyId, staffId })
      .then(data => {
        if (!data) {
          setError('Staff member not found');
          return;
        }
        
        const normalizedData = normalizeStaffData(data);
        if (!normalizedData) {
          setError('Invalid staff data');
          return;
        }
        
        setProfile(normalizedData);
        setForm(normalizedData);
      })
      .catch(e => {
        const errorMessage = e.message || 'Failed to load staff profile';
        setError(errorMessage);
      })
      .finally(() => setLoading(false));

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
  }, [companyId, staffId]);

  const handleChange = (section: string, field: string, value: string) => {
    setForm((prev: StaffData | null) => {
      if (!prev) return null;
      
      return {
        ...prev,
        [section]: {
          ...prev[section as keyof StaffData],
          [field]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!form) {
      setError('No data to save');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      await updateStaff({ companyId, staffId, data: form });
      setProfile(form);
      setEdit(false);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="staff-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close profile dialog">
            &times;
          </button>
          <div aria-live="polite" style={{color: 'var(--color-text-secondary)', padding: '20px', textAlign: 'center'}}>
            Loading profile...
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
        aria-labelledby="staff-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close profile dialog">
            &times;
          </button>
          <div style={{ color: 'var(--color-error-text)', padding: '20px', textAlign: 'center' }} role="alert" aria-live="assertive">
            <h3>Error Loading Profile</h3>
            <p>{error}</p>
            <button className="staff-profile-btn" onClick={onClose} style={{ marginTop: '10px' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div 
        className="staff-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close profile dialog">
            &times;
          </button>
          <div aria-live="polite" style={{color: 'var(--color-text-secondary)', padding: '20px', textAlign: 'center'}}>
            <h3>Profile Not Found</h3>
            <p>The requested staff member could not be found.</p>
            <button className="staff-profile-btn" onClick={onClose} style={{ marginTop: '10px' }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div
      className="staff-profile-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="staff-profile-title"
      tabIndex={-1}
      ref={modalRef}
      onKeyDown={handleKeyDown}
    >
      <a href="#main-content" className="skip-link visually-hidden-focusable">
        Skip to main content
      </a>
      <div className="staff-profile-card">
        <button className="staff-profile-close" onClick={onClose} aria-label="Close profile dialog">
          &times;
        </button>
        <h3 id="staff-profile-title">Staff Profile</h3>
        {edit ? (
          <div className="staff-profile-edit">
            <label htmlFor="profile-first-name">First Name</label>
            <input
              id="profile-first-name"
              value={form?.personalDetails?.firstName || ''}
              onChange={e => handleChange('personalDetails', 'firstName', e.target.value)}
            />
            <label htmlFor="profile-last-name">Last Name</label>
            <input
              id="profile-last-name"
              value={form?.personalDetails?.lastName || ''}
              onChange={e => handleChange('personalDetails', 'lastName', e.target.value)}
            />
            {/* Add more fields as needed, each with label+id */}
            <button className="staff-profile-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        ) : (
          <div className="staff-profile-view">
            <div style={{ marginBottom: '12px' }}>
              <b>Name:</b> {profile.firstName} {profile.lastName}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <b>Staff Number:</b> {profile.staffNumber || 'Not assigned'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <b>ID/Passport:</b> {profile.idNumber || 'Not provided'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <b>RSSB Number:</b> {profile.rssbNumber || 'Not provided'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <b>Email:</b> {profile.email || 'Not provided'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <b>Phone:</b> {profile.phone || 'Not provided'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <b>Department:</b> {profile.department || 'Not assigned'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <b>Position:</b> {profile.position || 'Not assigned'}
            </div>
            <div style={{ marginBottom: '12px' }}>
              <b>Start Date:</b> {profile.startDate || 'Not provided'}
            </div>
            {profile.endDate && (
              <div style={{ marginBottom: '12px' }}>
                <b>End Date:</b> {profile.endDate}
              </div>
            )}
            <div style={{ marginBottom: '12px' }}>
              <b>Status:</b> 
              <span style={{
                marginLeft: '8px',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: profile.status === 'active' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                color: profile.status === 'active' ? 'var(--color-success-text)' : 'var(--color-warning-text)'
              }}>
                {profile.status}
              </span>
            </div>
            {profile.emergencyContact?.name && (
              <div style={{ marginBottom: '12px' }}>
                <b>Emergency Contact:</b> {profile.emergencyContact.name} ({profile.emergencyContact.relationship}) - {profile.emergencyContact.phone}
              </div>
            )}
            {profile.bankDetails?.bankName && (
              <div style={{ marginBottom: '12px' }}>
                <b>Bank Details:</b> {profile.bankDetails.bankName} - {profile.bankDetails.accountNumber}
              </div>
            )}
            <button className="staff-profile-btn" onClick={() => setEdit(true)}>
              Edit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffProfile;
