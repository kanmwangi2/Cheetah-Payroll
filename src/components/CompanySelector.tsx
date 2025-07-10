import React, { useEffect, useState } from 'react';
import { getCompaniesForUser } from '../company';
import { auth } from '../auth';

const CompanySelector: React.FC<{ onSelect: (company: any) => void }> = ({ onSelect }) => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getCompaniesForUser(user.uid)
      .then(setCompanies)
      .catch(e => setError(e.message || 'Failed to load companies'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading companies...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (companies.length === 0) return <div>No companies found.</div>;

  return (
    <div>
      <h2>Select Company</h2>
      <ul>
        {companies.map(c => (
          <li key={c.id}>
            <button onClick={() => onSelect(c)}>{c.name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CompanySelector;
