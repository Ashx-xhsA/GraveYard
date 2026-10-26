import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { createPhotoUpload, StorageError } from "../lib/storage.js";

const router = express.Router();

// Issue a presigned POST so the browser can upload a photo straight to S3.
// The returned key is later passed as `photoKey` when creating a grave.
router.post("/photo", verifyToken, async (req, res) => {
  try {
    const { contentType, size } = req.body;
    return res.json(await createPhotoUpload(req.userId, contentType, size));
  } catch (error) {
    if (error instanceof StorageError) {
      return res.status(error.status).json({ error: error.message, code: error.code });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error.", code: "INTERNAL_ERROR" });
  }
});

export default router;
