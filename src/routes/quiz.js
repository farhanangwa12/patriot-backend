// routes/quizRoute.js
import express from 'express';
import quizService from '../services/quizService.js';
import resultService from '../services/resultService.js';
import QuizController from '../controllers/quizController.js';

const router = express.Router();

const quizController = new QuizController(quizService, resultService);



// routes → controller methods (sudah bound)
router.get('/intro', quizController.intoQuizez);
router.get('/start', quizController.startQuizez);
router.post('/submit', quizController.submitQuizez);
router.get('/result/:id', quizController.resultQuizez);

export default router;
