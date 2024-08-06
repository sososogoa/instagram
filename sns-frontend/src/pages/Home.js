import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import LoggedInMain from '../components/Main/LoggedInMain';
import LoggedOutMain from '../components/Main/LoggedOutMain';

const Home = () => {
  const { isLoggedIn } = useContext(AuthContext);

  return (isLoggedIn ? <LoggedInMain /> : <LoggedOutMain />);
};

export default Home;
