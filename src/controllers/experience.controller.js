const { db } = require('../config/firebase');
const { uploadFileLocally, deleteFileLocally, deleteFolderLocally } = require('../utils/fileUpload');

/**
 * Helper to fetch and resolve skill IDs to skill objects
 */
const resolveSkills = async (technologies) => {
  if (!technologies || !Array.isArray(technologies) || technologies.length === 0) return [];
  
  try {
    const skillsSnapshot = await db.collection('skills').where('active', '==', true).get();
    const skillsMap = {};
    skillsSnapshot.forEach(doc => {
      skillsMap[doc.id] = { id: doc.id, ...doc.data() };
    });
    return technologies.map(skillId => skillsMap[skillId] || skillId);
  } catch (error) {
    console.error("Error resolving skills:", error);
    return technologies; // Fallback to raw IDs
  }
};

/**
 * @desc    Get all active experiences for public view
 * @route   GET /api/experience
 * @access  Public
 */
exports.getAllExperience = async (req, res, next) => {
  try {
    const snapshot = await db.collection('experience')
      .where('active', '==', true)
      .orderBy('displayOrder', 'asc')
      // Note: We might want to order by endDate or startDate as well, but displayOrder gives manual control.
      .get();
      
    const experiences = [];
    
    // We'll resolve skills for all of them. Since it's public facing, this is important.
    // Fetch all active skills once to avoid multiple db calls
    const skillsSnapshot = await db.collection('skills').where('active', '==', true).get();
    const skillsMap = {};
    skillsSnapshot.forEach(doc => {
      skillsMap[doc.id] = { id: doc.id, ...doc.data() };
    });

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.technologies && Array.isArray(data.technologies)) {
        data.technologies = data.technologies.map(skillId => skillsMap[skillId] || skillId);
      }
      experiences.push({ id: doc.id, ...data });
    });

    res.status(200).json({ success: true, data: experiences });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all experiences (Admin)
 * @route   GET /api/admin/experience
 * @access  Private
 */
exports.getAllAdminExperience = async (req, res, next) => {
  try {
    const snapshot = await db.collection('experience')
      .orderBy('displayOrder', 'asc')
      .get();
      
    const experiences = [];
    snapshot.forEach(doc => {
      experiences.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: experiences });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single experience by ID (Admin)
 * @route   GET /api/admin/experience/:id
 * @access  Private
 */
exports.getExperienceById = async (req, res, next) => {
  try {
    const doc = await db.collection('experience').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create an experience (Admin)
 * @route   POST /api/admin/experience
 * @access  Private
 */
exports.createExperience = async (req, res, next) => {
  try {
    const { id, ...experienceData } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Experience ID is required' });
    }

    const dataToSave = {
      ...experienceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('experience').doc(id).set(dataToSave);

    res.status(201).json({
      success: true,
      message: 'Experience created successfully',
      data: { id, ...dataToSave }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an experience by ID (Admin)
 * @route   PUT /api/admin/experience/:id
 * @access  Private
 */
exports.updateExperience = async (req, res, next) => {
  try {
    const experienceData = req.body;
    const docRef = db.collection('experience').doc(req.params.id);
    
    const dataToSave = {
      ...experienceData,
      updatedAt: new Date().toISOString()
    };

    await docRef.set(dataToSave, { merge: true });

    res.status(200).json({
      success: true,
      message: 'Experience updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an experience by ID (Admin)
 * @route   DELETE /api/admin/experience/:id
 * @access  Private
 */
exports.deleteExperience = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete associated media locally
    await deleteFolderLocally(`experience/${id}`);

    await db.collection('experience').doc(id).delete();

    res.status(200).json({ success: true, message: 'Experience deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload company logo
 * @route   POST /api/admin/experience/:id/logo
 * @access  Private
 */
exports.uploadCompanyLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { id } = req.params;
    const extension = req.file.originalname.split('.').pop();
    const fileName = `experience/${id}/logo_${Date.now()}.${extension}`;
    
    // Upload locally
    const publicUrl = await uploadFileLocally(req.file.buffer, fileName, req);

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { url: publicUrl }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete company logo
 * @route   DELETE /api/admin/experience/:id/logo
 * @access  Private
 */
exports.deleteCompanyLogo = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'Image URL is required in body' });
    }

    await deleteFileLocally(url);

    res.status(200).json({ success: true, message: 'Logo deleted successfully' });
  } catch (error) {
    next(error);
  }
};
