import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import HomeIcon from '@mui/icons-material/Home';
import MailIcon from '@mui/icons-material/Mail';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import { useModal } from '../../context/ModalContext';

const LeftSidebar = ({ showNotifications, setShowNotifications }) => {
  const { user } = useContext(AuthContext);
  const { notifications } = useNotifications();
  const { openCreatePost } = useModal();
  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(id);
  };

  const handleNotificationClick = () => {
    setShowNotifications((prevState) => !prevState);
  };

  const unreadMessageCount = notifications.filter(notification => !notification.isRead && notification.type === 'message').length;
  const unreadNotificationsCount = notifications.filter(notification => !notification.isRead && notification.type !== 'message').length;

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-white border-r border-gray-300 transition-all duration-300 ease-in-out ${showNotifications ? 'w-16' : 'w-64'}`}
    >
      <div className="p-4">
        <h1 className="text-2xl font-bold ml-2 mb-4 whitespace-nowrap">
          {showNotifications ? 'IG' : 'Instagram'}
        </h1>
        <nav>
          <ul className="space-y-4">
            {[
              { icon: <HomeIcon />, label: '홈', path: '/' },
              {
                icon: (
                  <div className="relative">
                    <MailIcon />
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </div>
                ),
                label: '메시지',
                path: '/dm/inbox'
              },
              {
                icon: (
                  <div className="relative">
                    <FavoriteIcon />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                      </span>
                    )}
                  </div>
                ),
                label: '알림',
                onClick: handleNotificationClick,
              },
              { icon: <AddIcon />, label: '만들기', onClick: openCreatePost },
              { icon: <PersonIcon />, label: '프로필', path: `/profile/${user._id}` },
            ].map((item, index) => (
              <li
                key={index}
                onClick={item.onClick || (() => handleClick(item.path))}
                className="flex items-center cursor-pointer hover:bg-gray-100 rounded-full p-2 transition-colors duration-200 whitespace-nowrap"
              >
                <span className="mr-2">{item.icon}</span>
                <span className={`${showNotifications ? 'hidden' : 'block'} whitespace-nowrap`}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default LeftSidebar;
