import express from "express";
import cors from "cors";
import "./db.js";
import authRoutes from "./routes/auth.js";
import graveRoutes from "./routes/grave.js";
import interactionRoutes from "./routes/interaction.js";
import userRoutes from "./routes/user.js";
import blockRoutes from "./routes/blocks.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/grave", graveRoutes);
app.use("/api/graves/:graveId/interactions", interactionRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blocks", blockRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
