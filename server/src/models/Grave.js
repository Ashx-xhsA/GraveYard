import mongoose from "mongoose";

const graveSchema = new mongoose.Schema(
  {
    graveID: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    birth: {
      type: Date,
      required: true,
    },
    death: {
      type: Date,
      required: true,
    },
    epitaph: String,
    burial: {
      display_name: String,
      address: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    memorial: String,
    photos: [String],
    // Interaction
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Grave", graveSchema);
