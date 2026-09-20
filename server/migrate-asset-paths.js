/**
 * 迁移脚本：静态资源改名后，把数据库里存的旧路径换成新路径。
 *
 * 背景：TODO #18 / #19 把 client/public 下的图片按 CONVENTIONS 重新命名分目录了。
 * 但有 5 处路径同时存在于**数据库**里（Theme ×3、GyBlock.backgroundImage、
 * GyBlock.blockIconImage），文件改了名而库里还是旧值 = 线上 404。
 * 顺带执行 PRD D13：Theme.homeImage 字段改名为 containerImage。
 *
 * 用法（在项目根目录）：
 *   node server/migrate-asset-paths.js          ← 预演，只打印会改什么，不写库
 *   node server/migrate-asset-paths.js --apply  ← 真正写入
 *
 * ⚠️ 它连的是 server/.env 里的 MONGO_URI。如果那条指向线上 Atlas，
 *    --apply 就是在改线上数据。先跑一次预演确认无误再加 --apply。
 *
 * 可以重复跑：已经是新路径的记录会被跳过（幂等）。
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import GyBlock from "./src/models/GyBlock.js";

// 显式指向 server/.env —— 否则从项目根目录跑时 dotenv 会去找根目录的 .env（不存在）
dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), ".env"),
});

const APPLY = process.argv.includes("--apply");

// 旧路径 → 新路径（与 CONVENTIONS「重命名映射表」一一对应）
const PATH_MAP = {
  "/themes/containerbg.png": "/themes/yume2kki/background-pink-haze.png",
  "/themes/containerbg-2.png": "/themes/yume2kki/container-blue-vortex.png",
  "/themes/containerbg-2.PNG": "/themes/yume2kki/container-blue-vortex.png",
  "/themes/border.png": "/themes/yume2kki/border-purple-flowers.png",
  "/quit.PNG": "/themes/yume2kki/close-button-red-cross.png",
  "/graveyardLogoTrimmed.png": "/themes/yume2kki/logo-graveyard-text.png",
  "/themes/FishInSea.png": "/blocks/sea-1/background-deep-sea-fish.png",
  "/themes/desert.JPG": "/blocks/desert-1/background-sand-dunes.jpg",
  "/themes/unknownplace.webp": "/blocks/_default/icon-question-mark.webp",
  "/grave-1.png": "/blocks/_default/grave-rip-stone.png",
};

const remap = (value) => PATH_MAP[value] ?? null;

const changes = [];
const note = (what, from, to) => changes.push({ what, from, to });

await mongoose.connect(process.env.MONGO_URI);
console.log(`已连接数据库${APPLY ? "（--apply：会写入）" : "（预演，不写入）"}\n`);

// ---------- GyBlock：背景图 + 入口图标 ----------
for (const block of await GyBlock.find()) {
  let dirty = false;

  const bg = remap(block.backgroundImage?.url);
  if (bg) {
    note(`GyBlock(${block.blockID}).backgroundImage.url`, block.backgroundImage.url, bg);
    block.backgroundImage.url = bg;
    dirty = true;
  }

  const icon = remap(block.blockIconImage);
  if (icon) {
    note(`GyBlock(${block.blockID}).blockIconImage`, block.blockIconImage, icon);
    block.blockIconImage = icon;
    dirty = true;
  }

  const graveIcon = remap(block.graveIcon);
  if (graveIcon) {
    note(`GyBlock(${block.blockID}).graveIcon`, block.graveIcon, graveIcon);
    block.graveIcon = graveIcon;
    dirty = true;
  }

  if (dirty && APPLY) await block.save();
}

// ---------- Theme：三张图 + homeImage 字段改名（D13）----------
// 字段改名要用原生 collection 操作：Mongoose 的 schema 里已经没有 homeImage 了，
// 走 model 读不到这个字段，只能绕过 schema 直接改文档。
const themeCollection = mongoose.connection.collection("themes");

for (const theme of await themeCollection.find().toArray()) {
  const set = {};
  const unset = {};

  for (const field of ["backgroundImage", "borderImage", "containerImage"]) {
    const next = remap(theme[field]?.url);
    if (next) {
      note(`Theme(${theme.name}).${field}.url`, theme[field].url, next);
      set[`${field}.url`] = next;
    }
  }

  // D13：homeImage → containerImage（顺带把它的路径也换成新的）
  if (theme.homeImage !== undefined) {
    const url = remap(theme.homeImage?.url) ?? theme.homeImage?.url ?? "";
    note(`Theme(${theme.name}) 字段改名 homeImage → containerImage`, theme.homeImage?.url, url);
    set.containerImage = { url, styles: theme.homeImage?.styles ?? "" };
    unset.homeImage = "";
  }

  const update = {};
  if (Object.keys(set).length) update.$set = set;
  if (Object.keys(unset).length) update.$unset = unset;

  if (Object.keys(update).length && APPLY) {
    await themeCollection.updateOne({ _id: theme._id }, update);
  }
}

// ---------- 报告 ----------
if (changes.length === 0) {
  console.log("没有需要改的记录 —— 数据库里已经全是新路径了。");
} else {
  console.log(`共 ${changes.length} 处${APPLY ? "已修改" : "待修改"}：\n`);
  for (const c of changes) {
    console.log(`  ${c.what}`);
    console.log(`    ${c.from}`);
    console.log(`    → ${c.to}\n`);
  }
  if (!APPLY) {
    console.log("这只是预演，什么都没写入。确认无误后加 --apply 重跑：");
    console.log("  node server/migrate-asset-paths.js --apply");
  }
}

await mongoose.disconnect();
