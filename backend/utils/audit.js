const db = require('../config/db');

const clip = (value, max = 2000) => {
  if (value == null) return null;
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

const getIp = (req) => {
  const forwarded = req?.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) return forwarded.split(',')[0].trim();
  return req?.ip || req?.socket?.remoteAddress || null;
};

async function writeAudit({ req, userId, action, entityType = null, entityId = null, details = null }) {
  try {
    await db.execute(
      `INSERT INTO audit_logs(user_id, action, entity_type, entity_id, details, ip_address)
       VALUES(?,?,?,?,?,?)`,
      [userId || null, action, entityType, entityId == null ? null : String(entityId), clip(details), getIp(req)]
    );
  } catch (error) {
    // Audit must never break a business action. This also keeps the app usable
    // before the optional migration is applied, while still surfacing the issue.
    console.warn('[audit] skipped:', error.message);
  }
}

module.exports = { writeAudit, clip, getIp };
