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
      unique: true, // globally unique 
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone:{
      type:Number,
      required:true,
      unique:true,
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
      specialization: String, // for doctor
      experience: Number,
    },
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;