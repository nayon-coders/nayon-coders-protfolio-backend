const express = require('express');
const { getPublicProjects, getProjectBySlug } = require('../controllers/project.controller');

const router = express.Router();

// Public routes for projects
router.get('/', getPublicProjects);
router.get('/:slug', getProjectBySlug);

module.exports = router;
