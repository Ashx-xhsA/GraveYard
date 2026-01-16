import express from "express";
import cors from "cors";
import "./app.js";
import authRoutes from "./routes/auth.js";
import graveRoutes from "./routes/grave.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/grave", graveRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
