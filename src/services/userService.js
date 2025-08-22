
const userModel = require('../models/User');

class UserService {
    // Mendapatkan semua user
    async getAllUsers() {
        try {
            const users = await userModel.getAllUsers();
            return users;
        } catch (error) {
            throw new Error('Gagal mengambil daftar user: ' + error.message);
        }
    }

    // Mendapatkan user berdasarkan ID
    async getUserById(id) {
        try {
            const user = await userModel.getUserById(id);
            if (!user) {
                throw new Error('User tidak ditemukan');
            }
            return user;
        } catch (error) {
            throw new Error('Gagal mengambil user: ' + error.message);
        }
    }

    // Autentikasi user berdasarkan email dan password
    async authenticateUser({ email, password }) {
        try {
            const user = await userModel.getUserByEmail(email);
            if (!user) {
                throw new Error('Email atau password salah');
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new Error('Email atau password salah');
            }
            // Kembalikan data user tanpa password
            const { password: _, ...userData } = user;
            return userData;
        } catch (error) {
            throw new Error('Gagal autentikasi: ' + error.message);
        }
    }

    // Membuat user baru
    async createUser({ name, email, password }) {
        try {
            // Validasi bisnis: cek apakah email sudah ada
            const existingUser = await userModel.getUserByEmail(email);
            if (existingUser) {
                throw new Error('Email sudah terdaftar');
            }

            // Validasi bisnis: pastikan semua field wajib ada
            if (!name || !email || !password) {
                throw new Error('Nama, email, dan password wajib diisi');
            }

            const newUser = await userModel.createUser({ name, email, password });
            // Kembalikan data user tanpa password
            const { password: _, ...userData } = newUser;
            return userData;
        } catch (error) {
            throw new Error('Gagal membuat user: ' + error.message);
        }
    }

    // Memperbarui user
    async updateUser(id, { name, email, password }) {
        try {
            const user = await userModel.getUserById(id);
            if (!user) {
                throw new Error('User tidak ditemukan');
            }

            // Validasi bisnis: kalau email diubah, cek apakah sudah ada
            if (email && email !== user.email) {
                const existingUser = await userModel.getUserByEmail(email);
                if (existingUser) {
                    throw new Error('Email sudah terdaftar');
                }
            }

            const updatedUser = await userModel.updateUser({ id, name, email, password });
            if (!updatedUser) {
                throw new Error('Gagal memperbarui user');
            }
            // Kembalikan data user tanpa password
            const { password: _, ...userData } = updatedUser;
            return userData;
        } catch (error) {
            throw new Error('Gagal memperbarui user: ' + error.message);
        }
    }

    // Menghapus user
    async deleteUser(id) {
        try {
            const user = await userModel.deleteUser(id);
            if (!user) {
                throw new Error('User tidak ditemukan');
            }
            return { message: 'User berhasil dihapus' };
        } catch (error) {
            throw new Error('Gagal menghapus user: ' + error.message);
        }
    }
}

module.exports = new UserService();