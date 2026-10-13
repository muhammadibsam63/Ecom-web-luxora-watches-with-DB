const { query } = require('../config/db');

/**
 * Creates a notification. Never throws — swallows errors so notification
 * failures never break the primary action that triggered them.
 */
async function notify({ recipientType, userId = null, type, title, body = null, link = null }) {
  try {
    await query(
      `INSERT INTO notifications (recipient_type, user_id, type, title, body, link)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [recipientType, userId, type, title, body, link]
    );
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
}

// Convenience: broadcast to all admins (user_id NULL, recipient_type 'admin')
const notifyAdmins = (type, title, body, link) => notify({ recipientType: 'admin', type, title, body, link });

// Convenience: notify one customer
const notifyUser = (userId, type, title, body, link) => notify({ recipientType: 'user', userId, type, title, body, link });

module.exports = { notify, notifyAdmins, notifyUser };
