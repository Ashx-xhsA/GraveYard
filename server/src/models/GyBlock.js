import mongoose from "mongoose";

const gyBlockSchema = new mongoose.Schema(
  {
    // 給前端路由用的字串 ID (例如 "sea-1", "desert-1")
    blockID: {
      type: String,
      required: true,
      unique: true,
    },
    // 墓園名字: "大海區域"
    name: {
      type: String,
      required: true,
    },
    // 此墓園的背景圖 :"/themes/FishInSea.png"
    backgroundImage: {
      type: String,
      required: true,
    },
    // 墓園描述
    description: String,

    //此墓園的總共坟墓數量
    number: Number,

  },
  { timestamps: true }
);

export default mongoose.model("GyBlock", gyBlockSchema);
