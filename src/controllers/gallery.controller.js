const { db } = require('../config/firebase');
const { uploadFileLocally, deleteFileLocally, deleteFolderLocally } = require('../utils/fileUpload');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Get all gallery items (public)
 * @route   GET /api/gallery
 * @access  Public
 */
exports.getAllGalleryItems = async (req, res, next) => {
  try {
    let query = db.collection('gallery')
      .where('published', '==', true)
      .orderBy('displayOrder', 'asc')
      .orderBy('createdAt', 'desc');

    if (req.query.category) {
      query = query.where('category', '==', req.query.category);
    }
      
    const snapshot = await query.get();
      
    const gallery = [];
    snapshot.forEach(doc => {
      gallery.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all admin gallery items
 * @route   GET /api/admin/gallery
 * @access  Private
 */
exports.getAllAdminGallery = async (req, res, next) => {
  try {
    const snapshot = await db.collection('gallery')
      .orderBy('createdAt', 'desc')
      .get();
      
    const gallery = [];
    snapshot.forEach(doc => {
      gallery.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: gallery });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single gallery item
 * @route   GET /api/admin/gallery/:id
 * @access  Private
 */
exports.getGalleryById = async (req, res, next) => {
  try {
    const doc = await db.collection('gallery').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create gallery item metadata
 * @route   POST /api/admin/gallery
 * @access  Private
 */
exports.createGalleryItem = async (req, res, next) => {
  try {
    const { id, ...galleryData } = req.body;
    const galleryId = id || uuidv4();
    
    const docRef = db.collection('gallery').doc(galleryId);
    const dataToSave = {
      ...galleryData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docRef.set(dataToSave);
    res.status(201).json({ success: true, data: { id: galleryId, ...dataToSave } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update gallery item metadata
 * @route   PUT /api/admin/gallery/:id
 * @access  Private
 */
exports.updateGalleryItem = async (req, res, next) => {
  try {
    const galleryData = req.body;
    const docRef = db.collection('gallery').doc(req.params.id);
    
    const dataToSave = {
      ...galleryData,
      updatedAt: new Date().toISOString()
    };

    await docRef.set(dataToSave, { merge: true });
    res.status(200).json({ success: true, data: { id: req.params.id, ...dataToSave } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete gallery item and file
 * @route   DELETE /api/admin/gallery/:id
 * @access  Private
 */
exports.deleteGalleryItem = async (req, res, next) => {
  try {
    const docRef = db.collection('gallery').doc(req.params.id);
    
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const data = doc.data();

    if (data.imageUrl) {
      try {
        await deleteFileLocally(data.imageUrl);
      } catch (err) {
        console.error('Failed to delete associated photo:', err);
      }
    }

    await docRef.delete();

    try {
      await deleteFolderLocally(`gallery/${req.params.id}`);
    } catch (err) {
      console.error('Failed to delete gallery directory:', err);
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload gallery image file
 * @route   POST /api/admin/gallery/upload
 * @access  Private
 */
exports.uploadGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    // Since we support multiple uploads in a session or single, we pass a temporary or provided ID
    const id = req.body.id || uuidv4(); 
    const extension = req.file.originalname.split('.').pop();
    const fileName = `gallery/${id}/image_${Date.now()}.${extension}`;
    
    const publicUrl = await uploadFileLocally(req.file.buffer, fileName, req);

    res.status(200).json({
      success: true,
      data: { url: publicUrl, id }
    });
  } catch (error) {
    next(error);
  }
};
