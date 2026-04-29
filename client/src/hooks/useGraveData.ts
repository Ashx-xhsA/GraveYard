import { useMemo } from 'react';
import { useScreenSize } from './useScreenSize';

//墓碑顯示和擺放的邏輯
//大屏幕5個，小屏幕4個
//位置隨機擺放
export const useGraveData = (
  data: any[],
  currentPage: number,
  isRightPanelShow: boolean
) => {
  const screenSize = useScreenSize();

  const gridPositions = isRightPanelShow ? 9 : 12;

  const pageSize = useMemo(() => {
    return screenSize === 'lg' ? 5 : 4;
  }, [screenSize]);

  const currentGraves = useMemo(() => {
    const start = currentPage * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const randomIndices = useMemo(() => {
    const indices = Array.from({ length: gridPositions }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, currentGraves.length);
  }, [currentGraves, gridPositions]);

  const totalPages = Math.ceil(data.length / pageSize);

  return { currentGraves, randomIndices, totalPages };
};
