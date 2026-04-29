import mongoose from "mongoose";

const graveSchema = new mongoose.Schema(
  {
    //單獨墳墓的編號
    graveID: {
      type: String,
      required: true,
      unique: true,
    },
    //關聯的墓園
    block: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GyBlock",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    birth: {
      type: String,
      required: false,
    },
    death: {
      type: String,
      required: false,
    },
    epitaph: String,
    burial: {
      display_name: String,
      address: String,
    },
    memorial: String,
    photos: [String],
    // Interaction
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Grave", graveSchema);
