import { useLoaderData } from 'react-router-dom';
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
  if (graveid) {
    const grave = tempData.graves.find((grave) => grave.id === graveid);
    console.log('there is a graveid');
    return { type: 'detail', data: [graveid, grave] };
  } else {
    return { type: 'list', data: tempData.graves };
  }
};

interface LoaderData {
  type: 'detail' | 'list';
  data: any;
}

const MainContainer = () => {
  const { type, data } = useLoaderData() as LoaderData;
  const [currentPage, setCurrentPage] = useState(0);
  const { isRightPanelShow } = useAuth();
  const { currentGraves, randomIndices, totalPages } = useGraveData(
    type === 'list' ? data : [],
    currentPage,
    isRightPanelShow
  );

  return (
    <div
      className="h-full borderDecoration"
      id="main-container"
      style={{ flex: 1 }}
    >
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
