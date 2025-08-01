import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../core/config/firebase.config';
import { Company } from '../../../shared/types';

const CompanyManagement: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    sector: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const companiesSnapshot = await getDocs(collection(db, 'companies'));
      const companiesData = companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const companyData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };

      if (editingCompany) {
        await updateDoc(doc(db, 'companies', editingCompany.id), {
          ...companyData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'companies'), companyData);
      }
      
      resetForm();
      loadCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      taxId: company.taxId || '',
      sector: company.sector || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (companyId: string) => {
    if (window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'companies', companyId));
        loadCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      sector: ''
    });
    setEditingCompany(null);
    setShowForm(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>Loading companies...</div>;
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Company Management</h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--color-primary-600)',
            color: 'var(--color-text-inverse)',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all var(--transition-normal)'
          }}
        >
          + Add New Company
        </button>
      </div>

      {showForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'var(--color-overlay-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-modal-bg)',
            borderRadius: 8,
            padding: '32px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid var(--color-border-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginTop: 0, color: 'var(--color-text-primary)' }}>
              {editingCompany ? 'Edit Company' : 'Add New Company'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--color-input-border)',
                    borderRadius: 4,
                    fontSize: '14px',
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-normal)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--color-input-border)',
                    borderRadius: 4,
                    fontSize: '14px',
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-normal)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--color-input-border)',
                    borderRadius: 4,
                    fontSize: '14px',
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-normal)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--color-input-border)',
                    borderRadius: 4,
                    fontSize: '14px',
                    resize: 'vertical',
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-normal)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Tax ID
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--color-input-border)',
                    borderRadius: 4,
                    fontSize: '14px',
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-normal)'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                  Sector/Industry
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--color-input-border)',
                    borderRadius: 4,
                    fontSize: '14px',
                    backgroundColor: 'var(--color-input-bg)',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  <option value="">Select sector...</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail</option>
                  <option value="services">Services</option>
                  <option value="agriculture">Agriculture</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 4,
                    border: '1px solid var(--color-border-primary)',
                    background: 'var(--color-bg-secondary)',
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    borderRadius: 4,
                    border: 'none',
                    background: 'var(--color-primary-600)',
                    color: 'var(--color-text-inverse)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  {editingCompany ? 'Update' : 'Create'} Company
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{
        background: 'var(--color-card-bg)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        transition: 'all var(--transition-normal)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
          gap: '16px',
          padding: '16px',
          background: 'var(--color-bg-tertiary)',
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--color-text-primary)',
          borderBottom: '1px solid var(--color-border-primary)'
        }}>
          <div>Company Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Sector</div>
          <div>Actions</div>
        </div>

        {companies.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No companies found. Add your first company to get started.
          </div>
        ) : (
          companies.map((company) => (
            <div
              key={company.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr auto',
                gap: '16px',
                padding: '16px',
                borderBottom: '1px solid var(--color-border-primary)',
                alignItems: 'center',
                backgroundColor: 'var(--color-bg-secondary)',
                transition: 'all var(--transition-normal)'
              }}
            >
              <div>
                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{company.name}</div>
                {company.taxId && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    Tax ID: {company.taxId}
                  </div>
                )}
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{company.email || '—'}</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{company.phone || '—'}</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{company.sector || '—'}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleEdit(company)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid var(--color-primary-500)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-primary-600)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(company.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid var(--color-error-500)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-error-600)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CompanyManagement;