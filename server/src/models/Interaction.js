import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
  {
    graveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grave",
      required: true,
    },
    type: { type: String, enum: ["flower", "message"], required: true },
    variety: String,
    quantity: Number,
    content: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Interaction", interactionSchema);
