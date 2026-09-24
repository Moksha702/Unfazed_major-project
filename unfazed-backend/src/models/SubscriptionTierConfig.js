const mongoose = require('mongoose');

const subscriptionTierConfigSchema = new mongoose.Schema({
  tier: {
    type: String,
    enum: ['free', 'growth', 'pro'],
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  monthlyPrice: {
    type: Number,
    required: true
  },
  activeClientCap: {
    type: Number,
    required: true
  },
  allowedNoteTemplates: {
    type: [String],
    default: ['freeform']
  },
  analyticsDepth: {
    type: String,
    enum: ['basic', 'advanced', 'full'],
    default: 'basic'
  },
  customBranding: {
    type: Boolean,
    default: false
  },
  canExportInvoices: {
    type: Boolean,
    default: true
  },
  canAccessChat: {
    type: Boolean,
    default: true
  },
  canAccessPackages: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubscriptionTierConfig', subscriptionTierConfigSchema);
