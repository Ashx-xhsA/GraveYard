# 资源与样式规范

> **本文只写「规定」** —— 图片怎么分层、叫什么名字、放哪个目录、CSS 变量怎么命名、主题的值从哪来。
> 定稿于 2026-09-19（PRD **D12 / D13 / D14**）。
>
> 不在本文的内容去哪找：
>
> | 你想知道 | 去哪 |
> |---|---|
> | 还差什么没做 | `TODO.md`（#n 编号稳定）、`ROADMAP.md`（阶段） |
> | 当初为什么这么定、改名前长什么样、那天改了什么 | `docs/claude/2026-09-19_fix-phase0-fix-existing-bugs_会话记录.md` |
> | 数据结构的字段定义 | `DATA-MODEL.md` |

---

# 一、图片分层模型

整站的视觉只有两个图层：

- **`background`** —— 最外层，全屏铺满（`#background`）
- **`container`** —— 中间那块内容面板（`#main-container`）

三个页面层级之间，图片按一条规则传递：

> ## 你走进一层，原本的「里面」就变成了现在的「外面」。
> **新一层的 `background` ＝ 上一层的 `container` 背景。**

| 层 | 路由 | `background`（外） | `container`（内） | container 里放什么 |
|---|---|---|---|---|
| **L0 首页** | `/` | 主题·背景图 | 主题·容器图（氛围） | 各墓园的入口图标 |
| **L1 墓园** | `/:blockid` | 主题·容器图 ⬆ 继承自 L0 的里层 | **该墓园**·背景图 | 这座墓园的墓碑们 |
| **L2 墓碑** | `/:blockid/:graveid` | 该墓园·背景图 ⬆ 继承自 L1 的里层 | 不使用图片 | 墓碑详情 |

```
L0             L1             L2
┌─────────┐    ┌─────────┐    ┌─────────┐
│ 主题背景 │    │ 主题容器 │    │ 墓园背景 │   ← background（外）
│ ┌─────┐ │ →  │ ┌─────┐ │ →  │ ┌─────┐ │
│ │主题 │ │    │ │墓园 │ │    │ │详情 │ │   ← container（内）
│ │容器 │ │    │ │背景 │ │    │ │无图 │ │
│ └─────┘ │    │ └─────┘ │    │ └─────┘ │
└─────────┘    └─────────┘    └─────────┘
      └───────────┘└───────────┘
        里层变外层    里层变外层
```

**设计意图**：营造「逐步点击、逐步走进」的空间感。首页你站在主题的世界里，看见一个个墓园漂浮着；点进墓园，你走进了刚才看到的那片氛围，面前是这座墓园自己的景色；再点进墓碑，你走进了那片景色，它成了你身后的背景。

**这条规则是后面所有规定的依据** —— 有几类图、各自归谁管、该叫什么名字，全部由它推出来。

---

# 二、图片的两类归属

## 类 A · 主题资源（跟 `Theme` 走，全站一套，切主题时整套换）

| 用途 | 出现在哪 | 对应 DB 字段 |
|---|---|---|
| 背景图 | L0 的外层 | `Theme.backgroundImage` |
| 容器图 | L0 的里层 → L1 的外层 | `Theme.containerImage` |
| 边框 | container 描边 + 详情页分隔线 | `Theme.borderImage` |
| 关闭按钮 | 弹窗右上角 | 🅿️ `Theme.closeButtonImage`（前端已用，DB 待补） |
| logo | 页头 | 🅿️ 暂只在 CSS 变量里 |

## 类 B · 墓园资源（跟 `GyBlock` 走，**每座墓园一套**）

| 用途 | 出现在哪 | 对应 DB 字段 |
|---|---|---|
| 墓园背景 | L1 的里层 → L2 的外层 | `GyBlock.backgroundImage` |
| 入口图标 | L0 的 container 里那个可点的图 | `GyBlock.blockIconImage` |
| 默认墓碑 sprite | L1 的 container 里那些墓碑 | `GyBlock.graveIcon` |

**规定**：每座墓园都要有**自己的**入口图标和专属墓碑 sprite，不共用。`blocks/_default/` 只是没配图时的兜底，不是正式素材。

---

# 三、素材规格

1. **平铺纹理一律 32×32**（主题的背景图、容器图、边框）。靠 `background-size: var(--tile-size)`（210px）放大平铺 + `image-rendering: pixelated` 保持硬边。
2. **整图类素材**（照片等）例外，走 `cover`，由 DB 里的 `styles` JSON 字段声明，例：
   `'{"backgroundSize":"cover","backgroundPosition":"center","imageRendering":"auto"}'`
3. **墓碑 sprite 一律横向两帧**，宽 ＝ 高 × 2。[GraveIcon.tsx](../client/src/components/GraveIcon.tsx) 用 `background-size: 200.1% 100.1%` + `steps(1)` 动画在两帧间切换做出闪动。**给墓园配专属墓碑必须遵守这个规格**，否则动画错位。

---

# 四、命名规范

## 规则

1. **文件名 ＝ `<角色>-<内容>.<小写扩展名>`**，全小写 kebab-case。
   前半截说明它出现在哪一层，后半截说明它长什么样。例：`background-pink-haze.png`、`container-blue-vortex.png`。
   - 为什么不只写角色：`background.png` 看不出画的是什么。
   - 为什么不只写内容：`sakura.png` 看不出用在哪。
   - 为什么强制小写扩展名：Linux / Vercel 文件系统**区分大小写**，`.PNG` 与 `.png` 混用必踩 404。
2. **目录名 ＝ 数据库里的 ID**：`themes/<Theme.name>/`、`blocks/<GyBlock.blockID>/`。看到数据库里一条记录，闭眼就知道它的图在哪个文件夹。
3. **`_default/` 放兜底素材**，下划线开头表示「这不是一座真墓园」。
4. **路由与 loader 的词汇统一**：三层页面在代码里只用 `home` / `block` / `grave` 三个词 —— 路由 id（`App.tsx`）、loader 返回的 `page` 字段、组件里的变量名全部照此。不要再出现 `list` / `detail` 这种「只说了数据是列表还是单条、没说是哪一层的什么东西」的命名。
5. **CSS 变量 ＝ `--{域}-{元素}-{属性}`**：图片统一 `-image` 结尾，颜色 `-color`，尺寸 `-size` / `-width` / `-height`。
   **颜色例外，分两层**（PRD **D16**）：`--color-*` 是调色盘（原料，共 9 个，主题自定义的就是它）；其余用途色必须写成 `var(--color-*)`，**不许直接写 `rgb(...)`**。
6. **CSS 里只放 CSS 用得到的东西**，JS 逻辑常量放 TS。
7. **选择器统一 kebab-case**（id 和 class 都是）。

## 目录结构

```
client/public/
├── themes/
│   └── yume2kki/                        ← 目录名 = Theme.name
│       ├── background-pink-haze.png     ← L0 外层
│       ├── container-blue-vortex.png    ← L0 里层 / L1 外层
│       ├── border-purple-flowers.png    ← 边框 + 分隔线
│       ├── close-button-red-cross.png   ← 弹窗 ✕
│       └── logo-graveyard-text.png      ← 页头 logo
│
└── blocks/
    ├── <blockID>/                       ← 目录名 = GyBlock.blockID
    │   ├── background-*.png             ← 墓园背景
    │   ├── icon-*.webp                  ← 首页入口图标
    │   └── grave-*.png                  ← 专属墓碑 sprite（两帧）
    └── _default/                        ← 兜底
        ├── icon-question-mark.webp
        └── grave-rip-stone.png
```

## 现行 CSS 变量（图片与尺寸部分）

这些变量定义在 [`styles/variables.css`](../client/src/styles/variables.css)，**里面的值是兜底默认值**，主题接上 DB 后由 JS 覆盖（见第五节）。

| 变量 | 含义 |
|---|---|
| `--page-background-image` | L0 外层背景 |
| `--container-background-image` | L0 里层容器背景（＝ L1 的外层） |
| `--frame-border-image` | container 描边 |
| `--separator-border-image` | 详情页分隔线（与描边同图，独立成变量便于以后分开） |
| `--header-background-image` | 页头背景 —— **占位**，暂与 `--page-` 同图 |
| `--modal-background-image` | 弹窗面板背景 —— **占位**，暂与 `--page-` 同图 |
| `--header-logo-image` | 页头 logo |
| `--grave-sprite-image` | 墓碑 sprite 兜底（真实值应来自 `GyBlock.graveIcon` / `Grave.icon`） |
| `--tile-size` | 平铺纹理的放大尺寸（210px） |

> **占位也要留独立变量。** 页头和弹窗今后会有更丰富的设计，现在虽然和外层背景同图，也**不要三处都写同一个路径** —— 保持三个独立变量、值暂时相同，以后要换只改一行值，不用先去拆。

## 现行 CSS 变量（颜色部分）

颜色分两层（PRD **D16**）。**第一层 调色盘 —— 整站只有这 9 个「原料」，主题要自定义的就是它：**

| 变量 | 当前值 | 是什么 |
|---|---|---|
| `--color-accent` | `rgb(119, 89, 114)` | 主色·紫 |
| `--color-accent-soft` | `rgb(249, 228, 246)` | 主色的浅色搭档·淡粉 |
| `--color-ink` | `rgb(72, 86, 100)` | 正文墨色 |
| `--color-ink-strong` | `rgb(0, 0, 0)` | 最重的文字 |
| `--color-ink-alt` | `rgb(68, 76, 91)` | 次级文字（页脚） |
| `--color-shadow` | `rgb(79, 83, 86)` | 文字投影用的灰 |
| `--color-surface` | `rgb(225, 224, 224)` | 面板底色 |
| `--color-light` | `rgb(255, 255, 255)` | 白——深色底上的字 |
| `--color-overlay` | `black` | 全屏遮罩 |

**第二层 用途色** —— 19 个，全部写成 `var(--color-*)`，主题不存这一层。例：

```css
--interaction-item-underline-color:                    var(--color-accent);
--interaction-paginate-link-selected-background-color: var(--color-accent);
--header-icon-button-text-color:                       var(--color-accent);
/* 透明变体用 color-mix，这样它也跟着主色走 */
--interaction-paginate-link-hover-background-color:
  color-mix(in srgb, var(--color-accent) 10%, transparent);
```

> **为什么要分层**：改之前那 19 个变量里其实只有 8 种颜色 —— 主色紫被写了 4 遍、白 5 遍。换一次主色要改 4 处、漏一处就花脸。分层后换主色只改 `--color-accent` 一处。

---

# 五、主题取值链路

## 5.0 先补课：CSS 变量是怎么 work 的

看不懂本节的话，先花五分钟读这四条。

**① 声明与使用**

```css
:root { --my-color: pink; }         /* :root 就是 <html>，挂这里全站可用 */
h1    { color: var(--my-color); }   /* var() 把值原样替换进来 */
```

**② 谁能覆盖它 —— 本节方案的全部原理**

```
CSS 文件里的 :root { --x: A }     ← 最弱 → 这就是「默认值 / 兜底」
        ↓ 被覆盖
<html style="--x: B">            ← 内联样式，更强
```

而 JS 一行就能写这个内联样式：

```js
document.documentElement.style.setProperty('--frame-border-image', "url('…')");
//       └── documentElement 即 <html> 即 :root
```

执行完，**全站所有 `var(--frame-border-image)` 立刻换值** —— 不刷新、不改组件、不用把值层层传下去。

**③ 因此「没有就默认」是免费的**
CSS 文件里写死的值天然是兜底：主题没加载 / 请求失败 / 未登录 → JS 什么都不做 → 自动用 CSS 里的值，不会白屏。

**④ 什么该走 CSS 变量，什么不该**

| 值的性质 | 用什么 | 为什么 |
|---|---|---|
| **全站一份**（主题的边框、背景、字号） | ✅ CSS 变量 | 一处改，处处变 |
| **一条数据一份**（每座墓园自己的背景图） | ❌ 内联 `style={{…}}` | 每条数据都不同，塞进全局变量会互相打架 |

> 所以「主题走 CSS 变量、墓园走内联样式」不是两套方案，是**两类值本来就该用不同办法**。这是本节与第一节分层模型的接缝。

## 5.1 规定：DB 唯一真源 → JS 注入 CSS 变量 → CSS 只留兜底

```
Mongo 的 Theme 表
   │  GET /user/me 已经 populate("settings.theme") 带回来了（后端不用改）
   ▼
AuthContext 保留 settings ──▶ ThemeProvider
                                  │  映射成 CSS 变量名
                                  ▼
              document.documentElement.style.setProperty(…)
                                  │
                                  ▼
             全站 var(--xxx) 自动换值，组件一行不用改
                                  │
               主题没来？ ──▶ CSS 文件里的值自动兜底
```

```tsx
// ThemeProvider 内
useEffect(() => {
  if (!theme) return;                    // 没主题就什么都不做 → CSS 默认值兜底
  const vars = {
    '--page-background-image':      `url(${theme.backgroundImage?.url})`,
    '--container-background-image': `url(${theme.containerImage?.url})`,
    '--frame-border-image':         `url(${theme.borderImage?.url})`,
    '--modal-background-image':     `url(${theme.backgroundImage?.url})`,
  };
  Object.entries(vars).forEach(([k, v]) => {
    if (v && !v.includes('undefined')) {
      document.documentElement.style.setProperty(k, v);
    }
  });
}, [theme]);
```

**为什么是这套**：

- CSS 保持**单一取值入口** `var(--xxx)`，不用往组件上挂 inline `style={style}`；
- Settings 面板只需 `PUT /user/me/settings` + 重新 `setProperty` 就立刻生效；
- 未接入 DB 时自动兜底，不会白屏。

**为什么不选另一种**：把主题值当 props 层层传给组件，等于每加一个用到主题的组件都要改一遍传参，且 CSS 里会同时存在两个取值入口。

## 5.2 一个主题最终长什么样（#25 落地后的目标形态）

### ① 数据库里的一条 Theme 记录

主题只存**图片**和**调色盘**（D16），不存 19 个用途色：

```js
// themes 集合里的一条文档
{
  name: "yume2kki",                       // = public/themes/ 下的目录名
  backgroundImage:  { url: "/themes/yume2kki/background-pink-haze.png",   styles: "" },
  containerImage:   { url: "/themes/yume2kki/container-blue-vortex.png",  styles: "" },
  borderImage:      { url: "/themes/yume2kki/border-purple-flowers.png",  styles: "" },
  closeButtonImage: { url: "/themes/yume2kki/close-button-red-cross.png", styles: "" },
  colors: {                               // ← 调色盘，9 个
    accent:     "rgb(119, 89, 114)",
    accentSoft: "rgb(249, 228, 246)",
    ink:        "rgb(72, 86, 100)",
    inkStrong:  "rgb(0, 0, 0)",
    inkAlt:     "rgb(68, 76, 91)",
    shadow:     "rgb(79, 83, 86)",
    surface:    "rgb(225, 224, 224)",
    light:      "rgb(255, 255, 255)",
    overlay:    "black",
  },
}
```

**再加一个主题就是再加一条记录**，代码一行不用改：

```js
{
  name: "midnight",
  backgroundImage: { url: "/themes/midnight/background-starfield.png", styles: "" },
  containerImage:  { url: "/themes/midnight/container-deep-space.png", styles: "" },
  borderImage:     { url: "/themes/midnight/border-silver-frame.png",  styles: "" },
  closeButtonImage:{ url: "/themes/midnight/close-button-white-x.png", styles: "" },
  colors: {
    accent: "rgb(126, 160, 214)", accentSoft: "rgb(31, 41, 61)",
    ink: "rgb(206, 214, 226)",    inkStrong: "rgb(255, 255, 255)",
    inkAlt: "rgb(150, 160, 178)", shadow: "rgb(10, 12, 20)",
    surface: "rgb(24, 28, 40)",   light: "rgb(255, 255, 255)",
    overlay: "black",
  },
}
```

### ② ThemeProvider 里的映射（唯一要写的代码）

```tsx
const applyTheme = (theme) => {
  if (!theme) return;                       // 没主题 → CSS 里的值兜底

  const vars = {
    // 图片
    '--page-background-image':      `url(${theme.backgroundImage?.url})`,
    '--container-background-image': `url(${theme.containerImage?.url})`,
    '--frame-border-image':         `url(${theme.borderImage?.url})`,
    '--separator-border-image':     `url(${theme.borderImage?.url})`,
    // 调色盘：DB 的 camelCase 字段 → CSS 的 kebab-case 变量
    '--color-accent':      theme.colors?.accent,
    '--color-accent-soft': theme.colors?.accentSoft,
    '--color-ink':         theme.colors?.ink,
    '--color-ink-strong':  theme.colors?.inkStrong,
    '--color-ink-alt':     theme.colors?.inkAlt,
    '--color-shadow':      theme.colors?.shadow,
    '--color-surface':     theme.colors?.surface,
    '--color-light':       theme.colors?.light,
    '--color-overlay':     theme.colors?.overlay,
  };

  Object.entries(vars).forEach(([k, v]) => {
    if (v) document.documentElement.style.setProperty(k, v);
  });
};
```

**就这些。** 那 19 个用途色一个都不用写 —— 它们全是 `var(--color-*)`，第一层一换，它们自动跟着换。组件代码零改动。

### ③ 用户切换主题时发生了什么

```
用户在 Settings 选了 "midnight"
   → PUT /user/me/settings { theme: <该主题的 _id> }
   → 前端拿到新主题对象，调一次 applyTheme(theme)
   → :root 上 13 个变量被覆盖
   → 全站所有 var(--xxx) 立刻重算，页面当场变样，不刷新
```

> 落地状态见 `TODO.md` **#25**。**已完成的部分**：CSS 两层结构（D16，2026-09-19）、图片变量（D12/D13）。**还没做的**：`Theme` 模型补 `colors` 和 `closeButtonImage`、`AuthContext` 别丢 `settings`、`ThemeProvider` 写 `applyTheme`、`ModalReuse` 去掉 `style={style}`。
