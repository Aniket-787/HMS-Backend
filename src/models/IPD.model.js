const mongoose = require("mongoose");
const admitPatient = require("../controller/ipd.controller");

const ipdSchema = new mongoose.Schema(
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

    uhid: {
      type: String,
      required: true,
    },

    isInsured:{
        type:String,
        enum:["YES","NO"],
        default:"NO"
    },
    InsuranceNo:{
        type:Number
    },
    policyNo:{
        type:Number
    },

    complimentTo:{
        type:String
    },

    wardType:{
        type:String,
    },

    // 🛏️ BED INFO
    bedNumber: {
      type: String,
      required: true,
    },

    bedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bed",
      required: true,
    },

    // 💰 LOCK BED PRICE
    bedChargePerDay: {
      type: Number,
      required: true,
    },

    // 📅 ADMISSION / DISCHARGE
    admissionDate: {
      type: Date,
      default: Date.now,
    },

    dischargeDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["ADMITTED", "DISCHARGED"],
      default: "ADMITTED",
    },

    // 🩺 MEDICAL
    diagnosis: String,
    notes: String,

    dailyNotes: [
      {
        date: {
          type: Date,
          default: Date.now,
        },
        notes: String,
        medicines: [
          {
            name: String,
            dosage: String,
          },
        ],
      },
    ],

    // 💰 BILLING
    charges: [
      {
        type: {
          type: String,
          enum: ["BED", "MEDICINE", "TEST", "OTHER"],
        },
        description: String,
        amount: Number,
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    totalAmount: {
      type: Number,
      default: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "UNPAID"],
      default: "UNPAID",
    },

    // 🧾 discharge summary
    dischargeSummary: String,
  },
  {
    timestamps: true,
  }
);

// 🔥 prevent multiple active IPD
ipdSchema.index(
  { patientId: 1, hospitalId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "ADMITTED" } }
);

const ipdModel = mongoose.model("IPD", ipdSchema);

module.exports =  ipdModel
