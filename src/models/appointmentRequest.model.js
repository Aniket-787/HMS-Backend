const mongoose = require('mongoose');

const appointmentRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number
  },
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER']
  },
  symptoms: {
    type: String,
    trim: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  },
  opdId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OPD'
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentRequestSchema.index({ hospitalId: 1, createdAt: -1 });
appointmentRequestSchema.index({ status: 1 });

module.exports = mongoose.model('AppointmentRequest', appointmentRequestSchema);