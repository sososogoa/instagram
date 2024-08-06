import axios from 'axios';
import { handleLogout } from './context/AuthContext';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.error("토큰 없는듯");
  }
  return config;
});

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      handleLogout();
    }
    return Promise.reject(error);
  }
);

// 팔로우 API
export const requestFollow = (userId) => API.post(`/follows/${userId}/request-follow`);
export const cancelFollowRequest = (userId) => API.post(`/follows/${userId}/cancel-follow-request`);
export const acceptFollowRequest = (userId) => API.post(`/follows/${userId}/accept-follow`);
export const rejectFollowRequest = (userId) => API.post(`/follows/${userId}/reject-follow`);
export const followUser = (userId) => API.post(`/follows/${userId}/follow`);
export const unfollowUser = (userId) => API.post(`/follows/${userId}/unfollow`);
export const removeFollower = (userId) => API.post(`/follows/${userId}/remove-follower`);
export const getFollowers = (userId) => API.get(`/follows/${userId}/followers`);
export const getFollowing = (userId) => API.get(`/follows/${userId}/following`);
export const getFollowRequestStatus = (userId) => API.get(`/follows/requests/status/${userId}`);
export const getFollowRequests = () => API.get(`/follows/requests`);

// 유저 API
export const getUserById = (userId) => API.get(`/users/${userId}`);
export const searchUser = (query) => API.get(`/users/search?q=${query}`);
export const patchUserProfile = (data) => {
  const formData = new FormData();
  if (data.username) {
    formData.append('username', data.username);
  }
  if (data.profilePicture) {
    formData.append('profilePicture', data.profilePicture);
  }
  return API.patch('/users/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 포스트 API
export const getPostsByUserId = (userId, page) => API.get(`/posts/${userId}/posts?page=${page}`);
export const getPosts = (page) => API.get(`/posts?page=${page}&limit=5`);
export const getMyPosts = (page) => API.get(`/posts/my-posts?page=${page}`);
export const getPostById = (postId) => API.get(`/posts/${postId}`);
export const createPost = (data) => API.post('/posts/', data);

// 코멘트 API
export const getCommentsByPostId = (postId) => API.get(`/comments/post/${postId}`);
export const createComment = (content, postId) => API.post(`/comments`, { content, post: postId });
export const createReply = (content, postId, parentCommentId) => API.post(`/comments/reply`, { content, postId, parentCommentId });
export const likeComment = (commentId) => API.post(`/comments/${commentId}/like`);
export const unlikeComment = (commentId) => API.delete(`/comments/${commentId}/unlike`);
export const deleteComment = (commentId) => API.delete(`/comments/${commentId}`);

// 좋아요 API
export const likePost = (postId) => API.post(`/likes/${postId}`);
export const unlikePost = (postId) => API.delete(`/likes/${postId}`);

// 메시지 API
export const getConversationsByUserId = (userId) => API.get(`/messages/conversations/${userId}`);
export const createConversation = (participants) => API.post('/messages/conversations', { participants });
export const getMessagesBetweenUsers = (user1, user2, page, limit) => API.get(`/messages/${user1}/${user2}`, { params: { page, limit } });

// 알림 API
export const getNotifications = (userId) => API.get(`/notifications/${userId}`);
export const markNotificationAsRead = (notificationId) => API.patch(`/notifications/read/${notificationId}`);

// Auth API
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => {
  const formData = new FormData();
  formData.append('username', data.username);
  formData.append('email', data.email);
  formData.append('password', data.password);
  if (data.profileImage) {
    formData.append('profileImage', data.profileImage);
  }
  return API.post('/auth/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 파일 업로드 API
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return API.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// 파일 조회 API
export const getFileUrl = (filename) => `http://localhost:5000/api/uploads/${filename}`;

export default API;
