import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const RightSidebar = () => {
  const { isLoggedIn, handleLogout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="w-80 p-4">
      <div className="flex items-center mb-4">
        <div
          className="w-12 h-12 rounded-full bg-gray-300 mr-3 cursor-pointer"
          onClick={() => handleProfileClick(user._id)}
        />
        <div>
          <p
            className="font-semibold cursor-pointer"
            onClick={() => handleProfileClick(user._id)}
          >
            {user.email}
          </p>
          <p className="text-gray-500 text-sm">{user.username}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-3">회원님을 위한 추천</p>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 mr-3" />
          <div className="flex-1">
            <p className="text-sm font-semibold">suggested_user{i + 1}</p>
            <p className="text-xs text-gray-500">회원님을 위한 추천</p>
          </div>
          <button className="text-xs text-blue-500 font-semibold">팔로우</button>
        </div>
      ))}
    </div>
  );
};

export default RightSidebar;
