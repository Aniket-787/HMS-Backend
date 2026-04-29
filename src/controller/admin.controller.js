const hospitalModel = require('../models/hospital.model');
const opdModel = require('../models/opd.model');
const patientModel = require('../models/patient.model');
const userModel = require('../models/user.model');
const ipdModel = require('../models/IPD.model');
const bedModel = require('../models/bed.model');
const bcrypt = require('bcrypt');

async function createDoctor(req,res){
    try {
        const {name, email, password, phone, specialization, experience, consultationFee, followUpFee } = req.body;

        const hospitalId = req.user.hospitalId;

        const existing = await userModel.findOne({email});
        if(existing){
            return res.status(400).json({
                message:"Email already exists!"
            })
        };

        const hashpassword = await bcrypt.hash(password,10);

        const doctor = await userModel.create({
            name,
            email,
            password:hashpassword,
            phone,
            role:"DOCTOR",
            hospitalId:hospitalId,
            profile: {
            specialization,
            experience,
            consultationFee,
            followUpFee
      }
        });

        res.status(200).json({
            message:"Doctor Added to hospital.",
            doctor
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function createReceptionist(req,res){
    try {
        const{name,email,password,phone} = req.body;
        const hospitalId = req.user.hospitalId;

        const existing = await userModel.findOne({email});
        if(existing){
            return res.status(400).json({
                message:"Email already exists!"
            });
        };

        const hashPassword = await bcrypt.hash(password,10);

        const receptionist = await userModel.create({
            name,
            email,
            password:hashPassword,
            phone,
            role:"RECEPTIONIST",
            hospitalId:hospitalId
        });

        res.status(200).json({
            message:"Receptionist added to hospital.",
            receptionist
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getAllStaff(req,res){
    try {
        const hospitalId = req.user.hospitalId
        const staff = await userModel.find({hospitalId})||0;
        if(!staff){
            res.status(404).json({
                message:"No staff found!"
            })
        }

        res.status(200).json({
            staff
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
        const doctors = await userModel.find({hospitalId,role:"DOCTOR"})||0;
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

async function getReceptionist(req,res){
    try {
        const hospitalId = req.user.hospitalId;
        const receptionist = await userModel.find({hospitalId,role:"RECEPTIONIST"})||0;
        if(!receptionist){
            return res.status(400).json({
                message:"No receptionist found!"
            })
        };

        res.status(200).json({
           receptionist
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getDoctorById(req,res){
    try {
        const doctorId = req.params.id;
        const hospitalId = req.user.hospitalId;
         const doctor = await userModel.findOne({
            _id: doctorId,
            hospitalId: hospitalId,
            role: "DOCTOR"
        });

        if(!doctor){
            return res.status(404).json({
                message:"Doctor not found!"
            })
        };

        res.status(200).json({
            doctor
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getReceptionistById(req,res){
    try {
        const receptionistId = req.params.id;
        const hospitalId = req.user.hospitalId;
         const receptionist = await userModel.findOne({
            _id: receptionistId,
            hospitalId: hospitalId,
            role: "RECEPTIONIST"
        });

        if(!receptionist){
            return res.status(404).json({
                message:"Doctor not found!"
            })
        };

        res.status(200).json({
            receptionist
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getPatients(req,res){
    try {
        const patients = await patientModel.find({hospitalId:req.user.hospitalId})||0;
        res.status(200).json({
            patients
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getAppointments(req,res){
    try {
        const today = new Date();
        today.setHours(0,0,0,0)

        const opd = await opdModel.find({hospitalId:req.user.hospitalId, visitDate: { $gte: today }})
            .populate('patientId', 'name uhid')
            .sort({ tokenNumber: 1 });

        res.status(200).json({
            opd
        })

    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getHospitalStats(req,res){
    try {
        const hospitalId = req.user.hospitalId;

        // Get total patients
        const totalPatients = await patientModel.countDocuments({hospitalId});

        // Get total doctors
        const totalDoctors = await userModel.countDocuments({hospitalId, role: 'DOCTOR'});

        // Get total receptionists
        const totalReceptionists = await userModel.countDocuments({hospitalId, role: 'RECEPTIONIST'});

        // Get today's OPD visits
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayOPDVisits = await opdModel.countDocuments({
            hospitalId,
            visitDate: { $gte: today, $lt: tomorrow }
        });

        // Get current IPD patients (admitted but not discharged)
        const currentIPDPatients = await ipdModel.countDocuments({
            hospitalId,
            status: 'ADMITTED'
        });

        // Get total beds
        const totalBeds = await bedModel.countDocuments({hospitalId});

        // Get available beds
        const availableBeds = await bedModel.countDocuments({
            hospitalId,
            status: 'VACANT'
        });

        res.status(200).json({
            stats: {
                totalPatients,
                totalDoctors,
                totalReceptionists,
                todayOPDVisits,
                currentIPDPatients,
                totalBeds,
                availableBeds,
                bedOccupancyRate: totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0
            }
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getHospital(req,res){
    try {
        const hospitalId = req.user.hospitalId;
        const hospital = await hospitalModel.findById(hospitalId);
        
        if(!hospital){
            return res.status(404).json({
                message:"Hospital not found!"
            })
        }

        res.status(200).json({
            hospital
        })
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

module.exports = {
     createDoctor,
     createReceptionist,
     getAllStaff,
     getDoctors,
     getReceptionist,
     getDoctorById,
     getReceptionistById,
     getPatients,
     getAppointments,
     getHospital,
     getHospitalStats
    }




