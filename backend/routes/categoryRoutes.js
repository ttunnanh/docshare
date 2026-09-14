const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

// ==========================================
// QUẢN LÝ DANH MỤC (CATEGORIES)
// ==========================================

// Lấy danh sách toàn bộ danh mục (Mọi người dùng đều xem được)
router.get('/', categoryController.getAllCategories);

// ==========================================
// CÁC THAO TÁC CỦA QUẢN TRỊ VIÊN (ADMIN)
// ==========================================

// Thêm danh mục mới
router.post('/', verifyToken, verifyRole(['admin']), categoryController.createCategory);

// Cập nhật tên danh mục
router.put('/:id', verifyToken, verifyRole(['admin']), categoryController.updateCategory);

// Xóa danh mục
router.delete('/:id', verifyToken, verifyRole(['admin']), categoryController.deleteCategory);

module.exports = router;