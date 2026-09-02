const express = require('express');
const { getProfile } = require('../controllers/profile.controller');

const router = express.Router();

// Public route to get profile data
router.get('/', getProfile);

module.exports = router;
