import { useLoaderData, useRevalidator } from 'react-router-dom';
import InteractionPaginateContainer from './InteractionPaginateContainer';
import OfferForm from './OfferForm';
import MessageForm from './MessageForm';
import Login from './Login';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { useT } from '../i18n';
import type { LoaderData } from './MainContainer';

type GraveLoaderData = Extract<LoaderData, { page: 'grave' }>;

/** Entry points for offering and leaving messages; guests are invited to log in instead. */
const InteractionActions = ({ graveID }: { graveID: string }) => {
  const t = useT();
  const { isLoggedIn } = useAuth();
  const { openModal } = useModal();
  // The forms render in the modal, outside the router, so they receive this as a callback.
  const { revalidate } = useRevalidator();

  if (!isLoggedIn) {
    return (
      <div className="interaction-actions">
        <button type="button" className="interaction-login-link" onClick={() => openModal(<Login />)}>
          {t.grave.loginToInteract}
        </button>
      </div>
    );
  }

  return (
    <div className="interaction-actions">
      <button
        type="button"
        className="header-icon-button px-3"
        onClick={() => openModal(<OfferForm graveID={graveID} onOffered={revalidate} />)}
      >
        {t.offer.button}
      </button>
      <button
        type="button"
        className="header-icon-button px-3"
        onClick={() => openModal(<MessageForm graveID={graveID} onSent={revalidate} />)}
      >
        {t.message.button}
      </button>
    </div>
  );
};

const GraveInfo = () => {
  const { grave: graveData } = useLoaderData() as GraveLoaderData;

  if (!graveData) {
    return <div id="single-grave-container"><p>Grave not found.</p></div>;
  }

  const {
    graveID,
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
        <InteractionActions graveID={graveID} />
        {/* Remounting when the history grows returns the list to its first page, where new entries appear. */}
        <InteractionPaginateContainer key={interaction.history.length} interaction={interaction} itemsPerPage={10} />
      </div>
    </div>
  );
};

export default GraveInfo;
