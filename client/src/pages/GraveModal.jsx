import { useParams, useNavigate, useRouteLoaderData } from 'react-router-dom';
import {
  Overlay,
  ModalWindow,
  CloseButton,
  GraveTitle,
  DateText,
  Epitaph,
  GraveImage,
} from '../assets/wrappers/GraveModal';

const GraveModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const data = useRouteLoaderData('landing-route');

  const currentGrave = data?.graves?.find((g) => g.id.toString() === id);

  const handleClose = () => navigate('/');

  return (
    <Overlay onClick={handleClose}>
      <ModalWindow onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={handleClose}>×</CloseButton>

        {currentGrave ? (
          <>
            {currentGrave.photos && currentGrave.photos.length > 0 ? (
              <GraveImage
                src={currentGrave.photos[0]}
                alt={currentGrave.name}
              />
            ) : (
              <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🪦</div>
            )}
            <GraveTitle>{currentGrave.name || '无名之墓'}</GraveTitle>
            <DateText>
              {currentGrave.birth || '????'} — {currentGrave.death || '????'}
            </DateText>

            <Epitaph>“ {currentGrave.epitaph || '再见。'} ”</Epitaph>
          </>
        ) : (
          <p>...</p>
        )}
      </ModalWindow>
    </Overlay>
  );
};

export default GraveModal;
