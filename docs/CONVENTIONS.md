# 资源与样式命名梳理

> 2026-09-17 对 `client/` 的样式层和静态资源做的一次盘点。分四部分：
> ① 先修的真 bug ② 死资源清单 ③ 命名规范 + 重命名映射 ④ 主题来源收敛方案

---

## 一、真 bug（会出问题，建议先修）

| # | 问题 | 位置 | 后果 |
|---|---|---|---|
| 1 | `containerbg-2.PNG` 大写扩展名，磁盘上实际是 `containerbg-2.png` | `server/seed.js`（theme.homeImage） | macOS 本地大小写不敏感所以看不出来，**部署到 Linux / Vercel 会 404** |
| 2 | `@font-face` 用相对路径 `url('fonts/ms-pgothic.woff2')` | `client/src/index.css` | 从 `src/` 解析会去找 `src/fonts/`（不存在）。应写 `/fonts/ms-pgothic.woff2` |
| 3 | `--interaction-paginate-link-hover-color` **被使用但从未定义** | 用于 `styles/single-grave.css`，`variables.css` 里没有 | 分页 hover 的文字颜色失效（定义了 `--interaction-paginate-link-color` 却没人用，疑似当初写错名字） |
| 4 | 字体栈里的 `'Pixelify Sans'` 项目从未加载 | `styles/layout.css` | 死回退，不生效 |
| 5 | `Background.tsx` 仍从 `client/db.json`（mock）取背景 | `components/Background.tsx` | 单墓碑页的**外层背景永远是假数据**；代码自带注释「只寫了local的測試邏輯，等待修改」 |
| 6 | `App.css` 是 Vite 模板残留，且**无人 import** | `client/src/App.css` | 目前无害；但它含 `#root { max-width:1280px; padding:2rem }`，一旦误 import 会和 `layout.css` 的 `#root` 冲突、打乱整个布局 |

---

## 二、死资源清单（确认无引用，可删）

| 文件 | 说明 |
|---|---|
| `client/src/App.css` | Vite 模板残留，无人 import |
| `client/src/assets/react.svg` | 模板残留 |
| `client/public/vite.svg` | 仅作 favicon，建议换成自己的 logo |
| `client/public/ms-pgothic.woff2` | 与 `public/fonts/ms-pgothic.woff2` 重复，实际用的是后者 |
| `client/public/graveyardLogo.png` | 只用了 `graveyardLogoTrimmed.png` |
| `client/public/themes/IMG_7436.PNG` | 相机原始文件名，无任何引用 |
| `client/public/blooming-pixel-sakura-stockcake.webp` | 图库站残留名（"stockcake"），无引用 |
| `client/src/theme.json` | 旧 mock（sea-1/forest-1 → background），已被 `GyBlock.backgroundImage` 取代 |
| `client/src/user.json` | 旧 mock（含早期设想的 `flowersBalance`），无引用 |
| `client/db.json` | 还被 `Background.tsx` 真实引用 + `MainContainer.tsx` 注释引用；改完 #5 后即可删 |
| `client/gy-img` | 0 字节空文件 |

**死 CSS 变量**（定义了但从未使用）：`--content-transition`、`--header-max-width`、`--interaction-paginate-link-color`、`--items-per-page`
※ `--items-per-page: 10` 是 JS 概念（分页逻辑在 `InteractionPaginateContainer` 里），放在 CSS 属于放错地方，应移到 TS 常量。

---

## 三、命名规范

### 诊断：现在乱在哪

1. **扩展名大小写混用**：`.PNG` / `.JPG` 和 `.png` / `.webp` 混着用 —— 已经因此埋了一个部署 bug（见一.1）。
2. **文件命名四种风格并存**：
   - camelCase：`graveyardLogoTrimmed.png`、`FishInSea.png`
   - kebab-case：`containerbg-2.png`、`grave-1.png`
   - 全小写连写：`containerbg.png`、`unknownplace.webp`
   - 相机/图库原始名：`IMG_7436.PNG`、`blooming-pixel-sakura-stockcake.webp`
3. **CSS 变量后缀混用**：`-img-url`（`--bg-img-url`）vs `-image-url`（`--border-image-url`）。
4. **拼写错误**：`--single-grave-seperator-image-url` → 应为 `separator`。
5. **语义不清**：`--bg-img-url`（页面最外层背景）vs `--grave-yard-bg-img-url`（main-container 内层背景）—— 名字看不出区别；而且后者实际指向 `containerbg-2.png`（不是墓园图），真正的墓园背景已改由 DB 的 `GyBlock.backgroundImage` 提供，**该变量已名实不符**。
6. **选择器风格混用**：`#headerIconContainer` / `#headerLogoImage` / `#footerLinkContainer` 是 camelCase，而 `#main-container` / `#grave-list-container` / `#single-grave-container` 是 kebab-case；类名 `.borderDecoration` 是 camelCase，而 `.grave-icon` / `.header-icon-button` 是 kebab-case。

### 定下的规则

1. **文件名**：全小写 + kebab-case + **小写扩展名**。（理由：Linux/Vercel 文件系统大小写敏感，混用必踩坑）
2. **目录按用途分**，不要把所有图都塞进 `themes/`。
3. **CSS 变量**：`--{域}-{元素}-{属性}`；图片统一以 `-image` 结尾（废弃 `-img-url` / `-image-url` 混用），颜色 `-color`，尺寸 `-size` / `-width` / `-height`。
4. **CSS 里只放 CSS 用得到的东西**，JS 逻辑常量移到 TS。
5. **选择器统一 kebab-case**（id 和 class 都是）。

### 建议的目录结构

```
client/public/
  fonts/
    ms-pgothic.woff2
  themes/                    ← 皮肤资源，按主题名分目录（对应 DB 的 Theme.name）
    yume2kki/
      logo.png
      panel-bg.png
      panel-bg-alt.png
      frame-border.png
      close-button.png
  blocks/                    ← 墓园背景 / 入口图标（正式数据走 DB，这里放兜底和种子数据）
    sea-1-bg.png
    desert-1-bg.jpg
    default-block-icon.webp
  graves/                    ← 墓碑 sprite
    default-grave.png
```

### 重命名映射表（静态资源）

| 现在 | 改成 | 理由 |
|---|---|---|
| `public/graveyardLogoTrimmed.png` | `public/themes/yume2kki/logo.png` | camelCase → kebab；归入皮肤 |
| `public/themes/containerbg.png` | `public/themes/yume2kki/panel-bg.png` | "containerbg" 语义不明 |
| `public/themes/containerbg-2.png` | `public/themes/yume2kki/panel-bg-alt.png` | "-2" 不说明任何事 |
| `public/themes/border.png` | `public/themes/yume2kki/frame-border.png` | |
| `public/quit.PNG` | `public/themes/yume2kki/close-button.png` | 大写扩展名；quit → close 更准确 |
| `public/themes/FishInSea.png` | `public/blocks/sea-1-bg.png` | camelCase；与 `blockID` 对应起来 |
| `public/themes/desert.JPG` | `public/blocks/desert-1-bg.jpg` | 大写扩展名；与 `blockID` 对应 |
| `public/themes/unknownplace.webp` | `public/blocks/default-block-icon.webp` | 语义化（它是墓园入口的默认图标） |
| `public/grave-1.png` | `public/graves/default-grave.png` | "grave-1" 会被误读成"第 1 号墓碑"，它其实是默认 sprite |

> 改完别忘了同步：`styles/variables.css`、`server/seed.js`、`HomePage.tsx` 的 fallback 路径。

### 重命名映射表（CSS 变量）

| 现在 | 改成 |
|---|---|
| `--bg-img-url` | `--page-bg-image` |
| `--header-bg-img-url` | `--header-bg-image` |
| `--header-logo-img-url` | `--header-logo-image` |
| `--border-image-url` | `--frame-border-image` |
| `--grave-yard-bg-img-url` | `--panel-bg-image` |
| `--grave-img-url` | `--grave-sprite-image` |
| `--single-grave-seperator-image-url` | `--separator-border-image` |
| `--interaction-paginate-link-color` | 删（未使用），改为补上 `--interaction-paginate-link-hover-color` |

> 注意：`--grave-sprite-image` 和 `--panel-bg-image` 在 DB 主题 / `Grave.icon` 接入后，**应降级为兜底默认值**，运行时真实值从数据来（见下一节）。

---

## 四、主题来源收敛（结构性问题，Settings 做不下去的根因）

现在同一件事有 **4 套并行来源**，而且字段互不对应：

| # | 来源 | 内容 |
|---|---|---|
| a | `src/styles/variables.css` | CSS 变量，硬编码图片路径 |
| b | `src/context/ThemeContext.tsx` | 硬编码的 JS `style` 对象（`backgroundImage` / `borderImage` / `quitImage` / `modalHeaderColor`） |
| c | 后端 `Theme` 模型 + `/api/theme` + `User.settings.theme` | `backgroundImage` / `borderImage` / `homeImage` |
| d | `src/theme.json` | 已废弃（被 `GyBlock.backgroundImage` 取代） |

字段对不上的地方：**b 有** `quitImage` / `modalHeaderColor`，**c 没有**；**c 有** `homeImage`，前端没用；`ThemeContext.setTheme` 从未被任何代码调用。

### 建议方案：DB 为唯一真源，JS 注入 CSS 变量，CSS 只留兜底

```ts
// ThemeProvider 内，拿到主题数据后：
Object.entries(cssVarsFromTheme).forEach(([k, v]) =>
  document.documentElement.style.setProperty(k, v)
);
```

这样做的好处：
- CSS 保持**单一取值入口** `var(--xxx)`，不用再往组件上挂 inline `style={style}`（`ModalReuse.tsx` 现在就是这么干的）；
- Settings 面板只需 `PUT /user/me/settings` + 重新 `setProperty` 就立刻生效 —— **主题功能马上可做**；
- 未接入 DB 时 CSS 里的默认值自动兜底，不会白屏。

配套动作：
1. 给后端 `Theme` 模型补 `closeButtonImage`、`modalHeaderColor` 字段（对齐前端实际用到的）。
2. `Theme.homeImage` 要么用起来，要么删掉。
3. 删 `src/theme.json`。
4. `ThemeContext` 的 `style` 对象从"硬编码值"改为"DB 值 + 兜底"。
