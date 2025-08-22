 
import { quizModel } from '../models/quizModel.js';
import { questionModel } from '../models/questionModel.js';
import openAiService from '../services/openaiService.js';

class QuizService {
  // Membuat kuis baru dan menghasilkan 10 pertanyaan
  async createQuestion({ id }) {
    try {
      // Validasi input
      if (!id ) {
        throw new Error('id Quiz topic wajib ada');
      }

      // Buat kuis di database
      const quiz = await quizModel.findQuizById(id);
      if (!quiz) {
        throw new Error('Quiz tidak ada');
      }

      // Generate 10 pertanyaan menggunakan OpenAI
      const questions = await openAiService.generateQuiz({total_soal: quiz.total_questions, status_soal: quiz.question_statuses });


      // Validasi jumlah pertanyaan
      if (!Array.isArray(questions) || questions.length !== quiz.total_questions) {
        throw new Error('AI  harus menghasilkan tepat 10 pertanyaan');
      }

      // Simpan pertanyaan ke database
      const savedQuestions = await Promise.all(
        questions.map(async (q) => {
          if (!q.question_text || !q.fact_answer || !q.options || !Array.isArray(q.options)) {
            throw new Error('Format pertanyaan dari OpenAI tidak valid');
          }
          return await questionModel.createQuestion({
            quiz_id: quiz.id,
            question_text: q.question_text,
            fact_answer: q.fact_answer,
            created_by_ai: true,
          });
        })
      );

      return { quiz, questions: savedQuestions };
    } catch (error) {
      throw new Error('Gagal membuat kuis: ' + error.message);
    }
  }

  // Mendapatkan semua kuis
  async getAllQuizzes() {
    try {
      const quizzes = await quizModel.getAllQuizzes();
      return quizzes;
    } catch (error) {
      throw new Error('Gagal mengambil daftar kuis: ' + error.message);
    }
  }

  // Mendapatkan kuis berdasarkan ID beserta pertanyaannya
  async getQuizById(id) {
    try {
      const quiz = await quizModel.getQuizById(id);
      if (!quiz) {
        throw new Error('Kuis tidak ditemukan');
      }
      return quiz;
    } catch (error) {
      throw new Error('Gagal mengambil kuis: ' + error.message);
    }
  }

  // Memperbarui kuis
  async updateQuiz(id, { title, topic }) {
    try {
      const quiz = await quizModel.getQuizById(id);
      if (!quiz) {
        throw new Error('Kuis tidak ditemukan');
      }
      const updatedQuiz = await quizModel.updateQuiz(id, { title, topic });
      return updatedQuiz;
    } catch (error) {
      throw new Error('Gagal memperbarui kuis: ' + error.message);
    }
  }

  // Menghapus kuis (otomatis menghapus pertanyaan karena ON DELETE CASCADE)
  async deleteQuiz(id) {
    try {
      const quiz = await quizModel.deleteQuiz(id);
      if (!quiz) {
        throw new Error('Kuis tidak ditemukan');
      }
      return { message: 'Kuis berhasil dihapus' };
    } catch (error) {
      throw new Error('Gagal menghapus kuis: ' + error.message);
    }
  }

  // Memperbarui pertanyaan
  async updateQuestion(id, { question_text, fact_answer, options }) {
    try {
      const question = await questionModel.getQuestionById(id);
      if (!question) {
        throw new Error('Pertanyaan tidak ditemukan');
      }
      const updatedQuestion = await questionModel.updateQuestion(id, {
        question_text,
        fact_answer,
        options,
      });
      return updatedQuestion;
    } catch (error) {
      throw new Error('Gagal memperbarui pertanyaan: ' + error.message);
    }
  }

  // Menghapus pertanyaan
  async deleteQuestion(id) {
    try {
      const question = await questionModel.deleteQuestion(id);
      if (!question) {
        throw new Error('Pertanyaan tidak ditemukan');
      }
      return { message: 'Pertanyaan berhasil dihapus' };
    } catch (error) {
      throw new Error('Gagal menghapus pertanyaan: ' + error.message);
    }
  }
}

export default new QuizService();