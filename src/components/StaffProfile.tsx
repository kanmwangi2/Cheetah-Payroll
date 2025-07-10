import React, { useEffect, useState } from 'react';
import { getStaffProfile, updateStaff } from '../staff';

const StaffProfile: React.FC<{ companyId: string; staffId: string; onClose: () => void }> = ({ companyId, staffId, onClose }) => {
  const [profile, setProfile] = useState<any>(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStaffProfile(companyId, staffId)
      .then(data => {
        setProfile(data);
        setForm(data);
      })
      .catch(e => setError(e.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
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
      await updateStaff(companyId, staffId, form);
      setProfile(form);
      setEdit(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!profile) return <div>Profile not found.</div>;

  return (
    <div style={{ border: '1px solid #ccc', padding: 16, margin: 16 }}>
      <button onClick={onClose}>Close</button>
      <h3>Staff Profile</h3>
      {edit ? (
        <div>
          <input value={form.personalDetails.firstName} onChange={e => handleChange('personalDetails', 'firstName', e.target.value)} />
          <input value={form.personalDetails.lastName} onChange={e => handleChange('personalDetails', 'lastName', e.target.value)} />
          {/* Add more fields as needed */}
          <button onClick={handleSave}>Save</button>
        </div>
      ) : (
        <div>
          <div>First Name: {profile.personalDetails.firstName}</div>
          <div>Last Name: {profile.personalDetails.lastName}</div>
          {/* Add more fields as needed */}
          <button onClick={() => setEdit(true)}>Edit</button>
        </div>
      )}
    </div>
  );
};

export default StaffProfile;
