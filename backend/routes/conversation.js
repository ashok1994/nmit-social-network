const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const auth = require('../middleware/auth');

// Fetch all conversations for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user }).populate('participants', 'username profilePicture');
    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;