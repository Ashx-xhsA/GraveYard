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
      //特定坟墓页面
      {
        path: ":blockid/:graveid",
        element: <MainContainer />,
        loader: mainContainerLoader,
      },
      //特定墓园页面
      {
        path:":blockid",
        element: <MainContainer />,
        loader:mainContainerLoader,
      }
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
