import RootLayout from "./components/RootLayout";
import { MainContainer, About } from "./components";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import {  loader as mainContainerLoader } from "./components/MainContainer";
import { rootLoader } from "./components/RootLayout";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";
import { ThemeProvider } from "./context/ThemeContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    id: "root",
    loader: rootLoader,
    children: [
      {
        path: "/",
        index: true,
        element: <MainContainer />,
        loader: mainContainerLoader,
      },
      // L2 · 特定坟墓页面
      // id 是给 useRouteLoaderData 用的名字：Background 组件长在 RootLayout 里、
      // 是 <Outlet/> 的兄弟，拿不到子路由的 loader 数据，只能按名字去要。
      // 顺带还兼任「当前在哪一层」的判断器——不在这条路由时取到的是 undefined。
      {
        path: ":blockid/:graveid",
        id: "grave",
        element: <MainContainer />,
        loader: mainContainerLoader,
      },
      // L1 · 特定墓园页面
      {
        path: ":blockid",
        id: "block",
        element: <MainContainer />,
        loader: mainContainerLoader,
      },
    ],
  },
  {
    path: "about",
    element: <About />,
  },
]);
const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>

      <ModalProvider>
        <RouterProvider router={router} />
      </ModalProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};
export default App;
