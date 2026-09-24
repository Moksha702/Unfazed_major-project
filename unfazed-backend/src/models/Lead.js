const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
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
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'converted'],
    default: 'new',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', leadSchema);
