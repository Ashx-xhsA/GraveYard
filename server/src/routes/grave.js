import express from "express";
import Grave from "../models/Grave.js";
import Interaction from "../models/Interaction.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Helper function to fill up interaction field in graves
const populateInteractions = async (grave) => {
  if (!grave) return null;
  const interactions = await Interaction.find({ graveId: grave._id }).sort({
    createdAt: 1,
  });
  const totalFlowers = interactions
    .filter((i) => i.type === "flower")
    .reduce((sum, i) => sum + (i.quantity || 1), 0);
  const totalMessages = interactions.filter((i) => i.type === "message").length;

  return {
    ...grave.toObject(),
    interaction: {
      stats: {
        totalFlowers,
        totalMessages,
      },
      history: interactions,
    },
  };
};

// Get all graves
router.get("/", async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const query = search ? { name: { $regex: search, $options: "i" } } : {};
    const graves = await Grave.find(query)
      .populate("createdBy", "username")
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });
    const populatedGraves = await Promise.all(
      graves.map((grave) => populateInteractions(grave)),
    );
    const total = await Grave.countDocuments(query);
    return res.json({
      graves: populatedGraves,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Get single grave by ID
router.get("/:id", async (req, res) => {
  try {
    const grave = await Grave.findById(req.params.id).populate(
      "createdBy",
      "username",
    );
    if (!grave) {
      return res.status(404).json({ error: "Grave not found." });
    }
    const populatedGrave = await populateInteractions(grave);
    return res.json(populatedGrave);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Post a new grave
router.post("/", verifyToken, async (req, res) => {
  try {
    const { graveID, name, birth, death, epitaph, burial, memorial, photos } =
      req.body;
    if (!graveID || !name || !birth || !death) {
      return res
        .status(400)
        .json({ error: "Please fill out the required data for your grave." });
    }
    const grave = new Grave({
      graveID,
      name,
      birth,
      death,
      epitaph,
      burial,
      memorial,
      photos: photos || [],
      createdBy: req.userId,
    });
    await grave.save();
    const populatedGrave = await populateInteractions(grave);
    return res.status(201).json(populatedGrave);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Update grave
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const grave = await Grave.findById(req.params.id);
    if (!grave) {
      return res.status(404).json({ error: "Grave not found." });
    }
    if (grave.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "This is someone else's grave." });
    }
    const { name, birth, death, epitaph, burial, memorial, photos } = req.body;
    if (name) grave.name = name;
    if (birth) grave.birth = birth;
    if (death) grave.death = death;
    if (epitaph) grave.epitaph = epitaph;
    if (burial) grave.burial = burial;
    if (memorial) grave.memorial = memorial;
    if (photos) grave.photos = photos;
    await grave.save();
    const populatedGrave = await populateInteractions(grave);
    return res.json(populatedGrave);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Delete grave
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const grave = await Grave.findById(req.params.id);
    if (!grave) {
      return res.status(404).json({ error: "Grave not found." });
    }
    if (grave.createdBy.toString() !== req.userId) {
      return res.status(403).json({ error: "This is someone else's grave." });
    }
    await Interaction.deleteMany({ graveId: grave._id });
    await grave.remove();
    return res.json({ message: "Your grave has been removed.", grave });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
