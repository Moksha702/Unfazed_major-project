const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true }    // e.g. "17:00"
}, { _id: false });

const dayScheduleSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 }, // 0 = Sunday, 1 = Monday, ...
  isWorkingDay: { type: Boolean, default: true },
  slots: { type: [timeSlotSchema], default: [{ startTime: '10:00', endTime: '18:00' }] }
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  therapist_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Therapist',
    required: true,
    unique: true
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata'
  },
  weeklySchedule: {
    type: [dayScheduleSchema],
    default: () => [
      { dayOfWeek: 1, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
      { dayOfWeek: 2, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
      { dayOfWeek: 3, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
      { dayOfWeek: 4, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
      { dayOfWeek: 5, isWorkingDay: true, slots: [{ startTime: '10:00', endTime: '18:00' }] },
      { dayOfWeek: 6, isWorkingDay: true, slots: [{ startTime: '11:00', endTime: '16:00' }] },
      { dayOfWeek: 0, isWorkingDay: false, slots: [] }
    ]
  },
  bufferMinutes: {
    type: Number,
    default: 15
  },
  sessionDurations: {
    type: [Number],
    default: [45, 60]
  },
  overrides: [{
    date: { type: String, required: true }, // "YYYY-MM-DD"
    isAvailable: { type: Boolean, default: false },
    slots: [timeSlotSchema]
  }],
  blockedSlots: [{
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    reason: { type: String, default: 'Unavailable' }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Availability', availabilitySchema);
