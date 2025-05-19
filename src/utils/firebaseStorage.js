import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { storage } from '../config/firebase';

/**
 * Uploads a blob to Firebase Storage
 * @param {Blob} blob - Image blob to upload
 * @param {string} path - Storage path
 * @returns {Promise<string>} Promise resolving to the download URL
 */
export const uploadToStorage = async (blob, path) => {
  const auth = getAuth();
  
  // Check if user is authenticated
  if (!auth.currentUser) {
    console.error('User not authenticated');
    throw new Error('User must be authenticated to upload images');
  }

  try {
    console.log('Storage instance:', storage);
    console.log('Storage bucket:', storage.app.options.storageBucket);
    console.log('Auth state:', {
      isAuthenticated: !!auth.currentUser,
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email
    });

    // Create a reference to the file location
    const storageRef = ref(storage, path);
    console.log('Storage reference created:', {
      fullPath: storageRef.fullPath,
      bucket: storageRef.bucket,
      name: storageRef.name
    });
    
    // Log the upload attempt
    console.log('Starting upload to path:', path);
    console.log('Blob details:', {
      type: blob.type,
      size: blob.size,
      lastModified: blob.lastModified
    });
    
    // Upload the blob
    console.log('Attempting to upload blob...');
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: blob.type,
      customMetadata: {
        uploadedBy: auth.currentUser.uid,
        uploadedAt: new Date().toISOString()
      }
    });
    
    console.log('Upload successful:', {
      path: snapshot.ref.fullPath,
      size: snapshot.metadata.size,
      contentType: snapshot.metadata.contentType,
      metadata: snapshot.metadata
    });
    
    // Get the download URL
    console.log('Getting download URL...');
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log('Download URL obtained:', downloadUrl);
    
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      path: path,
      authState: auth.currentUser ? 'authenticated' : 'not authenticated',
      userId: auth.currentUser?.uid,
      storageBucket: storage.app.options.storageBucket,
      error: error
    });
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};

/**
 * Generates a storage path for an image
 * @param {string} userId - User ID
 * @param {string} filename - Original filename
 * @param {number} width - Image width
 * @returns {string} Storage path
 */
export const generateStoragePath = (userId, filename, width) => {
  // Remove file extension
  const baseName = filename.replace(/\.[^/.]+$/, '');
  // Replace spaces and special characters with underscores
  const sanitizedName = baseName.replace(/[^a-zA-Z0-9]/g, '_');
  // Generate a unique timestamp
  const timestamp = Date.now();
  const path = `images/${userId}/${sanitizedName}_${timestamp}_${width}w.jpg`;
  console.log('Generated storage path:', path);
  return path;
}; 