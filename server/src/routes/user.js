import express from "express";
import User from "../models/User.js";
import Grave from "../models/Grave.js";
import { populateInteractions } from "./grave.js";
import Interaction from "../models/Interaction.js";
import Theme from "../models/Theme.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get user's graves
router.get("/me/graves", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const graves = await Grave.find({ user: userId })
      .populate("user", "username")
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
router.get("/me/interactions", verifyToken, async (req, res) => {
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
router.get("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId)
      .select("username email settings favorites")
      .populate("settings.theme")
      .populate("favorites", "graveID name");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const gravesCreated = await Grave.countDocuments({ user: userId });
    const interactionsMade = await Interaction.countDocuments({ user: userId });
    return res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        settings: user.settings,
        favorites: user.favorites,
      },
      gravesCreated,
      interactionsMade,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Update current user settings
router.put("/me/settings", verifyToken, async (req, res) => {
  try {
    const { theme, fontsize } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (theme !== undefined) {
      const themeDoc = await Theme.findOne({ name: theme });
      if (!themeDoc) {
        return res.status(404).json({ error: "Theme not found." });
      }
      user.settings.theme = themeDoc._id;
    }
    if (fontsize !== undefined) {
      user.settings.fontsize = fontsize;
    }
    await user.save();
    await user.populate("settings.theme");
    return res.json({ settings: user.settings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Delete user account
router.delete("/me", verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    const graves = await Grave.find({ user: userId });
    const graveIds = graves.map((grave) => grave._id);
    if (graveIds.length > 0) {
      await Interaction.deleteMany({ graveId: { $in: graveIds } });
    }
    await Grave.deleteMany({ user: userId });
    await Interaction.deleteMany({ user: userId });
    await User.deleteOne({ _id: userId });
    return res.json({
      message: "User account and all associated data have been deleted.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
