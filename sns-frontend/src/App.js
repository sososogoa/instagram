import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import DirectMessage from './pages/DirectMessage';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ModalProvider, useModal } from './context/ModalContext';
import { Modal } from '@mui/material';
import CreatePost from './components/Post/CreatePost';
import "./index.css";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <ModalProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dm/:id" element={<DirectMessage />} />
            </Routes>
            <CreatePostModal />
          </ModalProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
};

const CreatePostModal = () => {
  const { isCreatePostOpen, closeCreatePost } = useModal();

  if (!isCreatePostOpen) return null;

  return (
    <Modal open={isCreatePostOpen} onClose={closeCreatePost}>
      <>
        <CreatePost onClose={closeCreatePost} />
      </>
    </Modal>
  );
};

export default App;
