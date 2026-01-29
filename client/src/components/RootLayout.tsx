import {
  Background,
  BackgroundOverlay,
  Header,
  Footer,
  RightPanel,
} from './index';
import { Outlet, useRouteLoaderData } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import user from '../user.json';

export const rootLoader = () => {
  // const { user } = useAuth();
  return {
    user
  };
};

const RootLayout = () => {
  const { isRightPanelShow } = useAuth();
  const { user } = useRouteLoaderData('root');

  return (
    <>
      <Background />
      <BackgroundOverlay />
      {/* Content */}
      <div
        id="content"
        className=" position-relative z-1 w-full min-h-full max-w-full my-0 mx-auto "
      >
        <Header />
        {/* Layout */}
        <div id="layout" className="flex flex-row ">
          <Outlet />
          {isRightPanelShow && <RightPanel user={user} />}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default RootLayout;
