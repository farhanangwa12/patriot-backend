// models/OtpModel.js
import client from '../config/database.js';

export const OtpModel = {
    // Simpan OTP baru
    createOTP: async (email, otp, expiresIn = 300) => {
        try {
            const expiresAt = new Date(Date.now() + expiresIn * 1000); // default 5 menit

            const query = `
        INSERT INTO otps (email, otp_code, expires_at, created_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING id, email, expires_at
      `;

            const values = [email, otp, expiresAt];
            const result = await client.query(query, values);

            return result.rows[0];
        } catch (error) {
            console.error("Error createOTP:", error);
            throw error;
        }
    },

    // Cek apakah OTP masih valid
    checkOTPIsValid: async (email, otp) => {
        try {
            const query = `
        SELECT *
        FROM otps
        WHERE email = $1
          AND otp_code = $2
          AND expires_at > NOW()
        ORDER BY created_at DESC
        LIMIT 1
      `;
            const values = [email, otp];
            const result = await client.query(query, values);

            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error("Error checkOTPIsValid:", error);
            throw error;
        }
    },

    // OtpModel.js
    deleteOTP: async (id) => {
        try {
            const query = `DELETE FROM otps WHERE id = $1 RETURNING *`;
            const values = [id];
            const result = await client.query(query, values);

            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (error) {
            console.error("Error deleteOTP:", error);
            throw error;
        }
    }

};

export default OtpModel;
