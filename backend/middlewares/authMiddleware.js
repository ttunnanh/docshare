const jwt = require('jsonwebtoken');
const db = require('../config/db');

const readToken = (req) => {
  const header = req.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
};

const decodeToken = (token) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET chưa được cấu hình');
  return jwt.verify(token, process.env.JWT_SECRET);
};

const loadCurrentUser = async (decoded) => {
  const [rows] = await db.execute(
    'SELECT id, role, is_active FROM users WHERE id = ? LIMIT 1',
    [decoded.id]
  );
  return rows[0] || null;
};

exports.verifyToken = async (req, res, next) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });

  try {
    const decoded = decodeToken(token);
    const currentUser = await loadCurrentUser(decoded);

    if (!currentUser) {
      return res.status(401).json({ message: 'Tài khoản không còn tồn tại.' });
    }

    if (Number(currentUser.is_active) === 0) {
      return res.status(403).json({
        code: 'ACCOUNT_LOCKED',
        message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      });
    }

    // Always use the current database role so role changes take effect immediately.
    req.user = { id: currentUser.id, role: currentUser.role };
    next();
  } catch (error) {
    if (error?.code === 'ER_BAD_FIELD_ERROR') {
      console.error('Chưa chạy migrate_enterprise_features.sql:', error.message);
      return res.status(503).json({
        code: 'MIGRATION_REQUIRED',
        message: 'Cơ sở dữ liệu chưa được nâng cấp. Hãy chạy migrate_enterprise_features.sql.',
      });
    }
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
};

// Public pages can optionally identify the owner/admin. Invalid or locked tokens
// are treated as guest sessions instead of making the public page unavailable.
exports.optionalToken = async (req, _res, next) => {
  const token = readToken(req);
  if (!token) return next();

  try {
    const decoded = decodeToken(token);
    const currentUser = await loadCurrentUser(decoded);
    req.user = currentUser && Number(currentUser.is_active) !== 0
      ? { id: currentUser.id, role: currentUser.role }
      : null;
  } catch {
    req.user = null;
  }
  next();
};

exports.authenticateToken = exports.verifyToken;

exports.verifyRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
  }
  next();
};

exports._private = { readToken, decodeToken, loadCurrentUser };
