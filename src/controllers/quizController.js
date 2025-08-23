// controllers/QuizController.js
export default class QuizController {
    constructor(quizService, resultService) {
        this.quizService = quizService;
        this.resultService = resultService;

        // bind supaya this tetap benar saat dipakai sebagai handler Express
        this.intoQuizez = this.intoQuizez.bind(this);
        this.startQuizez = this.startQuizez.bind(this);
        this.submitQuizez = this.submitQuizez.bind(this);   // <-- tambahin ini
        this.resultQuizez = this.resultQuizez.bind(this);   // <-- tambahin ini
    }

    async intoQuizez(req, res, next) {
        try {
            const result = await this.quizService.getQuizById(1);
            return res.status(201).json({
                status: 'success',
                message: 'Berhasil menampilkan quiz',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async startQuizez(req, res, next) {
        try {
            const questions = await this.quizService.createQuestion({ id: 1 });
            return res.status(201).json({
                status: 'success',
                message: 'Berhasil menampilkan question',
                data: questions
            });
        } catch (error) {
            next(error);
        }
    }

    async submitQuizez(req, res, next) {
        try {
            const { user_id, quiz_id, answers } = req.body;
            if (!user_id || !quiz_id || !answers || !Array.isArray(answers)) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'user_id, quiz_id, dan answers (array) wajib diisi'
                });
            }

            // perbaiki: kirim userAnswers, bukan question_id / user_answer yang undefined
            const result = await this.resultService.submitAnswer({
                user_id,
                quiz_id,
                userAnswers: answers   // <--- ini sesuai dengan ResultService
            });

            return res.status(201).json({
                status: 'success',
                message: 'Jawaban berhasil disimpan',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async resultQuizez(req, res, next) {
        try {
            const quiz_session_id = req.params.id;
            if (!quiz_session_id) {
                return res.status(400).json({
                    status: 'fail',
                    message: 'quiz_session_id wajib diisi'
                });
            }

            const result = await this.resultService.calculateQuizResult(quiz_session_id);
            return res.status(200).json({
                status: 'success',
                message: 'Berhasil menghitung quiz',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}
