import { useLoaderData, useLocation } from 'react-router-dom';
import axios from 'axios';
import GraveList from '../components/GraveList';
import { useRouteLoaderData, Outlet } from 'react-router-dom';
import tempData from '../../db.json';

// const graveUrl = 'http://localhost:3001/graves';
export const loader = async () => {
  // const searchId = '/';
  // const response = await axios.get(`${graveUrl}${searchId}`);
  // return { graves: response.data, searchId };
  return { graves: tempData };
};

const Landing = () => {
  const data = useRouteLoaderData('landing-route');

  // if (!data) return <div>Loading...</div>;

  // const { graves } = data;

  return (
    <>
      <GraveList graves={tempData.graves} />

      <Outlet />
    </>
  );
};
export default Landing;
