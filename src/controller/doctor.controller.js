const opdModel = require('../models/opd.model');
const mongoose = require('mongoose');



async function getQueue(req,res){
    try {
        const doctorId = req.user.userId;
        const hospitalId = req.user.hospitalId;
        
        const today = new Date();
        today.setHours(0,0,0,0);

        const opdList = await opdModel.find({
            doctorId,
            hospitalId,
            status: "WAITING",
            visitDate:{$gte:today}
        })
        .populate('patientId')
        .sort({tokenNumber:1})
        res.status(200).json({
            opdList
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function updateOpd(req,res){
    try {
        const opdId  = req.params.id
        const{diagnosis, generalExamination, investigation, medicines, notes, followUpDate } = req.body;

        const opd = await opdModel.findOne({
            _id:opdId,
            doctorId:req.user.userId,
            hospitalId:req.user.hospitalId
        });

        if(!opd){
            return res.status(404).json({
                messae:"opd not found"
            })
        }
        opd.diagnosis = diagnosis || opd.diagnosis;
        opd.generalExamination = generalExamination || opd.generalExamination;
        opd.investigation = investigation || opd.investigation
        opd.medicines = medicines || opd.medicines;
        opd.notes = notes || opd.notes;
        opd.followUpDate = followUpDate || opd.followUpDate;
        opd.status = "COMPLETED"

       await opd.save();
        res.status(200).json({
      message: "OPD updated successfully",
      opd,
    });

    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getPatientHistory (req, res){
  try {
    const { patientId } = req.params;

    const history = await opdModel.find({
      patientId,
      hospitalId: req.user.hospitalId,
    }).populate('patientId').sort({ visitDate: -1 });

    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

async function completedPatients(req,res){
    try {
        const patients = await opdModel.find({
            hospitalId:req.user.hospitalId,
            doctorId:req.user.userId,
            status : "COMPLETED"
        }).populate('patientId');

        res.status(200).json({
            patients
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

async function todaysPatients(req,res){
    try {
        const today = new Date()
        today.setHours(0,0,0,0)
        const patients = await opdModel.find({
            doctorId:req.user.userId,
            hospitalId:req.user.hospitalId,
            visitDate : {$gte : today}
        }).populate('patientId')
        res.status(200).json({
            patients
        })
    } catch (error) {
       res.status(500).json({
        message:error.message
       }) 
    }
}

async function getDoctorPatients(req, res) {
  try {
    if (!req.user?.userId || !req.user?.hospitalId) {
      return res.status(400).json({ message: "Invalid user data" });
    }

    const patients = await opdModel.aggregate([
      {
        $match: {
          doctorId: new mongoose.Types.ObjectId(req.user.userId),
          hospitalId: new mongoose.Types.ObjectId(req.user.hospitalId)
        }
      },
      {
        $sort: { visitDate: -1 }
      },
      {
        $group: {
          _id: "$patientId",
          opdId: { $first: "$_id" },
          visitDate: { $first: "$visitDate" },
          tokenNumber: { $first: "$tokenNumber" },
          status: { $first: "$status" }
        }
      },
      {
        $lookup: {
          from: "patients",
          localField: "_id",
          foreignField: "_id",
          as: "patientDetails"
        }
      },
      {
        $unwind: {
          path: "$patientDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: "$opdId",
          patientId: "$patientDetails",
          visitDate: 1,
          tokenNumber: 1,
          status: 1
        }
      }
    ]);

    res.status(200).json({
      total: patients.length,
      patients
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
}
module.exports = {
    getQueue,
    updateOpd,
    getPatientHistory,
    completedPatients,
    todaysPatients,
    getDoctorPatients
}