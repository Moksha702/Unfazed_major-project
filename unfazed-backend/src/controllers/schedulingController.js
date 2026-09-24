const Availability = require('../models/Availability');
const Session = require('../models/Session');
const Therapist = require('../models/Therapist');
const Client = require('../models/Client');
const { notifyBookingConfirmed } = require('../services/notificationService');

/**
 * @desc Get therapist's availability configuration
 * @route GET /api/scheduling/availability
 */
const getAvailability = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    let availability = await Availability.findOne({ therapist_id: therapistId });

    if (!availability) {
      availability = await Availability.create({ therapist_id: therapistId });
    }

    res.json({
      success: true,
      availability
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update therapist's availability configuration
 * @route PUT /api/scheduling/availability
 */
const updateAvailability = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const { weeklySchedule, bufferMinutes, sessionDurations, timezone, overrides, blockedSlots } = req.body;

    let availability = await Availability.findOneAndUpdate(
      { therapist_id: therapistId },
      {
        ...(weeklySchedule && { weeklySchedule }),
        ...(bufferMinutes !== undefined && { bufferMinutes }),
        ...(sessionDurations && { sessionDurations }),
        ...(timezone && { timezone }),
        ...(overrides && { overrides }),
        ...(blockedSlots && { blockedSlots })
      },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      availability
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get public bookable slots for a therapist given a date
 * @route GET /api/scheduling/public-slots/:slug
 */
const getPublicAvailableSlots = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { date, duration = 60 } = req.query; // date in YYYY-MM-DD format

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date parameter (YYYY-MM-DD) is required' });
    }

    const therapist = await Therapist.findOne({ slug: slug.toLowerCase() });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    const availability = await Availability.findOne({ therapist_id: therapist._id });
    if (!availability) {
      return res.json({ success: true, slots: [] });
    }

    // Determine target day of week (0 = Sunday, 1 = Monday, etc.)
    const targetDate = new Date(`${date}T00:00:00.000Z`);
    const dayOfWeek = targetDate.getUTCDay();

    // Check if there is an override for this date
    const override = availability.overrides.find(o => o.date === date);
    let workingSlots = [];

    if (override) {
      if (!override.isAvailable) {
        return res.json({ success: true, slots: [] });
      }
      workingSlots = override.slots;
    } else {
      const daySchedule = availability.weeklySchedule.find(d => d.dayOfWeek === dayOfWeek);
      if (!daySchedule || !daySchedule.isWorkingDay) {
        return res.json({ success: true, slots: [] });
      }
      workingSlots = daySchedule.slots;
    }

    // Retrieve existing booked sessions for this therapist on this date
    const dayStart = new Date(`${date}T00:00:00.000Z`);
    const dayEnd = new Date(`${date}T23:59:59.999Z`);

    const existingSessions = await Session.find({
      therapist_id: therapist._id,
      status: { $in: ['scheduled', 'completed'] },
      startTime: { $gte: dayStart, $lte: dayEnd }
    });

    const durationNum = parseInt(duration, 10);
    const buffer = availability.bufferMinutes || 15;
    const availableSlots = [];

    // Break working windows into discrete slot offerings
    for (const window of workingSlots) {
      const [startHour, startMin] = window.startTime.split(':').map(Number);
      const [endHour, endMin] = window.endTime.split(':').map(Number);

      let slotStart = new Date(`${date}T00:00:00.000Z`);
      slotStart.setUTCHours(startHour, startMin, 0, 0);

      const windowEnd = new Date(`${date}T00:00:00.000Z`);
      windowEnd.setUTCHours(endHour, endMin, 0, 0);

      while (slotStart.getTime() + durationNum * 60000 <= windowEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + durationNum * 60000);

        // Check if overlaps with any booked session
        const isDoubleBooked = existingSessions.some(session => {
          const sStart = new Date(session.startTime).getTime();
          const sEnd = new Date(session.endTime).getTime();
          return slotStart.getTime() < sEnd && slotEnd.getTime() > sStart;
        });

        // Check if overlaps with any blocked slots
        const isBlocked = availability.blockedSlots.some(blocked => {
          const bStart = new Date(blocked.startTime).getTime();
          const bEnd = new Date(blocked.endTime).getTime();
          return slotStart.getTime() < bEnd && slotEnd.getTime() > bStart;
        });

        if (!isDoubleBooked && !isBlocked) {
          availableSlots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            timeLabel: `${String(slotStart.getUTCHours()).padStart(2, '0')}:${String(slotStart.getUTCMinutes()).padStart(2, '0')} UTC`
          });
        }

        // Increment by session duration + buffer
        slotStart = new Date(slotEnd.getTime() + buffer * 60000);
      }
    }

    res.json({
      success: true,
      therapist: {
        name: therapist.name,
        slug: therapist.slug,
        hourlyRate: therapist.hourlyRate
      },
      date,
      slots: availableSlots
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Book a slot with atomic double-booking prevention
 * @route POST /api/scheduling/book
 */
const bookSlot = async (req, res, next) => {
  try {
    const { therapistSlug, clientName, clientEmail, clientPhone, startTime, endTime, durationMinutes = 60, intakeData } = req.body;

    if (!therapistSlug || !clientName || !clientEmail || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing required booking parameters' });
    }

    const therapist = await Therapist.findOne({ slug: therapistSlug.toLowerCase() });
    if (!therapist) {
      return res.status(404).json({ success: false, message: 'Therapist not found' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // CRITICAL: Double-booking guard
    const conflict = await Session.findOne({
      therapist_id: therapist._id,
      status: { $in: ['scheduled', 'completed'] },
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } }
      ]
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'This time slot was just booked by another client. Please select an alternate slot.'
      });
    }

    // Find or create the client
    let client = await Client.findOne({
      therapist_id: therapist._id,
      email: clientEmail.toLowerCase()
    });

    if (!client) {
      client = await Client.create({
        therapist_id: therapist._id,
        name: clientName,
        email: clientEmail.toLowerCase(),
        phone: clientPhone || '',
        status: 'active',
        intakeData: intakeData || {}
      });
    }

    // Create session
    const session = await Session.create({
      therapist_id: therapist._id,
      client_id: client._id,
      startTime: start,
      endTime: end,
      durationMinutes,
      status: 'scheduled',
      meetingLink: `https://meet.jit.si/unfazed-${therapist.slug}-${client._id.toString().slice(-4)}`
    });

    client.lastSessionDate = start;
    await client.save();

    // Fire notifications asynchronously
    notifyBookingConfirmed({ session, therapist, client }).catch(err => {
      console.warn('Booking confirmation notification error:', err.message);
    });

    res.status(201).json({
      success: true,
      message: 'Session successfully booked',
      session,
      client: {
        id: client._id,
        name: client.name,
        email: client.email
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get all sessions for logged-in therapist
 * @route GET /api/scheduling/sessions
 */
const getSessions = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const { status, date } = req.query;

    const filter = { therapist_id: therapistId };
    if (status) filter.status = status;

    if (date) {
      const dayStart = new Date(`${date}T00:00:00.000Z`);
      const dayEnd = new Date(`${date}T23:59:59.999Z`);
      filter.startTime = { $gte: dayStart, $lte: dayEnd };
    }

    const sessions = await Session.find(filter)
      .populate('client_id', 'name email phone status intakeData')
      .sort({ startTime: -1 });

    res.json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update session status (e.g. complete, cancel, no-show)
 * @route PUT /api/scheduling/sessions/:id
 */
const updateSessionStatus = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const sessionId = req.params.id;
    const { status } = req.body;

    const session = await Session.findOneAndUpdate(
      { _id: sessionId, therapist_id: therapistId },
      { status },
      { new: true }
    ).populate('client_id', 'name email phone');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({
      success: true,
      session
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAvailability,
  updateAvailability,
  getPublicAvailableSlots,
  bookSlot,
  getSessions,
  updateSessionStatus
};
