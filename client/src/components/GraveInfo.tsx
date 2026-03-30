import { useLoaderData } from 'react-router-dom';
import InteractionPaginateContainer from './InteractionPaginateContainer';

const GraveInfo = () => {
  const { data } = useLoaderData() as any;
  const [, graveData] = data;

  if (!graveData) {
    return <div id="single-grave-container"><p>Grave not found.</p></div>;
  }

  const {
    birth,
    death,
    epitaph,
    memorial,
    photos,
    burial,
    interaction,
    name,
  } = graveData;

  return (
    <div id="single-grave-container">
      {/* grave information container */}
      <div id="grave-info-container">
        <div id="grave-info-img-container">
          {photos && photos[0] && <img src={photos[0]} alt={name} />}
        </div>
        <div id="grave-title-container">
          <h1>{name}</h1>
          <span>
            {' '}
            {birth} --- {death}{' '}
          </span>
        </div>

        <div id="grave-info-content">
          <div className="info-item">
            <span className="info-value">{epitaph}</span>
          </div>
          <div className="info-item">
            <span className="info-value">{memorial}</span>
          </div>
          <div className="info-item">
            <span className="info-value">{burial?.display_name}</span>
          </div>
        </div>
      </div>

      {/* grave interaction container */}
      <div id="grave-interaction-container">
        <InteractionPaginateContainer interaction={interaction} itemsPerPage={10} name={name} />
      </div>
    </div>
  );
};

export default GraveInfo;
