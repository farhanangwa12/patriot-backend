import express from 'express';
import cors from 'cors';
import quizRoute from './routes/quiz.js';
import authRoute from './routes/index.js';
import resultRoute from './routes/result.js';
import env from './config/env.js';
import logger from "./utils/logger.js";
import { authenticateToken, authorizeRole, optionalAuth } from './middleware/auth.js';

const app = express();


app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: [

        env.FRONTEND_URL,

    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Enable CORS
app.use(cors(corsOptions));
// register route quiz
app.use('/auth', authRoute);
app.use('/quiz', quizRoute);
app.use('/result', resultRoute);


app.use((err, req, res, next) => {
    logger.error(err); // otomatis log stack trace kalau pakai winston.format.errors({ stack: true })

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
});
export default app;
