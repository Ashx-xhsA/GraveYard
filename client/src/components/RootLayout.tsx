import {
  Background,
  BackgroundOverlay,
  Header,
  Footer,
  RightPanel,
} from './index';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const rootLoader = () => {
  return null;
};

const RootLayout = () => {
  const { isRightPanelShow, user } = useAuth();

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
