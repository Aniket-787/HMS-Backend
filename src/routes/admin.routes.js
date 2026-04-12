const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware')
const adminController = require('../controller/admin.controller')

const router = express.Router();

//POST:Adds doctor to hospital
router.post('/doctor',authMiddleware,roleMiddleware.roleMiddleware("ADMIN"),adminController.createDoctor)

//POST: Adds receptionist to hospital
router.post('/receptionist',authMiddleware,roleMiddleware.roleMiddleware("ADMIN"),adminController.createReceptionist)

//GET: Get all staff of hospital
router.get('/staff',authMiddleware,roleMiddleware.roleMiddleware("ADMIN"),adminController.getAllStaff)

//GET: get all doctors
router.get('/doctorslist',authMiddleware,roleMiddleware.roleMiddleware("ADMIN"),adminController.getDoctors)

//GET: get all receptionist
router.get('/receptionistlist',authMiddleware,roleMiddleware.roleMiddleware("ADMIN"),adminController.getReceptionist)

//GET: get doctor by id
router.get('/doctor/:id',authMiddleware,roleMiddleware.roleMiddleware("ADMIN"),adminController.getDoctorById)

//GET: get receptionist by id
router.get('/receptionist/:id',authMiddleware,roleMiddleware.roleMiddleware("ADMIN"),adminController.getReceptionistById)

//GET: get all patients
router.get('/patients',authMiddleware,roleMiddleware.roleMiddleware('ADMIN'),adminController.getPatients)

//GET: get all appointments
router.get('/appointments',authMiddleware,roleMiddleware.roleMiddleware("ADMIN"),adminController.getAppointments)
module.exports = router;