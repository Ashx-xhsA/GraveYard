import GraveIcon from './GraveIcon';
import { Outlet } from 'react-router-dom';
import { useScreenSize } from '../hooks/useScreenSize';
import type { GraveDetail } from '../types';

interface GraveListProps {
  currentGraves: GraveDetail[];
  randomIndices: number[];
  isRightPanelShow: boolean;
}

const GraveList = ({ currentGraves, randomIndices, isRightPanelShow,}: GraveListProps) => {
  const screenSize = useScreenSize();
  const cols = !isRightPanelShow ? 4 : 3;

  return (
    <div
      id="grave-list-container"
      style={{
        ...(screenSize === 'lg'
          ? { gridTemplateColumns: `repeat(${cols}, 1fr)` }
          : {}),

      }}
      
  
    >
      {currentGraves.map((item, index) => {
        let gridStyle = {};
        if (screenSize === 'lg') {
          const posIndex = randomIndices[index];
          gridStyle = {
            gridRow: Math.floor(posIndex / cols) + 1,
            gridColumn: (posIndex % cols) + 1,
          };
        }

        return (
          <div key={item._id} style={gridStyle}>
            <GraveIcon graveData={item} />
          </div>
        );
      })}
      <Outlet />
    </div>
  );
};

export default GraveList;
