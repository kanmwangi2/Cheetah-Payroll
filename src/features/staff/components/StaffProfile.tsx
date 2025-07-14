import React, { useEffect, useState, useRef } from 'react';
import { getStaffProfile, updateStaff } from '../services/staff.service';

const StaffProfile: React.FC<{ companyId: string; staffId: string; onClose: () => void }> = ({
  companyId,
  staffId,
  onClose,
}) => {
  const [profile, setProfile] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Focus trap for modal
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    getStaffProfile({ companyId, staffId })
      .then(data => {
        setProfile(data);
        setForm(data);
      })
      .catch(e => setError(e.message || 'Failed to load profile'))
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
    setForm((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateStaff({ companyId, staffId, data: form });
      setProfile(form);
      setEdit(false);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {return <div aria-live="polite" style={{color: 'var(--color-text-secondary)'}}>Loading profile...</div>;}
  if (error)
    {return (
      <div style={{ color: 'var(--color-error-text)' }} role="alert" aria-live="assertive">
        {error}
      </div>
    );}
  if (!profile) {return <div aria-live="polite" style={{color: 'var(--color-text-secondary)'}}>Profile not found.</div>;}

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
              value={form.personalDetails.firstName}
              onChange={e => handleChange('personalDetails', 'firstName', e.target.value)}
            />
            <label htmlFor="profile-last-name">Last Name</label>
            <input
              id="profile-last-name"
              value={form.personalDetails.lastName}
              onChange={e => handleChange('personalDetails', 'lastName', e.target.value)}
            />
            {/* Add more fields as needed, each with label+id */}
            <button className="staff-profile-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        ) : (
          <div className="staff-profile-view">
            <div>
              <b>Name:</b> {profile.personalDetails.firstName} {profile.personalDetails.lastName}
            </div>
            <div>
              <b>ID/Passport:</b> {profile.personalDetails.idNumber}
            </div>
            <div>
              <b>Department:</b> {profile.employmentDetails.department}
            </div>
            {/* Add more fields as needed */}
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
