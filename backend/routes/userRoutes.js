const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

// Áp dụng middleware xác thực cho TẤT CẢ các route trong file này
router.use(verifyToken);

// ==========================================
// QUẢN LÝ HỒ SƠ CÁ NHÂN (PROFILE)
// ==========================================

// Lấy thông tin hồ sơ
router.get('/profile', userController.getProfile);

// Cập nhật thông tin cơ bản (họ tên,...)
router.put('/profile', userController.updateProfile);

// Thay đổi mật khẩu
router.put('/password', userController.changePassword);

// ==========================================
// QUẢN LÝ LỊCH SỬ HOẠT ĐỘNG
// ==========================================

// Lấy danh sách tài liệu đã tải lên
router.get('/uploads', userController.getMyUploads);

// Lấy danh sách tài liệu đã tải xuống
router.get('/downloads', userController.getMyDownloads);

module.exports = router;