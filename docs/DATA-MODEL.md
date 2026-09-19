# 数据结构参考

> 三层结构，每层逐个字段列出「现状 + 要改成什么」。
>
> **字段名前的标记**：`➕` 新增 ｜ `🔁` 改造 ｜ `➖` 删除 ｜ `🅿️` 预留（本轮不做）｜ 无标记 = 保持不变
>
> 本轮不处理的现存问题已移入 **REMINDERS.md**，这里不再展开。

```
① DB Schema        Mongoose 模型，数据库里真实存的
② API 响应形状      前端实际收到的 JSON（和 ① 不同！多了 populate 和派生字段）
③ 前端形状          loader / 组件 props
```

---

# 一、DB Schema

## User

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` | ObjectId | Mongo 主键 |
| `username` | string | unique / lowercase / trim |
| `password` | string | pre-save 钩子自动 bcrypt |
| `favorites` | ObjectId[] | → Grave（无写入路由，见 REMINDERS #1） |
| `settings.theme` | ObjectId | → Theme |
| `settings.fontsize` | number | default 14 |
| `createdAt` / `updatedAt` | Date | timestamps |
| `➕ role` | `"user"` \| `"admin"` | default `"user"`。管理员系统的地基 |
| `➕ inventory` | InventoryEntry[] | **统一背包**，花和物品放同一个列表 |
| `➕ lastRewardDate` | string | `"2026-09-19"`，**存用户本地日期**而不是时间戳。和前端传来的日期对比，不同就发放 |

### InventoryEntry（背包条目）`➕ 新增`

| 字段 | 类型 | 说明 |
|---|---|---|
| `kind` | `"flower"` \| `"item"` | 区分来源和显示：花有固定品种名和专属图标、来自地图拾取；物品自由命名、来自每日奖励 |
| `name` | string | 花 = 固定品种名（"郁金香"）；物品 = 用户取的名字，未命名则为 `""` |
| `count` | number | 同 kind 同 name 的合并成一条 |

> **背包保留 `kind`，但互动记录不保留**——因为背包需要知道「这是花还是物品」来决定图标和能不能命名；而一旦放到墓碑上，两者都只是"放着的东西"，不需要再区分（见 Interaction）。

### 物品命名：在背包里点按钮命名

物品发下来时是**未命名**的。用户在背包里通过一个专门的按钮给它命名，
文案是一次性转化的语气 ——「这个神奇的种子最终变成了什么？」

| 步骤 | 背包状态 |
|---|---|
| 每日登录发放 3 天 | `{kind:"item", name:"", count:3}` → 显示「未命名的物品 ×3」 |
| 点「命名」，输入"地雷"、数量 1 | `{kind:"item", name:"地雷", count:1}` + `{kind:"item", name:"", count:2}` |
| 献到墓碑上 | 从 `name:"地雷"` 那条扣减 |

- **命名会拆分堆叠**：3 个未命名物品命名掉 1 个，剩下 2 个仍是未命名。
- **命名时可指定数量**：想送「99 个地雷」不必点 99 次。
- **花不能命名**：`kind:"flower"` 的条目名字锁定为品种名，按钮对花禁用。
- **命名不可逆**（种子变成什么就是什么），若要允许改名需另定规则。

**API**：`POST /api/user/me/inventory/name`，body `{ name, quantity }` → 从未命名物品里取 `quantity` 个命名为 `name`。

## GyBlock（墓园）

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` | ObjectId | |
| `blockID` | string | unique。路由用的字符串 ID，如 `"sea-1"` |
| `name` | string | 显示名，如 `"大海區域"` |
| `🔁 blockIconImage` | string | 首页入口图标。裸字符串，建议改成 ImageRef |
| `🔁 graveIcon` | string | 该墓园的默认墓碑图标。裸字符串，且前端从未读取 |
| `backgroundImage.url` | string | required。墓园背景图 |
| `backgroundImage.styles` | string | JSON 字符串，如 `'{"backgroundSize":"cover"}'` |
| `description` | string | 墓园描述 |
| `➖ number` | number | **删除**。墓碑总数从不更新会失真，需要时用 `countDocuments` 实时算 |
| `createdAt` / `updatedAt` | Date | |

> **不加 `flowerVarieties`**。花在哪些墓园刷新由花系统自己声明，墓园这边一个字段都不用加。

## Grave（墓碑）

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` | ObjectId | |
| `graveID` | string | unique。路由用的字符串 ID，如 `"grave-1"` |
| `block` | ObjectId | → GyBlock，required |
| `user` | ObjectId | → User，required（创建者） |
| `name` | string | required。逝者名字 |
| `birth` | string | `"2025-03-12"`，**是字符串不是 Date** |
| `death` | string | 同上 |
| `epitaph` | string | 墓志铭 |
| `memorial` | string | 悼词 |
| `burial.display_name` | string | 安葬地名称，如 `"洗衣机"` |
| `burial.address` | string | 安葬地地址 |
| `photos` | string[] | 逝者照片（UI 只用第一张，见 REMINDERS #3） |
| `➕ icon` | string | **用户自定义墓碑图标，建后不可改**（PUT 时忽略此字段） |
| `createdAt` / `updatedAt` | Date | |

> **`photos` 和 `icon` 是两回事**：`photos` = 逝者的照片，显示在详情页；`icon` = 列表里代表这座墓碑的那个 sprite。

## Interaction（放在墓碑上的东西 / 留言）

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` | ObjectId | |
| `🔁 grave_id` | ObjectId | → Grave，required。**原名 `graveId`**，改成下划线以便和业务 ID `graveID` 一眼区分（它存的是 `_id`，写成 `grave_id` 正好呼应） |
| `user` | ObjectId | → User，required |
| `🔁 type` | `"message"` \| `"item"` | **原来是 `"flower"` \| `"message"`**。花和物品统一算 `item`，不再区分 |
| `🔁 itemName` | string | **原名 `variety`**。存物品名或花名，**仅 `type:"item"` 使用** |
| `🔁 quantity` | number | 加 `default: 1`。仅 `type:"item"` 使用 |
| `content` | string | 留言内容，仅 `type:"message"` 使用 |
| `createdAt` / `updatedAt` | Date | |

**`type` 合并后的三个连带影响：**

1. **统计变简单**：「这里放着 N 个东西」= 所有 `type:"item"` 的 `quantity` 求和，不用再分两类。
2. **想给花显示专属图标**，可以靠 `itemName` 反查品种表（`itemName ∈ FlowerVariety` → 是花）。缺点是用户把物品也取名叫"郁金香"时会认错，但无伤大雅。
3. **献花和献物品是同一个操作** ——「从背包拿 N 个 X 放到墓碑上」。已决定把原计划的 `POST /flowers` + `POST /items` 合并成单个 **`POST /api/grave/:graveId/offerings`**，body `{ itemName, quantity }`。

> **命名风格**：`itemName` 用 camelCase，与 `blockIconImage`、`graveIcon`、`graveID` 一致。`grave_id` 是这份 schema 里唯一的下划线写法，作为**例外保留**——它存的就是 `_id`，写成 `grave_id` 正好呼应。

## FlowerVariety（花的品种表）`➕ 全新`

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | string | `"郁金香"`，唯一键 |
| `icon` | string | 刷新在地图上的图片 |
| `🔁 spawnWeights` | `Record<blockID, number>` | **合并了原来的 `weight` + `blocks`**。键 = 墓园 `blockID`，值 = 在该墓园的刷新权重；**不在表里的墓园就不刷这种花**。`"*"` 为通配键，表示所有墓园的默认权重 |

按你的建议合并后，一个字段同时表达了「在哪刷」和「多稀有」，还顺带支持**同一种花在不同墓园稀有度不同**：

```js
{ name: "郁金香",   icon: "...", spawnWeights: { "*": 1 } }                      // 所有墓园都刷
{ name: "海葵",     icon: "...", spawnWeights: { "sea-1": 3 } }                  // 只在大海区域刷，且常见
{ name: "仙人掌花", icon: "...", spawnWeights: { "desert-1": 3, "sea-1": 1 } }   // 荒原常见、大海罕见
```

> **依赖方向**：花认识墓园，墓园不认识花 —— `GyBlock` 完全不用改。
> **存哪**：先放后端常量模块（品种表小且静态），用 `GET /api/flower-varieties` 暴露给前端；等管理员面板要能编辑了再升级成 Mongo collection。

## Theme（皮肤）`🅿️ 本轮预留`

主题系统**本轮不做**，作为今后的功能预留。现状记录如下，改造方案见 CONVENTIONS.md「主题来源收敛」。

| 字段 | 类型 | 说明 |
|---|---|---|
| `name` | string | unique，如 `"yume2kki"` |
| `backgroundImage` | `{url, styles}` | |
| `borderImage` | `{url, styles}` | |
| `homeImage` | `{url, styles}` | 前端从未使用 |
| `🅿️ closeButtonImage` | `{url, styles}` | 前端 ThemeContext 里叫 `quitImage`，DB 里没有 —— 将来补 |
| `🅿️ modalHeaderColor` | string | 同上 |

---

# 二、API 响应形状（前端实际收到的）

## GraveDetail —— 最核心的一个

`GET /api/grave/:graveId` **直接返回这个对象**（没有外层包装）。
它 = Grave 文档 + populate + `populateInteractions()` 现拼出来的 `interaction` 字段。

| 字段 | 类型 | 来源 | 说明 |
|---|---|---|---|
| `_id` `graveID` `name` `birth` `death` `epitaph` `memorial` `photos` `burial` `createdAt` `updatedAt` | — | DB | 同 Grave schema |
| `➕ icon` | string | DB | 新增字段 |
| `block` | GyBlock | populate | **完整对象**，不是 ObjectId |
| `user` | `{_id, username}` | populate | 只 populate 了 username |
| `interaction.stats.🔁 totalOfferings` | number | 派生 | 所有 `type:"item"` 的 `quantity` 求和 →「这里放着 N 个东西」 |
| `interaction.stats.totalMessages` | number | 派生 | 留言条数，单独计 |
| `interaction.stats.➕ byName` | `{name, count}[]` | 派生 | 按 `itemName` 分组：郁金香×12 / 地雷×99 |
| `interaction.stats.➖ totalFlowers` | number | 派生 | 被 `totalOfferings` 取代 |
| `interaction.history` | InteractionRecord[] | 派生 | 按 `createdAt` 升序 |

> `interaction` 整个字段**数据库里不存在**，是查询时拼出来的 —— 所以你在 schema 里搜不到它。

### InteractionRecord

| 字段 | 类型 | 说明 |
|---|---|---|
| `_id` `grave_id` `type` `itemName` `quantity` `content` `createdAt` | — | 同 Interaction schema |
| `user` | `{_id, username}` 或 ObjectId | 形状不稳定，见 REMINDERS #6 |

## 其它响应

### `GET /api/grave?block=&page=&limit=` → GraveListResponse

| 字段 | 类型 | 说明 |
|---|---|---|
| `graves` | GraveDetail[] | 每个墓碑都带完整 `interaction.history`，列表页用不到（见 REMINDERS #4） |
| `totalPages` / `currentPage` / `total` | number | 分页信息 |
| `blockInfo` | GyBlock \| null | 当前墓园信息（背景图从这里取） |

> **目标**：列表项瘦身成 `GraveSummary`，只返回 `stats` 不返回 `history`。

### 其余

| 接口 | 返回 |
|---|---|
| `GET /api/blocks` | `{ blocks: GyBlock[] }` |
| `GET /api/blocks/:blockID` | `{ block: GyBlock }` |
| `POST /api/auth/login` | `{ token, userId }` |
| `GET /api/user/me` | `{ user: {id, username, email, settings, favorites}, gravesCreated, interactionsMade }` ➕ 目标加 `inventory`、`role` |
| `🔁 POST /api/grave/:graveId/offerings` \| `/messages` | `{ message, interaction, graveStats }` ➕ 合并原 `/flowers` + 计划中的 `/items`；响应里带上 `inventory`，省掉前端再请求一次背包 |
| `➕ POST /api/user/me/inventory/name` | 给未命名物品命名，返回更新后的 `inventory` |
| `➕ POST /api/user/me/daily-reward` | body `{ localDate: "2026-09-19" }` → `{ granted: boolean, inventory }`。前端启动时自动调，不需要用户点 |

> `graveStats` 的算法和 `GraveDetail.interaction.stats` 不一致，见 REMINDERS #5。

---

# 三、前端形状

## MainContainer loader 返回值

现状：三种 type 共用一个 `data` 字段，但形状各不相同（靠下标取值）——

| type | data 的形状 | 组件里怎么取 |
|---|---|---|
| `detail` | `[graveid, graveData]` | `const [, graveData] = data` |
| `list` | `[gravesList, blockBgObj]` | `data[0]` 是列表，`data[1]` 是背景对象 |
| `home` | `blocks`（直接是数组） | `data` |
| `list`（出错兜底） | `[]` | 长度对不上，`data[1]` 是 undefined |

目标：改成具名字段的可辨识联合，不用再靠下标记忆——

| type | 字段 |
|---|---|
| `home` | `blocks: GyBlock[]` |
| `list` | `graves: GraveSummary[]`、`block: GyBlock \| null` |
| `detail` | `graveID: string`、`grave: GraveDetail \| null` |

> 前端目前所有组件 props 都是 `any`（`graveData: any`、`interaction: any`、`favorites: any`）。
> 建议把以上类型收进 `client/src/types.ts` 统一引用。

---

# 四、命名决定

| # | 原问题 | 决定 |
|---|---|---|
| 1 | `graveID`（业务 ID）和 `graveId`（外键，指向 `_id`）只差一个字母 | ✅ 外键改名 **`grave_id`**，用下划线拉开距离；`graveID` 保持不变 |
| 2 | `variety` 语义偏窄（物品名也要存这里） | ✅ 改名 **`itemName`**（camelCase，与其它字段一致） |
| 3 | `type` 里花和物品分开 | ✅ 合并成 **`item`**，只剩 `message` \| `item` |
| 4 | `weight` 和 `blocks` 两个字段表达刷新规则 | ✅ 合并成 **`spawnWeights`** 映射表 |
| 5 | `GyBlock.number` 会失真 | ✅ **删除**，需要时实时 count |
| 6 | `totalFlowers` 两处算法不一致 | ✅ 改造后自然消失（统一成 `totalOfferings`，抽同一个函数） |
| 7 | 路由参数大小写不一、图片字段结构不统一、组件 props 全是 any | 📌 记入 REMINDERS |

---

# 五、改动汇总

| 结构 | 改动 |
|---|---|
| `User` | ➕`role` ➕`inventory[]` ➕`lastRewardAt` |
| `Grave` | ➕`icon`（建后不可改） |
| `Interaction` | `type`→`message`\|`item`；`variety`→`itemName`；`graveId`→`grave_id`；`quantity` 加 default |
| `GyBlock` | ➖`number`；**不加花相关字段**；图片字段结构待统一 |
| `Theme` | 🅿️ 本轮预留 |
| `FlowerVariety` | 全新，花系统自有，`spawnWeights` 决定在哪刷、多稀有 |
| `GraveDetail.interaction.stats` | `totalFlowers` → `totalOfferings` + `byName[]` |
| `GraveListResponse` | 列表项瘦身，不返回 `history` |
| 前端 loader | 元组 → 具名可辨识联合 |

---

# 本轮已决定

| # | 问题 | 决定 |
|---|---|---|
| 1 | 物品什么时候命名 | **在背包里点专门的按钮命名** —— 不是领取时、也不是献上时。文案「这个神奇的种子最终变成了什么？」 |
| 2 | 命名可逆吗 | **不可逆**。种子变成什么就是什么 |
| 3 | 献花 / 献物品接口要不要合并 | **合并**成 `POST /grave/:graveId/offerings` |
| 4 | 字段叫 `itemname` 还是 `itemName` | **`itemName`**，camelCase 与其它字段一致 |
| 5 | 每日奖励怎么触发 | **自动发放**。前端启动时自动调 `POST /user/me/daily-reward`，用户不用点 |
| 6 | 隔几天没来要补发吗 | **只发 1 个**，不按天数累积 |
| 7 | 「每天」怎么算 | **前端传本地日期**（`YYYY-MM-DD`），后端与 `lastRewardDate` 对比。零时区逻辑、体验最准；可被伪造但本来就不防刷 |
| 8 | 发放后怎么提示用户 | **toast，本轮只计划不做**。先静默发放，组件以后再补（献花成功之类也能复用） |
