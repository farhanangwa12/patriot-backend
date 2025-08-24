 
// routes/resultRoute.js
import express from 'express';
import resultService from '../services/resultService.js';
import ResultController from '../controllers/resultController.js';
import { authenticateToken } from '../middleware/auth.js'; 
const router = express.Router();

const resultController = new ResultController(resultService);

// tampilkan semua result (hanya user login yang bisa akses)
router.get('/get-results', authenticateToken, resultController.getAllResults);

// tampilkan result berdasarkan id result
router.get('/get-result/:id', resultController.getResultById);

// delete result berdasarkan id
router.delete('/delete-result/:id', resultController.deleteResult);

export default router;
