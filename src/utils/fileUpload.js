const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { env } = require('../config/env');

const writeFileAsync = promisify(fs.writeFile);
const unlinkAsync = promisify(fs.unlink);
const mkdirAsync = promisify(fs.mkdir);

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

/**
 * Ensures a directory exists
 */
const ensureDir = async (dirPath) => {
  try {
    await mkdirAsync(dirPath, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
};

/**
 * Uploads a file buffer to the local disk
 * @param {Buffer} buffer - File buffer
 * @param {string} relativePath - E.g. 'projects/123/thumbnail_12345.jpg'
 * @param {Object} req - Express request object to construct full URL
 * @returns {Promise<string>} - The public URL to access the file
 */
const uploadFileLocally = async (buffer, relativePath, req) => {
  const fullPath = path.join(UPLOADS_DIR, relativePath);
  const dir = path.dirname(fullPath);
  
  await ensureDir(dir);
  await writeFileAsync(fullPath, buffer);
  
  // Try to use BASE_URL from env, if not fallback to request host
  const baseUrl = env.BASE_URL || (req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:5000');
  return `${baseUrl}/uploads/${relativePath}`;
};

/**
 * Deletes a file from the local disk
 * @param {string} fileUrl - The URL or path of the file
 */
const deleteFileLocally = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    let relativePath = fileUrl;
    if (fileUrl.includes('/uploads/')) {
      relativePath = fileUrl.split('/uploads/')[1];
    }
    
    if (!relativePath) return;

    const fullPath = path.join(UPLOADS_DIR, relativePath);
    if (fs.existsSync(fullPath)) {
      await unlinkAsync(fullPath);
    }
  } catch (err) {
    console.error('Error deleting file locally:', err);
  }
};

/**
 * Deletes an entire folder from the local disk
 * @param {string} relativeDirPath - E.g. 'projects/123'
 */
const deleteFolderLocally = async (relativeDirPath) => {
  try {
    if (!relativeDirPath) return;
    const fullPath = path.join(UPLOADS_DIR, relativeDirPath);
    
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.error('Error deleting folder locally:', err);
  }
};

module.exports = {
  uploadFileLocally,
  deleteFileLocally,
  deleteFolderLocally,
  UPLOADS_DIR
};

