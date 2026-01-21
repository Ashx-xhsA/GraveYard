import express from "express";
import Interaction from "../models/Interaction.js";
import Grave from "../models/Grave.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

// Get all interactions for a grave
router.get("/", async (req, res) => {
  try {
    const { graveId } = req.params;
    const interactions = await Interaction.find({ graveId }).sort({
      createdAt: -1,
    });
    return res.json(interactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Post a flower to a grave
router.post("/flowers", verifyToken, async (req, res) => {
  try {
    const { graveId } = req.params;
    const { variety, quantity = 1 } = req.body;
    const grave = await Grave.findById(graveId);
    if (!grave) {
      return res.status(404).json({ error: "Grave not found." });
    }
    const interaction = new Interaction({
      graveId,
      type: "flower",
      variety,
      user: req.user.id,
      quantity,
    });
    await interaction.save();
    const totalFlowers = await Interaction.countDocuments({
      graveId,
      type: "flower",
    });
    const totalMessages = await Interaction.countDocuments({
      graveId,
      type: "message",
    });
    grave.interaction = {
      stats: { totalFlowers, totalMessages },
      history: [],
    };
    await grave.save();
    return res.status(201).json({
      message: "Sent a flower to the grave.",
      interaction,
      graveStats: grave.interaction.stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Post a message to a grave
router.post("/messages", verifyToken, async (req, res) => {
  try {
    const { graveId } = req.params;
    const { content } = req.body;
    const grave = await Grave.findById(graveId);
    if (!grave) {
      return res.status(404).json({ error: "Grave not found." });
    }
    const interaction = new Interaction({
      graveId,
      type: "message",
      user: req.userId,
      content,
    });
    await interaction.save();
    const totalFlowers = await Interaction.countDocuments({
      graveId,
      type: "flower",
    });
    const totalMessages = await Interaction.countDocuments({
      graveId,
      type: "message",
    });
    grave.interaction = {
      stats: { totalFlowers, totalMessages },
      history: [],
    };
    await grave.save();
    return res.status(201).json({
      message: "Left a message on the grave.",
      interaction,
      graveStats: grave.interaction.stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Delete an interaction
router.delete("/:interactionId", verifyToken, async (req, res) => {
  try {
    const { graveId, interactionId } = req.params;
    const grave = await Grave.findById(graveId);
    if (!grave) {
      return res.status(404).json({ error: "Grave not found." });
    }
    const interaction = await Interaction.findById(interactionId);
    if (!interaction) {
      return res.status(404).json({ error: "Interaction not found." });
    }
    if (interaction.user.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "You can only take back your own interactions." });
    }
    await interaction.deleteOne();
    const totalFlowers = await Interaction.countDocuments({
      graveId,
      type: "flower",
    });
    const totalMessages = await Interaction.countDocuments({
      graveId,
      type: "message",
    });
    grave.interaction = {
      stats: { totalFlowers, totalMessages },
      history: [],
    };
    await grave.save();
    return res.json({
      message: "You have taken back your interaction.",
      graveStats: grave.interaction.stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
