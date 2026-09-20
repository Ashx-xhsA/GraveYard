# PRD



9.17 搁置有一段时间了，现在明确一下要做的功能

---

## 用户交互

- 用户可以献花
- 可以命名“花”
  - A 送上 99 个地雷
  - B 送上10个独角兽
  - 总共收到的花有 109 个
- 或者--- 把花改成“物品”
- 用户可以献上物品，物品可以取名字，但是花则保持原本的名字
- 每次登陆网站获取一个物品（物品作为一种奖励发放）
- 在随机的墓地里刷新随机的花朵，用户点击可以获得花朵

##  背景

- 不同的墓园有不同的背景，背景是background
- 不同的墓园可以有不同的墓碑icon
- 墓园的background可以有一个管理员账号上传的接口
- 管理员账号可以开设新的墓园，设定墓园的background和墓园的默认墓碑图片
- 用户在创建墓碑的时候可以用自己的图片（不可修改）
- 管理员账号可以移除墓碑

---

# PRD v2 — 结构化规格（2026-09-17 补充）

> 结合当前代码库实际状态整理。状态标注含义：
> ✅ 已完成 ｜ 🟡 部分/字段在但没接线 ｜ 🔴 从零新建 ｜ ⚠️ 与现有实现冲突需改造

## 0. 术语澄清（先统一，避免歧义）

| 名词 | 含义 | 当前字段 | 状态 |
|---|---|---|---|
| 墓碑照片 photos | 死者的照片，显示在墓碑详情页 | `Grave.photos: [String]` | ✅ 已能贴 URL |
| 墓碑图标 icon | 列表里代表墓碑的那个 sprite 图标 | 无（要新增 `Grave.icon`） | 🔴 新增 |
| 墓园默认图标 | 某墓园里墓碑的默认 icon | `GyBlock.graveIcon` | 🟡 字段在，前端没读 |
| 花 flower | **固定品种名**（郁金香/百合…），可批量献，来源=地图/详情页随机刷新点击拾取 | `Interaction.type:"flower"` + `variety` | 🟡 献花后端好、前端无入口；拾取 🔴 |
| 物品 item | **可命名**，每日登录送 1 个 | 无（新增 type + 库存） | 🔴 新增 |
| 献祭 offering | 把花/物品献给某墓碑，落一条 Interaction | `Interaction` | 🟡 |

---

## 1. 花系统（Flower）

### 1.1 获取——随机刷新 + 点击拾取 🔴
- 在**墓园地图（区块内墓碑列表页）**和**墓碑详情页**的随机位置刷新可点击的花。
- 用户点击 → 对应品种的花进入背包。
- **明确不做防刷（决策 D1）**：不限频、不去重、不把 spawn 落库。花刷在哪、刷什么品种、刷几朵，**全部由前端随机生成**。允许用户刷花。
- 唯一的服务端要求是**记账**（与防刷无关，是功能需要）：背包必须存在服务端，否则 ① 换设备背包丢失 ② 献花的扣减和数量校验无从谈起。
- **API**：`POST /api/user/me/flowers/collect`，body `{ variety }` → 背包对应品种 +1。
- **前端**：地图/详情页叠加一层可点击花朵图层，点击后播放动画 + 调 collect。

### 1.2 使用——献花 🟡（后端已就绪，缺前端）
- 详情页新增「献花」入口：从**背包里已有的品种**中挑选，选数量（≤ 该品种余额）提交。
- 花名是**固定品种名**（郁金香 / 百合 / …），来自预设品种表，用户**不能自定义**。
  - ⚠️ 需改造：当前 `flower` 的 `variety` 是任意字符串，要改为**校验 `variety ∈ 预设品种表`**。
  - 品种表放后端常量并导出给前端复用（可选扩展见 D5：不同墓园开不同的花）。
- **API**：🔁 `POST /api/grave/:graveId/offerings`（由现有 `/flowers` 改造而来，献花和献物品合并为同一个接口），提交时校验品种 + 扣背包（🔴 扣减逻辑要加）。

### 1.3 详情页统计 ⚠️ 改造
- 口径改为「**这里放着 N 个东西**」，N = 所有 `type:"item"` 记录的 `quantity` 总和（花和物品在互动记录里已统一成 `item`，不再区分）。
- **留言单独计数**（留言不算"放着的东西"）。
- 明细按名字分组展示，例如 `郁金香 ×12 / 百合 ×3 / 地雷 ×99 / 独角兽 ×10`。
- 🟡 现有 `populateInteractions` 只算 `totalFlowers` / `totalMessages`，需扩展为 `totalOfferings` + `byName` 分组；前端 `InteractionPaginateContainer` 的 `TotalCount` 组件同步改。

---

## 2. 物品系统（Item）🔴 全新

### 2.1 获取——每日奖励（自动发放）
- 用户每天**打开网站**时自动发放 1 个**未命名**物品到背包，不需要点任何按钮。
- ⚠️ **不能挂在登录接口上**：JWT 有效期 7 天（`auth.js` 的 `expiresIn: "7d"`），用户登录一次后 7 天内不会再碰登录接口，挂在那里等于 7 天才发一次，与「每次打开网站发一个」的本意不符。
- **触发**：前端启动时自动调 `POST /api/user/me/daily-reward`，body 带前端本地日期 `{ localDate: "2026-09-19" }`。
- **判定**：后端比对 `User.lastRewardDate`，不同就发放并更新。传本地日期是为了零时区逻辑 + 跨天边界符合用户直觉；可被伪造，但本来就不防刷（D1）。
- **补发**：隔多久没来都**只发 1 个**，不按天数累积。
- **数据模型**：写入统一背包 `User.inventory`（`kind:"item"`, `name:""`）；`User.lastRewardDate: string`。
- **提示**：🅿️ 计划用 toast 提示「今天获得了一颗神奇的种子」，**本轮不做**，先静默发放。

### 2.2 命名——在背包里点按钮命名
- 物品发下来是未命名的，用户在**背包里**通过一个专门的按钮给它命名。
- 文案是一次性转化的语气：**「这个神奇的种子最终变成了什么？」**
- 命名**可指定数量**（想送 99 个地雷不必点 99 次），命名后会**拆分堆叠**：
  `{name:"", count:3}` → 命名 1 个 → `{name:"地雷", count:1}` + `{name:"", count:2}`
- **花不能命名**，按钮对 `kind:"flower"` 的条目禁用。
- 建议**命名不可逆**（种子变成什么就是什么）。
- **API**：🔴 `POST /api/user/me/inventory/name`，body `{ name, quantity }`。

### 2.3 使用——献上物品
- 和献花是**同一个操作**：从背包拿 N 个 X 放到墓碑上。
- **数据模型**：`Interaction.type:"item"`；名字存 `itemName`、数量存 `quantity`。
- **API**：`POST /api/grave/:graveId/offerings`（与献花共用），提交时从 `inventory` 扣减。
- **前端**：详情页「献上」入口，从背包里选条目 + 选数量。

---

## 3. 墓碑图标（Grave Icon）🟡/🔴

- **渲染优先级**：`Grave.icon`（用户自定义）→ `GyBlock.graveIcon`（墓园默认）→ 全局默认 sprite。
- **用户自定义**：建墓时可传自己的 icon，**建后不可修改**（`photos` 死者照片保持可后续处理，二者区分开）。
  - 🔴 新增 `Grave.icon: String`；NewGrave 表单加「墓碑图标」字段（现阶段贴 URL）。
  - PUT 更新墓碑时**忽略 icon 字段**以保证不可改。
- **前端接线**：⚠️ `GraveIcon.tsx` 目前用硬编码 CSS 变量 `var(--grave-img-url)`，需改为按上面优先级读取真实值。

---

## 4. 管理员系统 🔴 全新（多条需求的地基）

- **角色**：`User.role: "user" | "admin"`，默认 `user`；`verifyToken` 之外加 `requireAdmin` 中间件。
- **开设新墓园**：`POST /api/blocks`（现在只有 GET）——设 name、blockID、background、默认墓碑 icon。
- **修改墓园背景/默认图标**：`PUT /api/blocks/:blockID`。
- **移除任意墓碑**：⚠️ 现在 `DELETE /grave/:graveId` 只放行墓碑本人（非本人 403），需为 admin 加豁免。
- **前端**：一个简单的管理面板（建墓园 / 传背景 / 传默认 icon / 删墓碑）。

---

## 5. 上传能力

- **现阶段**：所有图片（背景、默认 icon、墓碑 icon、死者照片）统一**贴 URL**。
- **后续**：换成真文件上传。设计时把「拿到一个图片地址」抽象成一层，方便以后从 URL 输入切换到上传组件 + 存储（本地 / S3 / Cloudinary，见「待定决策 D2」）。

---

## 数据模型变更汇总

| 模型 | 变更 | 用途 |
|---|---|---|
| User | + `role`、`inventory[]`、`lastRewardDate` | 权限 + **统一背包**（花和物品同一个列表）+ 每日奖励（存本地日期字符串，非时间戳）|
| FlowerVariety（新）| `name`、`icon`、`spawnWeights` | 花的品种表；`spawnWeights: {blockID: 权重}` 同时决定「在哪刷」和「多稀有」 |
| Grave | + `icon` | 用户自定义墓碑图标（建后不可改） |
| Interaction | `type`→`"message"`\|`"item"`（花物合并）；`variety`→`itemName`；`graveId`→`grave_id`；`quantity` 加 default | 统一成「放在墓碑上的东西」 |
| GyBlock | ➖ `number` | 从不更新会失真，需要时实时 count |
| Theme | 🅿️ 本轮预留 | 主题系统延后 |
| ~~FlowerSpawn~~ | **已取消**（D1 决定不落库，花由前端随机生成） | — |

## API 变更汇总

| 方法 | 路径 | 状态 |
|---|---|---|
| POST | `/api/grave/:graveId/offerings` | 🔁 由 `/flowers` 改造，**献花和献物品合用**；加品种校验 + 扣背包 |
| POST | `/api/user/me/flowers/collect` | 🔴 新增（地图拾取记账，无防刷） |
| POST | `/api/user/me/inventory/name` | 🔴 新增（给未命名物品命名） |
| POST | `/api/user/me/daily-reward` | 🔴 新增（前端启动时自动调，body 带本地日期） |
| GET | `/api/flower-varieties`（预设品种表） | 🔴 新增（或前后端共享常量） |
| POST | `/api/blocks`（建墓园，admin） | 🔴 新增 |
| PUT | `/api/blocks/:blockID`（改背景/默认图，admin） | 🔴 新增 |
| DELETE | `/api/grave/:graveId`（admin 豁免） | 🟡 改造 |

## 实施优先级 & 依赖顺序（建议）

1. **背包基础**：User 加 `flowerBag`/`itemBalance`，献祭时扣减（献花 UI 的前置）。
2. **献花 / 献物品的详情页 UI** + 详情页统计口径改造（收益最高，API 基本现成）。
3. **每日物品奖励**（简单，登录结算）。
4. **花的随机刷新 + 点击拾取**（因取消防刷，现在只是前端图层 + 一个 collect 接口）。
5. **管理员系统**（角色 → 建/改墓园 → 删墓碑豁免）。
6. **墓碑 icon 自定义 + GraveIcon 接线**（可与 5 并行）。
7. 收尾：真文件上传替换 URL、Settings/About 空壳、清理死资源与 mock 文件（见 CONVENTIONS.md）。

## 决策记录

- **D1 花掉落的实现方式** → ✅ **已定：不做防刷**。花的位置/品种/数量全部前端随机生成，不落库、不去重、不限频。服务端只提供 `collect` 记账接口（背包必须在服务端，理由是跨设备一致 + 献花需要扣减校验）。
- **D2 文件上传** → ✅ **已定：现阶段全部贴 URL**，后续再做真上传。设计时把"获得一个图片地址"抽象成一层，方便以后替换。存储方案（本地/S3/Cloudinary）延后定，注意 Vercel 无持久磁盘。
- **D3 花名可否自定义** → ✅ **已定：不可**。花用预设固定品种名（郁金香/百合…）；只有**物品**可自由命名。
- **D4 详情页统计口径** → ✅ **已定**：「这里放着 N 个东西」= 花 + 物品的 quantity 总和，留言单独计数，明细按名字分组。

- **D5 背包结构** → ✅ **已定：统一背包**。不分花背包 / 物品背包，`User.inventory: [{kind, name, count}]` 一个列表装下所有花和物品，`kind` 只用于区分显示和来源规则。
- **D6 不同墓园开不同的花** → ✅ **已定：归花系统所有**。由 `FlowerVariety.blocks` 声明该品种能在哪些墓园刷新，**不在 `GyBlock` 上加字段**。依赖方向是「花认识墓园，墓园不认识花」，墓园无需为花系统改动。

- **D7 每日奖励怎么发** → ✅ **已定：自动发放，单独一个 POST 接口**。前端启动时自动调 `POST /user/me/daily-reward`（带本地日期），用户不用点。
  - **不挂在登录接口上**：JWT 7 天有效，挂那儿等于 7 天才发一次。
  - **不挂在 `GET /user/me` 上**：发放会写库，GET 带副作用以后调试容易踩坑。
  - **只发 1 个**，隔多久没来都不累积补发。
  - **跨天按前端传的本地日期判定**（`lastRewardDate` 存 `"YYYY-MM-DD"` 字符串），零时区逻辑；可伪造但不防刷。
  - **提示用 toast**，🅿️ 本轮只计划不做，先静默发放。
- **D8 物品什么时候命名** → ✅ **已定：在背包里点专门的按钮命名**。不是领取时（弹窗打断体验），也不是献上时。文案取一次性转化的语气「这个神奇的种子最终变成了什么？」。命名可指定数量、会拆分堆叠、花不可命名。
- **D9 献花与献物品的接口** → ✅ **已定：合并**成 `POST /grave/:graveId/offerings`。`Interaction.type` 合并后两者本就是同一个操作——「从背包拿 N 个 X 放到墓碑上」。
- **D10 字段命名风格** → ✅ **已定**：`variety`→**`itemName`**（camelCase，与其它字段一致）；`graveId`→**`grave_id`**（唯一的下划线例外，因为它存的就是 `_id`）。

- **D11 命名是否可逆** → ✅ **已定：不可逆**。种子变成什么就是什么，可改名会削弱这个动作的仪式感。

- **D12 图片分层模型**（2026-09-19 新增） → ✅ **已定：走进一层，原本的「里面」变成现在的「外面」**。即 **新一层的 `background` ＝ 上一层的 `container` 背景**。
  - L0 首页：外层＝主题·背景图，里层＝主题·容器图（氛围，如「墓园漂浮在黑洞上」），里层内容＝各墓园入口图标；
  - L1 墓园：外层＝主题·容器图，里层＝**该墓园**·背景图，里层内容＝这座墓园的墓碑；
  - L2 墓碑：外层＝该墓园·背景图，里层不使用图片。
  - **理由**：营造「逐步点击、逐步走进」的空间感 —— 你刚才看见的那片氛围，下一层你就站在它里面。
  - **推论**：图片只有两类 —— 主题资源（跟 `Theme` 走）与墓园资源（跟 `GyBlock` 走）。**每座墓园都要有自己的入口图标和专属墓碑 sprite**，不共用；`_default/` 只是兜底。
  - 完整模型与命名规范见 **CONVENTIONS.md** 第一、二、四节（素材实拍清单见 `docs/claude/2026-09-19_…会话记录.md` 附录 D）。

- **D13 `Theme.homeImage` 改名为 `containerImage`**（2026-09-19 新增） → ✅ **已定**。
  - **理由**：按 D12，该字段存的正是「主题的容器图」（L0 的里层 / L1 的外层），`homeImage` 这个名字只说明了它出现在首页、没说明它是什么。CONVENTIONS 原先记的「`homeImage` 要么用起来要么删掉」由此有了答案：**用起来，并改名**。
  - 同时修订 DATA-MODEL.md 的 `Theme` 表。改名影响线上数据（该字段已有记录），需随资源重命名一并迁移。

- **D14 主题取值链路**（2026-09-19 新增） → ✅ **已定：DB 是唯一真源，JS 把主题值注入 CSS 变量，CSS 里的值降级为兜底默认。**
  - 链路：`Theme` 表 →（`GET /user/me` 已 `populate("settings.theme")`，后端不用改）→ `AuthContext` 保留 `settings` → `ThemeProvider` 用 `document.documentElement.style.setProperty()` 写进 `:root` → 全站 `var(--xxx)` 自动换值。
  - **取值分工**：全站一份的值（主题的背景/边框/字号）走 **CSS 变量**；一条数据一份的值（每座墓园自己的背景图）走 **内联 `style`**。两类值本来就该用不同办法，不是两套方案。
  - **兜底不用额外写**：`variables.css` 里现有的硬编码值天然就是默认值，主题没加载 / 请求失败 / 未登录时自动生效，不会白屏。
  - **为什么不选另一种**（把主题值当 props 层层传给组件、或继续往组件上挂 `style={style}`）：那样每加一个用到主题的组件都要改一遍传参，且 CSS 里会同时存在两个取值入口；现在这套只需组件写 `var(--xxx)`，主题变了组件一行都不用改。
  - 废弃来源：`src/theme.json`（删）、`ThemeContext` 里的硬编码 `style` 对象（改为 DB 值 + 兜底）。
  - 完整链路图与 CSS 变量原理补课见 **CONVENTIONS.md** 第五节；当时的四套来源现状与要改的 4 个文件见 `docs/claude/2026-09-19_…会话记录.md` 附录 F。

- **D15 字体方案：用系统字体栈，不自托管 webfont**（2026-09-19 新增） → ✅ **已定**。
  - **背景**：`index.css` 里原有一个 `@font-face` 自托管 `ms-pgothic.woff2`。当天先修好了它的路径 bug（TODO #2，此前一直加载失败），随即发现该文件 **2.0 MB** —— 是整个 JS 打包产物（408 KB）的 5 倍。
  - **决定**：删除 `@font-face` 与字体文件，`html, body` 改用系统字体栈
    `system-ui, -apple-system, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif`。
  - **理由**：① CJK 字库因字符集庞大**天生瘦不下来**，不是压缩能解决的；② 2 MB 首屏成本换不回对等的视觉收益；③ `MS PGothic` 是微软随 Windows/Office 分发的商业字体，**转成 woff2 自行托管分发在授权上有风险**。
  - **代价**：各平台字体观感不再统一（mac 上是 PingFang，Windows 上是微软雅黑）。接受 —— 本站视觉风格由像素素材承载，不依赖字体。
  - **以后若要像素风**：走「**拉丁字母用小体积像素字体（几十 KB）+ CJK 交给系统**」的路子，**不要再自托管整套 CJK 字库**。这条同样约束 **#43**（主题可切换字体）。
  - **当前的零成本折中**（2026-09-19 一并落地，TODO #42）：`index.css` 的 `@theme` 里把 `--font-pixel` 声明为**复古等宽栈**（`ui-monospace, 'SF Mono', Menlo, Consolas, 'MS Gothic', monospace`），供 `className="font-pixel"` 的少数位置（墓园名、分页页码）使用。仍然零下载，但和正文黑体拉开了区别；CJK 会回落到系统字体，Windows 上落到 `MS Gothic`（小字号本就是点阵观感）。将来接入拉丁像素 webfont 时，只需把它插到这行最前面，这些位置自动升级。

- **D16 颜色分两层：主题只存调色盘，用途色在 CSS 里派生**（2026-09-19 新增） → ✅ **已定**。
  - **问题**：`variables.css` 原有 **19 个颜色变量，但只有 8 种颜色** —— 主色紫 `rgb(119,89,114)` 被写了 4 遍、白被写了 5 遍。更糟的是 `ThemeContext` 里还硬编码着 `modalHeaderColor: '#553d66'`，**是第五个、且不一样的紫** —— 配色已经漂移了。
  - **决定**：
    - **第一层 调色盘 `--color-*`**（9 个）：`accent` / `accent-soft` / `ink` / `ink-strong` / `ink-alt` / `shadow` / `surface` / `light` / `overlay`。**主题自定义的就是这一层**。
    - **第二层 用途色 `--{域}-{元素}-{属性}`**（19 个）：值**只能**是 `var(--color-*)`，不许再直接写 `rgb(...)`。**主题不存这一层。**
  - **理由**：① 换一个主色只需改 1 处而不是 4 处，不可能漏；② `Theme` 表只需 9 个颜色字段而不是 19 个；③ Settings 面板给用户 5–9 个取色器是可用的，19 个没人会用。
  - **透明变体用 `color-mix`**：如 hover 底色 `color-mix(in srgb, var(--color-accent) 10%, transparent)`，这样它会跟着主色走；写死 `rgba(119,89,114,0.1)` 的话换主色时会掉队。
  - **2026-09-19 已落地**（纯重构，逐个变量比对过，29 个解析后取值完全一致）。主题注入那一半仍属 **#25**。
  - 与 **D14** 的关系：D14 定「值从哪来」（DB → `setProperty` → CSS 兜底），D16 定「主题该存哪些值」（只存调色盘）。

## 待定决策

（暂无 —— 数据结构已冻结，可以开始实现）

> 各数据结构的「现状 → 目标」完整定义见 **DATA-MODEL.md**；
> 本轮不处理的已知问题见 **REMINDERS.md**；样式与静态资源规范见 **CONVENTIONS.md**。

---

# 附录 A：当前代码现状清单（as-is，2026-09-17 核对）

## A.1 现有 API 全表

| 挂载点 | 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|---|
| auth | POST | `/api/auth/register` | — | 409 重名 / 422 非法 |
| auth | POST | `/api/auth/login` | — | 返回 `{token, userId}`，7d 过期 |
| grave | GET | `/api/grave` | — | query: `page`/`limit`/`block`；返回 `{graves, totalPages, currentPage, total, blockInfo}` |
| grave | GET | `/api/grave/:graveId` | — | 按 **`graveID` 字符串**查（非 `_id`） |
| grave | POST | `/api/grave` | ✅ | 必填 name/birth/death/block；自动生成 graveID |
| grave | PUT | `/api/grave/:graveId` | ✅ 本人 | 非本人 403 |
| grave | DELETE | `/api/grave/:graveId` | ✅ 本人 | 级联删该墓碑的 interactions |
| interaction | GET | `/api/grave/:graveId/interactions` | — | 按时间倒序 |
| interaction | POST | `/api/grave/:graveId/flowers` | ✅ | body `{variety, quantity=1}` |
| interaction | POST | `/api/grave/:graveId/messages` | ✅ | body `{content}` |
| interaction | DELETE | `/api/grave/:graveId/interactions/:interactionId` | ✅ 本人 | 撤回自己的互动 |
| user | GET | `/api/user/me` | ✅ | 含 `gravesCreated`/`interactionsMade` 统计 |
| user | GET | `/api/user/me/graves` | ✅ | |
| user | GET | `/api/user/me/interactions` | ✅ | |
| user | PUT | `/api/user/me/settings` | ✅ | body `{theme, fontsize}` |
| user | DELETE | `/api/user/me` | ✅ | 级联删墓碑 + 互动 |
| blocks | GET | `/api/blocks` | — | 首页墓园列表 |
| blocks | GET | `/api/blocks/:blockID` | — | |
| theme | GET | `/api/theme` | — | |
| theme | GET | `/api/theme/:name` | — | |
| — | GET | `/api/health` | — | |

## A.2 现有数据模型

```
User      username(unique,lowercase,trim) / password(pre-save bcrypt) /
          favorites[→Grave] / settings{theme→Theme, fontsize:14} / timestamps
          ※ email 字段已被注释掉

GyBlock   blockID(unique) / name / blockIconImage / graveIcon /
          backgroundImage{url(required), styles} / description / number / timestamps

Grave     graveID(unique) / block→GyBlock(required) / name(required) /
          birth / death / epitaph / burial{display_name,address} /
          memorial / photos[String] / user→User(required) / timestamps

Interaction  graveId→Grave(required) / type enum["flower","message"](required) /
             variety / quantity / content / user→User(required) / timestamps

Theme     name(unique) / backgroundImage{url,styles} / borderImage / homeImage / timestamps
```

## A.3 现状里的「悬空设计」（有一半、接不上的）

| 问题 | 细节 |
|---|---|
| 收藏功能不可用 | `User.favorites` 有字段、`/user/me` 有读取，但**没有任何写入路由**；前端直接渲染原始 ObjectId |
| 主题不可切换 | `Theme` 模型 + `/api/theme` + `User.settings.theme` 后端齐全，但前端 `Settings.tsx` 是空壳、`ThemeContext` 硬编码，`setTheme` 从未被调用 |
| `GyBlock.number` 会失真 | 记录墓园墓碑总数的字段，但建墓/删墓时**从不更新** |
| `GyBlock.graveIcon` 未接线 | 前端 `GraveIcon.tsx` 用硬编码 CSS 变量，不读该字段 |
| 外层背景是假数据 | `Background.tsx` 仍从 `client/db.json` mock 取背景（代码自带注释「只寫了local的測試邏輯，等待修改」） |
| PUT 无法清空字段 | `grave.js` 用 `if (field)` 判断，传空字符串会被忽略，选填项改不回空 |
| email 永远 undefined | `User` 无 email 字段，但 `/user/me` 仍 `select("email")`、前端 `AuthContext` 也在读 |
| 无输入长度校验 | epitaph / memorial / content 等自由文本无 maxlength |
| 缺环境变量样例 | 需要 `MONGO_URI`、`JWT_SECRET`，但无 `.env.example`，缺失时 `jwt.sign` 直接抛错 |
