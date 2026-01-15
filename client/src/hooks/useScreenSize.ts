import { useState, useEffect } from 'react';

export type ScreenSize = 'sm' | 'md' | 'lg';

export const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg');

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 640) setScreenSize('sm');
      else if (w < 1024) setScreenSize('md');
      else setScreenSize('lg');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};
