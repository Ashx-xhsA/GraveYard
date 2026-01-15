import React from 'react';
import HeaderLogoContainer from './HeaderLogoContainer';
import HeaderIconContainer from './HeaderIconContainer';

const Header = () => {
  return (
    <div
      id="header"
      className="flex flex-row justify-between borderDecoration "
    >
      <HeaderLogoContainer />
      <HeaderIconContainer />
    </div>
  );
};

export default Header;
