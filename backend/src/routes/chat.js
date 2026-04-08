const express = require('express');
const { protect } = require('../middleware/auth');
const { getChatHistory, getUserChatRooms } = require('../controllers/chatController');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.get('/rooms', apiLimiter, protect, getUserChatRooms);
router.get('/history/:roomId', apiLimiter, getChatHistory);

module.exports = router;
