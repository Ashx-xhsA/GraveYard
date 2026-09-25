import mongoose from "mongoose";

// Something left on a grave: either an offered item (flowers included) or a message.
const interactionSchema = new mongoose.Schema(
  {
    // References Grave._id. Named with an underscore to keep it visually
    // distinct from the human-readable Grave.graveID.
    grave_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grave",
      required: true,
    },
    type: { type: String, enum: ["message", "item"], required: true },
    // Only used when type is "item".
    itemName: String,
    quantity: { type: Number, default: 1 },
    // Only used when type is "message".
    content: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Interaction", interactionSchema);
