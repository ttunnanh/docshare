const router = require('express').Router();
const controller = require('../controllers/documentController');
const publicController = require('../controllers/publicController');
const secureDownloadController = require('../controllers/secureDownloadController');
const { verifyToken, verifyRole, optionalToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.get('/', controller.getAllDocuments);
router.get('/stats/public', publicController.getStats);
router.post('/upload', verifyToken, upload.single('file'), controller.uploadDocument);
router.get('/saved/user', verifyToken, controller.getSavedDocuments);
router.get('/admin/all', verifyToken, verifyRole(['admin']), controller.getAllForAdmin);
router.get('/pending', verifyToken, verifyRole(['admin']), controller.getPendingDocuments);
router.post('/:id/save', verifyToken, controller.toggleSaveDocument);
router.get('/:id/stream', verifyToken, secureDownloadController.streamDocument);
router.get('/:id/download', verifyToken, controller.downloadDocument);
router.put('/:id/approve', verifyToken, verifyRole(['admin']), controller.approveDocument);
router.get('/:id', optionalToken, publicController.getDocumentById);
router.put('/:id', verifyToken, controller.updateDocument);
router.delete('/:id', verifyToken, controller.deleteDocument);

module.exports = router;
