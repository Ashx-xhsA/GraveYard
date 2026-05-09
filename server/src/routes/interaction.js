import express from "express";
import Interaction from "../models/Interaction.js";
import Grave from "../models/Grave.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router({ mergeParams: true });

const getGraveStats = async (graveObjectId) => {
  const totalFlowers = await Interaction.countDocuments({
    graveId: graveObjectId,
    type: "flower",
  });
  const totalMessages = await Interaction.countDocuments({
    graveId: graveObjectId,
    type: "message",
  });
  return { totalFlowers, totalMessages };
};

// Get all interactions for a grave
router.get("/interactions", async (req, res) => {
  try {
    const grave = await Grave.findOne({ graveID: req.params.graveId });
    if (!grave) return res.status(404).json({ error: "Grave not found." });
    const interactions = await Interaction.find({ graveId: grave._id })
      .sort({ createdAt: -1 })
      .populate("user", "username");
    return res.json(interactions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Post a flower to a grave
router.post("/flowers", verifyToken, async (req, res) => {
  try {
    const { variety, quantity = 1 } = req.body;
    const grave = await Grave.findOne({ graveID: req.params.graveId });
    if (!grave) return res.status(404).json({ error: "Grave not found." });
    const interaction = new Interaction({
      graveId: grave._id,
      type: "flower",
      variety,
      user: req.userId,
      quantity,
    });
    await interaction.save();
    await interaction.populate("user", "username");
    const stats = await getGraveStats(grave._id);
    return res.status(201).json({
      message: "Sent a flower to the grave.",
      interaction,
      graveStats: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Post a message to a grave
router.post("/messages", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const grave = await Grave.findOne({ graveID: req.params.graveId });
    if (!grave) return res.status(404).json({ error: "Grave not found." });
    const interaction = new Interaction({
      graveId: grave._id,
      type: "message",
      user: req.userId,
      content,
    });
    await interaction.save();
    await interaction.populate("user", "username");
    const stats = await getGraveStats(grave._id);
    return res.status(201).json({
      message: "Left a message on the grave.",
      interaction,
      graveStats: stats,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Delete an interaction
router.delete(
  "/interactions/:interactionId",
  verifyToken,
  async (req, res) => {
    try {
      const { interactionId } = req.params;
      const grave = await Grave.findOne({ graveID: req.params.graveId });
      if (!grave) return res.status(404).json({ error: "Grave not found." });
      const interaction = await Interaction.findById(interactionId);
      if (!interaction)
        return res.status(404).json({ error: "Interaction not found." });
      if (interaction.user.toString() !== req.userId) {
        return res
          .status(403)
          .json({ error: "You can only take back your own interactions." });
      }
      await interaction.deleteOne();
      const stats = await getGraveStats(grave._id);
      return res.json({
        message: "You have taken back your interaction.",
        graveStats: stats,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
);

export default router;
