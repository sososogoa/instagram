import React, { useState } from 'react';
import { Modal, Box } from '@mui/material';
import { followUser, removeFollower } from '../../api';
import RemoveFollowerConfirmationModal from './RemoveFollowerConfirmationModal';

const FollowerModal = ({
  followers,
  currentUser,
  showFollowersModal,
  setShowFollowersModal,
  setFollowers,
}) => {
  const [showRemoveConfirmationModal, setShowRemoveConfirmationModal] = useState(false);
  const [selectedFollower, setSelectedFollower] = useState(null);

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      setFollowers((prevList) =>
        prevList.map((user) =>
          user._id === userId ? { ...user, isFollowing: true } : user
        )
      );
    } catch (error) {
      console.error('Failed to follow user', error);
    }
  };

  const handleRemoveClick = (follower) => {
    setSelectedFollower(follower);
    setShowRemoveConfirmationModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (selectedFollower) {
      try {
        await removeFollower(selectedFollower._id);
        setFollowers((prevList) => prevList.filter((user) => user._id !== selectedFollower._id));
        setShowRemoveConfirmationModal(false);
        setSelectedFollower(null);
      } catch (error) {
        console.error('Failed to remove follower', error);
      }
    }
  };

  return (
    <>
      <Modal open={showFollowersModal} onClose={() => setShowFollowersModal(false)}>
        <Box className="p-4 bg-white rounded shadow-lg" style={{ width: '400px', margin: 'auto', marginTop: '20vh' }}>
          <h2 className="text-lg font-semibold mb-4">팔로워 목록</h2>
          <ul className="max-h-80 overflow-y-auto">
            {followers.map((follower) => (
              <li key={follower._id} className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <img src={`http://localhost:5000${follower.profilePicture}`} alt={follower.username} className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex items-center">
                    <div className="font-semibold mr-2">{follower.username}</div>
                    {currentUser._id !== follower._id && !follower.isFollowing && (
                      <button
                        onClick={() => handleFollow(follower._id)}
                        className="bg-red-500 text-white px-4 py-1 rounded text-sm font-semibold hover:bg-red-600 mt-2"
                      >
                        팔로우
                      </button>
                    )}
                  </div>
                </div>
                {currentUser._id !== follower._id && (
                  <button
                    onClick={() => handleRemoveClick(follower)}
                    className="bg-red-500 text-white px-4 py-1 rounded text-sm font-semibold hover:bg-red-600"
                  >
                    삭제
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Box>
      </Modal>

      <RemoveFollowerConfirmationModal
        showRemoveConfirmationModal={showRemoveConfirmationModal}
        setShowRemoveConfirmationModal={setShowRemoveConfirmationModal}
        handleRemoveConfirm={handleRemoveConfirm}
        selectedFollower={selectedFollower}
      />
    </>
  );
};

export default FollowerModal;
