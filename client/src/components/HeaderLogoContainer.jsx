import React from 'react';
import { Link } from 'react-router-dom';

const HeaderLogoContainer = () => {
  return (
    <Link to="/">
      <div id="headerLogoContainer" className="flex flex-row align-center">
        <div id="headerLogoImage"></div>
      </div>
    </Link>
  );
};

export default HeaderLogoContainer;
