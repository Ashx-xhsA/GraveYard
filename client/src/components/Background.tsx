import { useRouteLoaderData } from 'react-router-dom';

/**
 * 最外层的全屏背景（图片分层模型的「外层」，见 CONVENTIONS 第一节）。
 *
 * 规则：走进一层，上一层的「里层」就变成这一层的「外层」。
 *
 *   L0 首页      外层 = 主题·背景图   ← 不做任何事，用 CSS 里的默认值
 *   L1 墓园页    外层 = 主题·容器图   ← 继承自 L0 的里层
 *   L2 墓碑页    外层 = 该墓园·背景图 ← 继承自 L1 的里层
 *
 * 本组件长在 RootLayout 里、是 <Outlet/> 的兄弟，拿不到子路由的 loader 数据，
 * 所以用 useRouteLoaderData 按路由 id 去要（id 定义在 App.tsx）。
 * 取不到值就说明不在那一层，于是它同时也是「当前在哪一层」的判断器。
 */
/** 墓园背景图在数据库里的形状：`GyBlock.backgroundImage` */
interface BlockBackground {
  url?: string;
  /** 一段 JSON 字符串，如 '{"backgroundSize":"cover"}' */
  styles?: string;
}

/** 墓碑页 loader 的返回：{ page: 'grave', data: [graveID, 墓碑数据] } */
interface GraveRouteData {
  data?: [string, { block?: { backgroundImage?: BlockBackground } } | null];
}

const Background = () => {
  // 在墓碑页才有值，否则 undefined
  const graveRoute = useRouteLoaderData('grave') as GraveRouteData | undefined;
  // 在墓园页才有值，否则 undefined。这里只判断「有没有」，不需要知道里面是什么
  const blockRoute = useRouteLoaderData('block');

  // 墓碑页 loader 返回 { page: 'grave', data: [graveID, 墓碑数据] }
  const grave = graveRoute?.data?.[1];
  // 后端 GET /grave/:graveId 已经 populate 了 block，所以整个墓园对象就挂在这儿
  const blockBackground = grave?.block?.backgroundImage;

  // ---- L2 · 墓碑页：用该墓园自己的背景图 ----
  if (blockBackground?.url) {
    // styles 在数据库里存的是一段 JSON 字符串，例如
    // '{"backgroundSize": "cover", "backgroundPosition": "center"}'
    // 沙漠墓园靠它铺满，不解析的话那张照片会被切成 210px 的小块平铺。
    let customStyles: Record<string, string> = {};
    try {
      if (typeof blockBackground.styles === 'string' && blockBackground.styles !== '') {
        customStyles = JSON.parse(blockBackground.styles);
      }
    } catch {
      // 数据脏了也不要让整页白屏，退回默认铺法即可
      customStyles = {};
    }

    return (
      <div
        id="background"
        className="fixed z-[-2] h-screen w-full"
        style={{
          backgroundImage: `url(${blockBackground.url})`,
          ...customStyles,
        }}
      />
    );
  }

  // ---- L1 · 墓园页：用主题的容器图（= 上一层的里层）----
  // 这里写 CSS 变量而不是写死路径：等主题接上 DB（#25），
  // ThemeProvider 一 setProperty，这里自动跟着换，代码不用改。
  if (blockRoute) {
    return (
      <div
        id="background"
        className="fixed z-[-2] h-screen w-full"
        style={{ backgroundImage: 'var(--container-background-image)' }}
      />
    );
  }

  // ---- L0 · 首页（以及其它页面）：什么都不写 ----
  // layout.css 里 #background 已经有 background-image: var(--page-background-image)，
  // 不写 inline style，那条默认值就生效。
  return <div id="background" className="fixed z-[-2] h-screen w-full" />;
};

export default Background;
