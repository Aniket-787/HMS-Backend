const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const reportsController = require('../controller/reports.controller');

const router = express.Router();

// OPD Reports
router.get('/opd/excel', authMiddleware, roleMiddleware.roleMiddleware("ADMIN", "RECEPTIONIST", "DOCTOR"), reportsController.exportOPDExcel);
router.get('/opd/pdf', authMiddleware, roleMiddleware.roleMiddleware("ADMIN", "RECEPTIONIST", "DOCTOR"), reportsController.exportOPDPDF);
router.get('/opd/preview', authMiddleware, roleMiddleware.roleMiddleware("ADMIN", "RECEPTIONIST", "DOCTOR"), reportsController.getOPDPreview);

// IPD Reports
router.get('/ipd/excel', authMiddleware, roleMiddleware.roleMiddleware("ADMIN", "RECEPTIONIST", "DOCTOR"), reportsController.exportIPDExcel);
router.get('/ipd/pdf', authMiddleware, roleMiddleware.roleMiddleware("ADMIN", "RECEPTIONIST", "DOCTOR"), reportsController.exportIPDPDF);
router.get('/ipd/preview', authMiddleware, roleMiddleware.roleMiddleware("ADMIN", "RECEPTIONIST", "DOCTOR"), reportsController.getIPDPreview);

module.exports = router;