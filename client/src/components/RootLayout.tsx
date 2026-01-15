import {
  Background,
  BackgroundOverlay,
  Header,
  Footer,
  RightPanel,
} from './index';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RootLayout = () => {
  const { isRightPanelShow } = useAuth();

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
          {isRightPanelShow && <RightPanel />}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default RootLayout;
