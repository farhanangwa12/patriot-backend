import express from 'express';
import quizRoute from './routes/quiz.js';
// import quizRoute from './routes/quiz.js';
const app = express();


app.use(express.json());
// register route quiz
app.use('/quiz', quizRoute);

export default app;
