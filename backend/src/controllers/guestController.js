const { v4: uuidv4, validate: uuidValidate } = require('uuid');
const Session = require('../models/Session');
const Message = require('../models/Message');

const createOrGetSession = async (req, res) => {
  const { guestId } = req.body;

  // Validate guestId is a valid UUID if provided
  if (guestId !== undefined && (typeof guestId !== 'string' || !uuidValidate(guestId))) {
    return res.status(400).json({ message: 'Invalid guest ID format' });
  }

  try {
    if (guestId) {
      const session = await Session.findOne({ guestId: String(guestId) });
      if (session) {
        session.lastActive = new Date();
        await session.save();
        return res.json({ session });
      }
    }

    const newGuestId = guestId || uuidv4();
    const session = await Session.create({
      guestId: newGuestId,
      displayName: `Guest_${newGuestId.slice(0, 6)}`,
    });

    res.status(201).json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getGuestChatHistory = async (req, res) => {
  const { guestId } = req.params;
  const { roomId } = req.query;

  // Validate guestId is a valid UUID
  if (typeof guestId !== 'string' || !uuidValidate(guestId)) {
    return res.status(400).json({ message: 'Invalid guest ID format' });
  }

  try {
    const session = await Session.findOne({ guestId: String(guestId) });
    if (!session) {
      return res.status(404).json({ message: 'Guest session not found' });
    }

    const query = { senderId: String(guestId), isGuest: true };
    if (roomId && typeof roomId === 'string') query.roomId = roomId;

    const messages = await Message.find(query).sort({ createdAt: 1 }).limit(100);

    res.json({ messages, session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createOrGetSession, getGuestChatHistory };
