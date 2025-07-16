import React, { useState, useEffect, useRef } from 'react';
import { updatePassword, updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, updateDoc, getFirestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthContext } from '../../../core/providers/AuthProvider';
import ProfilePicture from '../../../shared/components/ui/ProfilePicture';
import Button from '../../../shared/components/ui/Button';

const db = getFirestore();
const storage = getStorage();

const UserProfile: React.FC = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'picture'>('profile');

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

  // Profile picture state
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.photoURL || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropData, setCropData] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      if ((user as any).displayName !== profileForm.name) {
        await updateProfile(user as any, { displayName: profileForm.name });
      }

      setSuccess('Profile updated successfully');
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update profile');
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
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/wrong-password') {
        setError('Current password is incorrect');
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        setError('This email is already in use by another account');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else {
        setError(firebaseError.message || 'Failed to update email');
      }
    } finally {
      setLoading(false);
    }
  };

  // Profile picture handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropChange = (field: string, value: number) => {
    setCropData(prev => ({ ...prev, [field]: value }));
  };

  const cropImage = (imageUrl: string): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const image = new Image();
      
      image.onload = () => {
        canvas.width = cropData.width;
        canvas.height = cropData.height;
        
        ctx.drawImage(
          image,
          cropData.x,
          cropData.y,
          cropData.width,
          cropData.height,
          0,
          0,
          cropData.width,
          cropData.height
        );
        
        canvas.toBlob((blob: Blob | null) => {
          resolve(blob!);
        }, 'image/jpeg', 0.9);
      };
      
      image.src = imageUrl;
    });
  };

  const handleProfilePictureUpload = async () => {
    if (!selectedFile || !user?.id) {return;}
    
    setUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      let imageBlob: Blob;
      
      if (previewUrl) {
        imageBlob = await cropImage(previewUrl);
      } else {
        imageBlob = selectedFile;
      }
      
      // Upload to Firebase Storage
      const fileName = `profile-pictures/${user.id}/${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      
      const uploadResult = await uploadBytes(storageRef, imageBlob);
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        photoURL: downloadURL,
        updatedAt: new Date().toISOString(),
      });
      
      // Update Firebase Auth profile
      await updateProfile(user as any, { photoURL: downloadURL });
      
      setProfilePicture(downloadURL);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSuccess('Profile picture updated successfully');
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!user?.id) {return;}
    
    setUploading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update user profile in Firestore
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        photoURL: null,
        updatedAt: new Date().toISOString(),
      });
      
      // Update Firebase Auth profile
      await updateProfile(user as any, { photoURL: null });
      
      setProfilePicture(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setSuccess('Profile picture removed successfully');
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to remove profile picture');
    } finally {
      setUploading(false);
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
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to change password');
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
      <div className="tab-navigation">
        {[
          { key: 'profile', label: 'Profile' },
          { key: 'picture', label: 'Profile Picture' },
          { key: 'security', label: 'Security' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
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
                    className="modal-close-btn"
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

      {activeTab === 'picture' && (
        <div style={{
          background: 'var(--color-card-bg)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--border-radius-lg)',
          padding: 'var(--spacing-xl)'
        }}>
          <h3 style={{
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--spacing-lg)',
            fontSize: 'var(--font-size-xl)',
            fontWeight: 'var(--font-weight-semibold)'
          }}>Profile Picture</h3>

          {/* Current profile picture */}
          <div style={{ marginBottom: 'var(--spacing-xl)' }}>
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '3px solid var(--color-border-primary)',
              margin: '0 auto var(--spacing-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--color-bg-tertiary)'
            }}>
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile" 
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  fontSize: '48px',
                  color: 'var(--color-text-tertiary)'
                }}>
                  👤
                </div>
              )}
            </div>

            {profilePicture && (
              <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                <button
                  onClick={handleRemoveProfilePicture}
                  disabled={uploading}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    background: 'var(--color-error-500)',
                    color: 'var(--color-text-inverse)',
                    border: 'none',
                    borderRadius: 'var(--border-radius-md)',
                    fontSize: 'var(--font-size-sm)',
                    cursor: uploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploading ? 'Removing...' : 'Remove Picture'}
                </button>
              </div>
            )}
          </div>

          {/* File upload */}
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: 'var(--color-button-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'var(--border-radius-md)',
                cursor: 'pointer',
                fontSize: 'var(--font-size-base)',
                marginRight: 'var(--spacing-md)'
              }}
            >
              Choose New Picture
            </button>
            
            <small style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-xs)', display: 'block', marginTop: 'var(--spacing-sm)' }}>
              Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
            </small>
          </div>

          {/* Image preview */}
          {previewUrl && (
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div style={{
                border: '1px solid var(--color-border-primary)',
                borderRadius: 'var(--border-radius-md)',
                padding: 'var(--spacing-lg)',
                background: 'var(--color-bg-secondary)',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '200px',
                  height: '200px',
                  margin: '0 auto var(--spacing-lg)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
                
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center' }}>
                  <button
                    onClick={handleProfilePictureUpload}
                    disabled={uploading || !selectedFile}
                    style={{
                      padding: 'var(--spacing-md) var(--spacing-xl)',
                      background: 'var(--color-success-500)',
                      color: 'var(--color-text-inverse)',
                      border: 'none',
                      borderRadius: 'var(--border-radius-md)',
                      fontSize: 'var(--font-size-base)',
                      fontWeight: 'var(--font-weight-medium)',
                      cursor: (uploading || !selectedFile) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Save Picture'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
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
                </div>
              </div>
            </div>
          )}
          
          {/* Hidden canvas for cropping */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
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