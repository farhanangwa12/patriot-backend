import express from 'express';
import cors from 'cors';
import quizRoute from './routes/quiz.js';
// import quizRoute from './routes/quiz.js';
const app = express();


app.use(express.json());

// CORS configuration
const corsOptions = {
    origin: [

        'http://localhost:5173', // Vite default port

    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

// Enable CORS
app.use(cors(corsOptions));
// register route quiz
app.use('/quiz', quizRoute);

export default app;
