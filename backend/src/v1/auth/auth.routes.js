const express = require('express');
const { register, login, forgotPassword, resetPassword, getProfile } = require('./auth.controller');
const { verifyToken } = require('../../helpers/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', verifyToken, getProfile);

module.exports = router;
