import { useLoaderData } from 'react-router-dom';
import type { LoaderFunctionArgs } from 'react-router-dom';
import type { GraveDetail, GraveListResponse, GyBlock } from '../types';
import { IoMenuSharp } from "react-icons/io5";
import { useState } from 'react';
import { useGraveData } from '../hooks/useGraveData';
import GraveList from './GraveList';
import { useAuth } from '../context/AuthContext';
import GraveInfo from './GraveInfo';
import api from '../api';
import HomePage from './HomePage';

export const loader = async ({ params }: LoaderFunctionArgs): Promise<LoaderData> => {
  const { graveID, blockID } = params;

  // L2 · grave page. The response has its block populated.
  if (graveID) {
    try {
      const res = await api.get<GraveDetail>(`/grave/${graveID}`);
      return { page: 'grave', graveID, grave: res.data };
    } catch {
      return { page: 'grave', graveID, grave: null };
    }
  }

  // L1 · block page: the graves in this block, plus the block itself for its background.
  if (blockID) {
    try {
      const res = await api.get<GraveListResponse>('/grave', { params: { limit: 100, block: blockID } });
      return { page: 'block', graves: res.data.graves, block: res.data.blockInfo };
    } catch {
      return { page: 'block', graves: [], block: null };
    }
  }

  // L0 · home page: every block.
  try {
    const res = await api.get<{ blocks: GyBlock[] }>('/blocks');
    return { page: 'home', blocks: res.data.blocks };
  } catch {
    return { page: 'home', blocks: [] };
  }
};

/** `page` tells which layer is being rendered: home (L0), block (L1) or grave (L2). */
export type LoaderData =
  | { page: 'home'; blocks: GyBlock[] }
  | { page: 'block'; graves: GraveDetail[]; block: GyBlock | null }
  | { page: 'grave'; graveID: string; grave: GraveDetail | null };

const MainContainer = () => {
  const data = useLoaderData() as LoaderData;
  const { page } = data;
  const [currentPage, setCurrentPage] = useState(0);
  const { isRightPanelShow, toggleRightPanel } = useAuth();
  const { currentGraves, randomIndices, totalPages } = useGraveData(
    data.page === 'block' ? data.graves : [],
    currentPage,
    isRightPanelShow
  );
  // Only the block page paints the block's own background inside the container.
  const blockBgObj = data.page === 'block' ? data.block?.backgroundImage : undefined;

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
      {data.page === 'home' && <HomePage blocks={data.blocks} />}
    </div>
  );
};

export default MainContainer;
