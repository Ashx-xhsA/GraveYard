# TODO

> 排序原则：**先还技术债**。债内部按「会出故障 → 挡住后续开发 → 纯清理」排，功能开发放在后面。
>
> 工作量：`S` 半小时内 ｜ `M` 半天 ｜ `L` 一天以上
> 出处：`R#n` = REMINDERS.md ｜ `C` = CONVENTIONS.md ｜ `D` = DATA-MODEL.md ｜ `P` = PRD.md

---

## P0 · 会出故障的（全部加起来约 1 小时）

最便宜、收益最直接的一批。第 1 条不修，部署上线就是坏的。

| # | 任务 | 量 | 为什么排最前 | 出处 |
|---|---|---|---|---|
| 1 | ✅ ~~`seed.js` 里 `containerbg-2.PNG` → `.png`~~ | 1 行 | 2026-09-19 随 #18 改名一并完成，数据库旧值也已用 `migrate-asset-paths.js --apply` 迁移 | C |
| 2 | ✅ ~~`index.css` 的 `@font-face` 路径~~ | 1 行 | 2026-09-19：先修好路径，随后发现字体文件 2MB，**索性整个移除改用系统字体栈**（PRD **D15**）。现在项目不下载任何字体文件 | C |
| 3 | ✅ ~~补上 `--interaction-paginate-link-hover-color`~~ | 1 行 | 2026-09-19 完成。按 D16 写成 `var(--color-accent)`，跟着主色走 | C |
| 4 | 🅿️ ~~新建 `server/.env.example`~~ —— **2026-09-19 用户决定跳过** | S | 文件已写好又按用户要求删除。若以后换机器或有人接手，需要的三个键是 `MONGO_URI`、`JWT_SECRET`、`PORT`（5001） | R#9 |
| 5 | ✅ ~~`Background.tsx` 改成从 API 取背景~~ | S | 2026-09-19 完成。用 `useRouteLoaderData` 复用 loader 已取回的数据，**不发第二个请求**；`db.json` 自此零引用 | R#16 |
| 41 | ✅ ~~墓园页（L1）外层背景切换成「主题·容器图」~~ | S | 2026-09-19 完成，和 #5 同一个组件。值写成 `var(--container-background-image)`，#25 接 DB 后自动跟着换 | C |

---

## P1 · 挡住后续开发的地基（数据模型 + 命名）

**这一段最该现在做。** 所有新功能都要建在这些字段名上，拖到功能写完再改，改动面直接翻倍。
目标形态见 DATA-MODEL.md，已经定稿。

| # | 任务 | 量 | 说明 | 出处 |
|---|---|---|---|---|
| 6 | ✅ ~~`Interaction` 改造：`type`→`"message"\|"item"`、`variety`→`itemName`、`graveId`→`grave_id`、`quantity` 加 `default:1`~~ | M | 花和物品合并成 `item` | D |
| 7 | ✅ ~~`User` 改造：➕`role` ➕`inventory[]` ➕`lastRewardDate`~~ | S | 背包和管理员的地基 | D |
| 8 | ✅ ~~`Grave` ➕`icon`；`GyBlock` ➖`number`~~ | S | | D |
| 9 | ✅ ~~写数据迁移脚本（或直接清库重新 seed）~~ | M | ⚠️ 6–8 会让现有数据对不上字段，这步别漏 | — |
| 10 | ✅ ~~统一 `totalFlowers` 的两套算法，抽成同一个 stats 函数~~ | S | 现在同名字段两个值：献 99 朵花，详情页显示 99、献花响应返回 1，**页面数字会跳变** | R#5 |
| 11 | ✅ ~~所有对外响应统一 populate `user`~~ | S | 去掉前端那串 `item.user?.username \|\| item.user \|\| 'Unknown'` 兜底 | R#6 |
| 12 | ✅ ~~路由参数大小写统一（后端 `:graveId` / 前端 `:graveid`）~~ | S | | R#10 |

---

## P2 · 让以后的改动变安全

有了类型，上面那些重命名才不会漏改；没有类型，改字段名不会报错。

| # | 任务 | 量 | 说明 | 出处 |
|---|---|---|---|---|
| 13 | ✅ ~~建 `client/src/types.ts`，把 DATA-MODEL 里的类型落成代码，替掉组件里的 `any`~~ | M | 现在 `graveData: any`、`interaction: any`、`favorites: any` 全靠记忆 | R#12 |
| 14 | ✅ ~~loader 返回值：元组 → 具名可辨识联合~~ | S | 不用再靠 `data[0]` / `const [, graveData] = data` 取值 | D |
| 15 | 图片字段统一成 `ImageRef {url, styles?}` | M | `backgroundImage` 是对象，`blockIconImage`/`graveIcon`/`photos` 是裸字符串 | R#11 |

---

## P3 · 纯清理（不影响别的，随时可做）

| # | 任务 | 量 | 说明 | 出处 |
|---|---|---|---|---|
| 16 | 🔸 删死文件 —— **只剩 `vite.svg`** | S | 2026-09-19 已删 11 个：`App.css`、`react.svg`、`theme.json`、`user.json`、`gy-img`、`graveyardLogo.png`、`IMG_7436.PNG`、樱花图、两份 `ms-pgothic.woff2`（随 D15）、**`db.json`**（#5 做完后零引用）。剩 `vite.svg` —— 它是 favicon，得先有一张方形图标才能换掉 | C |
| 17 | 删死 CSS 变量：`--content-transition`、`--header-max-width`、`--interaction-paginate-link-color`、`--items-per-page` | S | 最后一个是 JS 概念放错在 CSS 里 | C |
| 18 | ✅ ~~静态资源按 CONVENTIONS 重命名 + 目录重组~~ | M | 2026-09-19 完成：9 张图改成 `<角色>-<内容>`，重组为 `themes/yume2kki/`、`blocks/<blockID>/`、`blocks/_default/`。数据库旧路径已用 `server/migrate-asset-paths.js --apply` 迁移完成 | C |
| 19 | ✅ ~~CSS 变量重命名（`-img-url`/`-image-url` 混用、`seperator` 拼写）~~ | S | 2026-09-19 完成：8 个变量改名 + 新增 `--modal-background-image`；CSS 里的值正式降级为「兜底默认值」 | C |
| 20 | 选择器命名统一 kebab-case（`#headerIconContainer`、`.borderDecoration` 等） | S | | C |
| 42 | ✅ ~~像素字体没接上~~ | S | 2026-09-19 收尾：`.Pixelify Sans.` 死回退随 D15 移除；`font-pixel` 类在 `index.css` 的 `@theme` 里声明成**复古等宽栈**（零下载），产物里已生成 `.font-pixel{font-family:var(--font-pixel)}`。以后要真像素字体，只需把拉丁像素 webfont 插到那行最前面 | C |
| 21 | 列表接口瘦身：`GET /grave` 不返回每座墓碑的完整 `history` | S | 现在每翻一页都为每座墓碑多跑一次 Interaction 查询 | R#4 |
| 22 | `PUT /grave` 改用 `!== undefined` 判断，支持把选填字段清空 | S | 现在传空字符串会被当成"没传" | R#7 |
| 23 | 自由文本加 maxlength（`epitaph`、`memorial`、`content`） | S | | R#8 |
| 24 | `email` 幽灵字段：补回 schema 或删掉 `select("email")` 和前端引用 | S | | R#2 |
| 44 | **lint 清零**：`main` 上 `npm run lint` 从未通过（2026-09-25 实测 33 个错，Phase 1 顺带降到 12 个） | M | 剩余三类：① `react-refresh/only-export-components` ×7（组件文件里同时导出 loader / context / hook，要拆文件）② React 19 新规则 ×2（`AuthContext` 的 effect 里同步 setState、`useGraveData` 渲染时调 `Math.random`）③ `ThemeContext` 的 `any` ×3（随 #25 消失）。清零之前「lint 通过」没法当验收标准 | — |

---

## P4 · 解锁被卡住的功能

| # | 任务 | 量 | 说明 | 出处 |
|---|---|---|---|---|
| 25 | **主题四套来源收敛**：DB 为唯一真源 → ThemeProvider 把值 `setProperty` 写进 `:root` → CSS 只留兜底 | M | 方案已定稿（PRD **D14**，链路见 CONVENTIONS 第五节）。前端只碰 4 个文件（`AuthContext` / `ThemeContext` / `variables.css` / `ModalReuse`），**后端零逻辑改动** —— `GET /user/me` 早就 `populate("settings.theme")` 了，数据到了浏览器被 `AuthContext` 丢掉。**颜色部分的 CSS 两层结构已于 2026-09-19 落地**（PRD **D16**：调色盘 `--color-*` + 用途色派生），剩下的是给 `Theme` 补 `colors`（9 个）和 `closeButtonImage`、写 `applyTheme`。目标形态和完整示例见 CONVENTIONS 5.2 | C |
| 26 | `Settings.tsx` 面板（主题切换 + 字号） | M | 依赖 #25。后端 API 早就齐了 | R#13 |
| 43 | 🅿️ **主题可切换字体**（后期考虑，非承诺） | M | ⚠️ 受 **D15** 约束：**不要自托管整套 CJK 字库**，只给拉丁字母配小体积像素字体。给 `Theme` 加 `font: {family, url}`；`font-family` 改成读 `--font-body` 变量；用浏览器的 `FontFace` API 在运行时只加载当前主题那一个字体，失败就回退 CSS 默认值。**依赖 #2（已完成）和 #25**。⚠️ 注意归属：**字体属主题，字号属用户**（`User.settings.fontsize` 字段早就有了）——别把字号也塞进主题 | — |

---

## P5 · 功能开发（技术债还完之后）

> ⚠️ **提醒**：#27–28 是网站的核心玩法——现在详情页**只能看不能互动**，献花和留言的后端接口早就写好了、前端却没有任何入口。
> 按"先还技术债"排它们会靠后，如果中途想让站点先能玩，把 #27–29 提到 P2 之后是合理的。

| # | 任务 | 量 | 说明 | 出处 |
|---|---|---|---|---|
| 27 | 后端：`POST /grave/:graveID/offerings`（合并原 `/flowers`）+ 扣背包 | M | 依赖 P1 | P |
| 28 | 前端：详情页**献上 UI** + **留言 UI** | M | 留言后端也早就有了，前端同样没入口 | P |
| 29 | 详情页统计改造：`totalOfferings` +「这里放着 N 个东西」+ 按名字分组明细 | S | | P |
| 30 | 每日奖励：`POST /user/me/daily-reward`（前端启动自动调，带本地日期） | M | | P 2.1 |
| 31 | 背包 UI + **命名按钮**（「这个神奇的种子最终变成了什么？」） | M | 命名可指定数量、会拆分堆叠、不可逆 | P 2.2 |
| 32 | 花品种表 `FlowerVariety` + 地图/详情页随机刷新 + 点击拾取 | L | 因为不做防刷，只需前端图层 + 一个 collect 接口 | P 1.1 |
| 33 | 墓碑 icon 接线：`grave.icon` → `block.graveIcon` → 默认，改掉 `GraveIcon.tsx` 的硬编码 CSS 变量 | M | | P 3 |
| 34 | 收藏功能：**后端补 POST/DELETE 路由** + 前端 | M | 现在只有字段和读取，没有写入路由，功能是死的 | R#1 |
| 35 | 管理员系统：`requireAdmin` + `POST/PUT /blocks` + 删墓碑豁免 + 管理面板 | L | 依赖 #7 的 `role` | P 4 |
| 36 | 编辑 / 删除墓碑 UI | M | 后端 PUT/DELETE 早就有了 | R#15 |
| 37 | toast 组件 | S | 每日奖励、献花成功都能复用 | R#17 |
| 38 | `About.tsx` 页面 | S | 页脚已有链接，点进去是空白页 | R#14 |
| 39 | 真文件上传替换贴 URL（存储方案待定，注意 Vercel 无持久磁盘） | L | | P 5 |
| 40 | `photos` 支持多图或改成单张 | S | 现在是数组但只渲染第一张 | R#3 |

---

## 建议的起手式

P0 五条加起来大约一小时，做完就能消掉一个会导致线上 404 的隐患。
接着直接进 P1——**数据模型和命名是唯一一件"越晚做越贵"的事**，其它技术债什么时候还成本都差不多。
