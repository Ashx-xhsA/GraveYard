import styled from 'styled-components';

const Wrapper = styled.div`
  display: grid;
  gap: 2rem;

  grid-template-columns: repeat(3, 1fr);

  @media (min-width: 1024px) {
    grid-template-columns: repeat(5, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: repeat(1, 1fr);
  }
`;

export default Wrapper;
