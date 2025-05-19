import { useRef, useState, useEffect } from 'react';
import { useImageUploader } from '../hooks/useImageUploader';

/**
 * Component for uploading and processing images
 * @param {Object} props
 * @param {string} props.userId - User ID for storage path
 * @param {Function} props.onUpload - Callback with uploaded image URLs
 * @param {Function} props.onDelete - Callback when image is deleted
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.existingImageUrl] - URL of existing image if any
 */
export const ImageUploader = ({ 
  userId, 
  onUpload, 
  onDelete,
  className = '',
  existingImageUrl = null 
}) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(existingImageUrl);
  const { handleFileUpload, isUploading, error } = useImageUploader();

  // Update previewUrl when existingImageUrl changes
  useEffect(() => {
    setPreviewUrl(existingImageUrl);
  }, [existingImageUrl]);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      const urlsByWidth = await handleFileUpload(selectedFile, userId);
      onUpload(urlsByWidth);
      
      // Reset file input and selected file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-4">
        {/* File Input */}
        <div className="flex items-center space-x-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`
              inline-flex items-center px-4 py-2 border border-transparent
              text-sm font-medium rounded-md shadow-sm text-white
              bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2
              focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Select Image
          </label>

          {selectedFile && (
            <button
              type="button"
              onClick={handleUpload}
              disabled={isUploading}
              className={`
                inline-flex items-center px-4 py-2 border border-transparent
                text-sm font-medium rounded-md shadow-sm text-white
                bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2
                focus:ring-offset-2 focus:ring-green-500
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          )}
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full max-w-md h-auto rounded-lg"
            />
            <button
              type="button"
              onClick={handleDelete}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full
                       hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              ×
            </button>
          </div>
        )}
        
        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}; 