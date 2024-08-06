import React, { createContext, useState, useEffect, useContext } from 'react';
import { getNotifications } from '../api';
import { AuthContext } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const { user: currentUser } = useContext(AuthContext);

  const fetchNotifications = async () => {
    try {
      if (currentUser) {
        const response = await getNotifications(currentUser._id);
        // console.log(response.data);
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  useEffect(() => {
    let intervalId;
    if (currentUser) {
      fetchNotifications();
      intervalId = setInterval(fetchNotifications, 60000);
      return () => clearInterval(intervalId);
    }
  }, [currentUser]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, fetchNotifications, selectedPostId, setSelectedPostId }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
