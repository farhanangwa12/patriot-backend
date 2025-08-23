import quizModel from '../models/Quiz.js';
import questionModel from '../models/Question.js';
import { openAiService } from '../services/openaiService.js';

class QuizService {
  // Membuat kuis baru dan menghasilkan 10 pertanyaan
  async createQuestion({ id }) {
    try {
      // Validasi input
      if (!id) {
        throw new Error('id Quiz topic wajib ada');
      }

      // Buat kuis di database
      const quiz = await quizModel.findQuizById(id);
      if (!quiz) {
        throw new Error('Quiz tidak ada');
      }

      // Generate 10 pertanyaan menggunakan OpenAI
      const questions = await openAiService.generateQuiz({ total_soal: quiz.total_questions, status_soal: quiz.question_statuses });


      // Validasi jumlah pertanyaan
      if (!Array.isArray(questions) || questions.length !== quiz.total_questions) {
        console.error(Array.isArray(questions));
        throw new Error('AI  harus menghasilkan tepat 10 pertanyaan');
      }

      // Simpan pertanyaan ke database
      const savedQuestions = await Promise.all(
        questions.map(async (q) => {
          if (!q.soal || !q.fakta) {
            throw new Error('Format pertanyaan dari OpenAI tidak valid');
          }
          return await questionModel.createQuestion({
            quiz_id: quiz.id,
            question_text: q.soal,
            fact_answer: q.fakta,
            created_by_ai: true,
          });
        })
      );

      return { quiz, questions: savedQuestions };
    } catch (error) {
      throw new Error('Gagal membuat kuis: ' + error.message);
    }
  }

  async createQuizez({ title, description, question_statuses, total_questions }) {
    try {
      // Validasi input wajib
      if (!title || !description || !question_statuses || !total_questions) {
        throw new Error('title, description, question_statuses, total_questions wajib ada');
      }

      // Panggil model untuk insert
      const quiz = await quizModel.createQuiz({
        title,
        description,
        question_statuses,
        total_questions
      });

      return quiz;
    } catch (error) {
      console.error('Error in createQuizez:', error.message);
      throw error;
    }
  }

  // Mendapatkan semua kuis
  async getAllQuizzes() {
    try {
      const quizzes = await quizModel.findAllQuiz();
      return quizzes;
    } catch (error) {
      throw new Error('Gagal mengambil semua kuis: ' + error.message);
    }
  }

  // Mendapatkan kuis berdasarkan ID beserta pertanyaannya
  async getQuizById(id) {
    try {
      const quiz = await quizModel.findQuizById(id);
      if (!quiz) {
        throw new Error('Kuis tidak ditemukan');
      }
      return quiz;
    } catch (error) {
      throw new Error('Gagal mengambil kuis: ' + error.message);
    }
  }

  // Memperbarui kuis
  async updateQuiz(id, { title, description, question_statuses, total_questions }) {
    try {
      const quiz = await quizModel.findQuizById(id);
      if (!quiz) {
        throw new Error('Kuis tidak ditemukan');
      }
      const updatedQuiz = await quizModel.updateQuiz({ id, title, description, question_statuses, total_questions });
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
      return true;
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

  async deleteQuestionByQuizId(id) {


    try {
      const question = await questionModel.deleteQuestionByQuizId(id);
      if (!question) {
        throw new Error('Pertanyaan tidak ditemukan');
      }
      return { message: 'Pertanyaan berhasil dihapus by quiz' };
    } catch (error) {
      throw new Error('Gagal menghapus pertanyaan by quiz: ' + error.message);
    }
  }


  async getQuestionByQuizId(id) {
    try {

      const question = await questionModel.findQuestionsByQuizId(id);
      return question;

    } catch (error) {
      throw new Error('Gagal mendapatkan question: ' + error.message);
    }

  }
}

export default new QuizService();