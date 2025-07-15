import React, { useEffect, useState, useRef } from 'react';
import { getStaffProfile, updateStaff } from '../services/staff.service';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
import Button from '../../../shared/components/ui/Button';

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
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  employmentType?: string;
  bankName?: string;
  accountNumber?: string;
  personalDetails?: {
    firstName?: string;
    lastName?: string;
    idNumber?: string;
    rssbNumber?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    maritalStatus?: string;
    nationality?: string;
    address?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelationship?: string;
    [key: string]: any;
  };
  employmentDetails?: {
    staffNumber?: string;
    position?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'inactive';
    employmentType?: string;
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
  const [originalProfile, setOriginalProfile] = useState<StaffData | null>(null);
  const [form, setForm] = useState<StaffData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  
  // Common countries list (same as StaffForm)
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 
    'Brazil', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'China', 'Colombia', 'Congo', 'Denmark', 
    'Egypt', 'Ethiopia', 'France', 'Germany', 'Ghana', 'India', 'Indonesia', 'Iran', 'Iraq', 'Italy', 
    'Japan', 'Kenya', 'Madagascar', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'Nigeria', 'Norway', 
    'Pakistan', 'Peru', 'Philippines', 'Poland', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 
    'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Tanzania', 
    'Thailand', 'Turkey', 'Uganda', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam', 'Yemen'
  ];
  
  // Common departments (same as StaffForm)
  const commonDepartments = [
    'Human Resources', 'Finance', 'Accounting', 'IT', 'Marketing', 'Sales', 'Operations', 
    'Administration', 'Legal', 'Customer Service', 'Procurement', 'Security', 'Maintenance'
  ];

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
      dateOfBirth: data.dateOfBirth || data.personalDetails?.dateOfBirth || '',
      gender: data.gender || data.personalDetails?.gender || '',
      maritalStatus: data.maritalStatus || data.personalDetails?.maritalStatus || '',
      nationality: data.nationality || data.personalDetails?.nationality || '',
      address: data.address || data.personalDetails?.address || '',
      emergencyContactName: data.emergencyContactName || data.personalDetails?.emergencyContactName || data.emergencyContact?.name || '',
      emergencyContactPhone: data.emergencyContactPhone || data.personalDetails?.emergencyContactPhone || data.emergencyContact?.phone || '',
      emergencyContactRelationship: data.emergencyContactRelationship || data.personalDetails?.emergencyContactRelationship || data.emergencyContact?.relationship || '',
      employmentType: data.employmentType || data.employmentDetails?.employmentType || '',
      bankName: data.bankName || data.bankDetails?.bankName || '',
      accountNumber: data.accountNumber || data.bankDetails?.accountNumber || '',
    };
  };
  
  // Load departments (same logic as StaffForm)
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const staffSnapshot = await getDocs(collection(db, 'companies', companyId, 'staff'));
        const existingDepartments = staffSnapshot.docs
          .map(doc => doc.data().department)
          .filter(Boolean);
        
        const allDepartments = [...new Set([...commonDepartments, ...existingDepartments])].sort();
        setDepartments(allDepartments);
      } catch (error) {
        setDepartments(commonDepartments);
      }
    };

    loadDepartments();
  }, [companyId]);
  
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
        
        setOriginalProfile(normalizedData);
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
      if (!modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[0].focus();
    };
    setTimeout(focusFirst, 0);
  }, [companyId, staffId]);

  const handleChange = (field: string, value: string) => {
    setForm((prev: StaffData | null) => {
      if (!prev) return null;
      
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const validate = () => {
    if (!form) return false;
    
    if (!form.firstName || !form.lastName || !form.idNumber || !form.rssbNumber || !form.staffNumber) return false;
    if (!form.nationality || !form.emergencyContactName || !form.emergencyContactPhone || !form.emergencyContactRelationship) return false;
    if (!form.department || !form.startDate || !form.position || !form.employmentType) return false;
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return false;
    
    // Validate end date is after start date (if both are provided)
    if (form.endDate && form.startDate && new Date(form.endDate) <= new Date(form.startDate)) {
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!form) {
      setError('No data to save');
      return;
    }
    
    if (!validate()) {
      if (form.endDate && form.startDate && new Date(form.endDate) <= new Date(form.startDate)) {
        setError('End date must be after the start date.');
      } else {
        setError('Please fill all required fields with valid data.');
      }
      return;
    }
    
    setSaving(true);
    setError(null);
    try {
      // Flatten form data to match service interface (same as StaffForm)
      const flatData = {
        firstName: form.firstName,
        lastName: form.lastName,
        idNumber: form.idNumber,
        rssbNumber: form.rssbNumber,
        staffNumber: form.staffNumber,
        email: form.email,
        phone: form.phone,
        department: form.department,
        position: form.position,
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        maritalStatus: form.maritalStatus,
        nationality: form.nationality,
        address: form.address,
        emergencyContactName: form.emergencyContactName,
        emergencyContactPhone: form.emergencyContactPhone,
        emergencyContactRelationship: form.emergencyContactRelationship,
        employmentType: form.employmentType,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        name: `${form.firstName || ''} ${form.lastName || ''}`.trim(),
        emergencyContact: `${form.emergencyContactName || ''} (${form.emergencyContactRelationship || ''}) - ${form.emergencyContactPhone || ''}`
      };
      
      await updateStaff({ companyId, staffId, data: flatData });
      setOriginalProfile(form);
      setEditMode(false);
    } catch (err: unknown) {
      const errorMessage = (err as Error).message || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(originalProfile);
    setEditMode(false);
    setError(null);
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
        aria-labelledby="staff-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close profile dialog">
            &times;
          </button>
          <div aria-live="polite" style={{color: 'var(--color-text-secondary)', padding: '40px', textAlign: 'center'}}>
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
          <div style={{ color: 'var(--color-error-text)', padding: '40px', textAlign: 'center' }} role="alert" aria-live="assertive">
            <h3>Error Loading Profile</h3>
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
        aria-labelledby="staff-profile-title"
        tabIndex={-1}
        ref={modalRef}
      >
        <div className="staff-profile-card">
          <button className="staff-profile-close" onClick={onClose} aria-label="Close profile dialog">
            &times;
          </button>
          <div aria-live="polite" style={{color: 'var(--color-text-secondary)', padding: '40px', textAlign: 'center'}}>
            <h3>Profile Not Found</h3>
            <p>The requested staff member could not be found.</p>
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
      aria-labelledby="staff-profile-title"
      tabIndex={-1}
      ref={modalRef}
      onKeyDown={handleKeyDown}
    >
      <div className="staff-profile-card">
        <button className="staff-profile-close" onClick={onClose} aria-label="Close profile dialog">
          &times;
        </button>
        
        <form className="staff-form" onSubmit={(e) => { e.preventDefault(); if (editMode) handleSave(); }}>
          <h3 id="staff-profile-title">{editMode ? 'Edit Staff' : 'Staff Profile'}</h3>
          
          <div className="staff-form-row">
            <input
              placeholder="First Name*"
              value={form.firstName || ''}
              onChange={e => handleChange('firstName', e.target.value)}
              required
              disabled={!editMode}
            />
            <input
              placeholder="Last Name*"
              value={form.lastName || ''}
              onChange={e => handleChange('lastName', e.target.value)}
              required
              disabled={!editMode}
            />
          </div>
          
          <div className="staff-form-row">
            <input
              placeholder="ID/Passport Number*"
              value={form.idNumber || ''}
              onChange={e => handleChange('idNumber', e.target.value)}
              required
              disabled={!editMode}
            />
            <input
              placeholder="RSSB Number*"
              value={form.rssbNumber || ''}
              onChange={e => handleChange('rssbNumber', e.target.value)}
              required
              disabled={!editMode}
            />
            <input
              placeholder="Staff Number*"
              value={form.staffNumber || ''}
              onChange={e => handleChange('staffNumber', e.target.value)}
              required
              disabled={!editMode}
            />
          </div>
          
          <div className="staff-form-row">
            <input
              placeholder="Date of Birth"
              type="date"
              value={form.dateOfBirth || ''}
              onChange={e => handleChange('dateOfBirth', e.target.value)}
              disabled={!editMode}
            />
            <select
              value={form.gender || ''}
              onChange={e => handleChange('gender', e.target.value)}
              disabled={!editMode}
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select
              value={form.maritalStatus || ''}
              onChange={e => handleChange('maritalStatus', e.target.value)}
              disabled={!editMode}
            >
              <option value="">Marital Status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
            </select>
            <select
              value={form.nationality || ''}
              onChange={e => handleChange('nationality', e.target.value)}
              disabled={!editMode}
            >
              <option value="">Nationality*</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
          
          <div className="staff-form-row">
            <input
              placeholder="Phone"
              value={form.phone || ''}
              onChange={e => handleChange('phone', e.target.value)}
              disabled={!editMode}
            />
            <input
              placeholder="Email*"
              value={form.email || ''}
              onChange={e => handleChange('email', e.target.value)}
              required
              disabled={!editMode}
            />
          </div>
          
          <div className="staff-form-row">
            <input
              placeholder="Address"
              value={form.address || ''}
              onChange={e => handleChange('address', e.target.value)}
              disabled={!editMode}
            />
          </div>
          
          <h4>Emergency Contact</h4>
          <div className="staff-form-row">
            <input
              placeholder="Emergency Contact Name*"
              value={form.emergencyContactName || ''}
              onChange={e => handleChange('emergencyContactName', e.target.value)}
              required
              disabled={!editMode}
            />
            <input
              placeholder="Emergency Contact Phone*"
              value={form.emergencyContactPhone || ''}
              onChange={e => handleChange('emergencyContactPhone', e.target.value)}
              required
              disabled={!editMode}
            />
            <select
              value={form.emergencyContactRelationship || ''}
              onChange={e => handleChange('emergencyContactRelationship', e.target.value)}
              required
              disabled={!editMode}
            >
              <option value="">Relationship*</option>
              <option value="Spouse">Spouse</option>
              <option value="Parent">Parent</option>
              <option value="Mother">Mother</option>
              <option value="Father">Father</option>
              <option value="Child">Child</option>
              <option value="Sibling">Sibling</option>
              <option value="Friend">Friend</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <h4>Employment Details</h4>
          <div className="staff-form-row">
            <select
              value={form.department || ''}
              onChange={e => handleChange('department', e.target.value)}
              required
              disabled={!editMode}
            >
              <option value="">Department*</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            <input
              placeholder="Position*"
              value={form.position || ''}
              onChange={e => handleChange('position', e.target.value)}
              required
              disabled={!editMode}
            />
            <input
              placeholder="Employment Type*"
              value={form.employmentType || ''}
              onChange={e => handleChange('employmentType', e.target.value)}
              required
              disabled={!editMode}
            />
            <input
              placeholder="Start Date*"
              type="date"
              value={form.startDate || ''}
              onChange={e => handleChange('startDate', e.target.value)}
              required
              disabled={!editMode}
            />
            <input
              placeholder="End Date (optional)"
              type="date"
              value={form.endDate || ''}
              onChange={e => handleChange('endDate', e.target.value)}
              disabled={!editMode}
            />
          </div>
          
          <div className="staff-form-row">
            <input
              placeholder="Bank Name"
              value={form.bankName || ''}
              onChange={e => handleChange('bankName', e.target.value)}
              disabled={!editMode}
            />
            <input
              placeholder="Account Number"
              value={form.accountNumber || ''}
              onChange={e => handleChange('accountNumber', e.target.value)}
              disabled={!editMode}
            />
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

export default StaffProfile;