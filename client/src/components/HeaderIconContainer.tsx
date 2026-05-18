import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import Settings from './Settings';
import NewGrave from './NewGrave';
import Login from './Login';

const HeaderIconContainer = () => {
  const { isLoggedIn, logout } = useAuth();
  const {openModal} = useModal();

  
  return (
    <div
      id="headerIconContainer"
      className="flex flex-row justify-between gap-2 relative"
    >
      <button id="SettingsButton" className="header-icon-button" onClick={()=>openModal(<Settings />)}>
        Settings
      </button>
      <button id="ApplyButton" className="header-icon-button" onClick={()=>openModal(<NewGrave/>)}>
        New Grave
      </button>
      {isLoggedIn ? (
        <button
          id="LoginButton"
          className="header-icon-button"
          onClick={logout}
        >
          Logout
        </button>
      ) : (
        <button
          id="LoginButton"
          className="header-icon-button"
          onClick={() => {openModal(<Login/>)}}
        >
          Login
        </button>
      )}
      
    </div>
  );
};

export default HeaderIconContainer;
