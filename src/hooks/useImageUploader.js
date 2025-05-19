import { useState } from 'react';
import { IMAGE_WIDTHS, loadImage, resizeImage, canvasToBlob, isValidImage } from '../utils/imageProcessor';
import { uploadToStorage, generateStoragePath } from '../utils/firebaseStorage';
import { storeImageMetadata, checkImageExists, updateImageUsage } from '../services/imageService';

/**
 * Hook for handling image uploads with resizing
 * @returns {Object} Upload handler and loading state
 */
export const useImageUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generates a hash for an image file using Web Crypto API
   * @param {File} file - Image file
   * @returns {Promise<string>} Image hash
   */
  const generateImageHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  /**
   * Handles file upload with resizing
   * @param {File} file - Image file to upload
   * @param {string} userId - User ID for storage path
   * @returns {Promise<{ [width: string]: string }>} Map of width to download URL
   */
  const handleFileUpload = async (file, userId) => {
    if (!file) {
      throw new Error('No file provided');
    }

    if (!isValidImage(file)) {
      throw new Error('Invalid image file type');
    }

    setIsUploading(true);
    setError(null);

    try {
      // Generate image hash
      const imageHash = await generateImageHash(file);
      
      // Check if image already exists
      const existingImage = await checkImageExists(userId, imageHash);
      if (existingImage.exists) {
        console.log('Image already exists, updating usage count');
        // Update usage count
        await updateImageUsage(userId, imageHash);
        return existingImage.urlsByWidth;
      }

      console.log('Uploading new image...');
      // Load the original image
      const img = await loadImage(file);
      
      // Process each width
      const uploadPromises = IMAGE_WIDTHS.map(async (width) => {
        console.log(`Processing width: ${width}px`);
        // Resize image
        const canvas = resizeImage(img, width);
        
        // Convert to blob
        const blob = await canvasToBlob(canvas);
        
        // Generate storage path
        const path = generateStoragePath(userId, file.name, width);
        console.log(`Generated path: ${path}`);
        
        // Upload to Firebase Storage
        const downloadUrl = await uploadToStorage(blob, path);
        console.log(`Uploaded to: ${downloadUrl}`);
        
        return [width, downloadUrl];
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      console.log('All uploads completed');
      
      // Convert array of [width, url] pairs to object
      const urlsByWidth = Object.fromEntries(results);
      
      // Store image metadata in Firestore
      await storeImageMetadata(userId, imageHash, urlsByWidth);
      console.log('Metadata stored in Firestore');
      
      return urlsByWidth;
    } catch (err) {
      console.error('Error in handleFileUpload:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    handleFileUpload,
    isUploading,
    error
  };
}; 