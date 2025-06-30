import express from 'express';
import dotenv from 'dotenv';
import {
  signup,
  login,
  getProfile,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authcontroller.js';
import { protect } from '../middleware/authMiddleware.js';

dotenv.config();

const router = express.Router();

// Signup route
router.post('/signup', signup);

// Login route
router.post('/login', login);

// Get profile (protected)
router.get('/profile', protect, getProfile);

// Request password reset token
router.post('/requestreset', requestPasswordReset);

// Reset password using token
router.post('/resetpassword', resetPassword);

export default router;
