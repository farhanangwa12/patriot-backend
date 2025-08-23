
import bcrypt from 'bcryptjs';
import userModel from '../models/User.js';
import { createToken } from '../middleware/auth.js';

export default class AuthController {


    // Register
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // simple validation
            if (!name || !email || !password) {
                return res.status(400).json({ success: false, message: 'Name, email and password are required' });
            }

            // check existing user
            const existingUser = await userModel.getUserByEmail({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }

            // create user (userModel will hash the password)
            const user = await userModel.createUser({ name, email, password });

            // create token
            const token = createToken(user);

            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                token,
                user // contains id, name, email (no password)
            });
        } catch (err) {
            console.error('Register error:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }

    // Login
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ success: false, message: 'Email and password are required' });
            }

            // get user (includes hashed password)
            const user = await userModel.getUserByEmail({ email });
            if (!user) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // compare password with hashed password from DB
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid email or password' });
            }

            // create token (user object should have id,name,email)
            const token = createToken(user);

            return res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });
        } catch (err) {
            console.error('Login error:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
        }
    }
}


