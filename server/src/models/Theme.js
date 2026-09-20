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
    // L0 外层背景
    backgroundImage: imageField,
    // container 描边
    borderImage: imageField,
    // L0 里层容器背景（= L1 的外层背景）。原名 homeImage，改名见 PRD D13
    containerImage: imageField,
  },
  { timestamps: true },
);

export default mongoose.model("Theme", themeSchema);
