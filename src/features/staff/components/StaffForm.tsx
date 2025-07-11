import React, { useState } from 'react';
import { createStaff } from '../services/staff.service';

const initialState = {
  personalDetails: {
    firstName: '',
    lastName: '',
    idNumber: '',
    rssbNumber: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
  },
  employmentDetails: {
    startDate: '',
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
    if (!p.firstName || !p.lastName || !p.idNumber || !p.rssbNumber || !e.department) return false;
    if (!e.startDate || !e.position || !e.employmentType) return false;
    if (!p.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email)) return false;
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setError('Please fill all required fields with valid data.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await createStaff({ companyId, data: form });
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
        <input
          placeholder="Emergency Contact"
          value={form.personalDetails.emergencyContact}
          onChange={e => handleChange('personalDetails', 'emergencyContact', e.target.value)}
        />
      </div>
      <div className="staff-form-row">
        <input
          placeholder="Department*"
          value={form.employmentDetails.department}
          onChange={e => handleChange('employmentDetails', 'department', e.target.value)}
          required
        />
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
      <button className="staff-form-btn" type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Staff'}
      </button>
      {error && (
        <div className="staff-form-error" role="alert" aria-live="assertive">
          {error}
        </div>
      )}
    </form>
  );
};

export default StaffForm;
