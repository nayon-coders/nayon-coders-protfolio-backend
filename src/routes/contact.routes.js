const express = require('express');
const { submitContact } = require('../controllers/message.controller');
const { contactRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/', contactRateLimiter, submitContact);

module.exports = router;
