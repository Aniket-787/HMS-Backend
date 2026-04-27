const mongoose = require("mongoose");

const opdSchema = new mongoose.Schema(
  {
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

    // 💰 BILLING (IMPROVED)
    amount: {
      type: Number,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "UNPAID"],
      default: "UNPAID",
    },

    visitDate: {
      type: Date,
      default: Date.now,
    },

    tokenNumber: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["WAITING", "COMPLETED"],
      default: "WAITING",
    },

    symptoms: {
      type: String,
    },

    generalExamination:{
      type:String
    },

    Investigation:{
      type:String
    },

    diagnosis: {
      type: String,
    },

    medicines: [
  {
    type: {
      type: String,
      enum: [
        "TAB", "SYP", "CRM", "POW", "INJ", "CAP",
        "DRP", "SUS", "LIQ", "SAC", "EXP", "OIN",
        "GEN", "LOT", "GEL", "GRA", "SOAP", "SOL",
        "VAC", "PAS", "INH", "OTH"
      ],
      default: "TAB",
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    dosage: {
      type: String,
      trim: true,
    },

    duration: {
      type: String,
      trim: true,
    },
  },
],

chiefComplaint: {
  type: String
},

onExamination: {
  type: String
},

procedure: {
  type: String
},

    notes: {
      type: String,
    },

    followUpDate: {
      type: Date,
    },

    attachments: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// 🔥 Important index for token logic
opdSchema.index({ doctorId: 1, visitDate: 1, tokenNumber: 1 });

const opdModel = mongoose.model("OPD", opdSchema);

module.exports = opdModel;