
import { quizModel } from '../models/quizModel.js';
import { userAnswerModel } from '../models/userAnswerModel.js';
import { questionModel } from '../models/questionModel.js';
import openAiService from '../services/openaiService.js';
import scoreService from '../services/scoreService.js';

class ResultService {
    // Menghitung hasil kuis berdasarkan quiz_id
    async calculateQuizResult(quizId, userId) {
        try {
            // Validasi input
            if (!quizId) {
                throw new Error('Quiz ID wajib ada');
            }

            if (!userId) {
                throw new Error('User ID wajib ada');
            }

            // Ambil data quiz
            const quiz = await quizModel.findQuizById(quizId);
            if (!quiz) {
                throw new Error('Quiz tidak ditemukan');
            }

            // Ambil jawaban user berdasarkan quiz ID
            const userAnswers = await userAnswerModel.findUserAnswersByQuizId(quizId, userId);
            if (!userAnswers || userAnswers.length === 0) {
                throw new Error('Tidak ada jawaban user untuk quiz ini');
            }

            // Ambil semua pertanyaan berdasarkan quiz ID
            const questions = await questionModel.findQuestionsByQuizId(quizId);
            if (!questions || questions.length === 0) {
                throw new Error('Tidak ada pertanyaan untuk quiz ini');
            }

            // Susun hasil tanpa re-checking dengan AI
            const answersDetail = userAnswers.map(userAnswer => {
                const question = questions.find(q => q.id === userAnswer.question_id);
                return {
                    question: question.question_text,
                    fact: question.fact_answer,
                    user_answer: userAnswer.user_answer,
                    id: userAnswer.id,
                    is_correct: userAnswer.is_correct
                };
            });

            const userAnswerResult = await openAiService.checkAnswerFromQuiz(answersDetail);

            // Update jawaban user dengan hasil dari AI
            await Promise.all(
                userAnswerResult.map(async (userAnswer) => {
                    return await userAnswerModel.updatedUserAnswer({
                        id: userAnswer.id,
                        is_correct: userAnswer.is_correct
                    });
                })
            );

            // Hitung skor menggunakan scoreService
            const scoreResult = await scoreService.calculateScore({
                quiz_id: quizId,
                user_id: userId,
                total_questions: questions.length,
                checked_answers: userAnswerResult
            });

            // Susun hasil akhir
            const result = {
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    topic: quiz.topic,
                    total_questions: questions.length
                },
                user_id: userId,
                score: scoreResult,
                answers_detail: userAnswerResult,
                completed_at: new Date(),
                summary: {
                    total_questions: questions.length,
                    correct_answers: userAnswerResult.filter(a => a.is_correct).length,
                    incorrect_answers: userAnswerResult.filter(a => !a.is_correct).length,
                    accuracy_percentage: scoreResult.percentage
                }
            };

            return result;

        } catch (error) {
            throw new Error('Gagal menghitung hasil kuis: ' + error.message);
        }
    }

    // // Mendapatkan hasil kuis yang sudah ada berdasarkan user dan quiz
    // async getExistingResult(quizId, userId) {
    //     try {
    //         if (!quizId || !userId) {
    //             throw new Error('Quiz ID dan User ID wajib ada');
    //         }

    //         // Ambil data quiz
    //         const quiz = await quizModel.getQuizById(quizId);
    //         if (!quiz) {
    //             throw new Error('Quiz tidak ditemukan');
    //         }

    //         // Ambil jawaban user
    //         const userAnswers = await userAnswerModel.getByQuizId(quizId, userId);
    //         if (!userAnswers || userAnswers.length === 0) {
    //             return null; // Belum ada hasil
    //         }

    //         // Ambil pertanyaan
    //         const questions = await questionModel.findByQuizId(quizId);

    //         // Susun hasil tanpa re-checking dengan AI
    //         const answersDetail = userAnswers.map(userAnswer => {
    //             const question = questions.find(q => q.id === userAnswer.question_id);
    //             return {
    //                 question_id: question.id,
    //                 question_text: question.question_text,
    //                 fact_answer: question.fact_answer,
    //                 user_answer: userAnswer.answer_text,
    //                 is_correct: userAnswer.is_correct
    //             };
    //         });

    //         const correctAnswers = answersDetail.filter(a => a.is_correct).length;
    //         const accuracy = (correctAnswers / questions.length) * 100;

    //         return {
    //             quiz: {
    //                 id: quiz.id,
    //                 title: quiz.title,
    //                 topic: quiz.topic,
    //                 total_questions: questions.length
    //             },
    //             user_id: userId,
    //             answers_detail: answersDetail,
    //             summary: {
    //                 total_questions: questions.length,
    //                 correct_answers: correctAnswers,
    //                 incorrect_answers: questions.length - correctAnswers,
    //                 accuracy_percentage: accuracy
    //             }
    //         };

    //     } catch (error) {
    //         throw new Error('Gagal mengambil hasil kuis: ' + error.message);
    //     }
    // }

    // // Mendapatkan semua hasil kuis untuk user tertentu
    // async getUserResults(userId) {
    //     try {
    //         if (!userId) {
    //             throw new Error('User ID wajib ada');
    //         }

    //         // Ambil semua jawaban user
    //         const userAnswers = await userAnswerModel.getByUserId(userId);
    //         if (!userAnswers || userAnswers.length === 0) {
    //             return [];
    //         }

    //         // Group by quiz_id
    //         const quizGroups = userAnswers.reduce((groups, answer) => {
    //             if (!groups[answer.quiz_id]) {
    //                 groups[answer.quiz_id] = [];
    //             }
    //             groups[answer.quiz_id].push(answer);
    //             return groups;
    //         }, {});

    //         // Process setiap quiz
    //         const results = await Promise.all(
    //             Object.keys(quizGroups).map(async (quizId) => {
    //                 return await this.getExistingResult(parseInt(quizId), userId);
    //             })
    //         );

    //         return results.filter(result => result !== null);

    //     } catch (error) {
    //         throw new Error('Gagal mengambil hasil user: ' + error.message);
    //     }
    // }

    // // Re-evaluate jawaban dengan AI (untuk kasus khusus)
    // async reEvaluateAnswers(quizId, userId) {
    //     try {
    //         return await this.calculateQuizResult(quizId, userId);
    //     } catch (error) {
    //         throw new Error('Gagal mengevaluasi ulang jawaban: ' + error.message);
    //     }
    // }
}

export default new ResultService();