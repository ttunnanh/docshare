const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ==========================================
// XÁC THỰC NGƯỜI DÙNG (AUTHENTICATION)
// ==========================================

// Đăng ký tài khoản mới
router.post('/register', authController.register);

// Đăng nhập hệ thống (Trả về JWT Token)
router.post('/login', authController.login);

module.exports = router;