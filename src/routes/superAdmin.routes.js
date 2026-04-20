const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const superAdminController = require('../controller/superAdmin.controller')
const upload = require('../middleware/multer.middleware');

const router = express.Router();

//POST:Create Hospital
router.post('/hospital',authMiddleware,roleMiddleware.roleMiddleware("SUPER_ADMIN"),superAdminController.createHospital);

//POST: Create Admin for Hospital
router.post('/hospital/admin',authMiddleware,roleMiddleware.roleMiddleware("SUPER_ADMIN"),superAdminController.createAdmin)
module.exports = router;

//GET: get all hospitals
router.get('/hospitalList',authMiddleware,roleMiddleware.roleMiddleware("SUPER_ADMIN"),superAdminController.getAllHospitals)

// Get: get hospital by id
router.get('/hospital/:id',authMiddleware,roleMiddleware.roleMiddleware("SUPER_ADMIN"),superAdminController.getHospitalById)

//GET: get all staff
router.get('/allstaff',authMiddleware,roleMiddleware.roleMiddleware("SUPER_ADMIN"),superAdminController.getAllStaff)

//GET: get all admins
router.get('/admins',authMiddleware,roleMiddleware.roleMiddleware("SUPER_ADMIN"),superAdminController.getAdmins)

//GET: get all patients
router.get('/allpatients',authMiddleware,roleMiddleware.roleMiddleware("SUPER_ADMIN"),superAdminController.getAllPatients)

//upload hospital logo
router.put("/hospital/upload-logo",authMiddleware,roleMiddleware.roleMiddleware("SUPER_ADMIN","ADMIN"),upload.single("logo"),superAdminController.uploadHospitalLogo);

module.exports = router;