const { db } = require('../config/firebase');
const { sendContactNotification } = require('../services/emailService');
const { v4: uuidv4 } = require('uuid');

/**
 * @desc    Submit contact form
 * @route   POST /api/contact
 * @access  Public
 */
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const messageId = uuidv4();
    const dataToSave = {
      name, email, phone: phone || '', subject, message,
      status: 'new',
      read: false,
      createdAt: new Date().toISOString()
    };

    await db.collection('messages').doc(messageId).set(dataToSave);

    // Trigger asynchronous email notification (don't await it to keep response fast)
    sendContactNotification(dataToSave).catch(err => console.error('Email failed', err));

    res.status(201).json({ success: true, message: 'Message sent successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all messages
 * @route   GET /api/admin/messages
 * @access  Private
 */
exports.getAllMessages = async (req, res, next) => {
  try {
    const snapshot = await db.collection('messages')
      .orderBy('createdAt', 'desc')
      .get();
      
    const messages = [];
    snapshot.forEach(doc => {
      messages.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single message
 * @route   GET /api/admin/messages/:id
 * @access  Private
 */
exports.getMessageById = async (req, res, next) => {
  try {
    const doc = await db.collection('messages').doc(req.params.id).get();
    
    if (!doc.exists) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.status(200).json({ success: true, data: { id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update message (e.g. mark as read, change status)
 * @route   PUT /api/admin/messages/:id
 * @access  Private
 */
exports.updateMessage = async (req, res, next) => {
  try {
    const docRef = db.collection('messages').doc(req.params.id);
    await docRef.set(req.body, { merge: true });
    
    res.status(200).json({ success: true, message: 'Message updated' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete message
 * @route   DELETE /api/admin/messages/:id
 * @access  Private
 */
exports.deleteMessage = async (req, res, next) => {
  try {
    await db.collection('messages').doc(req.params.id).delete();
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};
