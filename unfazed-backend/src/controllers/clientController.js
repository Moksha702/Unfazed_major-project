const Client = require('../models/Client');
const Session = require('../models/Session');
const Payment = require('../models/Payment');
const SessionNote = require('../models/SessionNote');

/**
 * @desc Get all clients for therapist (with search & filtering)
 * @route GET /api/clients
 */
const getClients = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const { status, search, tag } = req.query;

    const query = { therapist_id: therapistId };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (tag) {
      query.tags = tag;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const clients = await Client.find(query).sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: clients.length,
      clients
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get single client profile aggregated with session history, payment history & clinical notes
 * @route GET /api/clients/:id
 */
const getClientById = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const clientId = req.params.id;

    const client = await Client.findOne({ _id: clientId, therapist_id: therapistId });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    // Aggregate sessions, payments, and notes concurrently
    const [sessions, payments, notes] = await Promise.all([
      Session.find({ client_id: clientId, therapist_id: therapistId }).sort({ startTime: -1 }),
      Payment.find({ client_id: clientId, therapist_id: therapistId }).sort({ createdAt: -1 }),
      SessionNote.find({ client_id: clientId, therapist_id: therapistId }).sort({ createdAt: -1 })
    ]);

    res.json({
      success: true,
      client,
      sessions,
      payments,
      notes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Create new client manually (Therapist initiated)
 * @route POST /api/clients
 */
const createClient = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const { name, email, phone, tags, intakeData } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Client name and email are required' });
    }

    const client = await Client.create({
      therapist_id: therapistId,
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      tags: tags || ['New Client'],
      status: 'active',
      intakeData: intakeData || {}
    });

    res.status(201).json({
      success: true,
      client
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update client info, tags, or status
 * @route PUT /api/clients/:id
 */
const updateClient = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const clientId = req.params.id;

    const client = await Client.findOneAndUpdate(
      { _id: clientId, therapist_id: therapistId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    res.json({
      success: true,
      client
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Submit client intake details and digital consent
 * @route POST /api/clients/intake-consent
 */
const submitIntakeConsent = async (req, res, next) => {
  try {
    const { clientId, intakeData, consentAgreed } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client ID is required' });
    }

    if (!consentAgreed) {
      return res.status(400).json({ success: false, message: 'Consent agreement must be accepted to proceed' });
    }

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client record not found' });
    }

    client.intakeData = {
      ...client.intakeData,
      ...intakeData
    };
    client.consentAgreed = true;
    client.consentTimestamp = new Date();

    await client.save();

    res.json({
      success: true,
      message: 'Intake and informed consent recorded successfully',
      client
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  submitIntakeConsent
};
