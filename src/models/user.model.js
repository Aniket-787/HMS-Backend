const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String, // 🔥 changed
      required: true,
      trim: true,
    },

    role: {
      type: String,
      enum: ["SUPER_ADMIN", "ADMIN", "DOCTOR", "RECEPTIONIST"],
      required: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLogin: {
      type: Date,
    },

    profile: {
      specialization: String,
      experience: Number,

      // 💰 fees moved here
      consultationFee: {
        type: Number,
        default: 0,
      },

      followUpFee: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Optional (better uniqueness)
userSchema.index({ email: 1, hospitalId: 1 }, { unique: true });
userSchema.index({ phone: 1, hospitalId: 1 }, { unique: true });

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;