import React from 'react';
import { Modal, Box } from '@mui/material';
import { unfollowUser } from '../../api';

const FollowingModal = ({ currentUser, following, handleUnfollowConfirmation, showFollowingModal, setShowFollowingModal, setFollowing }) => {
  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId);
      setFollowing((prevList) => prevList.filter((user) => user._id !== userId));
    } catch (error) {
      console.error('Failed to unfollow user', error);
    }
  };

  return (
    <Modal open={showFollowingModal} onClose={() => setShowFollowingModal(false)}>
      <Box className="p-4 bg-white rounded shadow-lg" style={{ width: '400px', margin: 'auto', marginTop: '20vh' }}>
        <h2 className="text-lg font-semibold mb-4">팔로우 목록</h2>
        <ul className="max-h-80 overflow-y-auto">
          {following.map((follow) => (
            <li key={follow._id} className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img src={`http://localhost:5000${follow.profilePicture}`} alt={follow.username} className="w-10 h-10 rounded-full mr-3" />
                <div className="flex items-center">
                  <div className="font-semibold mr-2">{follow.username}</div>
                  {currentUser._id !== follow._id && (
                    <>
                      {follow.isFollower ? (
                        <button
                          onClick={() => handleUnfollowConfirmation(follow._id)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-blue-600"
                        >
                          팔로잉
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnfollow(follow._id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold hover:bg-red-600"
                        >
                          언팔로우
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Box>
    </Modal>
  );
};

export default FollowingModal;
