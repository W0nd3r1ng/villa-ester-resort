const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getAllUsers } = require('../controllers/userController');
const { auth } = require('../middleware/auth');

// Get current user's profile
router.get('/me', auth, getProfile);
// Update current user's profile (phone/email)
router.put('/me', auth, updateProfile);
// Change current user's password
router.put('/me/password', auth, changePassword);
// Get all users (customers)
router.get('/', getAllUsers);

module.exports = router; 