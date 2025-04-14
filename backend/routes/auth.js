// backend/routes/auth.js
const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG, PNG, and GIF images are allowed'), false);
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

// Routes using controller
router.post('/signup', upload.single('profilePic'), authController.signup);
router.post('/login', authController.login);
router.get('/user', verifyToken, authController.getUser);

module.exports = router;
