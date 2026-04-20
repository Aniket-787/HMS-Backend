const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const doctorController = require('../controller/doctor.controller')
const ipdController = require('../controller/ipd.controller')

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

//POST: admit patient to IPD
router.post('/admit/ipd',authMiddleware,roleMiddleware.roleMiddleware("DOCTOR", "RECEPTIONIST"),ipdController.admitPatient)

//GET: All Admitted Patients
router.get(
  "/ipd/admitted",
  authMiddleware,
  roleMiddleware.roleMiddleware("DOCTOR", "ADMIN", "RECEPTIONIST"),
  ipdController.getAdmittedPatients
);


//GET: All Discharged Patients
router.get(
  "/ipd/discharged",
  authMiddleware,
  roleMiddleware.roleMiddleware("DOCTOR","ADMIN","RECEPTIONIST"),
  ipdController.getDischargePatients
);


//POST: Add Daily Notes / Treatment
router.post(
  "/ipd/:ipdId/notes",
  authMiddleware,
  roleMiddleware.roleMiddleware("DOCTOR"),
  ipdController.addDailyNotes
);


//POST: Add Charges (Test / Medicine / Other)
router.post(
  "/ipd/:ipdId/charges",
  authMiddleware,
  roleMiddleware.roleMiddleware("DOCTOR", "ADMIN", "RECEPTIONIST"),
  ipdController.addCharges
);


//PUT: Discharge Patient
router.put(
  "/ipd/discharge/:ipdId",
  authMiddleware,
  roleMiddleware.roleMiddleware("DOCTOR"),
  ipdController.dischargePatient
);

module.exports = router