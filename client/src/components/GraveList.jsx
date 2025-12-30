import GraveIcon from './GraveIcon';
import Wrapper from '../assets/wrappers/GraveList';
const GraveList = ({ graves }) => {
  if (!graves) {
    return <h4 style={{ textAlign: 'center' }}>No grave found...</h4>;
  }

  return (
    <Wrapper>
      {graves.map((item) => {
        return <GraveIcon key={item.id} {...item} />;
      })}
    </Wrapper>
  );
};

export default GraveList;
