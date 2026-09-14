const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Từ chối truy cập. Không tìm thấy token.' });

    try {
        // Xử lý an toàn trường hợp header không có chữ "Bearer "
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        
        if (!token) {
            return res.status(401).json({ message: 'Định dạng token không hợp lệ.' });
        }

        // Đồng bộ fallback secret key giống bên authController
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'docshare_secret_key');
        req.user = verified;
        next();
    } catch (error) {
        console.error('Lỗi xác thực JWT:', error.message);
        res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

// Tạo alias để đảm bảo tương thích ngược nếu các file Route lỡ import `authenticateToken`
exports.authenticateToken = exports.verifyToken;

exports.verifyRole = (roles) => {
    return (req, res, next) => {
        // Kiểm tra an toàn xem req.user đã tồn tại chưa
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Không xác định được quyền truy cập.' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này.' });
        }
        next();
    };
};