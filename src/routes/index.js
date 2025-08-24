// routes/auth.js
import express from 'express';
import AuthController from '../controllers/authController.js';
import mailService from '../services/mailService.js';

const router = express.Router();

const authController = new AuthController(mailService);

// Login route
router.post('/login', authController.login);
// Get profile route (protected)
router.post('/register', authController.register);



router.post('/otp', authController.sendOTP);

export default router;
