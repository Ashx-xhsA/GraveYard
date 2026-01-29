import { useLoaderData } from 'react-router-dom';
import { IoMenuSharp } from "react-icons/io5";
import tempData from '../../db.json';
import { useState } from 'react';
import { useGraveData } from '../hooks/useGraveData';
import GraveList from './GraveList';
import { useAuth } from '../context/AuthContext';
import GraveInfo from './GraveInfo';

export const loader = async ({ params }: any) => {
  // const { id } = params;
  // if (id) {
  //
  //   const grave = await fetchGraveById(id);
  //   return { type: 'detail', data: grave };
  // } else {
  //
  //   const graves = await fetchGraves();
  //   return { type: 'list', data: graves };
  // }
  const { graveid } = params;
  const graveyard = tempData.graveyard;
  if (graveid) {
    const grave = tempData.graves.find((grave) => grave.id === graveid);
    console.log('there is a graveid');
    return { type: 'detail', data: [graveid, grave], graveyard };
  } else {
    return { type: 'list', data: tempData.graves, graveyard };
  }
};

interface LoaderData {
  type: 'detail' | 'list';
  data: any;
  graveyard: any;
}

const MainContainer = () => {
  const { type, data, graveyard } = useLoaderData() as LoaderData;
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
      style={{ 
        flex: 1,
        backgroundImage: type === 'list' && graveyard?.backgroundImage ? `url(${graveyard.backgroundImage})` : undefined
      }}
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
