const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: true,
    },

    uhid:{
      type: String,
      unique: true,
      trim: true,
    },

    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },

    // 🔮 future fields
    address: {
      type: String,
      trim: true,
    },

    bloodGroup: {
      type: String,
    },

    allergies: {
      type: String,
    },

    emergencyContact: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// 🔥 Unique constraint per hospital (VERY IMPORTANT)
patientSchema.index({ phone: 1, hospitalId: 1 }, { unique: true });

const patientModel = mongoose.model("Patient", patientSchema);

module.exports = patientModel;