import React from 'react';
import { Modal, Box, Avatar } from '@mui/material';

const LikesModal = ({ open, onClose, likesList, handleProfileClick }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="p-4 bg-white rounded shadow-lg"
        style={{ width: '400px', margin: 'auto', marginTop: '30vh' }}
      >
        <div className="text-center border-b border-gray-300 pb-2 mb-4">
          <p className="font-semibold text-lg">좋아요</p>
        </div>
        {likesList.map((user) => (
          <div key={user._id} className="flex items-center mb-2">
            <Avatar
              src={`http://localhost:5000${user.profilePicture}`}
              alt={user.username}
              className="w-8 h-8 rounded-full mr-2"
            />
            <span className="cursor-pointer" onClick={() => handleProfileClick(user._id)}>
              {user.username}
            </span>
          </div>
        ))}
      </Box>
    </Modal>
  );
};

export default LikesModal;
