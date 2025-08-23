// routes/auth.js
import express from 'express';
import AuthController from '../controllers/authController.js';


const router = express.Router();

const authController = new AuthController();

// Login route
router.post('/login', authController.login);
// Get profile route (protected)
router.post('/register', authController.register);

export default router;
