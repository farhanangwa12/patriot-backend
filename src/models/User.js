
import client from '../config/database.js';
import bcrypt from 'bcrypt';

export const userModel = {
    getUserByEmail: async ({ email, password }) => {

        const query = {
            text: 'SELECT id, name, email, password WHERE email = $1',
            values: [email]
        }
        const result = await client.query(query);
        const user = result.rows[0];
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
        } else {
            return null;

        }

    },
    createUser: async ({ name, email, password }) => {
        const createdAt = new Date();
        const hashedPassword = await bcrypt.hash(password, 10); // hash password

        const query = {
            text: 'INSERT INTO users (name, email, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            values: [name, email, hashedPassword, createdAt, createdAt]
        };
        const result = await client.query(query);
        return result.rows[0]; // kembalikan user yang baru dibuat
    },

    updateUser: async ({ id, name, email, password }) => {
        const updatedAt = new Date();
        let hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        // Buat query dinamis supaya password opsional
        const fields = [];
        const values = [];
        let i = 1;

        if (name) { fields.push(`name=$${i++}`); values.push(name); }
        if (email) { fields.push(`email=$${i++}`); values.push(email); }
        if (hashedPassword) { fields.push(`password=$${i++}`); values.push(hashedPassword); }

        fields.push(`updated_at=$${i++}`); values.push(updatedAt);

        const query = {
            text: `UPDATE users SET ${fields.join(', ')} WHERE id=$${i} RETURNING *`,
            values: [...values, id]
        };

        const result = await client.query(query);
        return result.rows[0];
    },

    deleteUser: async (id) => {
        const query = {
            text: 'DELETE FROM users WHERE id=$1 RETURNING *',
            values: [id]
        };
        const result = await client.query(query);
        return result.rows[0]; // kembalikan user yang dihapus
    }
};


