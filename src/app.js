import express from 'express';
import cors from 'cors';
import quizRoute from './routes/quiz.js';
import authRoute from './routes/index.js';
import resultRoute from './routes/result.js';
import env from './config/env.js';

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
export default app;
