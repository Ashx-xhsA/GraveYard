import React from 'react';

const BackgroundOverlay = () => {
  return (
    <div
      id="background-overlay"
      className="fixed z-[-1] h-full w-full"
      style={{
        backgroundColor: 'var(--bg-overlay-color)',
        opacity: 'var(--bg-overlay-opacity)',
      }}
    ></div>
  );
};

export default BackgroundOverlay;
