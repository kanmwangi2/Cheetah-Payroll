/**
 * Image Cropper Component
 * Provides image cropping functionality with a proper UI
 */

import React, { useState, useRef, useCallback } from 'react';
import Button from './Button';

interface ImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number; // width/height ratio, default 1 (square)
  cropSize?: { width: number; height: number };
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  onCrop,
  onCancel,
  aspectRatio = 1,
  cropSize = { width: 200, height: 200 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [cropArea, setCropArea] = useState<CropArea>({
    x: 50,
    y: 50,
    width: 200,
    height: 200
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) {return;}

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setCropArea(prev => ({
      ...prev,
      x: Math.max(0, Math.min(prev.x + deltaX, 400 - prev.width)),
      y: Math.max(0, Math.min(prev.y + deltaY, 400 - prev.height))
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleCropSizeChange = (dimension: 'width' | 'height', value: number) => {
    if (dimension === 'width') {
      setCropArea(prev => ({
        ...prev,
        width: value,
        height: aspectRatio === 1 ? value : value / aspectRatio
      }));
    } else {
      setCropArea(prev => ({
        ...prev,
        height: value,
        width: aspectRatio === 1 ? value : value * aspectRatio
      }));
    }
  };

  const performCrop = async () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    
    if (!canvas || !image) {return;}

    const ctx = canvas.getContext('2d');
    if (!ctx) {return;}

    // Set canvas size to desired output size
    canvas.width = cropSize.width;
    canvas.height = cropSize.height;

    // Calculate scale factors
    const scaleX = image.naturalWidth / image.offsetWidth;
    const scaleY = image.naturalHeight / image.offsetHeight;

    // Draw cropped image
    ctx.drawImage(
      image,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropSize.width,
      cropSize.height
    );

    // Convert to blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/jpeg', 0.9);
  };

  return (
    <div style={overlayStyles}>
      <div style={modalStyles}>
        <h3 style={titleStyles}>Crop Profile Picture</h3>
        
        <div style={previewContainerStyles}>
          <div
            style={imageContainerStyles}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              style={imageStyles}
              draggable={false}
            />
            
            {/* Crop overlay */}
            <div
              style={{
                ...cropOverlayStyles,
                left: cropArea.x,
                top: cropArea.y,
                width: cropArea.width,
                height: cropArea.height,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={handleMouseDown}
            />
          </div>
          
          {/* Cropped preview */}
          <div style={croppedPreviewStyles}>
            <h4>Preview</h4>
            <div style={previewCircleStyles}>
              <div
                style={{
                  ...previewImageStyles,
                  backgroundImage: `url(${imageUrl})`,
                  backgroundPosition: `-${cropArea.x}px -${cropArea.y}px`,
                  backgroundSize: `400px auto`
                }}
              />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={controlsStyles}>
          <div style={sliderContainerStyles}>
            <label>Size: {cropArea.width}px</label>
            <input
              type="range"
              min="50"
              max="300"
              value={cropArea.width}
              onChange={(e) => handleCropSizeChange('width', parseInt(e.target.value, 10))}
              style={sliderStyles}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div style={buttonContainerStyles}>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={performCrop}>
            Apply Crop
          </Button>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

// Styles
const overlayStyles: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const modalStyles: React.CSSProperties = {
  backgroundColor: 'var(--color-card-bg)',
  borderRadius: 'var(--border-radius-lg)',
  padding: 'var(--spacing-xl)',
  maxWidth: '600px',
  width: '90%',
  maxHeight: '90vh',
  overflow: 'auto',
  border: '1px solid var(--color-card-border)',
  boxShadow: 'var(--shadow-2xl)'
};

const titleStyles: React.CSSProperties = {
  color: 'var(--color-text-primary)',
  marginBottom: 'var(--spacing-lg)',
  textAlign: 'center'
};

const previewContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-xl)',
  marginBottom: 'var(--spacing-lg)',
  alignItems: 'flex-start'
};

const imageContainerStyles: React.CSSProperties = {
  position: 'relative',
  width: '400px',
  height: '400px',
  border: '2px solid var(--color-border-primary)',
  borderRadius: 'var(--border-radius-md)',
  overflow: 'hidden',
  userSelect: 'none'
};

const imageStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
};

const cropOverlayStyles: React.CSSProperties = {
  position: 'absolute',
  border: '2px solid var(--color-primary-500)',
  backgroundColor: 'rgba(59, 130, 246, 0.2)',
  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
};

const croppedPreviewStyles: React.CSSProperties = {
  textAlign: 'center',
  minWidth: '120px'
};

const previewCircleStyles: React.CSSProperties = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  overflow: 'hidden',
  border: '3px solid var(--color-border-primary)',
  margin: '0 auto'
};

const previewImageStyles: React.CSSProperties = {
  width: '100%',
  height: '100%',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat'
};

const controlsStyles: React.CSSProperties = {
  marginBottom: 'var(--spacing-lg)'
};

const sliderContainerStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--spacing-sm)'
};

const sliderStyles: React.CSSProperties = {
  width: '100%'
};

const buttonContainerStyles: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--spacing-md)',
  justifyContent: 'flex-end'
};

export default ImageCropper;