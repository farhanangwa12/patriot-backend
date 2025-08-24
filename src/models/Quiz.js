import client from '../config/database.js';

export const quizModel = {
  // Create a new quiz
  createQuiz: async ({
    title = 'Quiz Patriotisme',
    description,
    topic = 'patriotisme',
    question_statuses = [],
    total_questions = 10
  }) => {
    const query = {
      text: `
        INSERT INTO quizzes (title, description, topic, question_statuses, total_questions) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
      values: [title, description, topic, JSON.stringify(question_statuses), total_questions]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Get all quizzes
  findAllQuiz: async () => {
    const query = {
      text: `SELECT * FROM quizzes WHERE deleted_at IS NULL`
    };
    const result = await client.query(query);
    return result.rows;
  },

  // Get a quiz by ID
  findQuizById: async (id, showDeleted = false) => {
    let query;

    if (showDeleted) {
      query = {
        text: `SELECT * FROM quizzes WHERE id = $1`,
        values: [id],
      };
    } else {
      query = {
        text: `SELECT * FROM quizzes WHERE id = $1 AND deleted_at IS NULL`,
        values: [id],
      };
    }

    const result = await client.query(query);
    return result.rows[0];
  },



  // Update quiz
  updateQuiz: async ({ id, title, description, topic, question_statuses, total_questions }) => {
    const updatedAt = new Date();
    const fields = [];
    const values = [];
    let i = 1;

    if (title) { fields.push(`title=$${i++}`); values.push(title); }
    if (description) { fields.push(`description=$${i++}`); values.push(description); }
    if (topic) { fields.push(`topic=$${i++}`); values.push(topic); }
    if (question_statuses) {
      fields.push(`question_statuses=$${i++}`);
      values.push(JSON.stringify(question_statuses));
    }
    if (total_questions) { fields.push(`total_questions=$${i++}`); values.push(total_questions); }
    fields.push(`updated_at=$${i++}`); values.push(updatedAt);

    const query = {
      text: `UPDATE quizzes SET ${fields.join(', ')} WHERE id=$${i} AND deleted_at IS NULL RETURNING *`,
      values: [...values, id]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Delete a quiz
  deleteQuiz: async (id) => {
    const query = {
      text: `UPDATE quizzes SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
      values: [id]
    };
    const result = await client.query(query);
    return result.rows[0];
  }
};


export default quizModel;