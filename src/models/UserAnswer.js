import client from '../config/database.js'; 


export const userAnswerModel = {
  // Create a new user answer
  createUserAnswer: async ({ user_id, quiz_id, question_id, user_answer, is_correct, score = 0 }) => {
    const query = {
      text: `INSERT INTO user_answers (user_id, quiz_id, question_id, user_answer, is_correct, score) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      values: [user_id, quiz_id, question_id, user_answer, is_correct, score]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Get all user answers
  findAllUserAnswer: async () => {
    const query = {
      text: `SELECT * FROM user_answers`
    };
    const result = await client.query(query);
    return result.rows;
  },

  // Get user answers by user ID
  findUserAnswersByUserId: async (user_id) => {
    const query = {
      text: `SELECT * FROM user_answers WHERE user_id = $1`,
      values: [user_id]
    };
    const result = await client.query(query);
    return result.rows;
  },

  // Get user answers by quiz ID
  findUserAnswersByQuizId: async (quiz_id) => {
    const query = {
      text: `SELECT * FROM user_answers WHERE quiz_id = $1`,
      values: [quiz_id]
    };
    const result = await client.query(query);
  return result.rows;
  },

  // Get user answer by ID
  findUserAnswerById: async (id) => {
    const query = {
      text: `SELECT * FROM user_answers WHERE id = $1`,
      values: [id]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Update a user answer
  updateUserAnswer: async ({ id, user_id, quiz_id, question_id, user_answer, is_correct, score }) => {
    const fields = [];
    const values = [];
    let i = 1;

    if (user_id) { fields.push(`user_id=$${i++}`); values.push(user_id); }
    if (quiz_id) { fields.push(`quiz_id=$${i++}`); values.push(quiz_id); }
    if (question_id) { fields.push(`question_id=$${i++}`); values.push(question_id); }
    if (user_answer) { fields.push(`user_answer=$${i++}`); values.push(user_answer); }
    if (typeof is_correct === 'boolean') { fields.push(`is_correct=$${i++}`); values.push(is_correct); }
    if (score !== undefined) { fields.push(`score=$${i++}`); values.push(score); }
    fields.push(`answered_at=$${i++}`); values.push(new Date());

    const query = {
      text: `UPDATE user_answers SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`,
      values: [...values, id]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Delete a user answer
  deleteUserAnswer: async (id) => {
    const query = {
      text: `DELETE FROM user_answers WHERE id = $1 RETURNING *`,
      values: [id]
    };
    const result = await client.query(query);
    return result.rows[0];
  }
};