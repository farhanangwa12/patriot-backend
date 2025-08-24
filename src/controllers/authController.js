
import bcrypt from 'bcryptjs';
import userModel from '../models/User.js';
import { createToken } from '../middleware/auth.js';
import OtpModel from "../models/Otp.js";


export default class AuthController {
    constructor(mailService) {
        this.mailService = mailService;


        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.sendOTP = this.sendOTP.bind(this);
    }

    // Register
    async register(req, res) {
        try {
            const { name, email, otp, password } = req.body;

            // Validasi input
            if (!otp) {
                return res.status(400).json({ success: false, message: "OTP is required" });
            }
            if (!name || !email || !password) {
                return res
                    .status(400)
                    .json({ success: false, message: "Name, email and password are required" });
            }

            // Cek apakah email sudah terdaftar
            const existingUser = await userModel.getUserByEmail({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email already in use" });
            }

            // ✅ Verifikasi OTP
            const otpCheck = await OtpModel.checkOTPIsValid(email, otp);
            if (!otpCheck) {
                return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
            }

            // Buat user baru (userModel akan hash password)
            const user = await userModel.createUser({ name, email, password });

            // Hapus OTP biar tidak bisa dipakai ulang
            await OtpModel.deleteOTP(otpCheck.id);

            // Buat token
            const token = createToken(user);

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                token,
                user, // contains id, name, email (no password)
            });
        } catch (err) {
            console.error("Register error:", err);
            return res.status(500).json({ success: false, message: "Server error" });
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


    // Create OTP
    async sendOTP(req, res) {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: "Email wajib diisi",
                });
            }

            // Kirim OTP ke email user
            const result = await this.mailService.sendGeneratedOTP({
                to: email,
                otpLength: 6,        // default 6 digit
                expiryMinutes: 5,    // default 5 menit
            });

            return res.json({
                success: true,
                message: "Berhasil mengirim kode OTP, silahkan cek email atau spam.",
                expiresAt: result.expiresAt, // opsional kalau mau kasih info expired
            });
        } catch (err) {
            console.error("Send OTP error:", err);
            return res.status(500).json({
                success: false,
                message: "Gagal mengirim OTP, coba lagi nanti.",
            });
        }
    }

}


