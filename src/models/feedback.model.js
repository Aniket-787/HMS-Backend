const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true
  },
  hospitalName: {
    type: String,
    required: true,
    trim: true
  },
  hospitalAddress: {
    type: String,
    trim: true
  },
  senderName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['DOCTOR', 'RECEPTIONIST', 'ADMIN', 'SUPER_ADMIN', 'OTHER'],
    required: true
  },
  mobile: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    trim: true,
    maxlength: 200
  },
  feedbackType: {
    type: String,
    enum: ['SUGGESTION', 'COMPLAINT', 'TECHNICAL_ISSUE', 'BILLING_ISSUE', 'GENERAL_FEEDBACK'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['NEW', 'SEEN', 'RESOLVED'],
    default: 'NEW',
    index: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
    default: 'MEDIUM'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminNotes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
feedbackSchema.index({ hospitalId: 1, status: 1, createdAt: -1 });
feedbackSchema.index({ feedbackType: 1, status: 1 });

module.exports = mongoose.model('Feedback', feedbackSchema);