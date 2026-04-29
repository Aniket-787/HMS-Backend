const Feedback = require('../models/feedback.model');
const Hospital = require('../models/hospital.model');

// @desc    Submit feedback
// @route   POST /api/support/feedback
// @access  Private (logged in users)
exports.submitFeedback = async (req, res) => {
  try {
    const { hospitalName, hospitalAddress, senderName, role, mobile, subject, feedbackType, message } = req.body;

    // Validate required fields
    if (!senderName || !role || !feedbackType || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Validate message length
    if (message.length < 10) {
      return res.status(400).json({ 
        success: false, 
        message: 'Feedback message must be at least 10 characters' 
      });
    }

    // Get hospital ID from user if available
    const hospitalId = req.user?.hospitalId || null;
    
    // If hospital ID is provided, fetch hospital details
    let finalHospitalName = hospitalName;
    let finalHospitalAddress = hospitalAddress;

    if (hospitalId) {
      const hospital = await Hospital.findById(hospitalId);
      if (hospital) {
        finalHospitalName = hospital.name;
        finalHospitalAddress = hospital.address;
      }
    }

    const feedback = await Feedback.create({
      hospitalId: hospitalId || null,
      hospitalName: finalHospitalName || 'General',
      hospitalAddress: finalHospitalAddress || '',
      senderName,
      role,
      mobile,
      subject,
      feedbackType,
      message,
      createdBy: req.user?._id || null
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit feedback', 
      error: error.message 
    });
  }
};

// @desc    Get contact details
// @route   GET /api/support/contact-details
// @access  Public
exports.getContactDetails = async (req, res) => {
  try {
    // Static contact details - can be moved to config or database
    const contactDetails = {
      supportEmail: 'support@hospitalms.com',
      supportMobile: '+91 9876543210',
      workingHours: 'Monday - Saturday, 9:00 AM - 6:00 PM',
      supportMessage: 'Need help? Contact our support team. We are here to assist you with any queries or issues.'
    };

    res.status(200).json({
      success: true,
      data: contactDetails
    });
  } catch (error) {
    console.error('Error fetching contact details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contact details' 
    });
  }
};

// @desc    Get all feedbacks (Superadmin)
// @route   GET /api/superadmin/feedbacks
// @access  Private (Superadmin only)
exports.getAllFeedbacks = async (req, res) => {
  try {
    const { status, feedbackType, hospitalId, search, page = 1, limit = 20 } = req.query;

    // Build filter
    const filter = {};
    
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    
    if (feedbackType && feedbackType !== 'ALL') {
      filter.feedbackType = feedbackType;
    }
    
    if (hospitalId) {
      filter.hospitalId = hospitalId;
    }

    if (search) {
      filter.$or = [
        { senderName: { $regex: search, $options: 'i' } },
        { hospitalName: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [feedbacks, total] = await Promise.all([
      Feedback.find(filter)
        .populate('hospitalId', 'name hospitalCode')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Feedback.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: feedbacks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch feedbacks',
      error: error.message 
    });
  }
};

// @desc    Update feedback status
// @route   PATCH /api/superadmin/feedback/:id/status
// @access  Private (Superadmin only)
exports.updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    // Validate status
    const validStatuses = ['NEW', 'SEEN', 'RESOLVED'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be NEW, SEEN, or RESOLVED' 
      });
    }

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    feedback.status = status;
    
    if (status === 'RESOLVED') {
      feedback.resolvedAt = new Date();
      feedback.resolvedBy = req.user._id;
    }
    
    if (adminNotes) {
      feedback.adminNotes = adminNotes;
    }

    await feedback.save();

    res.status(200).json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });
  } catch (error) {
    console.error('Error updating feedback status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update feedback status',
      error: error.message 
    });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/superadmin/feedback/:id
// @access  Private (Superadmin only)
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ 
        success: false, 
        message: 'Feedback not found' 
      });
    }

    await Feedback.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete feedback',
      error: error.message 
    });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/superadmin/feedbacks/stats
// @access  Private (Superadmin only)
exports.getFeedbackStats = async (req, res) => {
  try {
    const [total, newCount, seenCount, resolvedCount, byType] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ status: 'NEW' }),
      Feedback.countDocuments({ status: 'SEEN' }),
      Feedback.countDocuments({ status: 'RESOLVED' }),
      Feedback.aggregate([
        { $group: { _id: '$feedbackType', count: { $sum: 1 } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        new: newCount,
        seen: seenCount,
        resolved: resolvedCount,
        byType: byType.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch feedback statistics',
      error: error.message 
    });
  }
};