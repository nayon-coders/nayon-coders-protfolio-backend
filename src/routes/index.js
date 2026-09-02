const express = require('express');
const router = express.Router();

// Import route files
const adminRoutes = require('./admin.routes');
const profileRoutes = require('./profile.routes');
const projectRoutes = require('./project.routes');

// Health Check Route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running gracefully.',
    timestamp: new Date().toISOString()
  });
});

// Mount public routes
router.use('/profile', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/skills', require('./skill.routes'));
router.use('/experience', require('./experience.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/gallery', require('./gallery.routes'));
router.use('/contact', require('./contact.routes'));
router.use('/settings', require('./settings.routes'));

// Mount protected admin routes
router.use('/admin', adminRoutes);

// Placeholder for future routes
// router.use('/projects', require('./projects.routes'));

module.exports = router;
