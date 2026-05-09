import express from "express";
import Theme from "../models/Theme.js";

const router = express.Router();

// Get all themes
router.get("/", async (req, res) => {
  try {
    const themes = await Theme.find();
    return res.json({ themes });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// Get a single theme by name
router.get("/:name", async (req, res) => {
  try {
    const theme = await Theme.findOne({ name: req.params.name });
    if (!theme) {
      return res.status(404).json({ error: "Theme not found." });
    }
    return res.json({ theme });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
