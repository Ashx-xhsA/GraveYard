import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {
  HomeLayout,
  Inventory,
  Landing,
  Error,
  Apply,
  GraveModal,
  SinglePageError,
} from './pages';
import { loader as landingLoader } from './pages/Landing.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomeLayout />,
    errorElement: <Error />,
    children: [
      {
        path: '/',
        id: 'landing-route',
        loader: landingLoader,
        element: <Landing />,
        errorElement: <SinglePageError />,
        children: [
          {
            path: 'graves/:id',
            element: <GraveModal />,
          },
        ],
      },

      {
        path: 'Inventory',
        element: <Inventory />,
      },
      {
        path: 'Apply',
        element: <Apply />,
      },
    ],
  },
]);
const App = () => {
  return <RouterProvider router={router} />;
};
export default App;
