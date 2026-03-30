import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/User.js";
import Grave from "./src/models/Grave.js";

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

// Import the graves
const graves = [
  {
    graveID: "grave_1",
    name: "小空的有线耳机",
    birth: new Date("2025-03-12"),
    death: new Date("2025-12-07"),
    epitaph: "我在洗衣机里一点也不害怕",
    burial: {
      display_name: "洗衣机",
      address: "Brookline, Boston",
    },
    memorial:
      "辛苦的一生，但也有许多欢乐...耳机酱这辈子最喜欢的歌曲是andymori的革命",
    photos: [
      "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MMTN2",
    ],
    user: user._id,
  },
  {
    graveID: "grave_2",
    name: "墙外世界的幻想",
    birth: new Date("2000-01-01"),
    death: new Date("2013-04-28"),
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
    console.log(`Grave "${graveData.name}" already exists, skipping.`);
  } else {
    const grave = new Grave(graveData);
    await grave.save();
    console.log(`Created grave: "${graveData.name}" (_id: ${grave._id})`);
  }
}

console.log(
  "\nDone! You can log in with: username=testuser, password=testpass123",
);
await mongoose.disconnect();
