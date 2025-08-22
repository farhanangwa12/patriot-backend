
import { userAnswerModel } from '../models/userAnswerModel.js';
import { quizModel } from '../models/quizModel.js';

class ScoreService {
    // Menghitung skor berdasarkan quiz_id dan user_id
    async calculateScore({ quiz_id, user_id, total_questions, checked_answers }) {
        try {
            // Validasi input
            if (!quiz_id) {
                throw new Error('Quiz ID wajib ada');
            }

            if (!user_id) {
                throw new Error('User ID wajib ada');
            }

            // Ambil data quiz untuk mendapatkan total questions jika tidak disediakan
            if (!total_questions) {
                const quiz = await quizModel.findQuizById(quiz_id);
                if (!quiz) {
                    throw new Error('Quiz tidak ditemukan');
                }
                total_questions = quiz.total_questions;
            }

            // Ambil jawaban user berdasarkan quiz_id
            const userAnswers = await userAnswerModel.findUserAnswersByQuizId(quiz_id, user_id);
            if (!userAnswers || userAnswers.length === 0) {
                throw new Error('Tidak ada jawaban user untuk quiz ini');
            }

            // Hitung nilai per soal (100 dibagi total questions)
            const scorePerQuestion = 100 / total_questions;

            // Hitung total skor
            let totalScore = 0;
            let correctAnswers = 0;
            let incorrectAnswers = 0;

            // Iterasi setiap jawaban user
            userAnswers.forEach((userAnswer) => {
                if (userAnswer.is_correct === true) {
                    totalScore += scorePerQuestion;
                    correctAnswers++;
                } else {
                    incorrectAnswers++;
                }
            });

            // Bulatkan skor ke 2 desimal
            totalScore = Math.round(totalScore * 100) / 100;

            // Hitung persentase
            const percentage = Math.round((correctAnswers / total_questions) * 100 * 100) / 100;

            // Tentukan grade berdasarkan skor
            const grade = this.calculateGrade(totalScore);

            // Susun hasil skor
            const scoreResult = {
                quiz_id: quiz_id,
                user_id: user_id,
                total_questions: total_questions,
                score_per_question: Math.round(scorePerQuestion * 100) / 100,
                correct_answers: correctAnswers,
                incorrect_answers: incorrectAnswers,
                total_score: totalScore,
                max_score: 100,
                percentage: percentage,
                grade: grade,
                calculated_at: new Date()
            };

            // Buat quiz session di database
            const quizSession = await quizSessionModel.createQuizSession({
                user_id: user_id,
                quiz_id: quiz_id,
                total_score: totalScore,
                max_score: 100,
                percentage: percentage,
                completed_at: new Date()
            });

            scoreResult.session_created_at = quizSession.created_at;

            return scoreResult;

        } catch (error) {
            throw new Error('Gagal menghitung skor: ' + error.message);
        }
    }

    // Menghitung grade berdasarkan skor
    calculateGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C+';
        if (score >= 50) return 'C';
        if (score >= 40) return 'D+';
        if (score >= 30) return 'D';
        return 'E';
    }

    // Menghitung skor untuk multiple quiz (leaderboard)
    async calculateUserScores(user_id) {
        try {
            if (!user_id) {
                throw new Error('User ID wajib ada');
            }

            // Ambil semua jawaban user
            const allUserAnswers = await userAnswerModel.findUserAnswersByUserId(user_id);
            if (!allUserAnswers || allUserAnswers.length === 0) {
                return [];
            }

            // Group jawaban berdasarkan quiz_id
            const quizGroups = allUserAnswers.reduce((groups, answer) => {
                if (!groups[answer.quiz_id]) {
                    groups[answer.quiz_id] = [];
                }
                groups[answer.quiz_id].push(answer);
                return groups;
            }, {});

            // Hitung skor untuk setiap quiz
            const scores = await Promise.all(
                Object.keys(quizGroups).map(async (quizId) => {
                    return await this.calculateScore({
                        quiz_id: parseInt(quizId),
                        user_id: user_id
                    });
                })
            );

            return scores;

        } catch (error) {
            throw new Error('Gagal menghitung skor user: ' + error.message);
        }
    }

    // Menghitung statistik skor untuk quiz tertentu
    async getQuizScoreStatistics(quiz_id) {
        try {
            if (!quiz_id) {
                throw new Error('Quiz ID wajib ada');
            }

            // Ambil quiz info
            const quiz = await quizModel.findQuizById(quiz_id);
            if (!quiz) {
                throw new Error('Quiz tidak ditemukan');
            }

            // Ambil semua jawaban untuk quiz ini
            const allAnswers = await userAnswerModel.findAnswersByQuizId(quiz_id);
            if (!allAnswers || allAnswers.length === 0) {
                return {
                    quiz_id: quiz_id,
                    total_participants: 0,
                    statistics: null
                };
            }

            // Group by user_id
            const userGroups = allAnswers.reduce((groups, answer) => {
                if (!groups[answer.user_id]) {
                    groups[answer.user_id] = [];
                }
                groups[answer.user_id].push(answer);
                return groups;
            }, {});

            // Hitung skor setiap user
            const userScores = await Promise.all(
                Object.keys(userGroups).map(async (userId) => {
                    return await this.calculateScore({
                        quiz_id: quiz_id,
                        user_id: parseInt(userId),
                        total_questions: quiz.total_questions
                    });
                })
            );

            // Hitung statistik
            const scores = userScores.map(s => s.total_score);
            const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
            const highestScore = Math.max(...scores);
            const lowestScore = Math.min(...scores);

            // Distribusi grade
            const gradeDistribution = userScores.reduce((dist, score) => {
                dist[score.grade] = (dist[score.grade] || 0) + 1;
                return dist;
            }, {});

            return {
                quiz_id: quiz_id,
                quiz_title: quiz.title,
                total_participants: userScores.length,
                statistics: {
                    average_score: Math.round(averageScore * 100) / 100,
                    highest_score: highestScore,
                    lowest_score: lowestScore,
                    grade_distribution: gradeDistribution,
                    pass_rate: Math.round((userScores.filter(s => s.total_score >= 60).length / userScores.length) * 100 * 100) / 100
                }
            };

        } catch (error) {
            throw new Error('Gagal menghitung statistik quiz: ' + error.message);
        }
    }

    // Validasi jawaban yang benar/salah
    validateAnswerScore(userAnswer, scorePerQuestion) {
        if (userAnswer.is_correct === true) {
            return scorePerQuestion;
        }
        return 0;
    }
}

export default new ScoreService();