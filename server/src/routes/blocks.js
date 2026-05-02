import express from "express";
import GyBlock from "../models/GyBlock.js";

const router = express.Router();

// 获取所有的区块列表 (首页展示用)
router.get("/", async (req, res) => {
  try {
    const blocks = await GyBlock.find();
    return res.json({ blocks });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server error." });
  }
});

// 获取单个区块的详情 (例如获取背景图等信息)
router.get("/:blockID", async (req, res) => {
  try {
    const block = await GyBlock.findOne({ blockID: req.params.blockID });
    if (!block) {
      return res.status(404).json({ error: "Block not found." });
    }
    return res.json({ block });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "server error." });
  }
});

export default router;
