const opdModel = require("../models/opd.model");
const patientModel = require("../models/patient.model");
const userModel = require("../models/user.model");

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

    const patient = await patientModel.create({
      name,
      phone,
      age,
      gender,
      hospitalId: hospitalId,
      bloodGroup,
      allergies,
      emergencyContact,
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
    const { patientId, doctorId, symptoms } = req.body;
    const hospitalId = req.user.hospitalId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const patientDetails = await patientModel.findOne({patientId:patientId});
    console.log(patientDetails)
    const lastOPD = await opdModel
      .findOne({
        doctorId,
        hospitalId,
        visitDate: { $gte: today },
      })
      .sort({ tokenNumber: -1 });

    const tokenNumber = lastOPD ? lastOPD.tokenNumber + 1 : 1;

    const OPD = await opdModel.create({
      patientDetails,
      patientId,
      doctorId,
      hospitalId,
      tokenNumber,
      symptoms,
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
        const opd = await opdModel.findOne({_id: opdId, hospitalId: req.user.hospitalId});
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
module.exports = {
  registerPatient,
  registerOPD,
  getOPD,
  getPatient,
  getPatientList,
  getOpdById,
  getDoctors,
  pendingAppointments
};
