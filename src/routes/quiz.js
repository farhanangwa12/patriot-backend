// routes/quizRoute.js
import express from 'express';
import pool from '../config/database.js'; // pg Pool

import QuizController from '../controllers/quizController.js';

const router = express.Router();
const quizService = new QuizService(pool);   // sesuaikan constructor service-mu

const quizController = new QuizController(quizService);

// routes → controller methods (sudah bound)
router.get('/:id/intro', quizController.intro);
router.get('/:id/start', quizController.start);
router.post('/:id/submit', quizController.submit);
router.get('/:id/result', quizController.result);

export default router;
