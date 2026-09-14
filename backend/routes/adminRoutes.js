const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.get('/stats', verifyToken, verifyRole(['admin']), adminController.getDashboardStats);
router.get('/users', verifyToken, verifyRole(['admin']), adminController.getAllUsers);
router.put('/users/:id/role', verifyToken, verifyRole(['admin']), adminController.updateUserRole);
router.get('/documents/pending', verifyToken, verifyRole(['admin']), adminController.getPendingDocuments);
router.put('/documents/:id/status', verifyToken, verifyRole(['admin']), adminController.updateDocumentStatus);

module.exports = router;