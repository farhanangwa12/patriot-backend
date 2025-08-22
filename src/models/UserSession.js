import client from '../config/database.js';


export const quizSessionModel = {
    // Create a new quiz session
    createQuizSession: async ({ user_id, quiz_id, total_score = 0, max_score = 100, percentage = 0.00, completed_at }) => {
        const query = {
            text: `INSERT INTO quiz_sessions (user_id, quiz_id, total_score, max_score, percentage, completed_at) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            values: [user_id, quiz_id, total_score, max_score, percentage, completed_at]
        };
        const result = await client.query(query);
        return result.rows[0];
    },

    // Get all quiz sessions
    findAllQuizSession: async () => {
        const query = {
            text: `SELECT * FROM quiz_sessions`
        };
        const result = await client.query(query);
        return result.rows;
    },

    // Get quiz sessions by user ID
    findQuizSessionsByUserId: async (user_id) => {
        const query = {
            text: `SELECT * FROM quiz_sessions WHERE user_id = $1`,
            values: [user_id]
        };
        const result = await client.query(query);
        return result.rows;
    },

    // Get quiz sessions by quiz ID
    findQuizSessionsByQuizId: async (quiz_id) => {
        const query = {
            text: `SELECT * FROM quiz_sessions WHERE quiz_id = $1`,
            values: [quiz_id]
        };
        const result = await client.query(query);
        return result.rows;
    },

    // Get a quiz session by ID
    findQuizSessionById: async (id) => {
        const query = {
            text: `SELECT * FROM quiz_sessions WHERE id = $1`,
            values: [id]
        };
        const result = await client.query(query);
        return result.rows[0];
    },

    // Update a quiz session
    updateQuizSession: async ({ id, user_id, quiz_id, total_score, max_score, percentage, completed_at }) => {
        const fields = [];
        const values = [];
        let i = 1;

        if (user_id) { fields.push(`user_id=$${i++}`); values.push(user_id); }
        if (quiz_id) { fields.push(`quiz_id=$${i++}`); values.push(quiz_id); }
        if (total_score !== undefined) { fields.push(`total_score=$${i++}`); values.push(total_score); }
        if (max_score !== undefined) { fields.push(`max_score=$${i++}`); values.push(max_score); }
        if (percentage !== undefined) { fields.push(`percentage=$${i++}`); values.push(percentage); }
        if (completed_at !== undefined) { fields.push(`completed_at=$${i++}`); values.push(completed_at); }

        const query = {
            text: `UPDATE quiz_sessions SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`,
            values: [...values, id]
        };
        const result = await client.query(query);
        return result.rows[0];
    },

    // Delete a quiz session
    deleteQuizSession: async (id) => {
        const query = {
            text: `DELETE FROM quiz_sessions WHERE id = $1 RETURNING *`,
            values: [id]
        };
        const result = await client.query(query);
        return result.rows[0];
    }
};