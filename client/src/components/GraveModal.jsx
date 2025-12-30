import styled from 'styled-components';
import { useParams, useNavigate, useRouteLoaderData } from 'react-router-dom';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;
const GraveImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #000;
  margin-bottom: 1.5rem;
  display: block;
`;

const ModalWindow = styled.div`
  background: #fdfcf8;
  width: 90%;
  max-width: 600px;
  min-height: 400px;
  border-radius: 0;

  position: relative;
  padding: 40px;
  border: 2px solid #000;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  &:hover {
    color: #333;
  }
`;

const GraveTitle = styled.h2`
  font-family: 'Georgia', serif;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
`;

const DateText = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 20px;
`;

const Epitaph = styled.div`
  line-height: 1.8;
  color: #34495e;
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  border-top: 1px solid #eee;
  width: 100%;
`;

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
