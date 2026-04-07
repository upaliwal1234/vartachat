const express = require('express');
const { protect } = require('../middleware/auth');
const { getChatHistory, getUserChatRooms } = require('../controllers/chatController');

const router = express.Router();

router.get('/rooms', protect, getUserChatRooms);
router.get('/history/:roomId', getChatHistory);

module.exports = router;
