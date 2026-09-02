const express = require('express');
const multer = require('multer');
const { getMe } = require('../controllers/admin.controller');
const { updateProfile, uploadProfileImage, deleteProfileImage } = require('../controllers/profile.controller');
const {
  createProject, getAllAdminProjects, getAdminProjectById, updateProject, deleteProject, uploadProjectImage, deleteProjectImage,
  getProjectTimeline, addMilestone, updateMilestone, deleteMilestone, reorderTimeline
} = require('../controllers/project.controller');
const {
  getAllAdminSkills, getSkillById, createSkill, updateSkill, deleteSkill, uploadSkillIcon, deleteSkillIcon
} = require('../controllers/skill.controller');
const {
  getAllAdminExperience, getExperienceById, createExperience, updateExperience, deleteExperience, uploadCompanyLogo, deleteCompanyLogo
} = require('../controllers/experience.controller');
const {
  getAllAdminReviews, getReviewById, createReview, updateReview, deleteReview, uploadClientPhoto, deleteClientPhoto
} = require('../controllers/review.controller');
const {
  getAllAdminGallery, getGalleryById, createGalleryItem, updateGalleryItem, deleteGalleryItem, uploadGalleryImage
} = require('../controllers/gallery.controller');
const {
  getAllMessages, getMessageById, updateMessage, deleteMessage
} = require('../controllers/message.controller');
const {
  updateSettings, uploadSettingsImage, deleteSettingsImage
} = require('../controllers/settings.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const router = express.Router();

// Setup Multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// All routes in this file require admin authentication
router.use(requireAuth);

router.get('/me', getMe);

// Profile management routes
router.put('/profile', updateProfile);
router.post('/profile/image', upload.single('image'), uploadProfileImage);
router.delete('/profile/image', deleteProfileImage);

// Project management routes
router.post('/projects', createProject);
router.get('/projects', getAllAdminProjects);
router.get('/projects/:id', getAdminProjectById);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);
router.post('/projects/:id/images', upload.single('image'), uploadProjectImage);
router.delete('/projects/:id/images', deleteProjectImage); // Using delete, URL passed in body

// Project Timeline routes
router.get('/projects/:id/timeline', getProjectTimeline);
router.post('/projects/:id/timeline', addMilestone);
router.put('/projects/:id/timeline/reorder', reorderTimeline);
router.put('/projects/:id/timeline/:milestoneId', updateMilestone);
router.delete('/projects/:id/timeline/:milestoneId', deleteMilestone);

// Skills management routes
router.post('/skills', createSkill);
router.get('/skills', getAllAdminSkills);
router.get('/skills/:id', getSkillById);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);
router.post('/skills/:id/icon', upload.single('image'), uploadSkillIcon);
router.delete('/skills/:id/icon', deleteSkillIcon);

// Experience management routes
router.post('/experience', createExperience);
router.get('/experience', getAllAdminExperience);
router.get('/experience/:id', getExperienceById);
router.put('/experience/:id', updateExperience);
router.delete('/experience/:id', deleteExperience);
router.post('/experience/:id/logo', upload.single('image'), uploadCompanyLogo);
router.delete('/experience/:id/logo', deleteCompanyLogo);

// Review management routes
router.post('/reviews', createReview);
router.get('/reviews', getAllAdminReviews);
router.get('/reviews/:id', getReviewById);
router.put('/reviews/:id', updateReview);
router.delete('/reviews/:id', deleteReview);
router.post('/reviews/:id/photo', upload.single('image'), uploadClientPhoto);
router.delete('/reviews/:id/photo', deleteClientPhoto);

// Gallery management routes
router.post('/gallery', createGalleryItem);
router.get('/gallery', getAllAdminGallery);
router.get('/gallery/:id', getGalleryById);
router.put('/gallery/:id', updateGalleryItem);
router.delete('/gallery/:id', deleteGalleryItem);
router.post('/gallery/upload', upload.single('image'), uploadGalleryImage);

// Message management routes
router.get('/messages', getAllMessages);
router.get('/messages/:id', getMessageById);
router.put('/messages/:id', updateMessage);
router.delete('/messages/:id', deleteMessage);

// Settings routes
router.put('/settings', updateSettings);
router.post('/settings/upload', upload.single('image'), uploadSettingsImage);
router.delete('/settings/image', deleteSettingsImage);

module.exports = router;
