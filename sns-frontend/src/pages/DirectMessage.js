import React, { useRef, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, IconButton, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { AuthContext } from '../context/AuthContext';
import LeftSidebarForDM from '../components/Sidebar/LeftSidebarForDM';
import NotificationComponent from '../components/Sidebar/NotificationComponent';
import useDirectMessages from '../hooks/useDirectMessages';
import { useNotifications } from '../context/NotificationContext';
import PostDetailModal from '../components/PostDetail/PostDetailModal';
import { markNotificationAsRead } from '../api';

const DirectMessage = () => {
  const { selectedPostId, setSelectedPostId } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};
  const { user: currentUser } = useContext(AuthContext);

  const messagesContainerRef = useRef();
  const [showNotifications, setShowNotifications] = useState(false);
  const sidebarWidth = showNotifications ? 64 : 256;

  const {
    conversations,
    selectedConversation,
    messages,
    newMessage,
    setNewMessage,
    fetchMessages,
    setSelectedConversation,
    sendMessage,
    hasMore,
    isLoading,
    setPage,
  } = useDirectMessages(currentUser, userId);

  const { notifications, fetchNotifications } = useNotifications();

  const handleCloseModal = () => {
    setSelectedPostId(null);
  };

  const getUnreadMessageCountForConversation = (conversation) => {
    const otherUser = conversation.participants.find(participant => participant._id !== currentUser._id);
    if (!otherUser) return 0;
    return notifications.filter(
      notification =>
        !notification.isRead &&
        notification.type === 'message' &&
        notification.requester._id === otherUser._id
    ).length;
  };

  const markConversationNotificationsAsRead = async (conversation) => {
    const otherUser = conversation.participants.find(participant => participant._id !== currentUser._id);
    if (!otherUser) return;
    const unreadNotifications = notifications.filter(
      notification =>
        !notification.isRead &&
        notification.type === 'message' &&
        notification.requester._id === otherUser._id
    );

    for (const notification of unreadNotifications) {
      await markNotificationAsRead(notification._id);
    }

    fetchNotifications();
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!messagesContainerRef.current) return;

    const handleScroll = () => {
      if (messagesContainerRef.current.scrollTop === 0 && hasMore && !isLoading) {
        setPage(prevPage => {
          const newPage = prevPage + 1;
          fetchMessages(newPage);
          return newPage;
        });
      }
    };

    messagesContainerRef.current.addEventListener('scroll', handleScroll);

    return () => {
      if (messagesContainerRef.current) {
        messagesContainerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasMore, isLoading, fetchMessages]);

  useEffect(() => {
    if (selectedConversation) {
      markConversationNotificationsAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
      <LeftSidebarForDM setShowNotifications={setShowNotifications} />
      <div className="flex-1 grid grid-cols-10 h-full" style={{ marginLeft: "64px" }}>
        <div className="col-span-2 flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-r border-gray-300">
            <h2 className="text-xl font-semibold">{currentUser.username}</h2>
          </div>
          <div className="flex-1 border-r border-gray-300 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            {conversations.map((conv, index) => {
              const otherUser = conv.participants.find(participant => participant._id !== currentUser._id);
              const unreadCount = getUnreadMessageCountForConversation(conv);
              return (
                <div
                  key={index}
                  onClick={() => setSelectedConversation(conv)}
                  className="flex items-center p-4 cursor-pointer hover:bg-gray-100"
                >
                  <Avatar src={`http://localhost:5000${otherUser.profilePicture}`} alt={otherUser.username} className="mr-4" />
                  <div className="hidden sm:block">
                    <h3 className="font-semibold">{otherUser.username}</h3>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {selectedConversation && (
          <div className="col-span-8 flex flex-col h-full">
            <div className="flex items-center p-4 border-b border-gray-300">
              <Avatar
                // src={selectedConversation.participants.find(participant => participant._id !== currentUser._id)?.profilePicture}
                src={`http://localhost:5000${selectedConversation.participants.find(participant => participant._id !== currentUser._id)?.profilePicture}`}
                alt={selectedConversation.participants.find(participant => participant._id !== currentUser._id)?.username}
                className="mr-4"
              />
              <h2 className="text-xl font-semibold">
                {selectedConversation.participants.find(participant => participant._id !== currentUser._id)?.username}
              </h2>
            </div>
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 128px - 64px)' }}>
              {messages.map((msg, index) => (
                <div key={msg._id} className={`flex items-start mb-4 ${msg.sender._id === currentUser._id ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-2 rounded-lg ${msg.sender._id === currentUser._id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    <p>{msg.text}</p>
                    <span className={`text-xs ${msg.sender._id === currentUser._id ? 'text-white-500' : 'text-gray-500'}`}>
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="border-t border-gray-300 p-4 flex items-center">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="메시지 입력..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <IconButton type="submit">
                <SendIcon />
              </IconButton>
            </form>
          </div>
        )}
      </div>
      <NotificationComponent
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
        sidebarWidth={sidebarWidth}
        currentUser={currentUser}
      />

      {selectedPostId && <PostDetailModal post={selectedPostId} onClose={handleCloseModal} />}
    </div>
  );
};

export default DirectMessage;
