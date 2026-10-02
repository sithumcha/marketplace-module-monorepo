const express = require('express');
const router = express.Router();
const { 
  getChatsForUser, 
  getChatMessages, 
  getUserSupportMessages,
  sendMessage, 
  getAllSupportMessages,
  deleteThread,
  deleteSingleMessage
} = require('../controllers/chatController');

router.get('/user/:userId', getUserSupportMessages);
router.get('/support/all', getAllSupportMessages);
router.get('/:chatId/messages', getChatMessages);
router.post('/send', sendMessage);
router.post('/messages', sendMessage);
router.delete('/thread/:threadId', deleteThread);
router.delete('/message/:messageId', deleteSingleMessage);

module.exports = router;
