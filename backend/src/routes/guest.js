const express = require('express');
const { createOrGetSession, getGuestChatHistory } = require('../controllers/guestController');

const router = express.Router();

router.post('/session', createOrGetSession);
router.get('/history/:guestId', getGuestChatHistory);

module.exports = router;
