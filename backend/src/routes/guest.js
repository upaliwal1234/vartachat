const express = require('express');
const { createOrGetSession, getGuestChatHistory } = require('../controllers/guestController');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/session', apiLimiter, createOrGetSession);
router.get('/history/:guestId', apiLimiter, getGuestChatHistory);

module.exports = router;
