// backend/routes/messages.js
const express = require('express');
const {
  createMessage,
  getMessages,
  getMessageById,
  deleteMessage,
} = require('../controllers/messageController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// 🔐 Get all messages for the logged-in user (admin sees all, users see only their own or public)
router.get('/', verifyToken, getMessages);

// 🔐 Get a specific message by ID
router.get('/:id', verifyToken, getMessageById);

// 🔐 Admin can create a message and tag users or leave it public
router.post('/', verifyToken,  createMessage);

// 🔐 Admin can delete a message
router.delete('/:id', verifyToken, isAdmin, deleteMessage);

module.exports = router;
