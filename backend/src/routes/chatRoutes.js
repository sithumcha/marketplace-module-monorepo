const express = require('express');
const router = express.Router();
const { getChatsForUser, getChatMessages, sendMessage } = require('../controllers/chatController');

router.get('/user/:userId', getChatsForUser);
router.get('/:chatId/messages', getChatMessages);
router.post('/messages', sendMessage);

module.exports = router;
