import React from 'react';
import Login from '../../pages/Login';

const LoggedOutMain = () => {

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row items-center max-w-4xl">
        <div className="hidden md:block md:w-1/2 pr-8">
          <img src="./images/inst.png" alt="insta" className="w-4/5" />
        </div>

        <Login />
      </div>
    </div>
  );
};

export default LoggedOutMain;
