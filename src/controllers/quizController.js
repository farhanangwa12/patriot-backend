// controllers/QuizController.js
export default class QuizController {
    constructor(quizService, resultService) {
        this.quizService = quizService;
        this.resultService = resultService;

        // bind supaya this tetap benar saat dipakai sebagai handler Express
        this.getAllQuizzes = this.getAllQuizzes.bind(this);
        this.createQuizez = this.createQuizez.bind(this);
        this.deleteQuizez = this.deleteQuizez.bind(this);
        this.updateQuizez = this.updateQuizez.bind(this);
        this.getQuizezById = this.getQuizezById.bind(this);

        this.intoQuizez = this.intoQuizez.bind(this);
        this.startQuizez = this.startQuizez.bind(this);
        this.submitQuizez = this.submitQuizez.bind(this);   // <-- tambahin ini
        this.resultQuizez = this.resultQuizez.bind(this);   // <-- tambahin ini
    }

    // GET /get-quizez
    async getAllQuizzes(req, res, next) {
        try {
            const quizzes = await this.quizService.getAllQuizzes();
            return res.status(200).json({ success: true, message: 'Berhasil mengambil data quiz', data: quizzes });
        } catch (error) {
            // console.error('intoQuizez error:', err);
            // return res.status(500).json({ success: false, message: 'Failed to fetch quizzes' });
            next(error);
        }
    }

    // POST /create-quizez
    // body: { title, topic, questions, ... }
    async createQuizez(req, res, next) {
        try {
            const { title, description, topic, question_statuses, total_questions } = req.body;

            // simple validation
            if (!title || !description || !topic || !question_statuses || !total_questions) {
                return res.status(400).json({
                    success: false,
                    message: 'title, description, topic, question_statuses, total_questions wajib ada'
                });
            }

            // panggil service
            const created = await this.quizService.createQuizez({
                title,
                description,
                topic,
                question_statuses,
                total_questions
            });

            await this.quizService.createQuestion({ id: created.id });

            return res.status(201).json({
                success: true,
                data: created
            });
        } catch (error) {
            next(error);
        }
    }

    // DELETE /delete-quizez
    // Accepts id via params, query, or body
    async deleteQuizez(req, res, next) {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ success: false, message: 'Missing id to delete' });


            const deleted = await this.quizService.deleteQuiz(id);


            // beberapa service mengembalikan objek/boolean; kita tangani keduanya
            if (deleted === false || deleted === null) {
                return res.status(404).json({ success: false, message: 'Quiz not found or already deleted' });
            }


            return res.status(200).json({ success: true, message: 'Quiz berhasil dihapus' });
        } catch (error) {
            next(error);
        }
    }


    // PUT /update-quizez
    // body: { id, title, topic }
    async updateQuizez(req, res, next) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing id to update'
                });
            }

            const { title, description, topic, question_statuses, total_questions } = req.body;

            // panggil service
            const updated = await this.quizService.updateQuiz(id, {
                title,
                description,
                topic,
                question_statuses,
                total_questions
            });

            if (!updated) {
                return res.status(404).json({
                    success: false,
                    message: 'Quiz not found'
                });
            }

            // Hapus semua question lama lalu buat ulang
            await this.quizService.deleteQuestionByQuizId(id);
            await this.quizService.createQuestion({ id: updated.id, topic: updated.topic });

            return res.status(200).json({
                success: true,
                data: updated
            });
        } catch (error) {
            next(error);
        }
    }



    // GET /get-quizez/:id
    async getQuizezById(req, res) {
        try {
            const id = req.params.id;
            if (!id) return res.status(400).json({ success: false, message: 'Missing id' });


            const quiz = await this.quizService.getQuizById(id);
            if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found' });


            return res.status(200).json({ success: true, data: quiz });
        } catch (error) {
            next(error);
        }
    }


    async intoQuizez(req, res, next) {
        try {

            const { id } = req.params;
            const result = await this.quizService.getQuizById(id);
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
            const { id } = req.body;
            const questions = await this.quizService.getQuestionByQuizId(id);
            const quiz = await this.quizService.getQuizById(id)


            return res.status(201).json({
                status: 'success',
                message: 'Berhasil menampilkan question',
                data: {
                    quiz,
                    questions: questions
                }
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
