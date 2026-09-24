const mongoose = require('mongoose');

const clientPackageSchema = new mongoose.Schema({
  client_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
    index: true
  },
  package_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true
  },
  remainingSessions: {
    type: Number,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'exhausted', 'expired'],
    default: 'active',
    index: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ClientPackage', clientPackageSchema);
