const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfilePicture,
  removeProfilePicture,
  getSessionInfo,
} = require("../controller/user.controller");
const  authMiddleware  = require("../middleware/authMiddleware");
const { uploadProfile } = require("../middleware/multer.middleware");

// All routes require authentication
router.use(authMiddleware);

// Get current user profile
router.get("/profile", getProfile);

// Update profile
router.patch("/profile", updateProfile);

// Change password
router.patch("/change-password", changePassword);

// Upload profile picture
router.post("/profile-picture", uploadProfile.single("avatar"), uploadProfilePicture);

// Remove profile picture
router.delete("/profile-picture", removeProfilePicture);

// Get session info
router.get("/session", getSessionInfo);

module.exports = router;