import { redirect, useLoaderData } from 'react-router-dom';
import { IoMenuSharp } from "react-icons/io5";
import { useState } from 'react';
import { useGraveData } from '../hooks/useGraveData';
import GraveList from './GraveList';
import { useAuth } from '../context/AuthContext';
import GraveInfo from './GraveInfo';
import api from '../api';
import tempData from '../../db.json'

const isTest = true; 
//測試用
export const loader = async ({ params }: any) => {
  const { graveid,blockid } = params;

  if (graveid) {
    if (isTest){
      const mockGraveDetail = tempData.graves.find((g) => g.graveID === graveid);
    return { type: 'detail', data: [graveid, mockGraveDetail || null] };
    }
    // try {
    //   const res = await api.get(`/grave/${graveid}`);
    //   return { type: 'detail', data: [graveid, res.data] };
    // } catch {
    //   return { type: 'detail', data: [graveid, null] };
    // }
  } else if (blockid) {
    // 這是真正的函數
    // try {
    //   const res = await api.get('/grave', { params: { limit: 100, block:blockid } });
    //   return { type: 'list', data: res.data.graves };
    // } catch {
    //   return { type: 'list', data: [] };
    // }
    
    if (isTest){
      const mockGraves = tempData.graves;
      return {type: 'list',data:mockGraves};
    }
  }
  //如果找不到路径跳转到主页
  return redirect('/');
};

interface LoaderData {
  type: 'detail' | 'list';
  data: any;
}

const MainContainer = () => {
  const { type, data } = useLoaderData() as LoaderData;
  const [currentPage, setCurrentPage] = useState(0);
  const { isRightPanelShow, toggleRightPanel } = useAuth();
  const { currentGraves, randomIndices, totalPages } = useGraveData(
    type === 'list' ? data : [],
    currentPage,
    isRightPanelShow
  );

  return (
    <div
      className="h-full borderDecoration relative"
      id="main-container"
      style={{ flex: 1 }}
    >
      <button
        id="toggle-right-panel-button"
        onClick={toggleRightPanel}
        className="absolute top-4 right-4 z-10 text-xl cursor-pointer bg-transparent border-None"
      >
        <IoMenuSharp />
      </button>
      {type === 'detail' ? (
        <GraveInfo />
      ) : (
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
    </div>
  );
};

export default MainContainer;
