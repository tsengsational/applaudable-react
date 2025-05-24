import { getStorage, ref, deleteObject, getDownloadURL } from 'firebase/storage';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  query,
  getDocs,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { storage } from '../config/firebase';

/**
 * Stores image metadata in Firestore
 * @param {string} userId - User ID
 * @param {string} imageId - Unique image ID
 * @param {Object} urlsByWidth - Map of width to URL
 * @returns {Promise<void>}
 */
export const storeImageMetadata = async (userId, imageId, urlsByWidth) => {
  const userImagesRef = doc(db, 'users', userId, 'images', imageId);
  
  await setDoc(userImagesRef, {
    urlsByWidth,
    createdAt: new Date().toISOString(),
    lastUsed: new Date().toISOString(),
    usageCount: 1
  });
};

/**
 * Updates image usage count and last used timestamp
 * @param {string} userId - User ID
 * @param {string} imageId - Image ID
 * @returns {Promise<void>}
 */
export const updateImageUsage = async (userId, imageId) => {
  const userImagesRef = doc(db, 'users', userId, 'images', imageId);
  const imageDoc = await getDoc(userImagesRef);
  
  if (imageDoc.exists()) {
    await updateDoc(userImagesRef, {
      lastUsed: new Date().toISOString(),
      usageCount: imageDoc.data().usageCount + 1
    });
  }
};

/**
 * Deletes image from Storage and its metadata from Firestore
 * @param {string} userId - User ID
 * @param {string} imageId - Image ID
 * @returns {Promise<void>}
 */
export const deleteImage = async (userId, imageId) => {
  try {
    // Delete from Storage
    const imageRef = ref(storage, `users/${userId}/images/${imageId}_original`);
    await deleteObject(imageRef);

    // Delete from Firestore
    const imageDocRef = doc(db, 'users', userId, 'images', imageId);
    await deleteDoc(imageDocRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

/**
 * Verifies if a file exists in Storage
 * @param {string} url - Storage URL
 * @returns {Promise<boolean>}
 */
const verifyStorageFile = async (url) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, url);
    await getDownloadURL(storageRef);
    return true;
  } catch (error) {
    console.log('File not found in Storage:', url);
    return false;
  }
};

/**
 * Checks if an image with the same hash exists and verifies storage files
 * @param {string} userId - User ID
 * @param {string} imageHash - Image hash
 * @returns {Promise<{exists: boolean, imageId?: string, urlsByWidth?: Object}>}
 */
export const checkImageExists = async (userId, imageHash) => {
  try {
    const imageDocRef = doc(db, 'users', userId, 'images', imageHash);
    const imageDoc = await getDoc(imageDocRef);
    
    if (imageDoc.exists()) {
      const data = imageDoc.data();
      console.log('Found existing image in Firestore:', data);
      
      // Verify that all files exist in Storage
      const urlsByWidth = data.urlsByWidth;
      const storageChecks = await Promise.all(
        Object.entries(urlsByWidth).map(async ([width, url]) => {
          const exists = await verifyStorageFile(url);
          return [width, exists];
        })
      );
      
      // Check if any files are missing
      const missingFiles = storageChecks.filter(([_, exists]) => !exists);
      
      if (missingFiles.length > 0) {
        console.log('Some files are missing in Storage:', missingFiles);
        // Delete the Firestore record since files are missing
        await deleteImage(userId, imageHash);
        return { exists: false };
      }
      
      console.log('All files verified in Storage');
      return {
        exists: true,
        imageId: imageHash,
        urlsByWidth: urlsByWidth
      };
    }
    
    console.log('No existing image found in Firestore');
    return { exists: false };
  } catch (error) {
    console.error('Error checking image existence:', error);
    return { exists: false };
  }
};

/**
 * Upload an image to Firebase Storage and create a record in Firestore
 * @param {string} userId - The ID of the user uploading the image
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Object containing URLs for different image sizes
 */
export const uploadImage = async (userId, file) => {
  try {
    // Generate a unique ID for the image
    const imageId = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // Upload the original image
    const originalRef = ref(storage, `users/${userId}/images/${imageId}_original`);
    await uploadBytes(originalRef, file);
    const originalUrl = await getDownloadURL(originalRef);

    // Create a record in Firestore
    const imageData = {
      id: imageId,
      name: file.name,
      originalUrl,
      userId,
      createdAt: new Date().toISOString()
    };

    // Add to Firestore
    const imageRef = doc(collection(db, 'users', userId, 'images'));
    await setDoc(imageRef, imageData);

    return {
      id: imageId,
      url: originalUrl,
      name: file.name
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

/**
 * Get all images for a user
 * @param {string} userId - The ID of the user
 * @returns {Promise<Array>} Array of image objects
 */
export const getImages = async (userId) => {
  try {
    const imagesRef = collection(db, 'users', userId, 'images');
    const q = query(imagesRef);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting images:', error);
    throw error;
  }
}; 