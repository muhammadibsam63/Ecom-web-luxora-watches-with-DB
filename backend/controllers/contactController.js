const { query } = require('../config/db');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { notifyAdmins } = require('../utils/notify');

// POST /api/contact
const submitMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) throw ApiError.badRequest('name, email and message are required.');

  const { rows } = await query(
    `INSERT INTO contact_messages (name, email, subject, message) VALUES ($1,$2,$3,$4) RETURNING *`,
    [name, email, subject || null, message]
  );
  notifyAdmins('new_message', 'New contact message', `From ${name}: ${(subject || message).slice(0, 60)}`, '/admin/messages');
  res.status(201).json({ success: true, message: 'Your message has been sent. We will get back to you shortly.', data: rows[0] });
});

module.exports = { submitMessage };
