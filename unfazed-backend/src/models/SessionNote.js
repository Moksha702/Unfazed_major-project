const mongoose = require('mongoose');

const sessionNoteSchema = new mongoose.Schema({
  session_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
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
  type: {
    type: String,
    enum: ['private', 'shared'],
    required: true,
    default: 'private',
    index: true
  },
  title: {
    type: String,
    default: 'Session Clinical Note'
  },
  format: {
    type: String,
    enum: ['freeform', 'soap', 'dap'],
    default: 'freeform'
  },
  content: {
    type: String,
    default: ''
  },
  soapData: {
    subjective: { type: String, default: '' },
    objective: { type: String, default: '' },
    assessment: { type: String, default: '' },
    plan: { type: String, default: '' }
  },
  dapData: {
    data: { type: String, default: '' },
    assessment: { type: String, default: '' },
    plan: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SessionNote', sessionNoteSchema);
