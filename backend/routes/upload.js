const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "./uploads/profile_pictures";
    fs.access(dir, (error) => {
      if (error) {
        return fs.mkdir(dir, { recursive: true }, (error) => cb(error, dir));
      } else {
        return cb(null, dir);
      }
    });
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload profile picture
router.post(
  "/uploadProfilePicture",
  auth,
  upload.single("profilePicture"),
  async (req, res) => {
    console.log("called");
    try {
      const user = await User.findByIdAndUpdate(
        req.user,
        { profilePicture: req.file.path },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Profile picture updated successfully", user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;
