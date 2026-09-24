const nodemailer = require('nodemailer');

// In-memory queue / audit log for stubbed WhatsApp & SMS messages
const notificationLogs = [];

// Configure Nodemailer transporter (Ethereal test account or local fallback)
let transporter = null;

const initTransporter = async () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Development fallback using dummy test transporter or console logger
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(`[Email Mock Sent] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
        return { messageId: `mock-email-${Date.now()}` };
      }
    };
  }
};

initTransporter().catch(err => console.warn('Notification service transport init notice:', err.message));

/**
 * Stub WhatsApp message dispatcher (queues and logs event)
 */
const sendWhatsAppStub = async ({ toPhone, recipientName, eventType, messageBody }) => {
  const logEntry = {
    id: `wa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    channel: 'WHATSAPP_BUSINESS_STUB',
    toPhone: toPhone || '+91 98765 43210',
    recipientName,
    eventType,
    messageBody,
    status: 'QUEUED_AND_DISPATCHED',
    timestamp: new Date()
  };

  notificationLogs.unshift(logEntry);
  if (notificationLogs.length > 100) notificationLogs.pop();

  console.log(`[WhatsApp Stub Dispatch] [${eventType}] To: ${toPhone || 'Client'} => "${messageBody}"`);
  return logEntry;
};

/**
 * Domain Event 1: Booking Confirmed
 */
const notifyBookingConfirmed = async ({ session, therapist, client }) => {
  const dateStr = new Date(session.startTime).toLocaleString('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });

  const waMessage = `Namaste ${client.name}, your therapy session with ${therapist.name} is confirmed for ${dateStr}. Meeting link: ${session.meetingLink || 'https://meet.google.com/unfazed-demo'}`;

  // WhatsApp stub
  await sendWhatsAppStub({
    toPhone: client.phone,
    recipientName: client.name,
    eventType: 'BOOKING_CONFIRMED',
    messageBody: waMessage
  });

  // Email notification
  if (client.email && transporter) {
    try {
      await transporter.sendMail({
        from: `"Unfazed Mental Health" <notifications@unfazed.in>`,
        to: client.email,
        subject: `Confirmed: Therapy Session with ${therapist.name}`,
        text: waMessage,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h2 style="color: #4f46e5;">Session Confirmed!</h2>
            <p>Dear <strong>${client.name}</strong>,</p>
            <p>Your therapy appointment with <strong>${therapist.name}</strong> has been successfully booked.</p>
            <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Date & Time:</strong> ${dateStr} (IST)</p>
              <p style="margin: 4px 0;"><strong>Duration:</strong> ${session.durationMinutes} minutes</p>
              <p style="margin: 4px 0;"><strong>Session Link:</strong> <a href="${session.meetingLink || 'https://meet.google.com/unfazed-demo'}">${session.meetingLink || 'Join Video Session'}</a></p>
            </div>
            <p style="color: #64748b; font-size: 13px;">Please complete your intake & consent form in your client portal if you haven't already.</p>
          </div>
        `
      });
    } catch (err) {
      console.warn('Email send error:', err.message);
    }
  }
};

/**
 * Domain Event 2: 24hr Session Reminder
 */
const notifySessionReminder = async ({ session, therapist, client }) => {
  const dateStr = new Date(session.startTime).toLocaleString('en-IN', {
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  });

  const msg = `Friendly reminder: Your session with ${therapist.name} is tomorrow at ${dateStr}. Click here to join: ${session.meetingLink || 'https://meet.google.com/unfazed-demo'}`;

  return await sendWhatsAppStub({
    toPhone: client.phone,
    recipientName: client.name,
    eventType: 'REMINDER_24HR',
    messageBody: msg
  });
};

/**
 * Domain Event 3: Post-Session Follow-Up & Resources
 */
const notifyPostSessionFollowUp = async ({ session, therapist, client }) => {
  const msg = `Thank you for attending today's session with ${therapist.name}. Your shared notes, reflections, and follow-up resources are now ready in your client portal.`;

  return await sendWhatsAppStub({
    toPhone: client.phone,
    recipientName: client.name,
    eventType: 'POST_SESSION_FOLLOWUP',
    messageBody: msg
  });
};

/**
 * Domain Event 4: Payment Received
 */
const notifyPaymentReceived = async ({ payment, therapist, client }) => {
  const msg = `Payment of ₹${payment.amount} received for session with ${therapist.name}. Invoice #${payment.invoiceNumber} is now available in your portal.`;

  return await sendWhatsAppStub({
    toPhone: client.phone,
    recipientName: client.name,
    eventType: 'PAYMENT_RECEIVED',
    messageBody: msg
  });
};

const getNotificationLogs = () => notificationLogs;

module.exports = {
  sendWhatsAppStub,
  notifyBookingConfirmed,
  notifySessionReminder,
  notifyPostSessionFollowUp,
  notifyPaymentReceived,
  getNotificationLogs
};
