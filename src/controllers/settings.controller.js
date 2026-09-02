const { db } = require('../config/firebase');
const { uploadFileLocally, deleteFileLocally } = require('../utils/fileUpload');

/**
 * @desc    Get global settings
 * @route   GET /api/settings
 * @access  Public
 */
exports.getSettings = async (req, res, next) => {
  try {
    const doc = await db.collection('settings').doc('site').get();
    
    if (!doc.exists) {
      return res.status(200).json({ success: true, data: {} });
    }

    res.status(200).json({ success: true, data: doc.data() });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update global settings
 * @route   PUT /api/admin/settings
 * @access  Private
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const docRef = db.collection('settings').doc('site');
    
    const dataToSave = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    await docRef.set(dataToSave, { merge: true });
    res.status(200).json({ success: true, data: dataToSave });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload setting image
 * @route   POST /api/admin/settings/upload
 * @access  Private
 */
exports.uploadSettingsImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const { type } = req.body; // e.g., 'logo', 'favicon', 'ogImage'
    const extension = req.file.originalname.split('.').pop();
    const fileName = `settings/${type}_${Date.now()}.${extension}`;
    
    const publicUrl = await uploadFileLocally(req.file.buffer, fileName, req);

    res.status(200).json({
      success: true,
      data: { url: publicUrl }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete setting image
 * @route   DELETE /api/admin/settings/image
 * @access  Private
 */
exports.deleteSettingsImage = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    await deleteFileLocally(url);
    res.status(200).json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    next(error);
  }
};
