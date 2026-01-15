import { Link } from 'react-router-dom';

interface GraveIconProps {
  id: string;
  graveID: string;
  name?: string;
  birth?: string;
  death?: string;
  epitaph?: string;
  photos?: string[];
  memorial?: string;
}

const GraveIcon = ({ id, graveID }: GraveIconProps) => {
  return (
    <Link
      to={`/${id}`}
      className="hover:scale-105 transition-transform grave-icon"
    >
      <h5 className="grave-icon-text">{graveID}</h5>
      <div
        className="w-[80%] min-w-[64px] aspect-square bg-no-repeat bg-[length:200.1%_100.1%] [image-rendering:pixelated] animate-[playSprite_1s_steps(1,end)_infinite] hover:brightness-120 hover:[animation-duration:2s]"
        style={{ backgroundImage: 'var(--grave-img-url)' }}
      />
    </Link>
  );
};
export default GraveIcon;
