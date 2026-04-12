const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const doctorController = require('../controller/doctor.controller')

const router = express.Router();

//GET: get Queue
router.get('/queue',authMiddleware,roleMiddleware.roleMiddleware("DOCTOR"),doctorController.getQueue)

//PUT: update opd
router.put('/opd/:id',authMiddleware,roleMiddleware.roleMiddleware("DOCTOR"),doctorController.updateOpd)

//GET: patient history
router.get(
  "/patient/:patientId/history",
  authMiddleware,
  roleMiddleware.roleMiddleware("DOCTOR"),
  doctorController.getPatientHistory
);

//GET: total patients
router.get('/total/patients',authMiddleware,roleMiddleware.roleMiddleware("DOCTOR"),doctorController.getDoctorPatients)

//GET: completed patients
router.get('/completed/patients', authMiddleware, roleMiddleware.roleMiddleware("DOCTOR"),doctorController.completedPatients)

//GET: todays patients
router.get('/today/patients',authMiddleware,roleMiddleware.roleMiddleware("DOCTOR"),doctorController.todaysPatients)

module.exports = router