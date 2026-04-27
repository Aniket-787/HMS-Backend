const appointmentRequestModel = require("../models/appointmentRequest.model");
const patientModel = require("../models/patient.model");
const opdModel = require("../models/opd.model");
const hospitalModel = require("../models/hospital.model");
const userModel = require("../models/user.model");
const mongoose = require("mongoose");
const sendSMS = require('../services/sendWhatsApp');
const { appointmentApproved } = require('../services/messageTemplates');
// Create a new appointment request
async function createAppointmentRequest(req, res) {
  try {
    const { name, phone, age, gender, symptoms, doctorId, hospitalId } = req.body;

    // Validate required fields
    if (!name || !phone || !hospitalId) {
      return res.status(400).json({
        message: "Name, phone, and hospitalId are required"
      });
    }

    const request = await appointmentRequestModel.create({
      name,
      phone,
      age,
      gender,
      symptoms,
      doctorId,
      hospitalId,
      status: "PENDING"
    });

    res.status(201).json({
      message: "Appointment request submitted successfully. Wait for approval.",
      request
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

// Get appointment requests for a hospital (for receptionist)
async function getAppointmentRequests(req, res) {
  try {
    const { hospitalId, status } = req.query;

    if (!hospitalId) {
      return res.status(400).json({
        message: "hospitalId is required"
      });
    }

    const query = { hospitalId };
    if (status) {
      query.status = status;
    }

    const requests = await appointmentRequestModel.find(query)
      .populate("doctorId", "name")
      .populate("hospitalId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      requests
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

// Approve appointment request
async function approveRequest(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const requestId = req.params.id;

    const request = await appointmentRequestModel.findById(requestId).session(session);

    if (!request) {
      await session.abortTransaction();
      return res.status(404).json({
        message: "Appointment request not found"
      });
    }

    if (request.status !== "PENDING") {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Request already ${request.status.toLowerCase()}`
      });
    }

    const hospitalId = request.hospitalId;
    const doctorId = request.doctorId;
    const phone = request.phone;

    // Check if patient exists
    let patient = await patientModel.findOne({ phone, hospitalId }).session(session);

    if (!patient) {
      // Create new patient
      const hospital = await hospitalModel.findById(hospitalId).session(session);
      const count = await patientModel.countDocuments({ hospitalId }).session(session);
      const nextNumber = count + 1;
      const uhid = `${hospital.hospitalCode}-${String(nextNumber).padStart(4, "0")}`;

      const newPatient = await patientModel.create([{
        name: request.name,
        phone,
        age: request.age,
        gender: request.gender,
        hospitalId,
        uhid
      }], { session });

      patient = newPatient[0];
    }

    // Create OPD with token
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let tokenNumber = 1;
    let amount = 0;

    if (doctorId) {
      const doctor = await userModel.findById(doctorId).session(session);

      if (doctor) {
        const lastOPD = await opdModel
          .findOne({
            doctorId,
            hospitalId,
            visitDate: { $gte: today }
          })
          .sort({ tokenNumber: -1 })
          .session(session);

        tokenNumber = lastOPD ? lastOPD.tokenNumber + 1 : 1;

        const lastPatientOPD = await opdModel
          .findOne({
            patientId: patient._id,
            doctorId,
            hospitalId
          })
          .sort({ createdAt: -1 })
          .session(session);

        // Determine consultation or follow-up fee
        if (lastPatientOPD && lastPatientOPD.followUpDate) {
          const validTill = new Date(lastPatientOPD.followUpDate);
          validTill.setDate(validTill.getDate() + 10);

          if (new Date() <= validTill) {
            amount = doctor.profile?.followUpFee || 0;
          } else {
            amount = doctor.profile?.consultationFee || 0;
          }
        } else {
          amount = doctor.profile?.consultationFee || 0;
        }
      }
    }

    const opd = await opdModel.create([{
      patientId: patient._id,
      doctorId: doctorId || null,
      hospitalId,
      tokenNumber,
      symptoms: request.symptoms,
      amount,
      paymentStatus: "UNPAID",
      status: "WAITING"
    }], { session });

    // Update request status
    request.status = "APPROVED";
    request.opdId = opd[0]._id;
    await request.save({ session });

    await session.commitTransaction();
    
    sendSMS(
  patient.phone,
  `Hello ${patient.name}, your appointment is confirmed with Dr. ${doctor.name}. Token No: ${tokenNumber}`
);

    res.status(200).json({
      message: "Appointment approved successfully",
      tokenNumber: opd[0].tokenNumber,
      opd: opd[0],
      patient
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      message: error.message
    });
  }
}

// Reject appointment request
async function rejectRequest(req, res) {
  try {
    const requestId = req.params.id;

    const request = await appointmentRequestModel.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Appointment request not found"
      });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({
        message: `Request already ${request.status.toLowerCase()}`
      });
    }

    request.status = "REJECTED";
    await request.save();

    res.status(200).json({
      message: "Appointment request rejected",
      request
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}

// Get single request by ID
async function getRequestById(req, res) {
  try {
    const request = await appointmentRequestModel.findById(req.params.id)
      .populate("doctorId", "name")
      .populate("hospitalId", "name");

    if (!request) {
      return res.status(404).json({
        message: "Appointment request not found"
      });
    }

    res.status(200).json({
      request
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}


async function getPublicDoctors(req, res) {
  try {
    const { hospitalId } = req.params;

    const doctors = await userModel.find({
      hospitalId,
      role: "DOCTOR"
    }).select("name");

    res.status(200).json({ doctors });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}
module.exports = {
  createAppointmentRequest,
  getAppointmentRequests,
  approveRequest,
  rejectRequest,
  getRequestById,
  getPublicDoctors
};