const Lead = require('../models/Lead');
const Therapist = require('../models/Therapist');
const { sendWhatsAppStub } = require('./notificationService');

/**
 * Capture an inquiry lead from the therapist's public page and notify the therapist
 */
const captureAndDistributeLead = async ({ therapistId, name, email, phone, message }) => {
  const therapist = await Therapist.findById(therapistId);
  if (!therapist) {
    throw new Error('Therapist not found');
  }

  const lead = await Lead.create({
    therapist_id: therapistId,
    name,
    email,
    phone,
    message,
    status: 'new'
  });

  // Notify therapist of a new inbound client lead
  await sendWhatsAppStub({
    toPhone: therapist.phone || '+91 99999 88888',
    recipientName: therapist.name,
    eventType: 'NEW_LEAD_RECEIVED',
    messageBody: `New client inquiry on your Unfazed page: ${name} (${email}) says: "${message || 'Interested in scheduling a consultation'}"`
  });

  return lead;
};

module.exports = {
  captureAndDistributeLead
};
