const cloudinary = require('cloudinary').v2;
const { env } = require('../config/env');

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {string} relativePath - E.g. 'projects/123/thumbnail_12345.jpg'
 * @param {Object} req - Express request object (unused for Cloudinary, kept for signature)
 * @returns {Promise<string>} - The public URL to access the file
 */
const uploadFileLocally = async (buffer, relativePath, req) => {
  return new Promise((resolve, reject) => {
    // Cloudinary uses public_id without extensions, but we can just pass the path
    // We strip the extension to keep it clean in Cloudinary
    const publicId = relativePath.substring(0, relativePath.lastIndexOf('.')) || relativePath;

    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        public_id: publicId,
        resource_type: 'auto',
        overwrite: true
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    // Write the buffer to the stream
    uploadStream.end(buffer);
  });
};

/**
 * Deletes a file from Cloudinary
 * @param {string} fileUrl - The URL or path of the file
 */
const deleteFileLocally = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extract public_id from Cloudinary URL
    // e.g. https://res.cloudinary.com/nayon-coders/image/upload/v1234567/projects/123/thumbnail_12345.png
    let publicId = fileUrl;
    
    if (fileUrl.includes('cloudinary.com/')) {
      const parts = fileUrl.split('/upload/');
      if (parts.length > 1) {
        // parts[1] looks like "v123456789/projects/123/thumbnail_12345.png"
        // We need to remove the version (v123...) and the extension (.png)
        let pathPart = parts[1];
        if (pathPart.match(/^v[0-9]+\//)) {
          pathPart = pathPart.replace(/^v[0-9]+\//, '');
        }
        
        // Remove extension
        publicId = pathPart.substring(0, pathPart.lastIndexOf('.')) || pathPart;
      }
    }
    
    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.error('Error deleting file from Cloudinary:', err);
  }
};

/**
 * Deletes an entire folder from Cloudinary
 * @param {string} relativeDirPath - E.g. 'projects/123'
 */
const deleteFolderLocally = async (relativeDirPath) => {
  try {
    if (!relativeDirPath) return;
    
    // Cloudinary allows deleting all resources with a specific prefix
    await cloudinary.api.delete_resources_by_prefix(relativeDirPath);
  } catch (err) {
    console.error('Error deleting folder from Cloudinary:', err);
  }
};

module.exports = {
  uploadFileLocally,
  deleteFileLocally,
  deleteFolderLocally,
  UPLOADS_DIR: 'cloudinary_storage'
};

