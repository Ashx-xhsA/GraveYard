import { useLocation } from 'react-router-dom';
import tempData from '../../db.json';
//只寫了local的測試邏輯，等待修改
const Background = () => {
  const { pathname } = useLocation();
  const blockid = pathname.split('/')[1];
  const graveid = pathname.split('/')[2];

  //判断是否在单个墓碑页面
  const isSingleGrave = Boolean(graveid);
 

  //獲取backgroundimg
  const { gyBlocks } = tempData;
  const currentBlock = gyBlocks?.find((block) => block.blockID === blockid)
  const backgroundImg = currentBlock ? currentBlock.backgroundImage : '';


  return (
    <div
      id="background"
      className="fixed z-[-2] h-screen w-full "
      style={{
        //如果在單個墳墓頁面，把background圖片換成對應的backgroundimage（在container之外的）
        backgroundImage: isSingleGrave ? `url(${backgroundImg})` : undefined,
      }}
    ></div>
  );
};

export default Background;
