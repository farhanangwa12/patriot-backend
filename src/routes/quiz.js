// routes/quizRoute.js
import express from 'express';
import quizService from '../services/quizService.js';
import QuizController from '../controllers/quizController.js';

const router = express.Router();

const quizController =  QuizController(quizService);

// routes → controller methods (sudah bound)
router.get('/intro', quizController.intoQuizez);
router.get('/start', quizController.startQuizez);
router.post('/:id/submit', quizController.submit);
// router.get('/:id/result', quizController.result);

export default router;
