import { useLocation } from 'react-router-dom';
import tempData from '../../db.json';

const Background = () => {
  const { pathname } = useLocation();
  const gyid = pathname.split('/')[1];
  const id = pathname.split('/')[2];

  const { graveyard } = tempData;
  const matchGraveyard = graveyard?.id === gyid;
  const backgroundImg = matchGraveyard ? graveyard.backgroundImage : '';

  /**
   * 判断是否在单个墓碑页面
   */
  const isSingleGrave = Boolean(id);

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
