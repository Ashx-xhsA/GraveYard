import Info from './Info';
import Favorites from './Favorites';
import { IoCloseSharp } from "react-icons/io5";
import { useAuth } from '../context/AuthContext';

const RightPanel = ({ user }: { user: any }) => {
  const { toggleRightPanel } = useAuth();
  return (
    <div id="right-panel" className="shrink-0 borderDecoration">
      <div id="right-panel-close-button-container">
        <button id="right-panel-close-button" onClick={toggleRightPanel}><IoCloseSharp /></button>
      </div>
      {user ? (
        <>
          <Info user={user} />
          <Favorites favorites={user.favorites || []} />
        </>
      ) : (
        <div id="info"><p>Not logged in</p></div>
      )}
    </div>
  );
};

export default RightPanel;
