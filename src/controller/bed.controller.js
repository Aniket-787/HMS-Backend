const { get } = require("mongoose");
const bedModel = require("../models/bed.model");

async function createBed(req, res) {
  try {
    const { bedNumber, type, chargePerDay } = req.body;
    const hospitalId = req.user.hospitalId;

    // check duplicate
    const existing = await bedModel.findOne({
      hospitalId,
      bedNumber,
    });

    if (existing) {
      return res.status(400).json({
        message: "Bed already exists",
      });
    }

    const bed = await bedModel.create({
      hospitalId,
      bedNumber,
      type,
      chargePerDay,
    });

    res.status(201).json({
      message: "Bed created successfully",
      bed,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}


async function getBeds(req, res) {
  try {
    const hospitalId = req.user.hospitalId;

    const beds = await bedModel.find({ hospitalId });

    res.status(200).json({ beds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function getBedsByType(req, res) {
  try {
    const { type } = req.query;
    const hospitalId = req.user.hospitalId;

    const beds = await bedModel.find({
      hospitalId,
      type,
    });

    res.status(200).json({ beds });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = { createBed, getBeds, getBedsByType };