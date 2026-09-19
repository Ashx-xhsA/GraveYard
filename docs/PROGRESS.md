# 进度

> **只回答「现在在哪」。保持极短（十几行），每次 `/exe` 收尾时刷新。**
> 整体怎么走看 `ROADMAP.md`，具体做哪些事看 `TODO.md`（编号 #n 即 TODO 里的编号）。

---

**当前阶段**：Phase 0 · 止血 —— 线上正在坏着的东西

**上次做完**：
- 2026-09-19 · 整理出 PRD / DATA-MODEL / CONVENTIONS / REMINDERS / TODO 五份文档，数据结构冻结
- 2026-09-19 · 补了 `client/.env.example`；`client/vite.config.ts` 加了 `VITE_PROXY_TARGET` 代理

**👉 下一步起点**：Phase 0 剩下的五条，约 1 小时
1. #1 `seed.js` 里 `containerbg-2.PNG` → `.png` ← **线上 Linux 正在 404，先修这条**
2. #2 `index.css` 的 `@font-face` 路径 `fonts/…` → `/fonts/…`
3. #3 补 `--interaction-paginate-link-hover-color`
4. #4 补 `server/.env.example`（`MONGO_URI`、`JWT_SECRET`）—— client 那份已完成
5. #5 `Background.tsx` 改成从 API 取背景，不再读 `db.json`

前四条都是一两行的改动，直接动手即可，不必先 `/make-plan`。#5 稍大，不确定就先 `/make-plan`。

**卡住 / 待决定**：无

**当前分支**：`docs/prd-and-conventions`（只装文档改动；开始改代码前应另开分支）
