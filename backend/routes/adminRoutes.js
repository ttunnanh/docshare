const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// Áp dụng middleware bảo vệ cho TẤT CẢ các route trong file này
// Giúp code gọn gàng, tránh việc phải lặp lại verifyToken và verifyRole ở từng dòng
router.use(verifyToken, verifyRole(['admin']));

// ==========================================
// THỐNG KÊ (DASHBOARD)
// ==========================================
router.get('/stats', adminController.getDashboardStats);

// ==========================================
// QUẢN LÝ NGƯỜI DÙNG (USERS)
// ==========================================
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);

// ==========================================
// QUẢN LÝ TÀI LIỆU (DOCUMENTS)
// ==========================================
router.get('/documents/pending', adminController.getPendingDocuments);
router.put('/documents/:id/status', adminController.updateDocumentStatus);

module.exports = router;