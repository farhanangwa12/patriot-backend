import client from '../config/database.js';

export const quizModel = {
  // Create a new quiz
  createQuiz: async ({ title = 'Quiz Patriotisme', description, total_questions = 10 }) => {
    const query = {
      text: `INSERT INTO quizzes (title, description,ss , total_questions) 
             VALUES ($1, $2, $3) RETURNING *`,
      values: [title, description, total_questions]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Get all quizzes
  findAllQuiz: async () => {
    const query = {
      text: `SELECT * FROM quizzes`
    };
    const result = await client.query(query);
    return result.rows;
  },

  // Get a quiz by ID
  findQuizById: async (id) => {
    const query = {
      text: `SELECT * FROM quizzes WHERE id = $1`,
      values: [id]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Update a quiz
  updateQuiz: async ({ id, title, description, total_questions }) => {
    const updatedAt = new Date();
    const fields = [];
    const values = [];
    let i = 1;

    if (title) { fields.push(`title=$${i++}`); values.push(title); }
    if (description) { fields.push(`description=$${i++}`); values.push(description); }
    if (total_questions) { fields.push(`total_questions=$${i++}`); values.push(total_questions); }
    fields.push(`updated_at=$${i++}`); values.push(updatedAt);

    const query = {
      text: `UPDATE quizzes SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`,
      values: [...values, id]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Delete a quiz
  deleteQuiz: async (id) => {
    const query = {
      text: `DELETE FROM quizzes WHERE id = $1 RETURNING *`,
      values: [id]
    };
    const result = await client.query(query);
    return result.rows[0];
  }
};