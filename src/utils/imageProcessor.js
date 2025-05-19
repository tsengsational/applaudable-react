/**
 * Utility functions for image processing
 */

// Supported image widths for responsive images
export const IMAGE_WIDTHS = [640, 768, 1024, 1280];

/**
 * Resizes an image to the specified width while maintaining aspect ratio
 * @param {HTMLImageElement} img - Source image element
 * @param {number} targetWidth - Desired width in pixels
 * @returns {HTMLCanvasElement} Canvas containing the resized image
 */
export const resizeImage = (img, targetWidth) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Calculate new height maintaining aspect ratio
  const aspectRatio = img.height / img.width;
  const targetHeight = Math.round(targetWidth * aspectRatio);
  
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  // Use high-quality image scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return canvas;
};

/**
 * Converts a canvas to a Blob
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {string} type - MIME type (default: 'image/jpeg')
 * @param {number} quality - JPEG quality (0-1, default: 0.8)
 * @returns {Promise<Blob>} Promise resolving to the image blob
 */
export const canvasToBlob = (canvas, type = 'image/jpeg', quality = 0.8) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      },
      type,
      quality
    );
  });
};

/**
 * Loads an image from a File object
 * @param {File} file - Image file to load
 * @returns {Promise<HTMLImageElement>} Promise resolving to the loaded image
 */
export const loadImage = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validates if a file is a supported image type
 * @param {File} file - File to validate
 * @returns {boolean} Whether the file is a supported image type
 */
export const isValidImage = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
}; 