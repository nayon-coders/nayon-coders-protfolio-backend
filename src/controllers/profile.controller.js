const { db } = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const { uploadFileLocally, deleteFileLocally } = require('../utils/fileUpload');

// Basic validation lists based on user requirements
const validStatuses = ['available', 'busy', 'unavailable'];
const validSocials = ['email', 'whatsapp', 'skype', 'github', 'linkedin', 'facebook', 'twitter'];

/**
 * @desc    Get public profile data
 * @route   GET /api/profile
 * @access  Public
 */
exports.getProfile = async (req, res, next) => {
  try {
    const doc = await db.collection('profile').doc('main').get();
    if (!doc.exists) {
      return res.status(200).json({ success: true, data: {} });
    }
    res.status(200).json({ success: true, data: doc.data() });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile data
 * @route   PUT /api/admin/profile
 * @access  Private/Admin
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { 
      name, title, intro, bio, experienceYears, location, 
      heroBadge, primaryCta, secondaryCta, availability, typingTexts, socialLinks 
    } = req.body;

    // Validate Availability strict format
    if (availability && !validStatuses.includes(availability.status)) {
      return res.status(400).json({ success: false, message: 'Invalid availability status' });
    }

    // Validate Social Links format
    let sanitizedSocialLinks = {};
    if (socialLinks && typeof socialLinks === 'object') {
      validSocials.forEach(platform => {
        if (socialLinks[platform]) {
          sanitizedSocialLinks[platform] = {
            enabled: Boolean(socialLinks[platform].enabled),
            value: socialLinks[platform].value || ''
          };
        } else {
          // Default if missing
          sanitizedSocialLinks[platform] = { enabled: false, value: '' };
        }
      });
    }

    const updateData = {
      ...(name && { name }),
      ...(title && { title }),
      ...(intro && { intro }),
      ...(bio && { bio }),
      ...(experienceYears && { experienceYears }),
      ...(location && { location }),
      ...(heroBadge && { heroBadge }),
      ...(primaryCta && { primaryCta }),
      ...(secondaryCta && { secondaryCta }),
      ...(availability && { availability }),
      ...(Array.isArray(typingTexts) && { typingTexts }),
      ...(Object.keys(sanitizedSocialLinks).length > 0 && { socialLinks: sanitizedSocialLinks }),
      updatedAt: new Date().toISOString()
    };

    await db.collection('profile').doc('main').set(updateData, { merge: true });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updateData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload profile image
 * @route   POST /api/admin/profile/image
 * @access  Private/Admin
 */
exports.uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    const extension = req.file.originalname.split('.').pop();
    const fileName = `profile/profile_image_${Date.now()}.${extension}`;
    
    // Upload locally
    const publicUrl = await uploadFileLocally(req.file.buffer, fileName, req);

    // Update Firestore
    await db.collection('profile').doc('main').set({
      profileImage: publicUrl,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: { profileImage: publicUrl }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete profile image
 * @route   DELETE /api/admin/profile/image
 * @access  Private/Admin
 */
exports.deleteProfileImage = async (req, res, next) => {
  try {
    const doc = await db.collection('profile').doc('main').get();
    const profileData = doc.data();

    if (profileData && profileData.profileImage) {
      await deleteFileLocally(profileData.profileImage);
    }

    // Unset field in Firestore
    await db.collection('profile').doc('main').set({
      profileImage: null,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
