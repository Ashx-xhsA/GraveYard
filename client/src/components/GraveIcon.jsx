import { Link } from 'react-router-dom';
import { IconWrapper, SpriteContainer } from '../assets/wrappers/GraveIcon';

const GraveIcon = ({
  id,
  graveID,
  name,
  birth,
  death,
  epitaph,
  photos,
  memorial,
}) => {
  return (
    <Link to={`/graves/${id}`} className="hover:scale-105 transition-transform">
      <IconWrapper>
        <h5
          style={{
            marginTop: '8px',
            fontWeight: 'bold',
            WebkitTextStroke: '1px #000',
            letterSpacing: 'var(--letterSpacing)',
          }}
        >
          {graveID}
        </h5>
        <SpriteContainer />
      </IconWrapper>
    </Link>
  );
};
export default GraveIcon;
