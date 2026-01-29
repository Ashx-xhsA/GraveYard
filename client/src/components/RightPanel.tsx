import React from 'react';
import { IoCloseSharp } from "react-icons/io5";
import Info from './Info';
import Favorites from './Favorites';
import { useAuth } from '../context/AuthContext';


const RightPanel = ({ user }: { user: any }) => {
  const { toggleRightPanel } = useAuth();
  return (
    <div id="right-panel" className="shrink-0 borderDecoration">
      <div id="right-panel-close-button-container">
        <button id="right-panel-close-button" onClick={toggleRightPanel} ><IoCloseSharp /></button>
      </div>
      <Info user={user.user} />
      <Favorites favorites={user.user.favorites} />
    </div>
  );
};

export default RightPanel;
