const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");
const Conversation = require('../models/Conversation');
const { check, validationResult } = require("express-validator");

const bcrypt = require("bcryptjs");

router.post(
    '/register',
    [
      check('username', 'Username is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password is required').not().isEmpty(),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const { username, email, password, age, relationshipStatus, location } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
          username,
          email,
          password: hashedPassword,
          age,
          relationshipStatus,
          location: location ? { type: 'Point', coordinates: location.coordinates } : undefined,
        });
        await newUser.save();
        res.status(201).json(newUser);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  );

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, "yourJWTSecret", {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Protected route example
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user information (age, relationshipStatus, location)
router.patch("/update", auth, async (req, res) => {
  try {
    const updates = {};
    const { age, relationshipStatus, location } = req.body;

    if (age !== undefined) updates.age = age;
    if (relationshipStatus !== undefined)
      updates.relationshipStatus = relationshipStatus;
    if (location !== undefined) {
      updates.location = {
        type: "Point",
        coordinates: location.coordinates,
      };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search for users by name, excluding the current user
router.get("/search", auth, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      username: { $regex: query, $options: "i" }, // 'i' makes it case-insensitive
      _id: { $ne: req.user }, // Exclude the current user
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});




// Add a friend and create a conversation
router.post('/addFriend', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findById(req.user);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add friendId to user's friends list
    if (!user.friends.includes(friendId)) {
      user.friends.push(friendId);
      await user.save();
    }

    // Add userId to friend's friends list
    if (!friend.friends.includes(req.user)) {
      friend.friends.push(req.user);
      await friend.save();
    }

    // Create a new conversation
    const existingConversation = await Conversation.findOne({
      participants: { $all: [req.user, friendId] }
    });

    if (!existingConversation) {
      const conversation = new Conversation({
        participants: [req.user, friendId]
      });
      await conversation.save();
    }

    res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove a friend
router.post('/removeFriend', auth, async (req, res) => {
  try {
    const { friendId } = req.body;
    const user = await User.findById(req.user);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove friendId from user's friends list
    user.friends = user.friends.filter(id => id.toString() !== friendId);
    await user.save();

    // Remove userId from friend's friends list
    friend.friends = friend.friends.filter(id => id.toString() !== req.user);
    await friend.save();

    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Get list of friends
router.get("/friends", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).populate(
      "friends",
      "username email profilePicture"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get the authenticated user's information
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
