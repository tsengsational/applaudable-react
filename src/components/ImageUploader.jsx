import React, { useState, useRef, useEffect } from 'react';
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
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);

  // Update previewUrl when existingImageUrl changes
  useEffect(() => {
    setPreviewUrl(existingImageUrl);
  }, [existingImageUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    await uploadFile(file);
  };

  const uploadFile = async (file) => {
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

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      await uploadFile(file);
    } else {
      setError('Please drop an image file');
    }
  };

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
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
      <div 
        ref={dropzoneRef}
        className={`image-uploader__dropzone ${isDragging ? 'image-uploader__dropzone--dragging' : ''}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleDropzoneClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="image-uploader__input"
          disabled={uploading}
        />
        <div className="image-uploader__dropzone-content">
          <p>Click or drag and drop an image here</p>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowImageSelector(true);
            }}
            className="image-uploader__select-button"
          >
            Select from existing images
          </button>
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