const r = require('express').Router();
const c = require('../controllers/documentController');
const publicController = require('../controllers/publicController');
const { verifyToken, verifyRole, optionalToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

r.get('/', c.getAllDocuments);
r.get('/stats/public', publicController.getStats);
r.post('/upload', verifyToken, upload.single('file'), c.uploadDocument);
r.get('/saved/user', verifyToken, c.getSavedDocuments);
r.get('/admin/all', verifyToken, verifyRole(['admin']), c.getAllForAdmin);
r.get('/pending', verifyToken, verifyRole(['admin']), c.getPendingDocuments);
r.post('/:id/save', verifyToken, c.toggleSaveDocument);
r.get('/:id/download', verifyToken, c.downloadDocument);
r.put('/:id/approve', verifyToken, verifyRole(['admin']), c.approveDocument);
r.get('/:id', optionalToken, publicController.getDocumentById);
r.put('/:id', verifyToken, c.updateDocument);
r.delete('/:id', verifyToken, c.deleteDocument);

module.exports = r;
