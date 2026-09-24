const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  bio: {
    type: String,
    default: ''
  },
  specializations: {
    type: [String],
    default: []
  },
  languages: {
    type: [String],
    default: ['English']
  },
  qualifications: {
    type: String,
    default: 'Licensed Clinical Psychologist'
  },
  experienceYears: {
    type: Number,
    default: 5
  },
  hourlyRate: {
    type: Number,
    default: 1500 // INR
  },
  currency: {
    type: String,
    default: 'INR'
  },
  tier: {
    type: String,
    enum: ['free', 'growth', 'pro'],
    default: 'free'
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  customTheme: {
    primaryColor: { type: String, default: '#6366f1' },
    bannerUrl: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Therapist', therapistSchema);
