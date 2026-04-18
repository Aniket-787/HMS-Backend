const mongoose = require("mongoose");

const bedSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },

  bedNumber: {
    type: String,
    required: true,
  },

  // 🔥 NEW (TYPE OF BED)
  type: {
    type: String,
    enum: ["GENERAL","PRIVATE", "ICU"],
    required: true,
  },

  // 💰 CHARGE PER DAY
  chargePerDay: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ["VACANT", "OCCUPIED"],
    default: "VACANT",
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    default: null,
  },
});

bedSchema.index({ hospitalId: 1, bedNumber: 1 }, { unique: true });

const bedModel = mongoose.model("Bed", bedSchema);

module.exports = bedModel;