import { redirect, useLoaderData } from 'react-router-dom';
import { IoMenuSharp } from "react-icons/io5";
import { useState } from 'react';
import { useGraveData } from '../hooks/useGraveData';
import GraveList from './GraveList';
import { useAuth } from '../context/AuthContext';
import GraveInfo from './GraveInfo';
import api from '../api';
import HomePage from './HomePage';

export const loader = async ({ params }: any) => {
  const { graveid, blockid } = params;

  // L2 · 墓碑页 —— data: [graveID, 墓碑数据（含后端 populate 出来的 block）]
  if (graveid) {
    try {
      const res = await api.get(`/grave/${graveid}`);
      return { page: 'grave', data: [graveid, res.data] };
    } catch {
      return { page: 'grave', data: [graveid, null] };
    }
  }

  // L1 · 墓园页 —— data: [这座墓园里的墓碑列表, 这座墓园的背景图]
  else if (blockid) {
    try {
      const res = await api.get('/grave', { params: { limit: 100, block: blockid } });
      const gravesList = res.data.graves || [];
      const blockBgObj = res.data.blockInfo?.backgroundImage || null;
      return { page: 'block', data: [gravesList, blockBgObj] };
    } catch {
      return { page: 'block', data: [] };
    }
  }

  // L0 · 首页 —— data: 全部墓园
  else if (!graveid && !blockid) {
    try {
      const res = await api.get('/blocks');
      return { page: 'home', data: res.data.blocks };
    } catch {
      return { page: 'home', data: [] };
    }
  }

  //如果找不到路径跳转到主页
  return redirect('/');
};

interface LoaderData {
  /** 当前在图片分层模型的哪一层（见 CONVENTIONS 第一节）：
   *  'home' = L0 首页 ｜ 'block' = L1 墓园页 ｜ 'grave' = L2 墓碑页 */
  page: 'home' | 'block' | 'grave';
  data: any;
}

const MainContainer = () => {
  const { page, data } = useLoaderData() as LoaderData;
  const [currentPage, setCurrentPage] = useState(0);
  const { isRightPanelShow, toggleRightPanel } = useAuth();
  const { currentGraves, randomIndices, totalPages } = useGraveData(
    page === 'block' ? (data[0] || []) : [],
    currentPage,
    isRightPanelShow
  );
  //如果是block則獲取背景
  const blockBgObj = page === 'block' ? data[1] : undefined;

  //獲取url
  const blockImg = blockBgObj?.url;
  //獲取styles —— 數據庫裡存的是一段 JSON 字符串，例如
  //'{"backgroundSize": "cover", "backgroundPosition": "center"}'
  const blockStylesString = blockBgObj?.styles;
  let customStyles: Record<string, string> = {};
  try {
    if (typeof blockStylesString === 'string' && blockStylesString !== '') {
      customStyles = JSON.parse(blockStylesString);
    }
  } catch {
    // 數據髒了也不要讓整頁白屏：JSON.parse 是在渲染期間拋錯的，
    // 沒有 try/catch 的話這座墓園的列表頁會直接變空白。退回默認鋪法即可。
    customStyles = {};
  }

 

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
      {page === 'grave' && <GraveInfo/>}
      {/* gravelist page */}
      {page === 'block' && (
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
      {page === 'home' && <HomePage blocks = {data}/>}
    </div>
  );
};

export default MainContainer;
