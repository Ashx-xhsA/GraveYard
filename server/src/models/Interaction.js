import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema({
  grave: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Grave",
    required: true,
  },
  type: { type: String, enum: ["flower", "message"], required: true },
  variety: String,
  user: { type: String, required: true },
  timestamp: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  quantity: Number,
  content: String,
});

export default mongoose.model("Interaction", interactionSchema);
