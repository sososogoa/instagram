import React, { useEffect, useRef, useCallback } from 'react';
import { markNotificationAsRead, acceptFollowRequest, rejectFollowRequest, getPostById } from '../../api';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@mui/material';


const NotificationComponent = ({ show, onClose, sidebarWidth }) => {
  const { notifications, setNotifications, fetchNotifications, setSelectedPostId } = useNotifications();
  const navigate = useNavigate();
  const ref = useRef(null);

  const fetchAndSetNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [show, fetchNotifications]);

  useEffect(() => {
    if (show) {
      fetchAndSetNotifications();
      console.log(notifications);
    }
  }, [show]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleAccept = async (userId, notificationId) => {
    try {
      await acceptFollowRequest(userId);
      handleMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to accept follow request', error);
    }
  };

  const handleReject = async (userId, notificationId) => {
    try {
      await rejectFollowRequest(userId);
      handleMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to reject follow request', error);
    }
  };

  const handleNotificationClick = async (userId, notificationId) => {
    try {
      await handleMarkAsRead(notificationId);
      navigate(`/profile/${userId}`);
    } catch (error) {
      console.error('Failed to handle notification click', error);
    }
  };

  const handleProfileNavigation = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handlePostNavigation = async (postId, notificationId) => {
    try {
      const response = await getPostById(postId._id);
      console.log(response.data);
      setSelectedPostId(response.data);
      handleMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to reject follow request', error);
    }
  };

  return (
    <div
      ref={ref}
      className={`fixed top-0 left-0 h-full bg-white w-80 shadow-lg transition-all duration-300 ease-in-out`}
      style={{
        transform: show ? `translateX(${sidebarWidth}px)` : 'translateX(-100%)',
        opacity: show ? 1 : 0,
      }}
    >
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">알림</h2>
        <div className="space-y-4">
          {notifications.filter(notification => !notification.isRead && notification.type !== "message").map(notification => (
            <div key={notification._id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar src={`http://localhost:5000${notification.requester.profilePicture}`} alt={notification.requester.username} className="mr-4" />
                {notification.type === 'follow-request' && (
                  <>
                    <span
                      className="cursor-pointer"
                      onClick={() => handleProfileNavigation(notification.requester._id)}
                    >
                      <span className="font-semibold">{notification.requester.username}</span>님이 회원님을 팔로우하기 시작했습니다.
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAccept(notification.requester._id, notification._id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                      >
                        승인
                      </button>
                      <button
                        onClick={() => handleReject(notification.requester._id, notification._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                      >
                        거절
                      </button>
                    </div>
                  </>
                )}
                {notification.type === 'follow-accepted' && (
                  <span
                    className="cursor-pointer"
                    onClick={() => handleNotificationClick(notification.requester._id, notification._id)}
                  >
                    <span className="font-semibold">{notification.requester.username}</span>님이 팔로우하였습니다.
                  </span>
                )}
                {notification.type === 'like' && (
                  <span
                    className="cursor-pointer"
                    onClick={() => handlePostNavigation(notification.postId, notification._id)}
                  >
                    <span className="font-semibold">{notification.requester.username}</span>님이 좋아요를 눌렀습니다.
                  </span>
                )}
                {notification.type === 'comment' && (
                  <span
                    className="cursor-pointer"
                    onClick={() => handlePostNavigation(notification.postId, notification._id)}
                  >
                    <span className="font-semibold">{notification.requester.username}</span>님이 댓글을 남겼습니다 : {notification.commentContent}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationComponent;
