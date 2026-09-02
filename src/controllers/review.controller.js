const { db } = require('../config/firebase');
const { uploadFileLocally, deleteFileLocally, deleteFolderLocally } = require('../utils/fileUpload');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Get all reviews (public)
 * @route   GET /api/reviews
 * @access  Public
 */
exports.getAllReviews = async (req, res, next) => {
  try {
    const snapshot = await db.collection('reviews')
      .where('published', '==', true)
      .orderBy('displayOrder', 'asc')
      .orderBy('createdAt', 'desc')
      .get();
      
    const reviews = [];
    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all admin reviews
 * @route   GET /api/admin/reviews
 * @access  Private
 */
exports.getAllAdminReviews = async (req, res, next) => {
  try {
    const snapshot = await db.collection('reviews')
      .orderBy('createdAt', 'desc')
      .get();
      
    const reviews = [];
    snapshot.forEach(doc => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single review
 * @route   GET /api/admin/reviews/:id
 * @access  Private
 */
exports.getReviewById = async (req, res, next) => {
  try {
    const doc = await db.collection('reviews').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create review
 * @route   POST /api/admin/reviews
 * @access  Private
 */
exports.createReview = async (req, res, next) => {
  try {
    const { id, ...reviewData } = req.body;
    const reviewId = id || uuidv4();
    
    const docRef = db.collection('reviews').doc(reviewId);
    const dataToSave = {
      ...reviewData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docRef.set(dataToSave);
    res.status(201).json({ success: true, data: { id: reviewId, ...dataToSave } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/admin/reviews/:id
 * @access  Private
 */
exports.updateReview = async (req, res, next) => {
  try {
    const reviewData = req.body;
    const docRef = db.collection('reviews').doc(req.params.id);
    
    const dataToSave = {
      ...reviewData,
      updatedAt: new Date().toISOString()
    };

    await docRef.set(dataToSave, { merge: true });
    res.status(200).json({ success: true, data: { id: req.params.id, ...dataToSave } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const docRef = db.collection('reviews').doc(req.params.id);
    
    // Check if exists
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const data = doc.data();

    // Delete associated photo if exists
    if (data.photo) {
      try {
        await deleteFileLocally(data.photo);
      } catch (err) {
        console.error('Failed to delete associated photo:', err);
      }
    }

    // Delete review document
    await docRef.delete();

    // Clean up directory
    try {
      await deleteFolderLocally(`reviews/${req.params.id}`);
    } catch (err) {
      console.error('Failed to delete review directory:', err);
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload client photo
 * @route   POST /api/admin/reviews/:id/photo
 * @access  Private
 */
exports.uploadClientPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const { id } = req.params;
    const extension = req.file.originalname.split('.').pop();
    const fileName = `reviews/${id}/photo_${Date.now()}.${extension}`;
    
    // Upload locally
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
 * @desc    Delete client photo
 * @route   DELETE /api/admin/reviews/:id/photo
 * @access  Private
 */
exports.deleteClientPhoto = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'URL is required' });
    }

    await deleteFileLocally(url);

    res.status(200).json({ success: true, message: 'Photo deleted successfully' });
  } catch (error) {
    next(error);
  }
};
