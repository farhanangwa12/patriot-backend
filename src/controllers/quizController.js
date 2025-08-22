// controllers/QuizController.js
export class QuizController {
  constructor(quizService) {
    this.quizService = quizService;

    // bind supaya this tetap benar saat dipakai sebagai handler Express
    this.createQuestions = this.createQuestions.bind(this);
  
  }

  // POST  /quizzes/:id/generate  -> generate questions via OpenAI (createQuestion di service)
  async createQuestions(req, res, next) {
    try {
      const { id } = req.params; // id quiz/topic
      const result = await this.quizService.createQuestion({ id });
      return res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  async intoQuizez(req, res, next) {
    try {
        const result = await this.quizService.getQuizById()
       
    } catch (error) {
        
    }
  }

}

// default export instance convenience (opsional)
export default (quizService) => new QuizController(quizService);
