import React, { useEffect, useState } from 'react';
import { getStaff } from '../staff';
import StaffForm from './StaffForm';
import StaffProfile from './StaffProfile';
import StaffImportExport from './StaffImportExport';

const StaffList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    getStaff(companyId)
      .then(setStaff)
      .catch(e => setError(e.message || 'Failed to load staff'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  if (loading) return <div>Loading staff...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Staff List</h2>
      <StaffForm companyId={companyId} onAdded={() => setRefresh(r => r + 1)} />
      <StaffImportExport companyId={companyId} onImported={() => setRefresh(r => r + 1)} staff={staff} />
      {selected && (
        <StaffProfile companyId={companyId} staffId={selected} onClose={() => setSelected(null)} />
      )}
      {staff.length === 0 ? (
        <div>No staff found.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>ID/Passport</th>
              <th>Department</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id}>
                <td>{s.personalDetails?.firstName}</td>
                <td>{s.personalDetails?.lastName}</td>
                <td>{s.personalDetails?.idNumber}</td>
                <td>{s.employmentDetails?.department}</td>
                <td><button onClick={() => setSelected(s.id)}>View</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffList;
