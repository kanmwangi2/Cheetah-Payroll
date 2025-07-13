import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../../core/config/firebase.config';
import { User, Company } from '../../../shared/types';
import { isPayrollPreparerOrHigher, getRoleDisplayName } from '../../../shared/constants/app.constants';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    companyIds: [] as string[],
    phone: '',
    department: ''
  });

  useEffect(() => {
    Promise.all([loadUsers(), loadCompanies()]).finally(() => setLoading(false));
  }, []);

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'app_settings/users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      // console.error('Error loading users:', error);
    }
  };

  const loadCompanies = async () => {
    try {
      const companiesSnapshot = await getDocs(collection(db, 'companies'));
      const companiesData = companiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[];
      setCompanies(companiesData);
    } catch (error) {
      // console.error('Error loading companies:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      };

      if (editingUser) {
        await updateDoc(doc(db, 'app_settings/users', editingUser.id), {
          ...userData,
          updatedAt: new Date()
        });
      } else {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, 'TempPass123!');
        const firebaseUser = userCredential.user;
        
        // Send password reset email so user can set their own password
        await sendPasswordResetEmail(auth, formData.email);
        
        // Create user document
        await addDoc(collection(db, 'app_settings/users'), {
          ...userData,
          uid: firebaseUser.uid
        });
      }
      
      resetForm();
      loadUsers();
    } catch (error) {
      // console.error('Error saving user:', error);
      alert('Error creating user. Please try again.');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || '',
      companyIds: user.companyIds || [],
      phone: user.phone || '',
      department: user.department || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string, userRole: string) => {
    if (userRole === 'primary_admin') {
      alert('Cannot delete the Primary Admin user.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'app_settings/users', userId));
        loadUsers();
      } catch (error) {
        // console.error('Error deleting user:', error);
      }
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent successfully!');
    } catch (error) {
      // console.error('Error sending password reset:', error);
      alert('Error sending password reset email.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      companyIds: [],
      phone: '',
      department: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  const handleCompanySelection = (companyId: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, companyIds: [...formData.companyIds, companyId] });
    } else {
      setFormData({ ...formData, companyIds: formData.companyIds.filter(id => id !== companyId) });
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>Loading users...</div>;
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', minHeight: '100vh', padding: 'var(--spacing-lg)' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, color: 'var(--color-text-primary)' }}>User Management</h2>
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
          + Add New User
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
            width: '600px',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid var(--color-border-primary)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <h3 style={{ marginTop: 0, color: 'var(--color-text-primary)' }}>
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    Full Name *
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

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingUser}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: '14px',
                      backgroundColor: editingUser ? 'var(--color-bg-tertiary)' : 'var(--color-input-bg)'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                  >
                    <option value="">Select role...</option>
                    <option value="app_admin">App Admin</option>
                    <option value="company_admin">Company Admin</option>
                    <option value="payroll_approver">Payroll Approver</option>
                    <option value="payroll_preparer">Payroll Preparer</option>
                  </select>
                </div>

                <div>
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
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    fontSize: '14px'
                  }}
                />
              </div>

              {formData.role && isPayrollPreparerOrHigher(formData.role as any) && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    Assign to Companies
                  </label>
                  <div style={{
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: 4,
                    padding: '12px',
                    maxHeight: '150px',
                    overflow: 'auto',
                    backgroundColor: 'var(--color-bg-secondary)'
                  }}>
                    {companies.length === 0 ? (
                      <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                        No companies available. Create companies first.
                      </div>
                    ) : (
                      companies.map(company => (
                        <label key={company.id} style={{ 
                          display: 'block', 
                          marginBottom: '8px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={formData.companyIds.includes(company.id)}
                            onChange={(e) => handleCompanySelection(company.id, e.target.checked)}
                            style={{ marginRight: '8px' }}
                          />
                          {company.name}
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

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
                  {editingUser ? 'Update' : 'Create'} User
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
          gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto',
          gap: '16px',
          padding: '16px',
          background: 'var(--color-bg-tertiary)',
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--color-text-primary)',
          borderBottom: '1px solid var(--color-border-primary)'
        }}>
          <div>User Details</div>
          <div>Email</div>
          <div>Role</div>
          <div>Companies</div>
          <div>Actions</div>
        </div>

        {users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            No users found. Add your first user to get started.
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto',
                gap: '16px',
                padding: '16px',
                borderBottom: '1px solid var(--color-border-primary)',
                alignItems: 'center',
                backgroundColor: 'var(--color-bg-secondary)',
                transition: 'all var(--transition-normal)'
              }}
            >
              <div>
                <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{user.name}</div>
                {user.phone && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {user.phone}
                  </div>
                )}
                {user.department && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    {user.department}
                  </div>
                )}
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>{user.email}</div>
              <div>
                <span style={{
                  backgroundColor: user.role === 'primary_admin' ? 'var(--color-error-500)' : 
                                 user.role === 'app_admin' ? 'var(--color-warning-500)' :
                                 user.role === 'company_admin' ? 'var(--color-success-500)' : 'var(--color-primary-500)',
                  color: 'var(--color-text-inverse)',
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontSize: '11px',
                  fontWeight: 500
                }}>
                  {getRoleDisplayName(user.role)}
                </span>
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                {user.companyIds?.length || 0} companies
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleEdit(user)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: '1px solid var(--color-primary-500)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-primary-600)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleResetPassword(user.email)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: '1px solid var(--color-success-500)',
                    background: 'var(--color-bg-secondary)',
                    color: 'var(--color-success-600)',
                    cursor: 'pointer',
                    fontSize: '11px',
                    transition: 'all var(--transition-normal)'
                  }}
                >
                  Reset
                </button>
                {user.role !== 'primary_admin' && (
                  <button
                    onClick={() => handleDelete(user.id, user.role)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid var(--color-error-500)',
                      background: 'var(--color-bg-secondary)',
                      color: 'var(--color-error-600)',
                      cursor: 'pointer',
                      fontSize: '11px',
                      transition: 'all var(--transition-normal)'
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserManagement;