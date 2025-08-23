// routes/quizRoute.js
import express from 'express';
import quizService from '../services/quizService.js';
import resultService from '../services/resultService.js';
import QuizController from '../controllers/quizController.js';

const router = express.Router();

const quizController = new QuizController(quizService, resultService);

// management routes sesuai permintaan Anda
router.get('/get-quizez', quizController.getAllQuizzes);
router.post('/create-quizez', quizController.createQuizez);
router.delete('/delete-quizez/:id', quizController.deleteQuizez); // id via body/query/params
router.put('/update-quizez/:id', quizController.updateQuizez); // id via body/query/params
router.get('/get-quizez/:id', quizController.getQuizezById);

// routes → controller methods (sudah bound)
router.get('/intro', quizController.intoQuizez);
router.get('/start', quizController.startQuizez);
router.post('/submit', quizController.submitQuizez);
router.get('/result/:id', quizController.resultQuizez);

export default router;
