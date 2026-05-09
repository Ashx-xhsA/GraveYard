import mongoose from "mongoose";

const imageField = {
  url: { type: String, default: "" },
  styles: { type: String, default: "" },
};

const themeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    backgroundImage: imageField,
    borderImage: imageField,
    homeImage: imageField,
  },
  { timestamps: true },
);

export default mongoose.model("Theme", themeSchema);
