const dischargeSummaryModel = require("../models/dischargeSummery.model");
const ipdModel = require("../models/IPD.model");
const bedModel = require("../models/bed.model");


async function createDischargeSummary(req, res) {
  try {
    const {
      ipdId,
      reasonForAdmission,
      diagnosis,
      significantFindings,
      investigations,
      procedures,
      treatmentGiven,
      conditionAtDischarge,
      medicines,
      instructions,
      followUpAdvice
    } = req.body;

    const hospitalId = req.user.hospitalId;
    const doctorId = req.user.userId;

    const ipd = await ipdModel.findById(ipdId);

    if (!ipd) {
      return res.status(404).json({ message: "IPD not found" });
    }

    // 🔥 prevent duplicate summary
    const existing = await dischargeSummaryModel.findOne({ ipdId });
    if (existing) {
      return res.status(400).json({
        message: "Discharge summary already exists"
      });
    }

    const summary = await dischargeSummaryModel.create({
      ipdId,
      patientId: ipd.patientId,
      doctorId,
      hospitalId,

      reasonForAdmission,
      diagnosis,
      significantFindings,
      investigations,
      procedures,
      treatmentGiven,
      conditionAtDischarge,
      medicines,
      instructions,
      followUpAdvice,
    });

    res.status(201).json({
      message: "Discharge summary created successfully",
      summary,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}


async function getDischargeSummary(req, res) {
  try {
    const { ipdId } = req.params;

    const summary = await dischargeSummaryModel
      .findOne({ ipdId })
      .populate("patientId")
      .populate("doctorId", "name")
      .populate("hospitalId");

    if (!summary) {
      return res.status(404).json({
        message: "Discharge summary not found",
      });
    }

    const ipd = await ipdModel.findById(ipdId);

    res.status(200).json({
      summary,
      ipd,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function getAllDischargeSummaries(req, res) {
  try {
    const hospitalId = req.user.hospitalId;

    const summaries = await dischargeSummaryModel
      .find({ hospitalId })
      .populate("patientId")
      .populate("doctorId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      summaries,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

module.exports = { createDischargeSummary, getAllDischargeSummaries, getDischargeSummary };