const { storage } = require('../config/firebase');

/**
 * Uploads a file buffer to Firebase Storage
 * @param {Buffer} buffer - File buffer
 * @param {string} relativePath - E.g. 'projects/123/thumbnail_12345.jpg'
 * @param {Object} req - Express request object (unused for Firebase, kept for signature)
 * @returns {Promise<string>} - The public URL to access the file
 */
const uploadFileLocally = async (buffer, relativePath, req) => {
  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }
  const bucket = storage.bucket();
  const file = bucket.file(relativePath);
  
  await file.save(buffer, {
    metadata: {
      contentType: 'auto' // Firebase usually infers it, or we could pass mimetype if we had it
    }
  });
  
  // Make the file publicly readable
  await file.makePublic();
  
  // Return the public URL format for Firebase Storage
  return `https://storage.googleapis.com/${bucket.name}/${relativePath}`;
};

/**
 * Deletes a file from Firebase Storage
 * @param {string} fileUrl - The URL or path of the file
 */
const deleteFileLocally = async (fileUrl) => {
  try {
    if (!fileUrl || !storage) return;
    
    // Extract the relative path from the URL
    // e.g. https://storage.googleapis.com/nayon-coders.appspot.com/profile/profile_image_123.png
    let relativePath = fileUrl;
    if (fileUrl.includes('.com/')) {
      // Get everything after the bucket name
      const parts = fileUrl.split('.com/');
      if (parts.length > 1) {
        relativePath = parts[1];
      }
    }
    
    if (!relativePath) return;

    const bucket = storage.bucket();
    const file = bucket.file(relativePath);
    
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    }
  } catch (err) {
    console.error('Error deleting file from Firebase Storage:', err);
  }
};

/**
 * Deletes an entire folder from Firebase Storage
 * @param {string} relativeDirPath - E.g. 'projects/123'
 */
const deleteFolderLocally = async (relativeDirPath) => {
  try {
    if (!relativeDirPath || !storage) return;
    
    const bucket = storage.bucket();
    await bucket.deleteFiles({
      prefix: relativeDirPath
    });
  } catch (err) {
    console.error('Error deleting folder from Firebase Storage:', err);
  }
};

module.exports = {
  uploadFileLocally,
  deleteFileLocally,
  deleteFolderLocally,
  UPLOADS_DIR: 'firebase_storage'
};

