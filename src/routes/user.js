import express from "express";
import { userModel } from "./userModel.js"; // Asumsi userModel ada

const Router = express.Router();

// Tambah pengguna
Router.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const user = await userModel.createUser({ name, email, password });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Edit pengguna
Router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;
    const user = await userModel.updateUser({ id, name, email, password });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Hapus pengguna
Router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.deleteUser(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default Router;