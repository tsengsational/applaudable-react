import { useState, useEffect } from 'react';
import { useImageUploader } from '../hooks/useImageUploader';
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
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const { handleFileUpload, isUploading, error } = useImageUploader(userId);

  useEffect(() => {
    setPreviewUrl(existingImageUrl);
  }, [existingImageUrl]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const urlsByWidth = await handleFileUpload(file);
      if (urlsByWidth) {
        setPreviewUrl(urlsByWidth['1280']);
        onUpload(urlsByWidth);
      }
    } catch (err) {
      console.error('Error uploading file:', err);
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
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Preview */}
      {previewUrl && (
        <div className="relative aspect-video">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={handleDelete}
            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      )}

      {/* Upload Controls */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="image-upload"
            className="block w-full text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
          >
            {isUploading ? 'Uploading...' : 'Upload New Image'}
          </label>
        </div>
        <button
          type="button"
          onClick={() => setShowImageSelector(true)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Select Existing Image
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

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