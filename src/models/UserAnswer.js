import client from '../config/database.js';

export const userAnswerModel = {
  /**
   * Create a new user answer
   * NOTE: quiz_session_id required (NOT NULL in DDL)
   */
  createUserAnswer: async ({
    user_id,
    quiz_id,
    question_id,
    quiz_session_id,
    user_answer = null,
    is_correct = null,
    score = null,
    answered_at = null
  }) => {
    if (!user_id) throw new Error('user_id is required');
    if (!quiz_id) throw new Error('quiz_id is required');
    if (!question_id) throw new Error('question_id is required');
    if (!quiz_session_id) throw new Error('quiz_session_id is required');

    const query = {
      text: `INSERT INTO user_answers (user_id, quiz_id, question_id, quiz_session_id, user_answer, is_correct, score, answered_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
      values: [user_id, quiz_id, question_id, quiz_session_id, user_answer, is_correct, score, answered_at]
    };
    const result = await client.query(query);
    return result.rows[0];
  },

  // Get all user answers (newest first)
  findAllUserAnswer: async () => {
    const query = {
      text: `SELECT * FROM user_answers ORDER BY created_at DESC`
    };
    const result = await client.query(query);
    return result.rows;
  },

  // Get user answers by user ID
  findUserAnswersByUserId: async (user_id) => {
    const query = {
      text: `SELECT * FROM user_answers WHERE user_id = $1 ORDER BY created_at DESC`,
      values: [user_id]
    };
    const result = await client.query(query);
    return result.rows;
  },

  // Get user answers by quiz ID (optional filter by user_id)
  // Usage: findUserAnswersByQuizId(quiz_id) or findUserAnswersByQuizId(quiz_id, user_id)
  findUserAnswersByQuizId: async (quiz_id, user_id = null) => {
    if (user_id) {
      const query = {
        text: `SELECT * FROM user_answers WHERE quiz_id = $1 AND user_id = $2 ORDER BY created_at DESC`,
        values: [quiz_id, user_id]
      };
      const result = await client.query(query);
      return result.rows;
    } else {
      const query = {
        text: `SELECT * FROM user_answers WHERE quiz_id = $1 ORDER BY created_at DESC`,
        values: [quiz_id]
      };
      const result = await client.query(query);
      return result.rows;
    }
  },

  // Get user answers by quiz_session_id
  findUserAnswersByQuizSessionId: async (quiz_session_id) => {
    const query = {
      text: `SELECT * FROM user_answers WHERE quiz_session_id = $1 ORDER BY created_at ASC`,
      values: [quiz_session_id]
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

  /**
   * Update a user answer (partial update).
   * Accepts any of: user_id, quiz_id, question_id, quiz_session_id, user_answer, is_correct, score, answered_at
   * Automatically updates updated_at to current timestamp.
   */
  updateUserAnswer: async ({ id, user_id, quiz_id, question_id, quiz_session_id, user_answer, is_correct, score, answered_at }) => {
    if (!id) throw new Error('id is required for update');

    const fields = [];
    const values = [];
    let idx = 1;

    if (user_id !== undefined) { fields.push(`user_id = $${idx++}`); values.push(user_id); }
    if (quiz_id !== undefined) { fields.push(`quiz_id = $${idx++}`); values.push(quiz_id); }
    if (question_id !== undefined) { fields.push(`question_id = $${idx++}`); values.push(question_id); }
    if (quiz_session_id !== undefined) { fields.push(`quiz_session_id = $${idx++}`); values.push(quiz_session_id); }
    if (user_answer !== undefined) { fields.push(`user_answer = $${idx++}`); values.push(user_answer); }
    // is_correct can be boolean or null — check for explicit undefined
    if (is_correct !== undefined) { fields.push(`is_correct = $${idx++}`); values.push(is_correct); }
    if (score !== undefined) { fields.push(`score = $${idx++}`); values.push(score); }
    if (answered_at !== undefined) { fields.push(`answered_at = $${idx++}`); values.push(answered_at); }

    // always update updated_at
    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    if (fields.length === 0) {
      throw new Error('No fields provided to update');
    }

    const query = {
      text: `UPDATE user_answers SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
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


export default userAnswerModel;
