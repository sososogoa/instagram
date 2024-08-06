import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [newPostCreated, setNewPostCreated] = useState(false);

  const openCreatePost = () => setIsCreatePostOpen(true);
  const closeCreatePost = () => setIsCreatePostOpen(false);
  const notifyNewPostCreated = () => setNewPostCreated(prev => !prev);


  return (
    <ModalContext.Provider value={{ isCreatePostOpen, openCreatePost, closeCreatePost, newPostCreated, notifyNewPostCreated }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);
