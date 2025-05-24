import React, { useState, useRef } from 'react';
import { uploadImage } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';
import { ImageSelector } from './ImageSelector';

/**
 * Component for uploading and managing images
 * @param {Object} props
 * @param {string} props.userId - User ID
 * @param {Function} props.onUpload - Callback when an image is uploaded
 * @param {Function} props.onDelete - Callback when an image is deleted
 * @param {string} props.existingImageUrl - URL of existing image
 * @param {string} props.className - Additional CSS classes
 */
export const ImageUploader = ({ userId, onUpload, onDelete, existingImageUrl, className = '' }) => {
  const { currentUser } = useAuth();
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const urlsByWidth = await uploadImage(currentUser.uid, file);
      if (urlsByWidth) {
        setPreviewUrl(urlsByWidth['1280']);
        onUpload(urlsByWidth);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = (urlsByWidth) => {
    setPreviewUrl(urlsByWidth['1280']);
    onUpload(urlsByWidth);
    setShowImageSelector(false);
  };

  const handleDelete = () => {
    setPreviewUrl('');
    onDelete();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`image-uploader ${className}`}>
      {/* Preview */}
      {previewUrl && (
        <div className="image-uploader__preview">
          <img
            src={previewUrl}
            alt="Preview"
            className="image-uploader__image"
          />
          <button
            type="button"
            onClick={handleDelete}
            className="image-uploader__delete"
          >
            Remove Image
          </button>
        </div>
      )}

      {/* Upload Controls */}
      <div className="image-uploader__dropzone">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="image-uploader__input"
          disabled={uploading}
        />
        {uploading && (
          <div className="image-uploader__loading">
            Uploading...
          </div>
        )}
        {error && (
          <div className="image-uploader__error">
            {error}
          </div>
        )}
      </div>

      {/* Image Selector Modal */}
      <ImageSelector
        userId={userId}
        isOpen={showImageSelector}
        onClose={() => setShowImageSelector(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}; 