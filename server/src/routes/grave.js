import express from "express";
import Grave from "../models/Grave.js";
import Interaction from "../models/Interaction.js";
import GyBlock from "../models/GyBlock.js";
import { verifyToken } from "../middleware/auth.js";
import { buildGraveDetail } from "../lib/graveDetail.js";

const router = express.Router();

// Get the graves from a certain block
router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, block } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    //filter the certain graves
    const filter = {};
    let blockInfo = null;
    if (block) {
      const gyBlock = await GyBlock.findOne({ blockID: block });
      if (!gyBlock) {
        return res.json({
          graves: [],
          totalPages: 0,
          currentPage: pageNum,
          total: 0,
          blockInfo: null,
        });
      }
      blockInfo = gyBlock;
      filter.block = gyBlock._id;
    }
    const graves = await Grave.find(filter)
      .populate("user", "username")
      .populate("block")
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });
    const populatedGraves = await Promise.all(
      graves.map((grave) => buildGraveDetail(grave)),
    );
    const total = await Grave.countDocuments(filter);
    return res.json({
      graves: populatedGraves,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
      blockInfo,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Get single grave by ID
router.get("/:graveID", async (req, res) => {
  try {
    const grave = await Grave.findOne({ graveID: req.params.graveID });
    if (!grave) {
      return res.status(404).json({ error: "Grave not found." });
    }
    return res.json(await buildGraveDetail(grave));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Generate the next available graveID
const generateGraveID = async () => {
  let n = (await Grave.countDocuments()) + 1;
  while (await Grave.exists({ graveID: `grave-${n}` })) n += 1;
  return `grave-${n}`;
};

// Post a new grave
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, birth, death, epitaph, burial, memorial, photos, icon, block } =
      req.body;
    if (!name || !birth || !death || !block) {
      return res
        .status(400)
        .json({ error: "Please fill out the required data for your grave." });
    }
    const graveID = await generateGraveID();
    const grave = new Grave({
      graveID,
      name,
      birth,
      death,
      epitaph,
      burial,
      memorial,
      photos: photos || [],
      icon,
      block,
      user: req.userId,
    });
    await grave.save();
    return res.status(201).json(await buildGraveDetail(grave));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Update grave
router.put("/:graveID", verifyToken, async (req, res) => {
  try {
    const grave = await Grave.findOne({ graveID: req.params.graveID });
    if (!grave) {
      return res.status(404).json({ error: "Grave not found." });
    }
    if (grave.user.toString() !== req.userId) {
      return res.status(403).json({ error: "This is someone else's grave." });
    }
    // `icon` is intentionally not updatable: it is fixed when the grave is created.
    const { name, birth, death, epitaph, burial, memorial, photos, block } =
      req.body;
    if (name) grave.name = name;
    if (birth) grave.birth = birth;
    if (death) grave.death = death;
    if (epitaph) grave.epitaph = epitaph;
    if (burial) grave.burial = burial;
    if (memorial) grave.memorial = memorial;
    if (photos) grave.photos = photos;
    if (block) grave.block = block;
    await grave.save();
    return res.json(await buildGraveDetail(grave));
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Delete grave
router.delete("/:graveID", verifyToken, async (req, res) => {
  try {
    const grave = await Grave.findOne({ graveID: req.params.graveID });
    if (!grave) {
      return res.status(404).json({ error: "Grave not found." });
    }
    if (grave.user.toString() !== req.userId) {
      return res.status(403).json({ error: "This is someone else's grave." });
    }
    await Interaction.deleteMany({ grave_id: grave._id });
    await grave.populate([{ path: "user", select: "username" }, { path: "block" }]);
    await grave.deleteOne();
    return res.json({ message: "Your grave has been removed.", grave });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
