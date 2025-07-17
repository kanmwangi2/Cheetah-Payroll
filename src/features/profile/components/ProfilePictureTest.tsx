/**
 * Test component for Profile Picture functionality
 * Demonstrates the upload-crop-save workflow
 */

import React, { useState } from 'react';
import { useAuthContext } from '../../../core/providers/AuthProvider';
import { uploadProfilePicture, removeProfilePicture } from '../../../shared/services/user.service';
import ProfilePicture from '../../../shared/components/ui/ProfilePicture';
import Button from '../../../shared/components/ui/Button';

const ProfilePictureTest: React.FC = () => {
  const { user } = useAuthContext();
  const [profilePicture, setProfilePicture] = useState<string | null>(
    (user?.profileData?.profilePicture as string) || user?.photoURL || null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async (croppedImageBlob: Blob) => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload profile picture using the user service
      const downloadURL = await uploadProfilePicture(user.id, croppedImageBlob);
      
      setProfilePicture(downloadURL);
      setSuccess('Profile picture uploaded successfully!');
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Remove profile picture using the user service
      await removeProfilePicture(user.id);
      
      setProfilePicture(null);
      setSuccess('Profile picture removed successfully!');
      
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to remove profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: 'var(--spacing-xl)',
      background: 'var(--color-card-bg)',
      borderRadius: 'var(--border-radius-lg)',
      border: '1px solid var(--color-card-border)'
    }}>
      <h2 style={{
        color: 'var(--color-text-primary)',
        marginBottom: 'var(--spacing-lg)',
        textAlign: 'center'
      }}>
        Profile Picture Test
      </h2>

      {/* Profile Picture Component */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: 'var(--spacing-lg)' 
      }}>
        <ProfilePicture
          src={profilePicture}
          alt={user?.name || 'Profile picture'}
          size="xl"
          editable={true}
          onUpload={handleUpload}
          onRemove={handleRemove}
          loading={uploading}
        />
      </div>

      {/* Instructions */}
      <div style={{
        background: 'var(--color-bg-secondary)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <h3 style={{
          color: 'var(--color-text-primary)',
          fontSize: 'var(--font-size-lg)',
          marginBottom: 'var(--spacing-sm)'
        }}>
          How to test:
        </h3>
        <ol style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          paddingLeft: 'var(--spacing-lg)'
        }}>
          <li>Click the camera icon to upload an image</li>
          <li>Select an image file (JPG, PNG, etc.)</li>
          <li>Use the cropper to select the area you want</li>
          <li>Click "Apply Crop" to save the cropped version</li>
          <li>Click the trash icon to remove the profile picture</li>
        </ol>
      </div>

      {/* Status Messages */}
      {error && (
        <div style={{
          background: 'var(--color-error-bg)',
          color: 'var(--color-error-text)',
          border: '1px solid var(--color-error-border)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {success && (
        <div style={{
          background: 'var(--color-success-bg)',
          color: 'var(--color-success-text)',
          border: '1px solid var(--color-success-border)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--border-radius-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <strong>Success:</strong> {success}
        </div>
      )}

      {/* Additional Manual Test Buttons */}
      <div style={{
        display: 'flex',
        gap: 'var(--spacing-md)',
        justifyContent: 'center',
        marginTop: 'var(--spacing-lg)'
      }}>
        <Button
          variant="outline"
          onClick={() => {
            setError(null);
            setSuccess(null);
          }}
          disabled={uploading}
        >
          Clear Messages
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => {
            console.log('Current profile picture URL:', profilePicture);
            console.log('User profile data:', user?.profileData);
          }}
          disabled={uploading}
        >
          Log Current State
        </Button>
      </div>

      {/* Technical Details */}
      <div style={{
        marginTop: 'var(--spacing-xl)',
        padding: 'var(--spacing-md)',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--border-radius-md)',
        fontSize: 'var(--font-size-sm)',
        color: 'var(--color-text-tertiary)'
      }}>
        <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Technical Details:</h4>
        <ul style={{ paddingLeft: 'var(--spacing-lg)' }}>
          <li>Images are uploaded to Firebase Storage</li>
          <li>Profile picture URLs are stored in Firestore under user.profileData.profilePicture</li>
          <li>Image cropping is handled by the ImageCropper component</li>
          <li>Maximum file size: 10MB</li>
          <li>Supported formats: JPG, PNG, GIF, WebP</li>
        </ul>
      </div>
    </div>
  );
};

export default ProfilePictureTest;