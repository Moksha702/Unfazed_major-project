const SessionNote = require('../models/SessionNote');
const Session = require('../models/Session');

/**
 * @desc Get notes for a session (Therapist view: sees both private & shared)
 * @route GET /api/notes/session/:sessionId
 */
const getSessionNotes = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const { sessionId } = req.params;

    const notes = await SessionNote.find({
      session_id: sessionId,
      therapist_id: therapistId
    }).sort({ createdAt: 1 });

    res.json({
      success: true,
      notes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get ONLY shared notes for a client (Strict Security Firewall)
 * @route GET /api/notes/client-shared/:clientId
 * Note: Even if requested by query or parameter, this route explicitly enforces { type: 'shared' }
 */
const getClientSharedNotes = async (req, res, next) => {
  try {
    const { clientId } = req.params;

    // Strict filter: NEVER return private notes under any circumstance
    const sharedNotes = await SessionNote.find({
      client_id: clientId,
      type: 'shared'
    })
      .select('title format content soapData.plan dapData.plan createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      notes: sharedNotes
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Create note for a session
 * @route POST /api/notes
 */
const createNote = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const { sessionId, clientId, type = 'private', title, format = 'freeform', content, soapData, dapData } = req.body;

    if (!sessionId || !clientId) {
      return res.status(400).json({ success: false, message: 'Session ID and Client ID are required' });
    }

    const note = await SessionNote.create({
      session_id: sessionId,
      therapist_id: therapistId,
      client_id: clientId,
      type,
      title: title || (type === 'shared' ? 'Shared Takeaways & Plan' : 'Confidential Clinical Note'),
      format,
      content: content || '',
      soapData: soapData || {},
      dapData: dapData || {}
    });

    res.status(201).json({
      success: true,
      note
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update existing note
 * @route PUT /api/notes/:id
 */
const updateNote = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const noteId = req.params.id;

    const note = await SessionNote.findOneAndUpdate(
      { _id: noteId, therapist_id: therapistId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({
      success: true,
      note
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Delete a note
 * @route DELETE /api/notes/:id
 */
const deleteNote = async (req, res, next) => {
  try {
    const therapistId = req.therapist._id;
    const noteId = req.params.id;

    const note = await SessionNote.findOneAndDelete({
      _id: noteId,
      therapist_id: therapistId
    });

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSessionNotes,
  getClientSharedNotes,
  createNote,
  updateNote,
  deleteNote
};
