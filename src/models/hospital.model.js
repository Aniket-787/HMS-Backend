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
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      unique:true,
      trim: true,
    },

    admin:{
      type:String
    },

    hospitalCode: {
      type: String,
      unique: true,
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