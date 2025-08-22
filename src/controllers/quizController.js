// controllers/QuizController.js
export class QuizController {
    constructor(quizService) {
        this.quizService = quizService;

        // bind supaya this tetap benar saat dipakai sebagai handler Express
        this.intoQuizez = this.intoQuizez.bind(this);
        this.startQuizez = this.startQuizez.bind(this);

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
            next(error)
        }
    }


    // async submitQuizez(req, res, next) {
    //     try {

    //         const questions = await this.quizService.createQuestion({ id: 1 });
    //         return res.status(201).json({
    //             status: 'success',
    //             message: 'Berhasil menampilkan question',
    //             data: questions
    //         });
    //     } catch (error) {
    //         next(error)
    //     }
    // }

}

// default export instance convenience (opsional)
export default (quizService) => new QuizController(quizService);
