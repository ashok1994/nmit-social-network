const express = require("express");
const auth = require("../middleware/auth");
const Message = require("../models/Message");
const User = require("../models/User");
const router = express.Router();
const Conversation = require('../models/Conversation');

// Fetch messages by conversation ID
router.get('/messages/:conversationId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a new message
router.post('/messages/chat', auth, async (req, res) => {
  const { conversationId, text } = req.body;

  try {
    const message = new Message({
      conversationId,
      sender: req.user,
      text,
    });

    await message.save();
    res.status(201).json(message);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
