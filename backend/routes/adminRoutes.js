const router = require('express').Router();
const controller = require('../controllers/adminController');
const { verifyToken, verifyRole } = require('../middlewares/authMiddleware');

router.use(verifyToken, verifyRole(['admin']));

router.get('/stats', controller.getDashboardStats);
router.get('/users', controller.getAllUsers);
router.put('/users/:id/role', controller.updateUserRole);
router.patch('/users/:id/status', controller.updateUserStatus);
router.delete('/users/:id', controller.deleteUser);
router.get('/documents/pending', controller.getPendingDocuments);
router.put('/documents/:id/status', controller.updateDocumentStatus);
router.get('/audit-logs', controller.getAuditLogs);

module.exports = router;
