import express from "express";
import Interaction from "../models/Interaction.js";
import Grave from "../models/Grave.js";
import { verifyToken } from "../middleware/auth.js";
import { getGraveStats } from "../lib/graveDetail.js";
import { takeFromInventory, returnToInventory } from "../lib/inventory.js";

const router = express.Router({ mergeParams: true });

// Errors carry a stable `code` so clients can show their own (translated) text;
// `error` stays as a readable description for logs.
const sendError = (res, status, code, error) =>
  res.status(status).json({ error, code });

const serverError = (res, error) => {
  console.error(error);
  return sendError(res, 500, "INTERNAL_ERROR", "Internal server error.");
};

const INVENTORY_KINDS = ["flower", "item"];

// Get all interactions for a grave
router.get("/interactions", async (req, res) => {
  try {
    const grave = await Grave.findOne({ graveID: req.params.graveID });
    if (!grave) return sendError(res, 404, "GRAVE_NOT_FOUND", "Grave not found.");
    const interactions = await Interaction.find({ grave_id: grave._id })
      .sort({ createdAt: -1 })
      .populate("user", "username");
    return res.json(interactions);
  } catch (error) {
    return serverError(res, error);
  }
});

// Offer something from the user's inventory to a grave
router.post("/offerings", verifyToken, async (req, res) => {
  try {
    const { kind, itemName, quantity } = req.body;
    // Unnamed items ("") must be named in the inventory before they can be offered.
    const valid =
      INVENTORY_KINDS.includes(kind) &&
      typeof itemName === "string" &&
      itemName !== "" &&
      Number.isInteger(quantity) &&
      quantity >= 1;
    if (!valid) {
      return sendError(res, 400, "INVALID_OFFERING", "Invalid offering.");
    }

    const grave = await Grave.findOne({ graveID: req.params.graveID });
    if (!grave) return sendError(res, 404, "GRAVE_NOT_FOUND", "Grave not found.");

    const taken = { kind, name: itemName, quantity };
    const inventory = await takeFromInventory(req.userId, taken);
    if (!inventory) {
      return sendError(
        res,
        400,
        "INSUFFICIENT_QUANTITY",
        "Not enough of that in your inventory.",
      );
    }

    let interaction;
    try {
      interaction = await Interaction.create({
        grave_id: grave._id,
        type: "item",
        itemName,
        quantity,
        user: req.userId,
      });
    } catch (error) {
      await returnToInventory(req.userId, taken);
      throw error;
    }

    await interaction.populate("user", "username");
    const stats = await getGraveStats(grave._id);
    return res.status(201).json({
      message: "Offered to the grave.",
      interaction,
      graveStats: stats,
      inventory,
    });
  } catch (error) {
    return serverError(res, error);
  }
});

// Post a message to a grave
router.post("/messages", verifyToken, async (req, res) => {
  try {
    const content =
      typeof req.body.content === "string" ? req.body.content.trim() : "";
    if (!content) {
      return sendError(res, 400, "EMPTY_MESSAGE", "Message cannot be empty.");
    }
    const grave = await Grave.findOne({ graveID: req.params.graveID });
    if (!grave) return sendError(res, 404, "GRAVE_NOT_FOUND", "Grave not found.");
    const interaction = new Interaction({
      grave_id: grave._id,
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
    return serverError(res, error);
  }
});

// Delete an interaction
router.delete(
  "/interactions/:interactionId",
  verifyToken,
  async (req, res) => {
    try {
      const { interactionId } = req.params;
      const grave = await Grave.findOne({ graveID: req.params.graveID });
      if (!grave) return sendError(res, 404, "GRAVE_NOT_FOUND", "Grave not found.");
      const interaction = await Interaction.findById(interactionId);
      if (!interaction) {
        return sendError(
          res,
          404,
          "INTERACTION_NOT_FOUND",
          "Interaction not found.",
        );
      }
      if (interaction.user.toString() !== req.userId) {
        return sendError(
          res,
          403,
          "NOT_YOUR_INTERACTION",
          "You can only take back your own interactions.",
        );
      }
      await interaction.deleteOne();
      const stats = await getGraveStats(grave._id);
      return res.json({
        message: "You have taken back your interaction.",
        graveStats: stats,
      });
    } catch (error) {
      return serverError(res, error);
    }
  },
);

export default router;
