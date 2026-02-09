import { useLoaderData } from 'react-router-dom';
import InteractionPaginateContainer from './InteractionPaginateContainer';

const GraveInfo = () => {
  const { data } = useLoaderData();
  const [graveid, graveData] = data;

  const {
    birth,
    death,
    epitaph,
    memorial,
    photos,
    burial,
    interaction,
    name,
    indexInGy,
    gyid,
    id,
  } = graveData;

  return (
    <div id="single-grave-container">
      {/* grave information container */}
      <div id="grave-info-container">
        <div id="grave-info-img-container">
          <img src={photos[0]} alt={name} />
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
          {/*墓志铭 */}
          {/* <span className="info-label">EPITAPH</span> */}
            <span className="info-value">{epitaph}</span>
          </div>
        <div className="info-item">
            {/* 墓碑文 */}
            {/* <span className="info-label">MEMORIAL</span> */}
            <span className="info-value">{memorial}</span>
          </div>
        <div className="info-item">
            {/* 墓碑位置 */}
            {/* <span className="info-label">BURIAL</span> */}
            <span className="info-value">{burial.display_name}</span>
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
