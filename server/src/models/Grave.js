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
    // Only one photo is supported for now; kept as an array so multiple photos need no migration.
    photos: [
      {
        _id: false,
        // Public URL of the image.
        url: String,
        // S3 object key; empty for legacy photos that point at external URLs.
        key: { type: String, default: "" },
      },
    ],
    // Custom grave sprite chosen at creation. Cannot be changed afterwards.
    icon: { type: String, default: "" },
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
