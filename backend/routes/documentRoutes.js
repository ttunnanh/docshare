const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// ==========================================
// CÁC ROUTE TĨNH (STATIC ROUTES)
// (Bắt buộc đặt trên cùng để không bị nhầm với :id)
// ==========================================

// [PUBLIC] Lấy danh sách tài liệu đã duyệt
router.get('/', documentController.getAllDocuments);

// [USER] Quản lý tài liệu cá nhân
router.post('/upload', verifyToken, upload.single('file'), documentController.uploadDocument);
router.get('/saved/user', verifyToken, documentController.getSavedDocuments);

// [ADMIN] Quản lý hệ thống tài liệu
router.get('/admin/all', verifyToken, verifyRole(['admin']), documentController.getAllForAdmin);
router.get('/pending', verifyToken, verifyRole(['admin']), documentController.getPendingDocuments);


// ==========================================
// CÁC ROUTE ĐỘNG (DYNAMIC ROUTES - /:id)
// ==========================================

// [USER] Tương tác với tài liệu cụ thể
router.post('/:id/save', verifyToken, documentController.toggleSaveDocument);
router.get('/:id/download', verifyToken, documentController.downloadDocument);
router.post('/:id/download', documentController.incrementDownload); // Có thể không cần token để tính view tự do

// [ADMIN] Duyệt hoặc từ chối tài liệu
router.put('/:id/approve', verifyToken, verifyRole(['admin']), documentController.approveDocument);

// [USER & ADMIN] Thao tác CRUD cơ bản trên tài liệu
router.get('/:id', verifyToken, documentController.getDocumentById);
router.put('/:id', verifyToken, documentController.updateDocument);
router.delete('/:id', verifyToken, documentController.deleteDocument);

module.exports = router;