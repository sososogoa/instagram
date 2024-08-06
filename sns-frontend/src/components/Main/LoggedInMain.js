import React, { useState, useContext, useEffect } from 'react';
import LeftSidebar from '../Sidebar/LeftSidebar';
import PostsList from '../Post/PostsList';
import NotificationComponent from '../Sidebar/NotificationComponent';
import PostDetailModal from '../PostDetail/PostDetailModal';
import { useNotifications } from '../../context/NotificationContext';
import { AuthContext } from '../../context/AuthContext';

const LoggedInMain = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { selectedPostId, setSelectedPostId } = useNotifications();
  const { user: currentUser } = useContext(AuthContext);
  const sidebarWidth = showNotifications ? 64 : 256;

  const handleCloseModal = () => {
    setSelectedPostId(null);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <LeftSidebar
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="flex-1 flex justify-center items-start overflow-y-auto ml-[256px] lg:ml-[64px]">
        <div className="w-full max-w-2xl p-4">
          {/* <div className="flex p-4 space-x-4 overflow-x-auto">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 p-0.5">
                  <div className="w-full h-full rounded-full border-2 border-white" />
                </div>
                <span className="text-xs mt-1">story{i + 1}</span>
              </div>
            ))}
          </div> */}

          <div className="mt-4">
            <PostsList />
          </div>
        </div>
      </div>

      {selectedPostId && <PostDetailModal post={selectedPostId} onClose={handleCloseModal} />}

      <NotificationComponent
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
        sidebarWidth={sidebarWidth}
        currentUser={currentUser}
      />
    </div>
  );
};

export default LoggedInMain;
