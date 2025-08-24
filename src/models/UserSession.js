import client from '../config/database.js';


export const quizSessionModel = {
    // Create a new quiz session
    createQuizSession: async ({ user_id, quiz_id, total_score = 0, max_score = 100, percentage = 0.00, completed_at = null }) => {
        if (!user_id) throw new Error('user_id is required');
        if (!quiz_id) throw new Error('quiz_id is required');

        const query = {
            text: `INSERT INTO quiz_sessions (user_id, quiz_id, total_score, max_score, percentage, completed_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            values: [user_id, quiz_id, total_score, max_score, percentage, completed_at]
        };

        const result = await client.query(query);
        return result.rows[0];
    },

    // Get all quiz sessions (newest first)
    findAllQuizSession: async () => {
        const query = {
            text: `SELECT * FROM quiz_sessions ORDER BY created_at DESC`
        };
        const result = await client.query(query);
        return result.rows;
    },

    // Get quiz sessions by user ID
    findQuizSessionsByUserId: async (user_id) => {
        const query = {
            text: `
            SELECT 
                qs.id AS id_session,
                u.name AS user_name,
                q.title AS quiz_title,
                qs.completed_at,
                COUNT(CASE WHEN ua.is_correct = TRUE THEN 1 END) AS jawaban_benar,
                COUNT(CASE WHEN ua.is_correct = FALSE THEN 1 END) AS jawaban_salah,
                q.total_questions AS total_soal
            FROM quiz_sessions qs
            JOIN users u ON qs.user_id = u.id
            JOIN quizzes q ON qs.quiz_id = q.id
            LEFT JOIN user_answers ua ON qs.id = ua.quiz_session_id
            WHERE qs.user_id = $1
            GROUP BY qs.id, u.name, q.title, qs.completed_at, q.total_questions
            ORDER BY qs.created_at DESC
        `,
            values: [user_id]
        };

        const result = await client.query(query);

        // Hitung akurasi di JS
        return result.rows.map(row => {
            const benar = Number(row.jawaban_benar) || 0;
            const total = Number(row.total_soal) || 0;
            const akurasi = total > 0 ? ((benar / total) * 100).toFixed(2) : "0.00";

            return {
                id_session: row.id_session,
                user_name: row.user_name,
                quiz_title: row.quiz_title,
                completed_at: row.completed_at,
                jawaban_benar: benar,
                jawaban_salah: Number(row.jawaban_salah) || 0,
                total_soal: total,
                akurasi
            };
        });
    },


    // Get quiz sessions by quiz ID
    findQuizSessionsByQuizId: async (quiz_id) => {
        const query = {
            text: `SELECT * FROM quiz_sessions WHERE quiz_id = $1 ORDER BY created_at DESC`,
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

    // Update a quiz session (partial update)
    updateQuizSession: async ({ id, user_id, quiz_id, total_score, max_score, percentage, completed_at }) => {
        if (!id) throw new Error('id is required for update');

        const fields = [];
        const values = [];
        let idx = 1;

        if (user_id !== undefined) { fields.push(`user_id = $${idx++}`); values.push(user_id); }
        if (quiz_id !== undefined) { fields.push(`quiz_id = $${idx++}`); values.push(quiz_id); }
        if (total_score !== undefined) { fields.push(`total_score = $${idx++}`); values.push(total_score); }
        if (max_score !== undefined) { fields.push(`max_score = $${idx++}`); values.push(max_score); }
        if (percentage !== undefined) { fields.push(`percentage = $${idx++}`); values.push(percentage); }
        if (completed_at !== undefined) { fields.push(`completed_at = $${idx++}`); values.push(completed_at); }

        if (fields.length === 0) {
            throw new Error('No fields provided to update');
        }

        // id is the last param
        values.push(id);
        const query = {
            text: `UPDATE quiz_sessions SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
            values
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

export default quizSessionModel;