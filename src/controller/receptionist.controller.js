const opdModel = require("../models/opd.model");
const patientModel = require("../models/patient.model");
const userModel = require("../models/user.model");
const hospitalModel = require("../models/hospital.model");
const mongoose = require("mongoose");
async function registerPatient(req, res) {
  try {
    const {
      name,
      phone,
      age,
      gender,
      bloodGroup,
      allergies,
      emergencyContact,
    } = req.body;
    const hospitalId = req.user.hospitalId;
    const existing = await patientModel.findOne({ phone, hospitalId });
    if (existing) {
      return res.status(400).json({
        message: "Patient already in record.",
      });
    }

    // 🔥 get hospital
   const hospital = await hospitalModel.findById(hospitalId);

   // count patients
   const count = await patientModel.countDocuments({ hospitalId });

   const nextNumber = count + 1;

   // generate UHID
   const uhid = `${hospital.hospitalCode}-${String(nextNumber).padStart(4, "0")}`;

    const patient = await patientModel.create({
      name,
      phone,
      age,
      gender,
      hospitalId: hospitalId,
      bloodGroup,
      allergies,
      emergencyContact,
      uhid
    });

    res.status(200).json({
      message: "Patient added to record.",
      patient,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function getPatient(req,res){
    try {
        const { phone } = req.query;
        const patient = await patientModel.findOne({phone});
        if(!patient){
            return res.status(404).json({
                message:"Patient not found!"
            })
        }
        res.status(200).json({
            patient
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getPatientList(req,res){
    try {
        const patientlist = await patientModel.find({hospitalId:req.user.hospitalId});
        res.status(200).json({
            patientlist
        })
    } catch (error) {
       res.status(500).json({
        message:error.message
       }) 
    }
}
async function registerOPD(req, res) {
  try {
    const { patientId, doctorId, symptoms, paymentStatus } = req.body;
    const hospitalId = req.user.hospitalId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔥 FIX: correct patient fetch
    const patientDetails = await patientModel.findById(patientId);

    if (!patientDetails) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // 🔥 Get doctor
    const doctor = await userModel.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // 🔥 Token logic
    const lastOPD = await opdModel
      .findOne({
        doctorId,
        hospitalId,
        visitDate: { $gte: today },
      })
      .sort({ tokenNumber: -1 });

    const tokenNumber = lastOPD ? lastOPD.tokenNumber + 1 : 1;

    // 🔥 Get last OPD of this patient with same doctor
    const lastPatientOPD = await opdModel
      .findOne({
        patientId,
        doctorId,
        hospitalId,
      })
      .sort({ createdAt: -1 });

    // 🔥 Default = consultation fee
    let amount = doctor.profile?.consultationFee || 0;

    // 🔥 FOLLOW-UP LOGIC
    if (lastPatientOPD && lastPatientOPD.followUpDate) {
      const validTill = new Date(lastPatientOPD.followUpDate);
      validTill.setDate(validTill.getDate() + 10); // 10 days validity

      const currentDate = new Date();

      if (currentDate <= validTill) {
        amount = doctor.profile?.followUpFee || 0;
        console.log(amount)
      }
    }

    // 🔥 Create OPD (with billing)
    const OPD = await opdModel.create({
      patientId,
      doctorId,
      hospitalId,
      tokenNumber,
      symptoms,

      amount,
      paymentStatus: paymentStatus || "UNPAID",
    });

    res.status(200).json({
      message: "OPD created successfully!",
      OPD,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
}

async function getOPD(req,res){
    try {
        const today =  new Date();
        today.setHours(0,0,0,0);
        const OPDList = await opdModel.find({
            hospitalId:req.user.hospitalId,
            visitDate:{$gte:today}
            })
             .populate("patientId")
      .populate("doctorId", "name");

      res.status(200).json({
        message:"OPD List for today",
        OPDList
      })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

async function getOpdById(req,res){
    try {
        const opdId = req.params.id;
        const opd = await opdModel
          .findOne({_id: opdId, hospitalId: req.user.hospitalId})
          .populate('patientId')
          .populate('doctorId');

        if(!opd){
           return res.status(404).json({
                message:"opd not found!"
            })
        }

        res.status(200).json({
            opd
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getDoctors(req,res){
    try {
        const hospitalId = req.user.hospitalId;
        const doctors = await userModel.find({hospitalId,role:"DOCTOR"});
        if(!doctors){
            return res.status(400).json({
                message:"No doctor found!"
            })
        };

        res.status(200).json({
           doctors
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}


async function pendingAppointments(req,res){
  try {
    const today = new Date();
    today.setHours(0,0,0,0)
     const pending = await opdModel.find({hospitalId:req.user.hospitalId, status:"WAITING", visitDate: {$gte: today} }) || 0;

     res.status(200).json({
      pending
     })
  } catch (error) {
    res.status(500).json({
      message:error.message
    })
  }
}

async function createVisit(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      patientData,
      opdData
    } = req.body;

    const hospitalId = req.user.hospitalId;

    let patientId;

    let patient = await patientModel.findOne({
      phone: patientData.phone,
      hospitalId
    }).session(session);

    if (!patient) {
    
      const hospital = await hospitalModel.findById(hospitalId).session(session);
      const count = await patientModel.countDocuments({ hospitalId }).session(session);

      const nextNumber = count + 1;
      const uhid = `${hospital.hospitalCode}-${String(nextNumber).padStart(4, "0")}`;

      const newPatient = await patientModel.create([{
        ...patientData,
        hospitalId,
        uhid
      }], { session });

      patient = newPatient[0];
    }

    patientId = patient._id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const doctor = await userModel.findById(opdData.doctorId).session(session);

    if (!doctor) {
      throw new Error("Doctor not found");
    }

    const lastOPD = await opdModel
      .findOne({
        doctorId: opdData.doctorId,
        hospitalId,
        visitDate: { $gte: today }
      })
      .sort({ tokenNumber: -1 })
      .session(session);

    const tokenNumber = lastOPD ? lastOPD.tokenNumber + 1 : 1;
    
    const lastPatientOPD = await opdModel
      .findOne({
        patientId,
        doctorId: opdData.doctorId,
        hospitalId
      })
      .sort({ createdAt: -1 })
      .session(session);

    let amount = doctor.profile?.consultationFee || 0;

    if (lastPatientOPD && lastPatientOPD.followUpDate) {
      const validTill = new Date(lastPatientOPD.followUpDate);
      validTill.setDate(validTill.getDate() + 10);

      if (new Date() <= validTill) {
        amount = doctor.profile?.followUpFee || 0;
      }
    }

    const opd = await opdModel.create([{
      patientId,
      doctorId: opdData.doctorId,
      hospitalId,
      tokenNumber,
      symptoms: opdData.symptoms,
      amount,
      paymentStatus: opdData.paymentStatus || "UNPAID"
    }], { session });

    await session.commitTransaction();

    res.status(201).json({
      message: "Visit created successfully",
      patient,
      opd: opd[0]
    });

  } catch (error) {
    await session.abortTransaction();

    res.status(500).json({
      message: error.message
    });
  }
}
 

async function markAsPaid(req, res) {
  try {
    const opd = await opdModel.findById(req.params.id);

    if (!opd) return res.status(404).json({ message: "Not found" });

    opd.paymentStatus = "PAID";
    await opd.save();

    res.json({ message: "Payment updated", opd });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  registerPatient,
  registerOPD,
  getOPD,
  getPatient,
  getPatientList,
  getOpdById,
  getDoctors,
  pendingAppointments,
  createVisit,
  markAsPaid
};
