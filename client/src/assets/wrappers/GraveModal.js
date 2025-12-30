import styled from 'styled-components';

export const Overlay = styled.div`
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
export const GraveImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #000;
  margin-bottom: 1.5rem;
  display: block;
`;

export const ModalWindow = styled.div`
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

export const CloseButton = styled.button`
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

export const GraveTitle = styled.h2`
  font-family: 'Georgia', serif;
  font-size: 2rem;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
`;

export const DateText = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 20px;
`;

export const Epitaph = styled.div`
  line-height: 1.8;
  color: #34495e;
  text-align: center;
  margin-top: 20px;
  padding: 20px;
  border-top: 1px solid #eee;
  width: 100%;
`;
