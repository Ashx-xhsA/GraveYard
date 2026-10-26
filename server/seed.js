import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Grave from "./src/models/Grave.js";
import GyBlock from "./src/models/GyBlock.js";
import Interaction from "./src/models/Interaction.js";
import Theme from "./src/models/Theme.js";
import { initialInventory } from "./src/lib/inventory.js";

// 显式指向 server/.env —— 否则 `npm run seed`（从项目根跑）会去找根目录的 .env（不存在）
dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env"),
});

await mongoose.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");

// Create test user
let user = await User.findOne({ username: "testuser" });
if (!user) {
  user = new User({
    username: "testuser",
    password: "testpass123",
    inventory: initialInventory(),
  });
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
    blockIconImage: "/blocks/_default/icon-question-mark.webp",
    backgroundImage: {
      url: "/blocks/sea-1/background-deep-sea-fish.png",
      styles: '{"backgroundSize": "210px", "imageRendering": "pixelated"}',
    },
    graveIcon: "",
    description: "靠近大陆与大洋连接的水域",
  });
  await seaBlock.save();
  console.log("Created GyBlock: 大海區域");
} else {
  seaBlock.blockIconImage = "/blocks/_default/icon-question-mark.webp";
  seaBlock.backgroundImage = {
    url: "/blocks/sea-1/background-deep-sea-fish.png",
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
    blockIconImage: "/blocks/_default/icon-question-mark.webp",
    backgroundImage: {
      url: "/blocks/desert-1/background-sand-dunes.jpg",
      styles:
        '{"backgroundSize": "cover", "backgroundPosition": "center", "imageRendering": "auto"}',
    },
    graveIcon: "",
    description: "一堆破烂的偶像，承受着太阳的鞭打",
  });
  await desertBlock.save();
  console.log("Created GyBlock: 荒原區域");
} else {
  desertBlock.blockIconImage = "/blocks/_default/icon-question-mark.webp";
  desertBlock.backgroundImage = {
    url: "/blocks/desert-1/background-sand-dunes.jpg",
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
      { url: "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MMTN2" },
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
      {
        url: "https://static.wikia.nocookie.net/shingekinokyojin/images/e/e2/The_Walls.png/revision/latest/scale-to-width-down/1000?cb=20200308210427",
      },
    ],
    user: user._id,
  },
  {
    // Its long memorial is useful for checking how the grave page handles overflowing text.
    graveID: "grave_3",
    block: seaBlock._id,
    name: "大理石手指",
    birth: "0001-01-01",
    death: "1000-05-01",
    epitaph: "信天翁来到西南各大厅之年第五个月第一天的记录",
    memorial: [
      "月亮在北三号大厅升起的时候，我去了九号前厅，看三股潮水汇合。这是八年才发生一次的景观。",
      "九号前厅有三座壮观的楼梯，墙上排列着大理石雕像。数百座雕像层层叠叠地排列着，堆得非常高。",
      "我爬上西边的墙，来到举蜂巢的女人的雕像旁，这里离地15米高。举蜂巢的女人有我两三倍高，蜂巢上刻满了大理石蜜蜂，个个都和我的大拇指一样大。其中一只蜜蜂让我觉得有些恶心——它爬到那女人的左眼上。我挤进雕像所处的壁龛等着，终于听见潮水呼啸着从下层大厅里冲上来，墙壁因即将到来的大潮而震动。",
      "最先涌来的是远东大厅的潮水。它平静地漫过最东边的楼梯。潮水没什么颜色，刚没过脚踝，在地上形成一片灰色的镜面，那大理石花纹的表面上布满牛奶般的泡沫。",
      "接着涌来的是西面大厅的潮水。伴随着惊雷般的声音，潮水淹没了最西边的楼梯，重重地撞上了东边的墙，让大理石雕像都颤动起来。它的泡沫白如鱼骨，旋涡深处呈现出青灰色。几秒钟不到，水越升越高，淹没了第一层雕像的腰部。",
      "最后涌来的是北面大厅的潮水。它冲上中间的楼梯，迸发出大量闪亮雪白的泡沫，充满了整个前厅。我被淋得湿透，一时间什么也看不清。当我能再次睁眼时，水正顺着雕像倾泻而下。这时候我意识到自己犯了个错误，把第二和第三个大潮里的浪数错了。巨大的水花冲向我的容身之处。水像一只大手伸来，想把我从墙上拽下来。我一把抱住举蜂巢的女人的腿部，祈祷这座大宅能保护我。水淹没了我，一时间我周围全然是古怪的寂静，那是大海在吞没你的同时也吞没了自己的声音。我以为自己就要死了，或者会被冲进未知的大厅里，远离这些湍急混乱的寻常潮水。我继续紧抓不放。",
      "但是水很快退去了，就像它冲上来的时候一样突然。混在一处的潮水冲进周围的大厅。我听见雷鸣般的声响和潮水拍击墙壁时发出的碎裂声。九号前厅里的水迅速退潮，最终只勉强没过第一层雕像的底座。",
      "我意识到自己正握着什么东西，于是松开手，发现那是一截大理石的手指，是潮水从远处某个雕像上冲下来的。",
      "这座大宅壮美无限，仁慈无边。",
    ].join("\n\n"),
    photos: [],
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
      grave_id: createdGraves[0]._id, // 留給小空的有线耳机
      type: "item",
      itemName: "洗衣液",
      quantity: 1,
      user: user._id,
    },

    {
      grave_id: createdGraves[1]._id, // 留給墙外世界的幻想
      type: "item",
      itemName: "地鳴",
      quantity: 999,
      user: user._id,
    },
    {
      grave_id: createdGraves[1]._id,
      type: "message",
      content: "我踏馬萊啦",
      user: user._id,
    },
  ];

  await Interaction.insertMany(interactions);
  console.log("Created interactions (offerings and messages).");
}

// Themes
const themes = [
  {
    name: "yume2kki",
    backgroundImage: { url: "/themes/yume2kki/background-pink-haze.png", styles: "" },
    borderImage: { url: "/themes/yume2kki/border-purple-flowers.png", styles: "" },
    containerImage: {
      url: "/themes/yume2kki/container-blue-vortex.png",
      styles: "",
    },
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
