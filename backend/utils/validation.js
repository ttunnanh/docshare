const VALID_ROLES = new Set(['student', 'teacher', 'admin']);
const VALID_REVIEW_STATUSES = new Set(['approved', 'rejected']);

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const isEmail = (value) => /^\S+@\S+\.\S+$/.test(normalizeEmail(value));
const isValidRole = (value) => VALID_ROLES.has(String(value || ''));
const isValidReviewStatus = (value) => VALID_REVIEW_STATUSES.has(String(value || ''));
const isStrongEnoughPassword = (value) => String(value || '').length >= 6;

const positiveInt = (value, fallback, max = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

module.exports = {
  VALID_ROLES,
  VALID_REVIEW_STATUSES,
  normalizeEmail,
  isEmail,
  isValidRole,
  isValidReviewStatus,
  isStrongEnoughPassword,
  positiveInt,
};
