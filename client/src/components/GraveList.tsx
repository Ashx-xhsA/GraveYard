import GraveIcon from './GraveIcon';
import { Outlet } from 'react-router-dom';
import { useScreenSize } from '../hooks/useScreenSize';

interface GraveListProps {
  currentGraves: any[];
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
      {currentGraves.map((item: any, index: number) => {
        let gridStyle = {};
        if (screenSize === 'lg') {
          const posIndex = randomIndices[index];
          gridStyle = {
            gridRow: Math.floor(posIndex / cols) + 1,
            gridColumn: (posIndex % cols) + 1,
          };
        }

        return (
          <div key={item._id || item.id} style={gridStyle}>
            <GraveIcon graveData={item} />
          </div>
        );
      })}
      <Outlet />
    </div>
  );
};

export default GraveList;
