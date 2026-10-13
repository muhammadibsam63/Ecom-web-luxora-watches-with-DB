const { query } = require('../config/db');

/**
 * Records an admin action. Never throws — logging failures must not break
 * the admin action itself, so errors are swallowed and logged to console.
 * @param {string} adminId
 * @param {string} action - e.g. 'product.created', 'order.status_changed'
 * @param {string} entityType - e.g. 'product', 'order', 'coupon'
 * @param {string} entityId
 * @param {object} [metadata]
 */
async function logActivity(adminId, action, entityType, entityId, metadata = null) {
  try {
    await query(
      `INSERT INTO admin_activity_log (admin_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, $3, $4, $5)`,
      [adminId, action, entityType, entityId ? String(entityId) : null, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (err) {
    console.error('Failed to log admin activity:', err.message);
  }
}

module.exports = { logActivity };
