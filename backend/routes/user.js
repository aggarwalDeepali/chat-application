const express = require('express');
const {
    getAllUsers
} = require('../controllers/userController');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');


// Route to get all users
router.get('/',verifyToken, getAllUsers);
module.exports = router;
