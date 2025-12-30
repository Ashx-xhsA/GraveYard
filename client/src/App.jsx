import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import {
  HomeLayout,
  Bag,
  Landing,
  Error,
  Apply,
  Grave,
  SinglePageError,
} from './pages';
import { loader as landingLoader } from './pages/Landing.jsx';
import GraveModal from './components/GraveModal.jsx';

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
        path: 'Bag',
        element: <Bag />,
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
