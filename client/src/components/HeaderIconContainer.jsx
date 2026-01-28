import { useAuth } from '../context/AuthContext';

const HeaderIconContainer = () => {
  const { isRightPanelShow, toggleRightPanel } = useAuth();

  return (
    <div
      id="headerIconContainer"
      className="flex flex-row justify-between gap-2"
    >
      <button id="SettingsButton" className="header-icon-button">
        Settings
      </button>
      <button id="ApplyButton" className="header-icon-button">
        New Grave
      </button>
      <button
        id="LoginButton"
        className="header-icon-button"
        onClick={toggleRightPanel}
      >
        {isRightPanelShow ? 'Logout' : 'Login'}
      </button>
    </div>
  );
};

export default HeaderIconContainer;
