import React from 'react';
import API from '../../api';

const FollowButton = ({ isFollowing, followRequestStatus, profileUser, fetchProfileUser }) => {
  const handleFollowClick = async () => {
    try {
      if (isFollowing) {
        await API.post(`/follows/${profileUser._id}/unfollow`);
      } else if (followRequestStatus === 'pending') {
        await API.post(`/follows/${profileUser._id}/cancel-follow-request`);
      } else {
        await API.post(`/follows/${profileUser._id}/request-follow`);
      }
      fetchProfileUser(); // Update the profile user again to reflect changes
    } catch (error) {
      console.error('Failed to update follow status', error);
    }
  };

  return (
    <button
      onClick={handleFollowClick}
      className="bg-gray-200 text-black px-4 py-1 mr-2 rounded text-sm font-semibold hover:bg-gray-300">
      {isFollowing ? '언팔로우' : followRequestStatus === 'pending' ? '요청됨' : '팔로우'}
    </button>
  );
};

export default FollowButton;
