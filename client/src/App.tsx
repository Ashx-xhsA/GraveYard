import RootLayout from './components/RootLayout';
import { MainContainer, About } from './components';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { loader as mainContainerLoader } from './components/MainContainer';
import {rootLoader} from './components/RootLayout';
import { AuthProvider } from './context/AuthContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    id: 'root',
    loader: rootLoader,
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
  {
    path: 'about',
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
