const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Các route tĩnh (không có tham số động) phải đặt lên trên cùng
router.get('/', documentController.getAllDocuments);
router.get('/admin/all', verifyToken, verifyRole(['admin']), documentController.getAllForAdmin);
router.post('/upload', verifyToken, upload.single('file'), documentController.uploadDocument);
router.get('/pending', verifyToken, verifyRole(['admin']), documentController.getPendingDocuments);

// Các route động (chứa /:id) phải đặt xuống dưới
router.get('/:id', verifyToken, documentController.getDocumentById);
router.get('/:id/download', verifyToken, documentController.downloadDocument);
router.put('/:id', verifyToken, documentController.updateDocument);
router.delete('/:id', verifyToken, documentController.deleteDocument);
router.put('/:id/approve', verifyToken, verifyRole(['admin']), documentController.approveDocument);

module.exports = router;