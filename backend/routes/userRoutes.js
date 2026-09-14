const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/profile', verifyToken, userController.getProfile);
router.get('/uploads', verifyToken, userController.getMyUploads);
router.get('/downloads', verifyToken, userController.getMyDownloads);
router.get('/downloads', verifyToken, userController.getMyDownloads);
router.get('/my-uploads', verifyToken, userController.getMyUploads);
router.put('/profile', verifyToken, userController.updateProfile);
router.put('/password', verifyToken, userController.changePassword);

module.exports = router;