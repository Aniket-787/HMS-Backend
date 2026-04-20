const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique:true,
      trim: true,
      match: [
     /^[6-9]\d{9}$/,
     "Please enter a valid 10-digit mobile number",
  ],
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique:true,
      trim: true,
      match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please enter a valid email address",
  ],
    },

    admin:{
      type:String
    },

    hospitalCode: {
      type: String,
      unique: true,
    },

    logo: {
      type: String, // Image URL from ImageKit
   },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    subscriptionPlan: {
      type: String,
      enum: ["FREE", "BASIC", "PREMIUM"],
      default: "FREE",
    },

    subscriptionExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const hospitalModel  = mongoose.model("Hospital", hospitalSchema);

module.exports = hospitalModel;