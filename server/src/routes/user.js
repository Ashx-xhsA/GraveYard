import express from "express";
import User from "../models/User.js";
import Grave from "../models/Grave.js";
import { populateInteractions } from "../utils/populateInteractions.js";
import Interaction from "../models/Interaction.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get user's graves
router.get("/user-graves", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const graves = await Grave.find({ createdBy: userId })
      .populate("createdBy", "username")
      .sort({ createdAt: -1 });
    const populatedGraves = await Promise.all(
      graves.map((grave) => populateInteractions(grave)),
    );
    return res.json(populatedGraves);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Get user's interactions
router.get("/user-interactions", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const interactions = await Interaction.find({ user: userId })
      .populate("graveId", "name")
      .sort({ createdAt: -1 });
    return res.json(interactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Get user's profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("username email");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const gravesCreated = await Grave.countDocuments({ createdBy: userId });
    const interactionsMade = await Interaction.countDocuments({ user: userId });
    return res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      gravesCreated,
      interactionsMade,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
