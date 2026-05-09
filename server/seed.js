import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Grave from "./src/models/Grave.js";
import GyBlock from "./src/models/GyBlock.js";
import Interaction from "./src/models/Interaction.js";
import Theme from "./src/models/Theme.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

// Create test user
let user = await User.findOne({ username: "testuser" });
if (!user) {
  user = new User({ username: "testuser", password: "testpass123" });
  await user.save();
  console.log("Created test user:", user.username);
} else {
  console.log("Test user already exists:", user.username);
}

// 建立墓園區塊 (GyBlock)
let seaBlock = await GyBlock.findOne({ blockID: "sea-1" });
if (!seaBlock) {
  seaBlock = new GyBlock({
    blockID: "sea-1",
    name: "大海區域",
    blockIconImage: "/themes/unknownplace.webp",
    backgroundImage: {
      url: "/themes/FishInSea.png",
      styles: '{"backgroundSize": "210px", "imageRendering": "pixelated"}',
    },
    graveIcon: "",
    description: "靠近大陆与大洋连接的水域",
    number: 2,
  });
  await seaBlock.save();
  console.log("Created GyBlock: 大海區域");
} else {
  seaBlock.blockIconImage = "/themes/unknownplace.webp";
  seaBlock.backgroundImage = {
    url: "/themes/FishInSea.png",
    styles: '{"backgroundSize": "210px", "imageRendering": "pixelated"}',
  };
  await seaBlock.save();
  console.log("GyBlock 大海區域 already exists, updated images");
}

let desertBlock = await GyBlock.findOne({ blockID: "desert-1" });
if (!desertBlock) {
  desertBlock = new GyBlock({
    blockID: "desert-1",
    name: "荒原區域",
    blockIconImage: "/themes/unknownplace.webp",
    backgroundImage: {
      url: "/themes/desert.JPG",
      styles:
        '{"backgroundSize": "cover", "backgroundPosition": "center", "imageRendering": "auto"}',
    },
    graveIcon: "",
    description: "一堆破烂的偶像，承受着太阳的鞭打",
    number: 0,
  });
  await desertBlock.save();
  console.log("Created GyBlock: 荒原區域");
} else {
  desertBlock.blockIconImage = "/themes/unknownplace.webp";
  desertBlock.backgroundImage = {
    url: "/themes/desert.JPG",
    styles:
      '{"backgroundSize": "cover", "backgroundPosition": "center", "imageRendering": "auto"}',
  };
  await desertBlock.save();
  console.log("GyBlock 荒原區域 already exists, updated images");
}

// 建立墳墓，並把它們關聯到大海區域
const graves = [
  {
    graveID: "grave_1",
    block: seaBlock._id,
    name: "小空的有线耳机",
    birth: "2025-03-12",
    death: "2025-12-07",
    epitaph: "我在洗衣机里一点也不害怕",
    burial: {
      display_name: "洗衣机",
      address: "Brookline, Boston",
    },
    memorial: "只是一個耳機",
    photos: [
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MMTN2",
    ],
    user: user._id,
  },
  {
    graveID: "grave_2",
    block: seaBlock._id,
    name: "墙外世界的幻想",
    birth: "2000-01-01",
    death: "2013-04-28",
    epitaph: "原来海的那边不仅有自由，还有敌人",
    burial: {
      display_name: "艾尔迪亚岛",
      address: "/",
    },
    memorial: "墙外有燃烧的水，冰做的土地，沙子做的雪原。",
    photos: [
      "https://static.wikia.nocookie.net/shingekinokyojin/images/e/e2/The_Walls.png/revision/latest/scale-to-width-down/1000?cb=20200308210427",
    ],
    user: user._id,
  },
];

for (const graveData of graves) {
  const existing = await Grave.findOne({ graveID: graveData.graveID });
  if (existing) {
    // 如果存在，順便更新它的 block 和新的 string 格式日期
    existing.block = graveData.block;
    existing.birth = graveData.birth;
    existing.death = graveData.death;
    await existing.save();
    console.log(
      `Grave "${graveData.name}" already exists, updated its schema.`,
    );
  } else {
    const grave = new Grave(graveData);
    await grave.save();
    console.log(`Created grave: "${graveData.name}" (_id: ${grave._id})`);
  }
}

// 新增 Interaction
const createdGraves = await Grave.find();
await Interaction.deleteMany({ user: user._id });
if (createdGraves.length > 0) {
  const interactions = [
    {
      graveId: createdGraves[0]._id, // 留給小空的有线耳机
      type: "flower",
      variety: "洗衣液",
      quantity: 1,
      user: user._id,
    },

    {
      graveId: createdGraves[1]._id, // 留給墙外世界的幻想
      type: "flower",
      variety: "地鳴",
      quantity: 999,
      user: user._id,
    },
    {
      graveId: createdGraves[1]._id,
      type: "message",
      content: "我踏馬萊啦",
      user: user._id,
    },
  ];

  await Interaction.insertMany(interactions);
  console.log("Created interactions (flowers and messages).");
}

// Themes
const themes = [
  {
    name: "yume2kki",
    backgroundImage: { url: "/themes/containerbg.png", styles: "" },
    borderImage: { url: "/themes/border.png", styles: "" },
    homeImage: { url: "/themes/containerbg-2.PNG", styles: "" },
  },
];

for (const t of themes) {
  await Theme.findOneAndUpdate({ name: t.name }, t, {
    upsert: true,
    new: true,
  });
  console.log(`Upserted theme: ${t.name}`);
}

console.log(
  "\nDone! You can log in with: username=testuser, password=testpass123",
);
await mongoose.disconnect();
