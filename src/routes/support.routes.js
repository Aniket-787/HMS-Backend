const express = require('express');
const router = express.Router();
const supportController = require('../controller/support.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Public routes
router.get('/contact-details', supportController.getContactDetails);

// Protected routes - any logged in user can submit feedback
router.post('/feedback', authMiddleware, supportController.submitFeedback);

// Superadmin routes - feedback management
router.get(
  '/superadmin/feedbacks',
  authMiddleware,
  roleMiddleware.roleMiddleware('SUPER_ADMIN'),
  supportController.getAllFeedbacks
);

router.get(
  '/superadmin/feedbacks/stats',
  authMiddleware,
  roleMiddleware.roleMiddleware('SUPER_ADMIN'),
  supportController.getFeedbackStats
);

router.patch(
  '/superadmin/feedback/:id/status',
  authMiddleware,
  roleMiddleware.roleMiddleware('SUPER_ADMIN'),
  supportController.updateFeedbackStatus
);

router.delete(
  '/superadmin/feedback/:id',
  authMiddleware,
  roleMiddleware.roleMiddleware('SUPER_ADMIN'),
  supportController.deleteFeedback
);

module.exports = router;