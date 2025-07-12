import React, { useState, useEffect } from 'react';
import { updatePassword, updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
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

  const [emailChangeForm, setEmailChangeForm] = useState({
    newEmail: '',
    currentPassword: '',
  });

  const [showEmailChange, setShowEmailChange] = useState(false);

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

      // Update Firebase Auth display name if changed
      if (user.displayName !== profileForm.name) {
        await updateProfile(user as any, { displayName: profileForm.name });
      }

      setSuccess('Profile updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) {return;}

    if (emailChangeForm.newEmail === user.email) {
      setError('New email must be different from current email');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Reauthenticate user before changing email
      const credential = EmailAuthProvider.credential(user.email, emailChangeForm.currentPassword);
      await reauthenticateWithCredential(user as any, credential);

      // Update email in Firebase Auth
      await updateEmail(user as any, emailChangeForm.newEmail);

      // Update email in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        email: emailChangeForm.newEmail,
        updatedAt: new Date().toISOString(),
      });

      setSuccess('Email updated successfully. Please verify your new email address.');
      setProfileForm({ ...profileForm, email: emailChangeForm.newEmail });
      setEmailChangeForm({ newEmail: '', currentPassword: '' });
      setShowEmailChange(false);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use by another account');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(err.message || 'Failed to update email');
      }
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
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: 'var(--spacing-xl)',
      background: 'var(--color-bg-primary)',
      minHeight: '100vh'
    }}>
      <h2 style={{ 
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-xl)',
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-bold)'
      }}>User Profile</h2>
      
      {/* Tab Navigation */}
      <div style={{ borderBottom: '1px solid var(--color-border-primary)', marginBottom: '24px' }}>
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
              borderBottom: activeTab === tab.key ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              color: activeTab === tab.key ? 'var(--color-primary-600)' : 'var(--color-text-secondary)',
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
          padding: 'var(--spacing-md)',
          background: 'var(--color-error-bg)',
          color: 'var(--color-error-text)',
          border: '1px solid var(--color-error-border)',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          padding: 'var(--spacing-md)',
          background: 'var(--color-success-bg)',
          color: 'var(--color-success-text)',
          border: '1px solid var(--color-success-border)',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          {success}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'profile' && (
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-xl)'
        }}>
          <form onSubmit={handleProfileUpdate}>
            <h3 style={{
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-lg)',
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>Profile Information</h3>
          
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
              <div>
                <label style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-xs)',
                  display: 'block'
                }}>
                  Full Name
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-md)', 
                      border: '1px solid var(--color-input-border)', 
                      borderRadius: 'var(--border-radius-md)', 
                      marginTop: 'var(--spacing-xs)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-base)'
                    }}
                  />
                </label>
              </div>
            
              <div>
                <label style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-xs)',
                  display: 'block'
                }}>
                  Email Address
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-xs)' }}>
                    <input
                      type="email"
                      value={profileForm.email}
                      disabled
                      style={{ 
                        flex: 1,
                        padding: 'var(--spacing-md)', 
                        border: '1px solid var(--color-input-border)', 
                        borderRadius: 'var(--border-radius-md)', 
                        background: 'var(--color-input-disabled)',
                        color: 'var(--color-text-secondary)',
                        fontSize: 'var(--font-size-base)'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmailChange(true)}
                      style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        background: 'var(--color-warning-500)',
                        color: 'var(--color-text-inverse)',
                        border: 'none',
                        borderRadius: 'var(--border-radius-md)',
                        fontSize: 'var(--font-size-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      Change
                    </button>
                  </div>
                </label>
              </div>
            
              <div>
                <label style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-xs)',
                  display: 'block'
                }}>
                  Phone Number
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-md)', 
                      border: '1px solid var(--color-input-border)', 
                      borderRadius: 'var(--border-radius-md)', 
                      marginTop: 'var(--spacing-xs)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-base)'
                    }}
                  />
                </label>
              </div>
            
              <div>
                <label style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-xs)',
                  display: 'block'
                }}>
                  Department
                  <input
                    type="text"
                    value={profileForm.department}
                    onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: 'var(--spacing-md)', 
                      border: '1px solid var(--color-input-border)', 
                      borderRadius: 'var(--border-radius-md)', 
                      marginTop: 'var(--spacing-xs)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-base)'
                    }}
                  />
                </label>
              </div>
            </div>

            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <strong style={{ color: 'var(--color-text-primary)' }}>Role:</strong> 
              <span style={{ color: 'var(--color-text-secondary)', marginLeft: 'var(--spacing-sm)' }}>
                {user?.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                background: 'var(--color-button-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>

          {/* Email Change Modal */}
          {showEmailChange && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--color-bg-overlay)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}>
              <div style={{
                background: 'var(--color-card-bg)',
                border: '1px solid var(--color-card-border)',
                padding: 'var(--spacing-xl)',
                borderRadius: 'var(--border-radius-xl)',
                maxWidth: '500px',
                width: '90%',
                maxHeight: '90vh',
                overflow: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                  <h3 style={{
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    fontSize: 'var(--font-size-xl)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}>Change Email Address</h3>
                  <button
                    onClick={() => setShowEmailChange(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      color: 'var(--color-text-secondary)',
                      padding: '4px'
                    }}
                  >
                    ×
                  </button>
                </div>
                
                <form onSubmit={handleEmailChange}>
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      marginBottom: 'var(--spacing-xs)',
                      display: 'block'
                    }}>
                      Current Email
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        style={{
                          width: '100%',
                          padding: 'var(--spacing-md)',
                          border: '1px solid var(--color-input-border)',
                          borderRadius: 'var(--border-radius-md)',
                          marginTop: 'var(--spacing-xs)',
                          background: 'var(--color-input-disabled)',
                          color: 'var(--color-text-secondary)',
                          fontSize: 'var(--font-size-base)'
                        }}
                      />
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                    <label style={{
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      marginBottom: 'var(--spacing-xs)',
                      display: 'block'
                    }}>
                      New Email Address
                      <input
                        type="email"
                        value={emailChangeForm.newEmail}
                        onChange={(e) => setEmailChangeForm({ ...emailChangeForm, newEmail: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: 'var(--spacing-md)',
                          border: '1px solid var(--color-input-border)',
                          borderRadius: 'var(--border-radius-md)',
                          marginTop: 'var(--spacing-xs)',
                          background: 'var(--color-input-bg)',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--font-size-base)'
                        }}
                      />
                    </label>
                  </div>
                  
                  <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                    <label style={{
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      marginBottom: 'var(--spacing-xs)',
                      display: 'block'
                    }}>
                      Current Password (for verification)
                      <input
                        type="password"
                        value={emailChangeForm.currentPassword}
                        onChange={(e) => setEmailChangeForm({ ...emailChangeForm, currentPassword: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: 'var(--spacing-md)',
                          border: '1px solid var(--color-input-border)',
                          borderRadius: 'var(--border-radius-md)',
                          marginTop: 'var(--spacing-xs)',
                          background: 'var(--color-input-bg)',
                          color: 'var(--color-text-primary)',
                          fontSize: 'var(--font-size-base)'
                        }}
                      />
                    </label>
                    <small style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-xs)' }}>
                      We need your current password to verify this change for security purposes.
                    </small>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailChange(false);
                        setEmailChangeForm({ newEmail: '', currentPassword: '' });
                      }}
                      style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        background: 'transparent',
                        color: 'var(--color-button-secondary)',
                        border: '1px solid var(--color-button-secondary)',
                        borderRadius: 'var(--border-radius-md)',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        padding: 'var(--spacing-md) var(--spacing-lg)',
                        background: 'var(--color-warning-500)',
                        color: 'var(--color-text-inverse)',
                        border: 'none',
                        borderRadius: 'var(--border-radius-md)',
                        cursor: loading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {loading ? 'Updating...' : 'Update Email'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-xl)'
        }}>
          <form onSubmit={handlePasswordChange}>
            <h3 style={{
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-lg)',
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)'
            }}>Security Settings</h3>
          
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-xs)',
                  display: 'block'
                }}>
                  Current Password
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--color-input-border)',
                      borderRadius: 'var(--border-radius-md)',
                      marginTop: 'var(--spacing-xs)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-base)'
                    }}
                  />
                </label>
              </div>
            
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-xs)',
                  display: 'block'
                }}>
                  New Password
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    minLength={6}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--color-input-border)',
                      borderRadius: 'var(--border-radius-md)',
                      marginTop: 'var(--spacing-xs)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-base)'
                    }}
                  />
                </label>
                <small style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-xs)' }}>Minimum 6 characters</small>
              </div>
            
              <div style={{ marginBottom: 'var(--spacing-lg)' }}>
                <label style={{
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  marginBottom: 'var(--spacing-xs)',
                  display: 'block'
                }}>
                  Confirm New Password
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-md)',
                      border: '1px solid var(--color-input-border)',
                      borderRadius: 'var(--border-radius-md)',
                      marginTop: 'var(--spacing-xs)',
                      background: 'var(--color-input-bg)',
                      color: 'var(--color-text-primary)',
                      fontSize: 'var(--font-size-base)'
                    }}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: 'var(--spacing-md) var(--spacing-xl)',
                background: 'var(--color-error-500)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 'var(--font-size-base)',
                fontWeight: 'var(--font-weight-medium)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserProfile;