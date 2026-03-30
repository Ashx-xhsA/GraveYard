import RootLayout from "./components/RootLayout";
import { MainContainer, About } from "./components";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { loader as mainContainerLoader } from "./components/MainContainer";
import { rootLoader } from "./components/RootLayout";
import { AuthProvider } from "./context/AuthContext";

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

      {
        path: "gy/:graveid",
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
      <RouterProvider router={router} />
    </AuthProvider>
  );
};
export default App;
