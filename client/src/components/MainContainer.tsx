import { redirect, useLoaderData } from 'react-router-dom';
import { IoMenuSharp } from "react-icons/io5";
import { useState } from 'react';
import { useGraveData } from '../hooks/useGraveData';
import GraveList from './GraveList';
import { useAuth } from '../context/AuthContext';
import GraveInfo from './GraveInfo';
import api from '../api';
// import tempData from '../../db.json'
import HomePage from './HomePage';

// const isTest = false; 
//測試用
export const loader = async ({ params }: any) => {
  const { graveid,blockid } = params;

  if (graveid) {
    // if (isTest){
    //   const mockGraveDetail = tempData.graves.find((g) => g.graveID === graveid);
    // return { type: 'detail', data: [graveid, mockGraveDetail || null] };
    // }
    try {
      const res = await api.get(`/grave/${graveid}`);
      return { type: 'detail', data: [graveid, res.data] };
    } catch {
      return { type: 'detail', data: [graveid, null] };
    }
  } else if (blockid) {
    
    //需要返回block的信息
    //data[[墳墓列表]，block背景]
    try {
      const res = await api.get('/grave', { params: { limit: 100, block:blockid } });
      const gravesList = res.data.graves || [];
      const blockBgObj = res.data.blockInfo?.backgroundImage || null;
      return { type: 'list', data: [gravesList, blockBgObj] };
    } catch {
      return { type: 'list', data: [] };
    }
    
    // if (isTest){
    //   const mockGraves = tempData.graves;
    //   return {type: 'list',data:[mockGraves,'/themes/desert.JPG']};
    // }
  }
  else if ( !graveid && !blockid){
    // if(isTest){
    //   return {type:'home',data:tempData.gyBlocks}
    // }
    try {
      const res = await api.get('/blocks');
      return { type: 'home', data: res.data.blocks };
    } catch {
      return { type: 'home', data: [] };
    }
    
  }
  //如果找不到路径跳转到主页
  return redirect('/');
};

interface LoaderData {
  type: 'detail' | 'list' | 'home';
  data: any;
}

const MainContainer = () => {
  const { type, data } = useLoaderData() as LoaderData;
  const [currentPage, setCurrentPage] = useState(0);
  const { isRightPanelShow, toggleRightPanel } = useAuth();
  const { currentGraves, randomIndices, totalPages } = useGraveData(
    type === 'list' ? (data[0] || []) : [],
    currentPage,
    isRightPanelShow
  );
  //如果是block則獲取背景
  const blockBgObj = type === 'list' ? data[1] : undefined;

  //獲取url
  const blockImg = blockBgObj?.url;
  //獲取styles
  const blockStylesString = blockBgObj?.styles;
  const customStyles = typeof blockStylesString === 'string' && blockStylesString !== '' 
    ? JSON.parse(blockStylesString) 
    : {};

 

  return (
    <div
      className="h-full borderDecoration relative"
      id="main-container"
      style={{ flex: 1,
        backgroundImage: blockImg ? `url(${blockImg})` : undefined,
        ...customStyles

      }}

    >
      <button
        id="toggle-right-panel-button"
        onClick={toggleRightPanel}
        className="absolute top-4 right-4 z-10 text-xl cursor-pointer bg-transparent border-None"
      >
        <IoMenuSharp />
      </button>
      {/* graveInfo page  */}
      {type === 'detail' && <GraveInfo/>}
      {/* gravelist page */}
      {type === 'list' && (
        <>
          <GraveList
            currentGraves={currentGraves}
            randomIndices={randomIndices}
            isRightPanelShow={isRightPanelShow}
          />
          <div
            className="flex justify-center items-center gap-6 py-4"
            id="pagination-container"
          >
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="header-icon-button disabled:opacity-30 disabled:cursor-not-allowed"
            >
              PREV
            </button>
            <span className="text-white font-pixel text-sm">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="header-icon-button disabled:opacity-30 disabled:cursor-not-allowed"
            >
              NEXT
            </button>
          </div>
        </>
      )}
      {/* home page */}
      {type === 'home' && <HomePage blocks = {data}/>}
    </div>
  );
};

export default MainContainer;
