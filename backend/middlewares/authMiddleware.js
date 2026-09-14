const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const header = req.get('Authorization');
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
  const token = header.slice(7);
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET chưa được cấu hình');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
  }
};
exports.authenticateToken = exports.verifyToken;
exports.verifyRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
  next();
};
