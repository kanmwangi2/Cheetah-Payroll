import React, { useState, useEffect } from 'react';
import { updatePassword, updateProfile } from 'firebase/auth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { useAuthContext } from '../../../core/providers/AuthProvider';

const db = getFirestore();

const UserProfile: React.FC = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    theme: localStorage.getItem('theme') || 'system',
    language: 'en',
    emailNotifications: true,
    pushNotifications: true,
    twoFactorAuth: false,
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        department: user.department || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {return;}

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Update Firestore user document
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        name: profileForm.name,
        phone: profileForm.phone,
        department: profileForm.department,
        updatedAt: new Date().toISOString(),
      });

      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {return;}

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updatePassword(user as any, passwordForm.newPassword);
      setSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h2>User Profile</h2>
      
      {/* Tab Navigation */}
      <div style={{ borderBottom: '1px solid #e0e0e0', marginBottom: '24px' }}>
        {[
          { key: 'profile', label: 'Profile' },
          { key: 'security', label: 'Security' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #1976d2' : '2px solid transparent',
              color: activeTab === tab.key ? '#1976d2' : '#666',
              fontWeight: activeTab === tab.key ? '600' : 'normal',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{
          padding: '12px',
          background: '#ffebee',
          color: '#c62828',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px',
          background: '#e8f5e8',
          color: '#2e7d32',
          border: '1px solid #c8e6c9',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {success}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate}>
          <h3>Profile Information</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label>
                Full Name
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
            </div>
            
            <div>
              <label>
                Email Address
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px', background: '#f5f5f5' }}
                />
              </label>
              <small style={{ color: '#666' }}>Email cannot be changed here</small>
            </div>
            
            <div>
              <label>
                Phone Number
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
            </div>
            
            <div>
              <label>
                Department
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <strong>Role:</strong> {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      )}

      {activeTab === 'security' && (
        <form onSubmit={handlePasswordChange}>
          <h3>Security Settings</h3>
          
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label>
                Current Password
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label>
                New Password
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
              <small style={{ color: '#666' }}>Minimum 6 characters</small>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label>
                Confirm New Password
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '4px' }}
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default UserProfile;