import styled, { keyframes } from 'styled-components';
import graveImg from '../grave-1.png';

const playSprite = keyframes`
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 0%; }
  100% { background-position: 100% 0%; }
`;

export const SpriteContainer = styled.div`
  width: 80%;
  min-width: 64px;
  aspect-ratio: 1 / 1;

  background-image: url(${graveImg});
  background-repeat: no-repeat;
  background-size: 200.1% 100.1%;

  image-rendering: pixelated;

  animation: ${playSprite} 1s steps(1, end) infinite;

  &:hover {
    filter: brightness(1.2);
    animation-duration: 2s;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;

  color: white;

  font-family: 'MS Sans Serif', Tahoma, sans-serif;
  font-size: 12px;
  width: 100%;
`;
