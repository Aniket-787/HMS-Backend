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
  email:{
    type:String
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
  appointmentDate: {
    type: Date,
    required: true
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
appointmentRequestSchema.index({ hospitalId: 1, appointmentDate: 1 });
appointmentRequestSchema.index({ status: 1, appointmentDate: 1 });

module.exports = mongoose.model('AppointmentRequest', appointmentRequestSchema);