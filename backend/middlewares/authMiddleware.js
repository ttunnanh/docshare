const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ message: 'Từ chối truy cập. Không tìm thấy token.' });

    try {
        const token = authHeader.split(' ')[1]; // Tách lấy chuỗi token sau từ khóa "Bearer"
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn.' });
    }
};

exports.verifyRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Không có quyền thực hiện thao tác này.' });
        }
        next();
    };
};