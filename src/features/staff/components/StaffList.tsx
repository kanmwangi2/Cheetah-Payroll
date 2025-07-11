import React, { useEffect, useState } from 'react';
import { getStaff } from '../services/staff.service';
import StaffForm from './StaffForm';
import StaffProfile from './StaffProfile';
import StaffImportExport from './StaffImportExport';

const StaffList: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getStaff(companyId)
      .then(setStaff)
      .catch(e => setError(e.message || 'Failed to load staff'))
      .finally(() => setLoading(false));
  }, [companyId, refresh]);

  const filteredStaff = staff.filter(
    s =>
      (s.personalDetails?.firstName || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.personalDetails?.lastName || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.personalDetails?.idNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div aria-live="polite">Loading staff...</div>;
  if (error)
    return (
      <div style={{ color: 'red' }} role="alert" aria-live="assertive">
        {error}
      </div>
    );

  return (
    <div className="staff-list-container">
      <a href="#main-content" className="skip-link visually-hidden-focusable">
        Skip to main content
      </a>
      <div className="staff-list-header">
        <h2>Staff List</h2>
        <label htmlFor="staff-search-input" className="visually-hidden">
          Search staff
        </label>
        <input
          id="staff-search-input"
          type="text"
          placeholder="Search staff..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="staff-search-input"
        />
      </div>
      <StaffForm companyId={companyId} onAdded={() => setRefresh(r => r + 1)} />
      <StaffImportExport
        companyId={companyId}
        onImported={() => setRefresh(r => r + 1)}
        staff={staff}
      />
      {selected && (
        <StaffProfile companyId={companyId} staffId={selected} onClose={() => setSelected(null)} />
      )}
      {filteredStaff.length === 0 ? (
        <div aria-live="polite">No staff found.</div>
      ) : (
        <div className="staff-table-wrapper">
          <table className="staff-table">
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
              {filteredStaff.map(s => (
                <tr key={s.id}>
                  <td>{s.personalDetails?.firstName}</td>
                  <td>{s.personalDetails?.lastName}</td>
                  <td>{s.personalDetails?.idNumber}</td>
                  <td>{s.employmentDetails?.department}</td>
                  <td>
                    <button className="staff-profile-btn" onClick={() => setSelected(s.id)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffList;
