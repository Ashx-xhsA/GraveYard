import { Link } from 'react-router-dom';
import type { GraveDetail } from '../types';

interface GraveIconProps {
  graveData: Pick<GraveDetail, 'graveID' | 'name' | 'block'>;
}

const GraveIcon = ({ graveData }: GraveIconProps) => {
  const { graveID, name,block
   } = graveData;
  return (
    <Link
      to={`/${block.blockID}/${graveID}`}
      className="hover:scale-105 transition-transform grave-icon"
    >
      <h5 className="grave-icon-text">{name}</h5>
      <div
        className="w-[80%] min-w-[64px] aspect-square bg-no-repeat bg-[length:200.1%_100.1%] [image-rendering:pixelated] animate-[playSprite_1s_steps(1,end)_infinite] hover:brightness-120 hover:[animation-duration:2s]"
        style={{ backgroundImage: 'var(--grave-sprite-image)' }}
      />
    </Link>
  );
};
export default GraveIcon;
