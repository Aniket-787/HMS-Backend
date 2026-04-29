const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate("hospitalId", "name address phone email logo");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hospitalId: user.hospitalId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, phone, profile } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: userId },
        hospitalId: req.user.hospitalId,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Check if phone is already taken by another user
    if (phone) {
      const existingUser = await User.findOne({
        phone,
        _id: { $ne: userId },
        hospitalId: req.user.hospitalId,
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Phone number already in use",
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (phone) updateData.phone = phone;
    if (profile) {
      // Update profile fields
      if (profile.specialization !== undefined) updateData["profile.specialization"] = profile.specialization;
      if (profile.experience !== undefined) updateData["profile.experience"] = profile.experience;
      if (profile.address !== undefined) updateData["profile.address"] = profile.address;
      if (profile.bio !== undefined) updateData["profile.bio"] = profile.bio;
      if (profile.consultationFee !== undefined) updateData["profile.consultationFee"] = profile.consultationFee;
      if (profile.followUpFee !== undefined) updateData["profile.followUpFee"] = profile.followUpFee;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("hospitalId", "name address phone email logo");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hospitalId: user.hospitalId,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirm password do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    });
  }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB",
      });
    }

    // Get existing user to delete old avatar if exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old avatar if it's a local file
    if (user.profile?.avatar && user.profile.avatar.startsWith("/uploads/")) {
      const oldAvatarPath = path.join(__dirname, "..", "..", user.profile.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Save file path - using the uploads directory
    const avatarPath = `/uploads/profiles/${req.file.filename}`;

    await User.findByIdAndUpdate(userId, {
      $set: { "profile.avatar": avatarPath },
    });

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded successfully",
      avatar: avatarPath,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading profile picture",
      error: error.message,
    });
  }
};

// Remove profile picture
exports.removeProfilePicture = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Delete old avatar if it's a local file
    if (user.profile?.avatar && user.profile.avatar.startsWith("/uploads/")) {
      const oldAvatarPath = path.join(__dirname, "..", "..", user.profile.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    await User.findByIdAndUpdate(userId, {
      $set: { "profile.avatar": null },
    });

    res.status(200).json({
      success: true,
      message: "Profile picture removed successfully",
    });
  } catch (error) {
    console.error("Error removing profile picture:", error);
    res.status(500).json({
      success: false,
      message: "Error removing profile picture",
      error: error.message,
    });
  }
};

// Get user session info
exports.getSessionInfo = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("lastLogin createdAt");

    res.status(200).json({
      success: true,
      session: {
        lastLogin: user.lastLogin,
        accountCreated: user.createdAt,
        currentSession: new Date(),
      },
    });
  } catch (error) {
    console.error("Error fetching session info:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching session info",
      error: error.message,
    });
  }
};