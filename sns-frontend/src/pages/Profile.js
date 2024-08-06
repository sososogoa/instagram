import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IconButton, Modal, Box, Button, CircularProgress, Avatar, TextField } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { AuthContext } from '../context/AuthContext';
import LeftSidebar from '../components/Sidebar/LeftSidebar';
import PostDetailModal from '../components/PostDetail/PostDetailModal';
import FollowerModal from '../components/Follow/FollowerModal';
import FollowingModal from '../components/Follow/FollowingModal';
import FollowButton from '../components/Follow/FollowButton';
import PostGrid from '../components/Post/PostGrid';
import UnfollowConfirmationModal from '../components/Follow/UnfollowConfirmationModal';
import useProfile from '../hooks/useProfile';
import { followUser, unfollowUser, removeFollower, patchUserProfile } from '../api';
import NotificationComponent from '../components/Sidebar/NotificationComponent';
import { useNotifications } from '../context/NotificationContext';

const Profile = () => {
  const { id } = useParams();
  const { user: currentUser, handleLogout, loading: authLoading } = useContext(AuthContext);
  const { selectedPostId, setSelectedPostId } = useNotifications();
  const [selectedPost, setSelectedPost] = useState(null);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [showUnfollowConfirmationModal, setShowUnfollowConfirmationModal] = useState(false);
  const [unfollowUserId, setUnfollowUserId] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const sidebarWidth = showNotifications ? 64 : 256;
  const navigate = useNavigate();

  const {
    profileUser,
    posts,
    totalPosts,
    allPostLoaded,
    loading,
    error,
    isFollowing,
    followRequestStatus,
    followers,
    following,
    fetchProfileUser,
    fetchFollowers,
    fetchFollowing,
    setFollowers,
    setFollowing,
    loadMorePosts
  } = useProfile(id, currentUser, authLoading);

  const handleCloseModal = () => {
    setSelectedPostId(null);
  };

  const handleEditProfileClick = useCallback(() => {
    setNewUsername(currentUser.username);
    setImagePreview(currentUser.profilePicture ? `http://localhost:5000${currentUser.profilePicture}` : '');
    setEditProfileModalOpen(true);
  }, [currentUser.username, currentUser.profilePicture]);

  const handleEditProfileClose = () => {
    setEditProfileModalOpen(false);
    setNewProfilePicture(null);
    setImagePreview('');
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProfilePicture(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditProfileSubmit = async () => {
    const formData = new FormData();
    formData.append('username', newUsername);
    if (newProfilePicture) {
      formData.append('profilePicture', newProfilePicture);
    }
    try {
      await patchUserProfile({ username: newUsername, profilePicture: newProfilePicture });
      fetchProfileUser();
      setEditProfileModalOpen(false);
    } catch (error) {
      console.error("프로필 변경 실패 : ", error);
    }
  };

  const handlePostClick = useCallback((post) => {
    setSelectedPost(post);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedPost(null);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setOpenSettingsModal(true);
  }, []);

  const handleCloseSettingsModal = useCallback(() => {
    setOpenSettingsModal(false);
  }, []);

  const handleDMClick = useCallback(() => {
    navigate(`/dm/${profileUser._id}`, {
      state: {
        userId: profileUser._id,
        username: profileUser.username,
        profilePicture: profileUser.profilePicture
      }
    });
  }, [navigate, profileUser]);

  const handleFollowersClick = useCallback(async () => {
    if (profileUser.followers.length === 0) return;
    await fetchFollowers();
    setShowFollowersModal(true);
  }, [profileUser, fetchFollowers]);

  const handleFollowingClick = useCallback(async () => {
    if (profileUser.following.length === 0) return;
    await fetchFollowing();
    setShowFollowingModal(true);
  }, [profileUser, fetchFollowing]);

  const handleUnfollowConfirmation = useCallback((userId) => {
    setUnfollowUserId(userId);
    setShowUnfollowConfirmationModal(true);
  }, []);

  const handleUnfollow = useCallback(async (userId) => {
    try {
      await unfollowUser(userId);
      setFollowers((prevList) => prevList.filter((user) => user._id !== userId));
      setFollowing((prevList) => prevList.filter((user) => user._id !== userId));
      setShowUnfollowConfirmationModal(false);
    } catch (error) {
      console.error("팔로우 취소 실패 : ", error);
    }
  }, []);

  const handleFollow = useCallback(async (userId) => {
    try {
      await followUser(userId);
      fetchProfileUser();
    } catch (error) {
      console.error("팔로우 신청 실패 : ", error);
    }
  }, [fetchProfileUser]);

  const handleRemoveFollower = useCallback(async (userId) => {
    try {
      await removeFollower(userId);
      setFollowers((prevList) => prevList.filter((user) => user._id !== userId));
      setFollowing((prevList) => prevList.filter((user) => user._id !== userId));
    } catch (error) {
      console.error("팔로우 삭제 실패 : ", error);
    }
  }, []);

  const handleAvatarClick = () => {
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
  };
  if (loading || authLoading) {
    return <div className="text-center mt-8"><CircularProgress /></div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">{error}</div>;
  }

  if (!profileUser) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <LeftSidebar
        showNotifications={showNotifications}
        setShowNotifications={setShowNotifications}
      />

      <div className="flex-1 flex justify-center items-start overflow-y-auto ml-[256px] lg:ml-[64px]">
        <div className="w-full max-w-4xl p-4">
          <div className="flex flex-col items-center mt-8">
            <div className="flex items-center mb-8">
              <div onClick={handleAvatarClick} className="relative cursor-pointer">
                <Avatar
                  sx={{ width: 80, height: 80 }}
                  src={profileUser.profilePicture ? `http://localhost:5000${profileUser.profilePicture}` : ''}
                >
                  {!profileUser.profilePicture && profileUser.username.charAt(0).toUpperCase()}
                </Avatar>
              </div>
              <div className="ml-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-semibold mr-4">{profileUser.username}</h2>
                  {currentUser && currentUser._id !== profileUser._id ? (
                    <>
                      <FollowButton
                        isFollowing={isFollowing}
                        followRequestStatus={followRequestStatus}
                        profileUser={profileUser}
                        fetchProfileUser={fetchProfileUser}
                      />
                      <button
                        onClick={handleDMClick}
                        className="bg-gray-200 text-black px-4 py-1 rounded text-sm font-semibold hover:bg-gray-300">
                        메시지 보내기
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="ml-2 border border-gray-300 px-4 py-1 rounded text-sm font-semibold" onClick={handleEditProfileClick}>프로필 편집</button>
                      <IconButton className="ml-2" onClick={handleSettingsClick}>
                        <SettingsIcon fontSize="large" />
                      </IconButton>
                    </>
                  )}
                </div>
                <div className="flex mb-4">
                  <span className={"mr-6"}>
                    <strong>게시글</strong> {totalPosts}
                  </span>
                  <span
                    className={`mr-6 ${profileUser.followers.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={profileUser.followers.length > 0 ? handleFollowersClick : null}>
                    <strong>팔로워</strong> {profileUser.followers.length}
                  </span>
                  <span
                    className={`${profileUser.following.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={profileUser.following.length > 0 ? handleFollowingClick : null}>
                    <strong>팔로우</strong> {profileUser.following.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-full max-w-4xl">
              <div className="border-t border-gray-300 pt-4">
                <PostGrid posts={posts} handlePostClick={handlePostClick} />
              </div>
            </div>
            {!allPostLoaded && (
              <IconButton
                onClick={loadMorePosts}
                color="primary"
                aria-label="load more posts"
                size="large"
              >
                <AddIcon fontSize="large" />
              </IconButton>
            )}
          </div>
        </div>
      </div>
      <Modal open={openSettingsModal} onClose={handleCloseSettingsModal}>
        <Box className="p-4 bg-white rounded shadow-lg" style={{ width: '300px', margin: 'auto', marginTop: '20vh' }}>
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <Button onClick={handleLogout} className="w-full bg-red-500 text-white py-2 rounded">로그아웃</Button>
        </Box>
      </Modal>
      <Modal open={editProfileModalOpen} onClose={handleEditProfileClose}>
        <Box className="p-4 bg-white rounded shadow-lg" style={{ width: '300px', margin: 'auto', marginTop: '20vh' }}>
        <div className="text-center border-b border-gray-300 pb-2 mb-4">
          <p className="font-semibold text-lg">프로필 편집</p>
        </div>
          <TextField
            label="이름"
            value={newUsername}
            variant="standard"
            onChange={(e) => setNewUsername(e.target.value)}
            fullWidth
            margin="normal"
          />
          <div className="relative w-20 h-20 mx-auto mb-4">
            <input
              accept="image/*"
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              id="profile-image-upload"
              onChange={handleProfileImageChange}
            />
            <label htmlFor="profile-image-upload" className="cursor-pointer">
              <Avatar
                sx={{ width: 80, height: 80 }}
                src={imagePreview || (currentUser.profilePicture ? `http://localhost:5000${currentUser.profilePicture}` : '')}
              >
                {(!imagePreview && !currentUser.profilePicture) && currentUser.username.charAt(0).toUpperCase()}
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 rounded-full">
                <AddIcon />
              </div>
            </label>
          </div>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            className="mt-4"
            onClick={handleEditProfileSubmit}
          >
            저장
          </Button>
        </Box>
      </Modal>
      <FollowerModal
        currentUser={currentUser}
        followers={followers}
        handleUnfollowConfirmation={handleUnfollowConfirmation}
        handleFollow={handleFollow}
        handleRemoveFollower={handleRemoveFollower}
        showFollowersModal={showFollowersModal}
        setShowFollowersModal={setShowFollowersModal}
        setFollowers={setFollowers}
      />
      <FollowingModal
        currentUser={currentUser}
        following={following}
        handleUnfollowConfirmation={handleUnfollowConfirmation}
        showFollowingModal={showFollowingModal}
        setShowFollowingModal={setShowFollowingModal}
        setFollowing={setFollowing}
      />
      <UnfollowConfirmationModal
        showUnfollowConfirmationModal={showUnfollowConfirmationModal}
        setShowUnfollowConfirmationModal={setShowUnfollowConfirmationModal}
        handleUnfollow={handleUnfollow}
        unfollowUserId={unfollowUserId}
      />
      <NotificationComponent
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
        sidebarWidth={sidebarWidth}
        currentUser={currentUser}
      />
      {selectedPost && <PostDetailModal post={selectedPost} onClose={closeModal} />}
      {selectedPostId && <PostDetailModal post={selectedPostId} onClose={handleCloseModal} />}
      {imageModalOpen && (
        <div
          className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-75 "
          style={{ zIndex: 1000 }}
          onClick={handleCloseImageModal}
        >
          <div className="relative w-4/5 h-4/5 max-w-lg max-h-lg flex items-center justify-center">
            <Avatar
              src={`http://localhost:5000${profileUser.profilePicture}`}
              alt={profileUser.username}
              sx={{ width: 500, height: 500 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Profile);
