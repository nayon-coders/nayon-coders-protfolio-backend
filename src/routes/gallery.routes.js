const express = require('express');
const { getAllGalleryItems } = require('../controllers/gallery.controller');

const router = express.Router();

router.get('/', getAllGalleryItems);

module.exports = router;
