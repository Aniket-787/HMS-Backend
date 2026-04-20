const mongoose = require("mongoose");

const dischargeSummarySchema = new mongoose.Schema({
  ipdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "IPD",
    required: true,
  },

  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },

  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hospital",
    required: true,
  },

  //MEDICAL DETAILS
  reasonForAdmission: String,
  diagnosis: String,
  significantFindings: String,
  investigations: String,
  procedures: String,
  treatmentGiven: String,

  conditionAtDischarge: {
    condition: String,
    bp: String,
    spo2: String,
  },

  medicines: [
    {
      name: String,
      dose: String,
      frequency: String,
      duration: String,
    }
  ],

  instructions: String,
  followUpAdvice: String,

}, {
  timestamps: true
});

const dischargeSummaryModel = mongoose.model("DischargeSummary", dischargeSummarySchema);

module.exports = dischargeSummaryModel;