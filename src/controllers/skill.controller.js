const { db } = require('../config/firebase');
const { uploadFileLocally, deleteFileLocally, deleteFolderLocally } = require('../utils/fileUpload');

/**
 * @desc    Get all active skills for public view
 * @route   GET /api/skills
 * @access  Public
 */
exports.getAllSkills = async (req, res, next) => {
  try {
    const snapshot = await db.collection('skills').get();
      
    const skills = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.active === true) {
        skills.push({ id: doc.id, ...data });
      }
    });

    skills.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all skills (Admin)
 * @route   GET /api/admin/skills
 * @access  Private
 */
exports.getAllAdminSkills = async (req, res, next) => {
  try {
    const snapshot = await db.collection('skills').get();
      
    const skills = [];
    snapshot.forEach(doc => {
      skills.push({ id: doc.id, ...doc.data() });
    });

    skills.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single skill by ID (Admin)
 * @route   GET /api/admin/skills/:id
 * @access  Private
 */
exports.getSkillById = async (req, res, next) => {
  try {
    const doc = await db.collection('skills').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a skill (Admin)
 * @route   POST /api/admin/skills
 * @access  Private
 */
exports.createSkill = async (req, res, next) => {
  try {
    const { id, ...skillData } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, message: 'Skill ID is required' });
    }

    const dataToSave = {
      ...skillData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('skills').doc(id).set(dataToSave);

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: { id, ...dataToSave }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a skill by ID (Admin)
 * @route   PUT /api/admin/skills/:id
 * @access  Private
 */
exports.updateSkill = async (req, res, next) => {
  try {
    const skillData = req.body;
    const docRef = db.collection('skills').doc(req.params.id);
    
    const dataToSave = {
      ...skillData,
      updatedAt: new Date().toISOString()
    };

    await docRef.set(dataToSave, { merge: true });

    res.status(200).json({
      success: true,
      message: 'Skill updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a skill by ID (Admin)
 * @route   DELETE /api/admin/skills/:id
 * @access  Private
 */
exports.deleteSkill = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Delete associated media locally
    await deleteFolderLocally(`skills/${id}`);

    await db.collection('skills').doc(id).delete();

    res.status(200).json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload skill icon
 * @route   POST /api/admin/skills/:id/icon
 * @access  Private
 */
exports.uploadSkillIcon = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const { id } = req.params;
    const extension = req.file.originalname.split('.').pop();
    const fileName = `skills/${id}/icon_${Date.now()}.${extension}`;
    
    // Upload locally
    const publicUrl = await uploadFileLocally(req.file.buffer, fileName, req);

    res.status(200).json({
      success: true,
      message: 'Icon uploaded successfully',
      data: { url: publicUrl }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete skill icon
 * @route   DELETE /api/admin/skills/:id/icon
 * @access  Private
 */
exports.deleteSkillIcon = async (req, res, next) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ success: false, message: 'Image URL is required in body' });
    }

    await deleteFileLocally(url);

    res.status(200).json({ success: true, message: 'Icon deleted successfully' });
  } catch (error) {
    next(error);
  }
};
