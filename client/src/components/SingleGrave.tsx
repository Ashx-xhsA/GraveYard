import React from 'react';
import { useAuth } from '../context/AuthContext';

const SingleGrave = ({ graveid }) => {
  const { isRightPanelShow } = useAuth();
  console.log(graveid);
  return (
    <div
      id="main-container"
      className={` ${!isRightPanelShow ? 'w-full' : 'flex-1'}`}
    >
      SingleGrave
    </div>
  );
};

export default SingleGrave;
