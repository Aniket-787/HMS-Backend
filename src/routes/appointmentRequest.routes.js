const express = require('express');
const appointmentRequestController = require('../controller/appointmentRequest.controller');


const router = express.Router();

// POST: Create appointment request
router.post('/', appointmentRequestController.createAppointmentRequest);

// GET: Get appointment requests
router.get('/', appointmentRequestController.getAppointmentRequests);

// GET: Public doctors
router.get('/public/doctors/:hospitalId', appointmentRequestController.getPublicDoctors);

router.get('/:id', appointmentRequestController.getRequestById);

router.patch('/:id/approve', appointmentRequestController.approveRequest);

router.patch('/:id/reject', appointmentRequestController.rejectRequest);

module.exports = router;