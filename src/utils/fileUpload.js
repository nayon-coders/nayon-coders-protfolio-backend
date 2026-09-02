const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

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
  
  // Construct the absolute public URL
  const baseUrl = req ? `${req.protocol}://${req.get('host')}` : 'http://localhost:5000';
  return `${baseUrl}/uploads/${relativePath}`;
};

/**
 * Deletes a file from the local disk
 * @param {string} fileUrl - The URL or path of the file (e.g. '/uploads/projects/123/thumbnail.jpg' or full URL)
 */
const deleteFileLocally = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Extract the relative path from the URL
    // e.g. 'http://localhost:5000/uploads/projects/123/img.jpg' -> 'projects/123/img.jpg'
    // or '/uploads/projects/123/img.jpg' -> 'projects/123/img.jpg'
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
