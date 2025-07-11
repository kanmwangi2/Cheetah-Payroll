import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../../core/config/firebase.config';
import { User, Company } from '../../../shared/types';

const roleLabels: Record<string, string> = {
  primary_admin: 'Primary Admin',
  app_admin: 'App Admin',
  company_admin: 'Company Admin',
  payroll_approver: 'Payroll Approver',
  payroll_preparer: 'Payroll Preparer',
};

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
      console.error('Error loading users:', error);
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
      console.error('Error loading companies:', error);
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
      console.error('Error saving user:', error);
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
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert('Password reset email sent successfully!');
    } catch (error) {
      console.error('Error sending password reset:', error);
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
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading users...</div>;
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{ margin: 0, color: '#333' }}>User Management</h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 20px',
            borderRadius: 6,
            border: 'none',
            background: '#1976d2',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 500
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
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 8,
            padding: '32px',
            width: '600px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginTop: 0, color: '#333' }}>
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
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
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
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
                      backgroundColor: editingUser ? '#f8f9fa' : '#fff'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: '14px'
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
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: 4,
                      fontSize: '14px'
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

              {(formData.role === 'company_admin' || formData.role === 'payroll_approver' || formData.role === 'payroll_preparer') && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
                    Assign to Companies
                  </label>
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    padding: '12px',
                    maxHeight: '150px',
                    overflow: 'auto'
                  }}>
                    {companies.length === 0 ? (
                      <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
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
                    border: '1px solid #ddd',
                    background: '#fff',
                    cursor: 'pointer'
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
                    background: '#1976d2',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 500
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
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: 8,
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.5fr 1fr 1fr auto',
          gap: '16px',
          padding: '16px',
          background: '#e9ecef',
          fontWeight: 600,
          fontSize: '14px',
          color: '#495057'
        }}>
          <div>User Details</div>
          <div>Email</div>
          <div>Role</div>
          <div>Companies</div>
          <div>Actions</div>
        </div>

        {users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
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
                borderBottom: '1px solid #dee2e6',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ fontWeight: 500, color: '#212529' }}>{user.name}</div>
                {user.phone && (
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    {user.phone}
                  </div>
                )}
                {user.department && (
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    {user.department}
                  </div>
                )}
              </div>
              <div style={{ color: '#6c757d', fontSize: '14px' }}>{user.email}</div>
              <div>
                <span style={{
                  backgroundColor: user.role === 'primary_admin' ? '#dc3545' : 
                                 user.role === 'app_admin' ? '#fd7e14' :
                                 user.role === 'company_admin' ? '#198754' : '#0d6efd',
                  color: '#fff',
                  padding: '4px 8px',
                  borderRadius: 12,
                  fontSize: '11px',
                  fontWeight: 500
                }}>
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
              <div style={{ color: '#6c757d', fontSize: '12px' }}>
                {user.companyIds?.length || 0} companies
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleEdit(user)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: '1px solid #1976d2',
                    background: '#fff',
                    color: '#1976d2',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleResetPassword(user.email)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 4,
                    border: '1px solid #28a745',
                    background: '#fff',
                    color: '#28a745',
                    cursor: 'pointer',
                    fontSize: '11px'
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
                      border: '1px solid #dc3545',
                      background: '#fff',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '11px'
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