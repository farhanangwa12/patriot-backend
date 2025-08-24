 
// routes/resultRoute.js
import express from 'express';
import resultService from '../services/resultService.js';
import ResultController from '../controllers/resultController.js';

const router = express.Router();

const resultController = new ResultController(resultService);

// tampilkan semua result
router.get('/get-results', resultController.getAllResults);

// tampilkan result berdasarkan id result
router.get('/get-result/:id', resultController.getResultById);


// delete result berdasarkan id (boleh dihapus)
router.delete('/delete-result/:id', resultController.deleteResult);

export default router;
