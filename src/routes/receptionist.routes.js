const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const receptionistController = require('../controller/receptionist.controller');


const router = express.Router();

//POST: Register patient
router.post('/patient',authMiddleware,roleMiddleware.roleMiddleware("RECEPTIONIST"),receptionistController.registerPatient)

//GET: get patient 
router.get('/search/patient',authMiddleware,roleMiddleware.roleMiddleware("RECEPTIONIST"),receptionistController.getPatient)

//GET: get patientList
router.get('/patientlist',authMiddleware, roleMiddleware.roleMiddleware('RECEPTIONIST','DOCTOR'),receptionistController.getPatientList)
//POST: register OPD
router.post('/opd',authMiddleware,roleMiddleware.roleMiddleware("RECEPTIONIST"),receptionistController.registerOPD)

//GET: get OPDlist
router.get('/opdlist',authMiddleware,roleMiddleware.roleMiddleware("RECEPTIONIST","DOCTOR"),receptionistController.getOPD)

//GET: get opd by id
router.get('/opd/:id',authMiddleware,roleMiddleware.roleMiddleware("RECEPTIONIST"),receptionistController.getOpdById)

router.get('/doctorslist',authMiddleware,roleMiddleware.roleMiddleware("RECEPTIONIST","DOCTOR"),receptionistController.getDoctors)

//GET: pending Appointments
router.get('/pending',authMiddleware,roleMiddleware.roleMiddleware("RECEPTIONIST"),receptionistController.pendingAppointments)
module.exports = router