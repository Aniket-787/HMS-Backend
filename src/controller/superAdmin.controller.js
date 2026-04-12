const hospitalModel = require('../models/hospital.model');
const userModel = require('../models/user.model');
const patientModel = require('../models/patient.model')
const bcrypt = require('bcrypt');

async function createHospital(req,res){
    try {
          const{name, address, email, phone} = req.body;
    
    const createHospital = hospitalModel.create({
        name,
        address,
        email,
        phone,
        admin : null
    })

    res.status(200).json({
        message:"Hospital Created Successfully!",
        createHospital
    })
    } catch (error) {
        return res.status(500).json({message:error.message})
    }

}

async function createAdmin(req,res){
    try {
        const{ name, email, password, phone, hospitalId } = req.body;
        
        const hospital = await hospitalModel.findById(hospitalId);

        if(!hospital){
            return res.status(404).json({
                message:"Hospital not found"
            })
        }

        const existing = await userModel.findOne({email});
        if(existing){
            return res.status(400).json({
                message:"Email already exists"
            })
        }

        const hashPassword = await bcrypt.hash(password,10);

        const admin = await userModel.create({
            name,
            email,
            password:hashPassword,
            phone,
            role:"ADMIN",
            hospitalId,
        });

        await hospitalModel.findByIdAndUpdate(hospitalId,{
            admin:admin._id
        },{new:true})    

        res.status(200).json({
            message:"Admin created successfully!",
            admin
        })

    } catch (error) {
        return res.status(500).json({
            message:error.message
        })
    }
}

async function getAllHospitals(req,res){
    try {
        const hospitals = await hospitalModel.find();
        res.status(200).json({
            hospitals
        })
    } catch (error) {
       res.status(500).json({
        message:error.message
       }) 
    }
}

async function getHospitalById(req,res){
    try {
        const HospitalId = req.params.id;

        const hospital = await hospitalModel.findById({_id:HospitalId});
        
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

async function getAllStaff(req,res){
    try {
        const staff = await userModel.find()||0;
        res.status(200).json({
            staff
        })
        
    } catch (error) {
        res.status(500).json({
            message:error.message
        })
    }
}

async function getAdmins(req,res){
    try {
        const admins = await userModel.find({role:"ADMIN"})||0;
        res.status(200).json({
            admins
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


async function getAllPatients(req,res){
    try {
        const patients = await patientModel.find()||0;
        res.status(200).json({
            patients
        })
    } catch (error) {
       res.status(500).json({
        message:error.message
       }) 
    }
}
module.exports = {
    createHospital,
    createAdmin,
    getAllHospitals,
    getHospitalById,
    getAdmins,
    getAllStaff,
    getAllPatients
}