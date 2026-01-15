import RootLayout from './components/RootLayout';
import { MainContainer } from './components';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { loader as mainContainerLoader } from './components/MainContainer';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    // errorElement: <Error />,
    children: [
      {
        path: '/',
        index: true,
        // element: <DefaultPage />,
        element: <MainContainer />,
        loader: mainContainerLoader,
      },
      {
        path: ':graveid',
        element: <MainContainer />,
        loader: mainContainerLoader,
      },

      {
        path: ':gyid',
        element: <MainContainer />,
        loader: mainContainerLoader,
      },
      {
        path: ':gyid/:graveid',
        element: <MainContainer />,
        loader: mainContainerLoader,
      },
    ],
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
