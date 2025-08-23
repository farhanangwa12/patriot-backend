import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // tambahin .js biar ESM valid

// Middleware untuk verifikasi token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

const createToken = (user) => {
    return jwt.sign(
        {
            userId: user._id,    // atau user.id kalau pakai SQL
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // token expired 1 jam
    );
};

// Middleware untuk mengecek role tertentu
const authorizeRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        next();
    };
};

// Middleware optional auth (untuk route yang bisa diakses dengan/tanpa login)
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId);
            req.user = user;
        }
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

export {
    createToken,
    authenticateToken,
    authorizeRole,
    optionalAuth
};
