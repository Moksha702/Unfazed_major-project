const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
    index: true
  },
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    index: true
  },
  endTime: {
    type: Date,
    required: true
  },
  durationMinutes: {
    type: Number,
    default: 60
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled',
    index: true
  },
  meetingLink: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  clientNotes: {
    type: String,
    default: ''
  },
  payment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  package_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }
}, {
  timestamps: true
});

// Compound index to help query overlaps quickly
sessionSchema.index({ therapist_id: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model('Session', sessionSchema);
