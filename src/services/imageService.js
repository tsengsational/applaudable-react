import { getStorage, ref, deleteObject, getDownloadURL } from 'firebase/storage';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

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
  const storage = getStorage();
  const userImagesRef = doc(db, 'users', userId, 'images', imageId);
  const imageDoc = await getDoc(userImagesRef);
  
  if (imageDoc.exists()) {
    const { urlsByWidth } = imageDoc.data();
    
    // Delete all versions from Storage
    const deletePromises = Object.values(urlsByWidth).map(url => {
      const storageRef = ref(storage, url);
      return deleteObject(storageRef);
    });
    
    await Promise.all(deletePromises);
    
    // Delete metadata from Firestore
    await deleteObject(userImagesRef);
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