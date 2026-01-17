import React from 'react';
import { useLocation } from 'react-router-dom';
import theme from '../theme.json';

const Background = () => {
  const { pathname } = useLocation();
  const gyid = pathname.split('/')[1];
  const id = pathname.split('/')[2];

  /**
   *  根据gyid设置背景图片
   * // Todo：增加默认背景图片
   */
  const themesData = theme as Record<string, Record<string, string>>;
  const currentTheme = themesData[gyid];
  const backgroundImg = currentTheme?.background || '';

  /**
   * 判断是否在单个墓碑页面
   */
  const isSingleGrave = Boolean(id);
  if (isSingleGrave) {
    console.log('isSingleGrave', isSingleGrave);
  }
  return (
    <div
      id="background"
      className="fixed z-[-2] h-screen w-full "
      style={{
        backgroundImage: isSingleGrave ? `url(${backgroundImg})` : undefined,
      }}
    ></div>
  );
};

export default Background;
