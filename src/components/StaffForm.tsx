import React, { useState } from 'react';
import { createStaff } from '../staff';

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

const StaffForm: React.FC<{ companyId: string; onAdded: () => void }> = ({ companyId, onAdded }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createStaff(companyId, form);
      setForm(initialState);
      onAdded();
    } catch (err: any) {
      setError(err.message || 'Failed to add staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Staff</h3>
      <input placeholder="First Name" value={form.personalDetails.firstName} onChange={e => handleChange('personalDetails', 'firstName', e.target.value)} required />
      <input placeholder="Last Name" value={form.personalDetails.lastName} onChange={e => handleChange('personalDetails', 'lastName', e.target.value)} required />
      <input placeholder="ID/Passport Number" value={form.personalDetails.idNumber} onChange={e => handleChange('personalDetails', 'idNumber', e.target.value)} required />
      <input placeholder="RSSB Number" value={form.personalDetails.rssbNumber} onChange={e => handleChange('personalDetails', 'rssbNumber', e.target.value)} required />
      <input placeholder="Department" value={form.employmentDetails.department} onChange={e => handleChange('employmentDetails', 'department', e.target.value)} required />
      {/* Add more fields as needed */}
      <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Staff'}</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
};

export default StaffForm;
