# 遗留问题清单

> 已知但本轮不处理的问题，攒在这里方便日后查看。
> 编号被 DATA-MODEL.md 引用（如「见 REMINDERS #3」），**调整顺序时别改编号**。
>
> 样式与静态资源相关的问题另见 **CONVENTIONS.md**，那边有详细的修复方案。

## 数据与 API

| # | 问题 | 位置 | 影响 |
|---|---|---|---|
| 1 | **收藏功能是死的** —— `User.favorites` 有字段、`/user/me` 有读取，但**没有任何写入路由** | `models/User.js`、`routes/user.js` | 前端 `Favorites.tsx` 只能渲染原始 ObjectId，且永远为空。要做收藏得先补 POST/DELETE 路由 |
| 2 | **`email` 永远是 undefined** —— `User` schema 里 email 被注释掉了，但 `/user/me` 仍在 `select("email")`，前端 `AuthContext` 也在读 | `models/User.js:12`、`routes/user.js` | 不报错，但是个幽灵字段。要么补回 email，要么把读取一并删掉 |
| 3 | **`photos` 是数组但只用第一张** | `models/Grave.js`、`GraveInfo.tsx` | 要么支持多图轮播，要么改成单张字段 |
| 4 | **列表接口返回了用不到的完整互动历史** —— `GET /grave` 里每个墓碑都跑了一次 `populateInteractions()` | `routes/grave.js` | 每翻一页要为每座墓碑多跑一次 Interaction 查询（N+1），传输量也浪费。列表其实只需要 stats |
| 5 | **`totalFlowers` 有两种算法，会返回不同的数** —— `populateInteractions()` 是 **quantity 求和**，`getGraveStats()` 是 **countDocuments 条数** | `routes/grave.js`、`routes/interaction.js` | A 献 99 朵花：详情页加载显示 **99**，献完花的响应却返回 **1**，**页面数字会跳变**。改造成 `totalOfferings` 时要抽成同一个函数 |
| 6 | **`user` 字段形状不稳定** —— 有时是 ObjectId，有时被 populate 成 `{_id, username}` | 各路由 | 前端被迫写 `item.user?.username \|\| item.user \|\| 'Unknown'` 兜底。应统一所有对外响应都 populate |
| 7 | **PUT 无法清空可选字段** —— `grave.js` 用 `if (field)` 判断，传空字符串会被当成"没传" | `routes/grave.js` | 用户改完墓志铭想清空改不回去 |
| 8 | **自由文本无长度校验** —— `epitaph`、`memorial`、`content` 等都没有 maxlength | 各 model | 可以塞进任意长的内容 |
| 9 | **缺 `.env.example`** —— 需要 `MONGO_URI`、`JWT_SECRET`，但仓库里没有样例文件 | 项目根 / `server/` | 新环境上手要靠猜；`JWT_SECRET` 缺失时 `jwt.sign` 直接抛错 |

## 命名与类型

| # | 问题 | 位置 | 影响 |
|---|---|---|---|
| 10 | **路由参数大小写不一** —— 后端 `:graveId`，前端 React Router `:graveid` / `:blockid` | `app.js`、`App.tsx` | 容易写错，建议统一 |
| 11 | **图片字段结构不统一** —— `backgroundImage` 是 `{url, styles}` 对象，而 `blockIconImage`、`graveIcon`、`photos` 是裸字符串；后缀也不一致（一个带 `Image` 一个不带） | `models/GyBlock.js`、`models/Grave.js` | 建议统一成 `ImageRef = {url, styles?}` |
| 12 | **前端组件 props 全是 `any`** —— `graveData: any`、`interaction: any`、`favorites: any` | `client/src/components/*` | 类型全靠记忆，改字段名不会报错。建议建 `client/src/types.ts` |

## 未完成的界面

| # | 问题 | 位置 | 影响 |
|---|---|---|---|
| 13 | **`Settings.tsx` 是空壳** —— 只有一个 `<div>Settings</div>`，而后端主题/字号 API 全套就绪 | `components/Settings.tsx` | 主题功能做不下去的表层原因（根因见 CONVENTIONS.md「主题来源收敛」） |
| 14 | **`About.tsx` 是空壳** —— 只有一个 `<h1>About</h1>`，但页脚已有链接指过去 | `components/About.tsx` | 点进去是空白页 |
| 15 | **编辑 / 删除墓碑没有 UI** —— 后端 PUT / DELETE 都已实现 | 前端 | 建完墓碑就改不了了 |
| 16 | **`Background.tsx` 读的是 mock 数据** —— 仍从 `client/db.json` 取背景，代码里自带注释「只寫了local的測試邏輯，等待修改」 | `components/Background.tsx` | 单墓碑页的外层背景永远是死数据。详见 CONVENTIONS.md |
| 17 | **toast 提示组件还没做** —— 每日奖励发放后想提示「今天获得了一颗神奇的种子」，本轮决定先静默发放 | 前端 | 用户领到了东西但不知道。做好后献花成功之类也能复用 |

## 样式与静态资源

详见 **CONVENTIONS.md**，那里有完整的诊断、重命名映射表和修复方案。摘要：

| 问题 | 严重度 |
|---|---|
| `seed.js` 里 `containerbg-2.PNG` 大小写不匹配实际文件，**部署到 Linux/Vercel 会 404** | 🔴 会出故障 |
| `@font-face` 用了相对路径，解析到不存在的 `src/fonts/` | 🟠 |
| `--interaction-paginate-link-hover-color` 被使用但从未定义，分页 hover 颜色失效 | 🟠 |
| `'Pixelify Sans'` 在字体栈里但从未加载 | 🟡 |
| `App.css` 是 Vite 模板残留，无人 import（误 import 会打乱布局） | 🟡 |
| 一批死资源与死 CSS 变量待清理 | 🟡 |
