
import quizModel from '../models/Quiz.js';
import userAnswerModel from '../models/UserAnswer.js';
import questionModel from '../models/Question.js';
import quizSessionModel from '../models/UserSession.js';
import userModel from '../models/User.js';
import { openAiService } from '../services/openaiService.js';

class ResultService {

    // Submit jawaban user
    /**
     * submitAnswerBulk: menerima bulk answers saja.
     * payload = { user_id, quiz_id, userAnswers: [{ question_id, answer | user_answer }, ...] }
     */
    async submitAnswer(payload) {
        try {
            const { user_id, quiz_id, userAnswers } = payload;

            // Basic validations
            if (!user_id) throw new Error('User ID wajib diisi');
            if (!quiz_id) throw new Error('Quiz ID wajib diisi');
            if (!Array.isArray(userAnswers) || userAnswers.length === 0) {
                throw new Error('userAnswers (array) wajib diisi dan tidak boleh kosong');
            }


            // Check user exists
            const user = await userModel.findById(user_id);
            if (!user) throw new Error('User tidak ditemukan');


            // Check quiz exists
            const quiz = await quizModel.findQuizById(quiz_id);
            if (!quiz) throw new Error('Quiz tidak ditemukan');


            const userSession = await quizSessionModel.createQuizSession({ user_id, quiz_id })

            // Validate all questions first (serial validation to provide clear errors)
            const validatedQuestions = {}; // map question_id -> question row
            for (const item of userAnswers) {
                const question_id = item.question_id ?? item.questionId ?? item.id;
                if (!question_id) throw new Error('Setiap item pada userAnswers harus memiliki question_id');

                const question = await questionModel.findQuestionById(question_id);
                if (!question) throw new Error(`Question dengan id ${question_id} tidak ditemukan`);

                // If question has quiz_id field, ensure it belongs to the provided quiz_id
                if (question.quiz_id !== undefined && question.quiz_id !== null) {
                    if (Number(question.quiz_id) !== Number(quiz_id)) {
                        throw new Error(`Question ${question_id} tidak termasuk dalam quiz ${quiz_id}`);
                    }
                }

                validatedQuestions[question_id] = question;
            }

            // Build insert promises
            const insertPromises = userAnswers.map((item) => {
                const question_id = item.question_id ?? item.questionId ?? item.id;
                const user_answer = (item.answer ?? item.user_answer ?? null);

                const question = validatedQuestions[question_id];

                // Determine answered_at, is_correct, score
                let is_correct = null;
                let score = null;
                let answered_at = null;

                const hasAnswered = user_answer !== null && user_answer !== undefined && String(user_answer).trim() !== '';
                if (hasAnswered) {
                    const correctAnswer = String(question.fact_answer ?? '').trim().toLowerCase();
                    const given = String(user_answer).trim().toLowerCase();
                    is_correct = (correctAnswer === given);
                    score = is_correct ? 1 : 0;
                    answered_at = new Date();
                } else {
                    // belum menjawab
                    is_correct = null;
                    score = null;
                    answered_at = null;
                }

                // call model createUserAnswer (updated to accept answered_at)
                return userAnswerModel.createUserAnswer({
                    user_id,
                    quiz_id,
                    question_id,
                    quiz_session_id: userSession.id,
                    user_answer,
                    is_correct,
                    score,
                    answered_at
                });
            });

            // Execute all inserts in parallel
            await Promise.all(insertPromises);



            return userSession;

        } catch (err) {
            throw new Error('Gagal submit bulk answers: ' + err.message);
        }
    }

    // Menghitung hasil kuis berdasarkan quiz_id
    async calculateQuizResult(quiz_session_id) {
        try {


            // Ambil data quiz
            const quizSession = await quizSessionModel.findQuizSessionById(quiz_session_id);
            if (!quizSession) {
                throw new Error('Quiz session tidak ditemukan');
            }


            const questions = await questionModel.findQuestionsByQuizId(quizSession.quiz_id);
            const userAnswers = await userAnswerModel.findUserAnswersByQuizSessionId(quizSession.id);
            // 2. prepare payload for OpenAI: map userAnswers -> include question & fact from questions
            const qaPayload = userAnswers.map(ua => {
                const q = questions.find(x => Number(x.id) === Number(ua.question_id));
                // Support multiple possible field names (question_name, question_text) and fact (fact, fact_answer)
                const questionText = q?.question_name ?? q?.question_text ?? q?.question ?? '';
                const factText = q?.fact ?? q?.fact_answer ?? q?.answer ?? '';
                return {
                    question: questionText,
                    fact: factText,
                    user_answer: ua.user_answer,
                    id: ua.id,
                    is_correct: ua.is_correct // can be true/false/null
                };
            });



            // 3. call OpenAI checker (send JSON string so prompt receives valid JSON)
            let aiReplyRaw = await openAiService.checkAnswerFromQuiz(JSON.stringify(qaPayload));
            // openAiService is expected to return a string containing JSON array.
            let aiResults;

            try {
                aiResults = JSON.parse(aiReplyRaw);
                if (!Array.isArray(aiResults)) throw new Error('AI reply is not an array');
            } catch (err) {
                // If parsing fails, surface helpful error
                throw new Error('Failed to parse AI response: ' + (err.message || aiReplyRaw));
            }




            // 4. determine per-question score based on quiz.total_soal
            const quiz = await quizModel.findQuizById(quizSession.quiz_id);
            const totalQuestions = Number(quiz?.total_soal ?? questions.length);
            if (!totalQuestions || totalQuestions <= 0) throw new Error('Invalid quiz total_soal');

            // integer per-question value (floor), per requirement
            const perQuestionScore = Math.floor(100 / totalQuestions);

            // 5. update each user answer based on AI result
            const updatePromises = aiResults.map(item => {
                // item expected: { id: <number>, is_correct: true/false }
                const id = item.id;
                // normalize possible string 'true'/'false' to boolean
                const is_correct = (item.is_correct === true || String(item.is_correct).toLowerCase() === 'true');
                const score = is_correct ? perQuestionScore : 0;

                // find existing userAnswer to keep other fields or answered_at
                const existing = userAnswers.find(u => Number(u.id) === Number(id));
                const answered_at = existing?.answered_at ?? new Date();

                // call update model (partial update)
                return userAnswerModel.updateUserAnswer({
                    id,
                    is_correct,
                    score,
                    answered_at
                });
            });

            const updatedAnswers = await Promise.all(updatePromises);

            // 6. recompute totals after updates
            const refreshedAnswers = await userAnswerModel.findUserAnswersByQuizSessionId(quiz_session_id);

            const correctCount = refreshedAnswers.filter(a => a.is_correct === true).length;
            const incorrectCount = refreshedAnswers.filter(a => a.is_correct === false).length;
            const totalScore = refreshedAnswers.reduce((sum, a) => sum + (Number(a.score) || 0), 0);

            // per your DDL, quiz_sessions.max_score default = 100
            const percentage = totalScore; // since perQuestionScore sum is computed against 100 (per requirement)

            const result = {
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    topic: quiz.topic,
                    total_questions: totalQuestions
                },
                quiz_session_id: quizSession.id,
                user_id: quizSession.user_id,
                total_score: totalScore,
                percentage,
                completed_at: new Date(),
                answers_detail: refreshedAnswers.map(a => ({
                    id: a.id,
                    question_id: a.question_id,
                    user_answer: a.user_answer,
                    is_correct: a.is_correct,
                    score: a.score,
                    answered_at: a.answered_at
                })),
                summary: {
                    total_questions: totalQuestions,
                    correct_answers: correctCount,
                    incorrect_answers: incorrectCount,
                    accuracy_percentage: percentage
                }
            };

            // 7. update quiz_session row with totals
            await quizSessionModel.updateQuizSession({
                id: quizSession.id,
                total_score: totalScore,
                percentage,
                completed_at: result.completed_at
            });

            return result;





        } catch (error) {
            throw new Error('Gagal menghitung hasil kuis: ' + error.message);
        }
    }


    async getAllResult(id) {
        try {
            const result = await quizSessionModel.findQuizSessionsByUserId(id);

            return result;

        }
        catch (err) {
            throw new Error('Gagal submit bulk answers: ' + err.message);
        }


    }
    async getResultById(id) {
        try {
            const quizSession = await quizSessionModel.findQuizSessionById(id);
          
            const quiz = await quizModel.findQuizById(quizSession.quiz_id, true);

            const questions = await questionModel.findQuestionsByQuizId(quizSession.quiz_id);
            const totalQuestions = Number(quiz?.total_questions ?? questions.length);
            const userAnswers = await userAnswerModel.findUserAnswersByQuizSessionId(quizSession.id);


            const correctCount = userAnswers.filter(a => a.is_correct === true).length;
            const incorrectCount = userAnswers.filter(a => a.is_correct === false).length;
            const totalScore = userAnswers.reduce((sum, a) => sum + (Number(a.score) || 0), 0);

            // per your DDL, quiz_sessions.max_score default = 100
            const percentage = totalScore; // since perQuestionScore sum is computed against 100 (per requirement)
            const result = {
                quiz: {
                    id: quiz.id,
                    title: quiz.title,
                    topic: quiz.topic,
                    total_questions: totalQuestions
                },
                quiz_session_id: quizSession.id,
                user_id: quizSession.user_id,
                total_score: totalScore,
                percentage,
                completed_at: new Date(),
                answers_detail: userAnswers.map(a => {
                    const question = questions.find(q => q.id === a.question_id); // cari soal yg cocok
                    return {
                        id: a.id,
                        question_id: a.question_id,
                        user_answer: a.user_answer,
                        is_correct: a.is_correct,
                        score: a.score,
                        answered_at: a.answered_at,
                        fact_answer: question ? question.fact_answer : null, // tambahkan fact_answer
                        question: question ? question.question_text : null
                    };
                }),
                summary: {
                    total_questions: totalQuestions,
                    correct_answers: correctCount,
                    incorrect_answers: incorrectCount,
                    accuracy_percentage: percentage
                }
            };

            return result;

        }
        catch (err) {
            throw new Error('Error mendapatkan data result : ' + err.message);
        }
    }
    async deleteResult(id) {
        try {
            const result = await quizSessionModel.deleteQuizSession(id);

            return result;

        }
        catch (err) {
            throw new Error('Gagal submit bulk answers: ' + err.message);
        }
    }

}

export default new ResultService();