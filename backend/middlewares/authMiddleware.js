const jwt = require('jsonwebtoken');

const readToken = (req) => {
  const header = req.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
};

const decodeToken = (token) => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET chưa được cấu hình');
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.verifyToken = (req, res, next) => {
  const token = readToken(req);
  if (!token) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });

  try {
    req.user = decodeToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
};

// Dùng cho các trang công khai nhưng vẫn cần nhận biết chủ sở hữu/admin khi có token.
exports.optionalToken = (req, _res, next) => {
  const token = readToken(req);
  if (!token) return next();

  try {
    req.user = decodeToken(token);
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
