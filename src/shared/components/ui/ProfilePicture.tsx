/**
 * Optimized Profile Picture Component
 * Features lazy loading, error handling, and placeholder support
 */

import React, { useState, useRef, useCallback } from 'react';
import Button from './Button';
import ImageCropper from './ImageCropper';

interface ProfilePictureProps {
  src?: string | null;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
  onUpload?: (file: Blob) => Promise<void>;
  onRemove?: () => Promise<void>;
  loading?: boolean;
  className?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  alt = 'Profile picture',
  size = 'md',
  editable = false,
  onUpload,
  onRemove,
  loading = false,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeStyles = {
    sm: { width: '32px', height: '32px', fontSize: '12px' },
    md: { width: '48px', height: '48px', fontSize: '16px' },
    lg: { width: '64px', height: '64px', fontSize: '20px' },
    xl: { width: '128px', height: '128px', fontSize: '36px' }
  };

  const currentSize = sizeStyles[size];

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    setImageError(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {return;}

    // Validate file
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(previewUrl);
    setShowCropper(true);

    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleCropComplete = useCallback(async (croppedBlob: Blob) => {
    if (!onUpload) {return;}

    setUploading(true);
    try {
      await onUpload(croppedBlob);
      setShowCropper(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const handleCropCancel = useCallback(() => {
    setShowCropper(false);
    if (selectedFile) {
      URL.revokeObjectURL(selectedFile);
      setSelectedFile(null);
    }
  }, [selectedFile]);

  const handleRemoveClick = useCallback(async () => {
    if (!onRemove) {return;}
    
    if (confirm('Are you sure you want to remove your profile picture?')) {
      try {
        await onRemove();
      } catch (error) {
        console.error('Remove failed:', error);
        alert('Failed to remove image. Please try again.');
      }
    }
  }, [onRemove]);

  const getInitials = useCallback((name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, []);

  const shouldShowImage = src && !imageError && imageLoaded;
  const shouldShowPlaceholder = !src || imageError || !imageLoaded;

  return (
    <>
      <div
        className={`profile-picture ${className}`}
        style={{
          ...profilePictureStyles,
          ...currentSize,
          position: 'relative'
        }}
      >
        {/* Loading spinner */}
        {loading && (
          <div style={loadingOverlayStyles}>
            <div style={spinnerStyles} />
          </div>
        )}

        {/* Actual image */}
        {src && (
          <img
            src={src}
            alt={alt}
            style={{
              ...imageStyles,
              opacity: shouldShowImage ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy" // Native lazy loading
          />
        )}

        {/* Placeholder */}
        {shouldShowPlaceholder && (
          <div style={{
            ...placeholderStyles,
            fontSize: currentSize.fontSize
          }}>
            {alt ? getInitials(alt) : '👤'}
          </div>
        )}

        {/* Edit overlay for large sizes */}
        {editable && size === 'xl' && !loading && (
          <div style={editOverlayStyles}>
            <div style={editButtonsStyles}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                style={editButtonStyle}
              >
                📷
              </Button>
              {src && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveClick}
                  style={editButtonStyle}
                >
                  🗑️
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Edit buttons for smaller sizes */}
      {editable && size !== 'xl' && (
        <div style={externalEditButtonsStyles}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            Change Picture
          </Button>
          {src && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveClick}
              disabled={loading}
            >
              Remove
            </Button>
          )}
        </div>
      )}

      {/* Hidden file input */}
      {editable && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      )}

      {/* Image cropper modal */}
      {showCropper && selectedFile && (
        <ImageCropper
          imageUrl={selectedFile}
          onCrop={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={1}
          cropSize={{ width: 200, height: 200 }}
        />
      )}

      {/* Loading state for upload */}
      {uploading && (
        <div style={uploadOverlayStyles}>
          <div style={uploadMessageStyles}>
            Uploading...
          </div>
        </div>
      )}
    </>
  );
};

// Styles
const profilePictureStyles: React.CSSProperties = {
  borderRadius: '50%',
  overflow: 'hidden',
  border: '2px solid var(--color-border-primary)',
  backgroundColor: 'var(--color-bg-secondary)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  position: 'relative'
};

const imageStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
  top: 0,
  left: 0
};

const placeholderStyles: React.CSSProperties = {
  color: 'var(--color-text-secondary)',
  fontWeight: 'var(--font-weight-medium)',
  backgroundColor: 'var(--color-bg-tertiary)',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const loadingOverlayStyles: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10
};

const spinnerStyles: React.CSSProperties = {
  width: '20px',
  height: '20px',
  border: '2px solid var(--color-border-primary)',
  borderTopColor: 'var(--color-primary-500)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
};

const editOverlayStyles: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  cursor: 'pointer'
};

const editButtonsStyles: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-xs)'
};

const editButtonStyle: React.CSSProperties = {
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: 'var(--color-text-primary)',
  borderRadius: '50%',
  width: '32px',
  height: '32px',
  minWidth: '32px',
  padding: 0
};

const externalEditButtonsStyles: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-sm)',
  marginTop: 'var(--spacing-sm)'
};

const uploadOverlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

const uploadMessageStyles: React.CSSProperties = {
  backgroundColor: 'var(--color-card-bg)',
  padding: 'var(--spacing-lg)',
  borderRadius: 'var(--border-radius-md)',
  color: 'var(--color-text-primary)',
  fontSize: 'var(--font-size-lg)'
};

// Add CSS animation for spinner
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .profile-picture:hover .edit-overlay {
    opacity: 1;
  }
`;
document.head.appendChild(style);

export default ProfilePicture;