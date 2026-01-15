import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Username already exists" });
    } else if (error.name === "ValidationError") {
      return res.status(422).json({ error: "Invalid user data" });
    } else {
      console.error(error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({ token, userId: user._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
