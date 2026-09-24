const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'lead'],
    default: 'active',
    index: true
  },
  tags: {
    type: [String],
    default: ['New Client']
  },
  intakeData: {
    age: { type: Number },
    gender: { type: String, default: '' },
    presentingConcern: { type: String, default: '' },
    medicalHistory: { type: String, default: '' },
    currentMedications: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      relationship: { type: String, default: '' },
      phone: { type: String, default: '' }
    }
  },
  consentAgreed: {
    type: Boolean,
    default: false
  },
  consentTimestamp: {
    type: Date
  },
  lastSessionDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
