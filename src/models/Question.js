import client from '../config/database.js';

export const questionModel = {
  // Create a new question
  createQuestion: async ({ quiz_id, question_text, fact_answer, question_type = 'essay', created_by_ai = true }) => {
    const query = {
      text: `INSERT INTO questions (quiz_id, question_text, fact_answer, question_type, created_by_ai) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      values: [quiz_id, question_text, fact_answer, question_type, created_by_ai]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Get all questions
  findAllQuestion: async () => {
    const query = {
      text: `SELECT * FROM questions`
    };
    const result = await client.query(query);
    return result.rows;
  },

  // Get questions by quiz ID
  findQuestionsByQuizId: async (quiz_id) => {
    const query = {
      text: `SELECT * FROM questions WHERE quiz_id = $1`,
      values: [quiz_id]
    };
    const result = await client.query(query);
    return result.rows;
  },

  // Get a question by ID
  findQuestionById: async (id) => {
    const query = {
      text: `SELECT * FROM questions WHERE id = $1`,
      values: [id]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Update a question
  updateQuestion: async ({ id, quiz_id, question_text, fact_answer, question_type, created_by_ai }) => {
    const fields = [];
    const values = [];
    let i = 1;

    if (quiz_id) { fields.push(`quiz_id=$${i++}`); values.push(quiz_id); }
    if (question_text) { fields.push(`question_text=$${i++}`); values.push(question_text); }
    if (fact_answer) { fields.push(`fact_answer=$${i++}`); values.push(fact_answer); }
    if (question_type) { fields.push(`question_type=$${i++}`); values.push(question_type); }
    if (typeof created_by_ai === 'boolean') { fields.push(`created_by_ai=$${i++}`); values.push(created_by_ai); }

    const query = {
      text: `UPDATE questions SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`,
      values: [...values, id]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Delete a question
  deleteQuestion: async (id) => {
    const query = {
      text: `DELETE FROM questions WHERE id = $1 RETURNING *`,
      values: [id]
    };
    const result = await client.query(query);
    return result.rows[0];
  }
};

export default questionModel;
