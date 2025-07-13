import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
import { createStaff } from '../services/staff.service';
import Button from '../../../shared/components/ui/Button';

const initialState = {
  personalDetails: {
    firstName: '',
    lastName: '',
    idNumber: '',
    rssbNumber: '',
    staffNumber: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    nationality: '',
    phone: '',
    email: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
  },
  employmentDetails: {
    startDate: '',
    endDate: '',
    position: '',
    employmentType: '',
    department: '',
  },
  bankDetails: {
    bankName: '',
    accountNumber: '',
  },
};

const StaffForm: React.FC<{ companyId: string; onAdded: () => void }> = ({
  companyId,
  onAdded,
}) => {
  const [form, setForm] = useState<any>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<string[]>([]);
  
  // Common countries list
  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Bangladesh', 'Belgium', 
    'Brazil', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'China', 'Colombia', 'Congo', 'Denmark', 
    'Egypt', 'Ethiopia', 'France', 'Germany', 'Ghana', 'India', 'Indonesia', 'Iran', 'Iraq', 'Italy', 
    'Japan', 'Kenya', 'Madagascar', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'Nigeria', 'Norway', 
    'Pakistan', 'Peru', 'Philippines', 'Poland', 'Romania', 'Russia', 'Rwanda', 'Saudi Arabia', 
    'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland', 'Tanzania', 
    'Thailand', 'Turkey', 'Uganda', 'Ukraine', 'United Kingdom', 'United States', 'Vietnam', 'Yemen'
  ];
  
  // Common departments
  const commonDepartments = [
    'Human Resources', 'Finance', 'Accounting', 'IT', 'Marketing', 'Sales', 'Operations', 
    'Administration', 'Legal', 'Customer Service', 'Procurement', 'Security', 'Maintenance'
  ];

  // Load existing departments from staff and combine with common ones
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
        console.error('Error loading departments:', error);
        setDepartments(commonDepartments);
      }
    };

    loadDepartments();
  }, [companyId]);

  const handleChange = (section: string, field: string, value: string) => {
    setForm((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const validate = () => {
    const p = form.personalDetails;
    const e = form.employmentDetails;
    if (!p.firstName || !p.lastName || !p.idNumber || !p.rssbNumber || !p.staffNumber) { return false; }
    if (!p.nationality || !p.emergencyContactName || !p.emergencyContactPhone || !p.emergencyContactRelationship) { return false; }
    if (!e.department || !e.startDate || !e.position || !e.employmentType) { return false; }
    if (!p.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) { return false; }
    
    // Validate end date is after start date (if both are provided)
    if (e.endDate && e.startDate && new Date(e.endDate) <= new Date(e.startDate)) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const e = form.employmentDetails;
      if (e.endDate && e.startDate && new Date(e.endDate) <= new Date(e.startDate)) {
        setError('End date must be after the start date.');
      } else {
        setError('Please fill all required fields with valid data.');
      }
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Flatten form data to match service interface
      const flatData = {
        ...form.personalDetails,
        ...form.employmentDetails,
        ...form.bankDetails,
        name: `${form.personalDetails.firstName} ${form.personalDetails.lastName}`.trim(),
        // Create legacy emergencyContact for backward compatibility
        emergencyContact: `${form.personalDetails.emergencyContactName} (${form.personalDetails.emergencyContactRelationship}) - ${form.personalDetails.emergencyContactPhone}`
      };
      
      await createStaff({ companyId, data: flatData });
      setForm(initialState);
      onAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="staff-form" onSubmit={handleSubmit}>
      <h3>Add Staff</h3>
      <div className="staff-form-row">
        <input
          placeholder="First Name*"
          value={form.personalDetails.firstName}
          onChange={e => handleChange('personalDetails', 'firstName', e.target.value)}
          required
        />
        <input
          placeholder="Last Name*"
          value={form.personalDetails.lastName}
          onChange={e => handleChange('personalDetails', 'lastName', e.target.value)}
          required
        />
      </div>
      <div className="staff-form-row">
        <input
          placeholder="ID/Passport Number*"
          value={form.personalDetails.idNumber}
          onChange={e => handleChange('personalDetails', 'idNumber', e.target.value)}
          required
        />
        <input
          placeholder="RSSB Number*"
          value={form.personalDetails.rssbNumber}
          onChange={e => handleChange('personalDetails', 'rssbNumber', e.target.value)}
          required
        />
        <input
          placeholder="Staff Number*"
          value={form.personalDetails.staffNumber}
          onChange={e => handleChange('personalDetails', 'staffNumber', e.target.value)}
          required
        />
      </div>
      <div className="staff-form-row">
        <input
          placeholder="Date of Birth"
          type="date"
          value={form.personalDetails.dateOfBirth}
          onChange={e => handleChange('personalDetails', 'dateOfBirth', e.target.value)}
        />
        <select
          value={form.personalDetails.gender}
          onChange={e => handleChange('personalDetails', 'gender', e.target.value)}
        >
          <option value="">Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
        <select
          value={form.personalDetails.maritalStatus}
          onChange={e => handleChange('personalDetails', 'maritalStatus', e.target.value)}
        >
          <option value="">Marital Status</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
        </select>
        <select
          value={form.personalDetails.nationality}
          onChange={e => handleChange('personalDetails', 'nationality', e.target.value)}
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
          value={form.personalDetails.phone}
          onChange={e => handleChange('personalDetails', 'phone', e.target.value)}
        />
        <input
          placeholder="Email*"
          value={form.personalDetails.email}
          onChange={e => handleChange('personalDetails', 'email', e.target.value)}
          required
        />
      </div>
      <div className="staff-form-row">
        <input
          placeholder="Address"
          value={form.personalDetails.address}
          onChange={e => handleChange('personalDetails', 'address', e.target.value)}
        />
      </div>
      <h4>Emergency Contact</h4>
      <div className="staff-form-row">
        <input
          placeholder="Emergency Contact Name*"
          value={form.personalDetails.emergencyContactName}
          onChange={e => handleChange('personalDetails', 'emergencyContactName', e.target.value)}
          required
        />
        <input
          placeholder="Emergency Contact Phone*"
          value={form.personalDetails.emergencyContactPhone}
          onChange={e => handleChange('personalDetails', 'emergencyContactPhone', e.target.value)}
          required
        />
        <select
          value={form.personalDetails.emergencyContactRelationship}
          onChange={e => handleChange('personalDetails', 'emergencyContactRelationship', e.target.value)}
          required
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
          value={form.employmentDetails.department}
          onChange={e => handleChange('employmentDetails', 'department', e.target.value)}
          required
        >
          <option value="">Department*</option>
          {departments.map(dept => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
        <input
          placeholder="Position*"
          value={form.employmentDetails.position}
          onChange={e => handleChange('employmentDetails', 'position', e.target.value)}
          required
        />
        <input
          placeholder="Employment Type*"
          value={form.employmentDetails.employmentType}
          onChange={e => handleChange('employmentDetails', 'employmentType', e.target.value)}
          required
        />
        <input
          placeholder="Start Date*"
          type="date"
          value={form.employmentDetails.startDate}
          onChange={e => handleChange('employmentDetails', 'startDate', e.target.value)}
          required
        />
        <input
          placeholder="End Date (optional)"
          type="date"
          value={form.employmentDetails.endDate}
          onChange={e => handleChange('employmentDetails', 'endDate', e.target.value)}
        />
      </div>
      <div className="staff-form-row">
        <input
          placeholder="Bank Name"
          value={form.bankDetails.bankName}
          onChange={e => handleChange('bankDetails', 'bankName', e.target.value)}
        />
        <input
          placeholder="Account Number"
          value={form.bankDetails.accountNumber}
          onChange={e => handleChange('bankDetails', 'accountNumber', e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} variant="primary" loading={loading}>
        Add Staff
      </Button>
      {error && (
        <div className="staff-form-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
    </form>
  );
};

export default StaffForm;
