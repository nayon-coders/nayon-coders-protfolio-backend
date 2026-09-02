const express = require('express');
const { getAllExperience } = require('../controllers/experience.controller');

const router = express.Router();

router.get('/', getAllExperience);

module.exports = router;
