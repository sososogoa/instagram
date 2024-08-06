import React, { useState, useEffect, useContext } from 'react';
import { Avatar, IconButton, CircularProgress, Typography } from '@mui/material';
import { Favorite, FavoriteBorder, Comment } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import PostDetailModal from '../PostDetail/PostDetailModal';
import { getUserById, likePost, unlikePost, createComment } from '../../api';

const Post = ({ post, handleLikesModalOpen, updatePostComments }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [comment, setComment] = useState('');
  const { isLoggedIn, user: currentUser } = useContext(AuthContext);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const userId = typeof post.user === 'object' ? post.user._id : post.user;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(userId);
        setUser(response.data);
        setLiked(post.likes.some(like => like._id === currentUser._id));
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [userId, isLoggedIn, post.likes, currentUser._id]);

  const handleLikeClick = async () => {
    try {
      if (liked) {
        await unlikePost(post._id);
        post.likes = post.likes.filter(like => like._id !== currentUser._id);
      } else {
        await likePost(post._id);
        post.likes = [...post.likes, { _id: currentUser._id, username: currentUser.username, profilePicture: currentUser.profilePicture }];
      }
      setLiked(!liked);
    } catch (error) {
      console.error('Failed to update like status', error);
    }
  };

  const handleProfileClick = () => {
    navigate(`/profile/${user._id}`);
  };

  const handleCommentClick = () => {
    setSelectedPostId(post);
  };

  const handleCloseModal = () => {
    setSelectedPostId(null);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  }

  const handleCommentSubmit = async (postId) => {
    try {
      const response = await createComment(comment, postId);
      const newComment = response.data;
      console.log(response.data);
      setComment('');
      updatePostComments(postId, newComment);
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (!user) {
    return <Typography variant="body1">Failed to load user information.</Typography>;
  }

  const openLikesModal = () => {
    handleLikesModalOpen(post.likes);
  };

  return (
    <div key={post._id} className="border-b border-gray-300 pb-2 mb-2">
      <div className="flex items-center p-3">
        <Avatar src={`http://localhost:5000${user.profilePicture}`} alt={user.username} className="w-8 h-8 rounded-full mr-3" />
        <div onClick={handleProfileClick} className="font-semibold" style={{ cursor: 'pointer' }}>
          {user.username}
        </div>
        <span className="ml-auto">...</span>
      </div>
      <img src={`http://localhost:5000${post.imageUrl}` || 'https://via.placeholder.com/600x400'} alt="Post" className="w-full" />
      <div className="p-3">
        <div className="flex space-x-4">
          <IconButton onClick={handleLikeClick}>
            {liked ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
          <IconButton onClick={handleCommentClick}>
            <Comment />
          </IconButton>
        </div>
        {post.likes.length > 0 && (
          <div onClick={openLikesModal} className="flex font-semibold cursor-pointer">
            좋아요 {post.likes.length}개
          </div>
        )}
        <div className="flex space-x-2">
          <p onClick={handleProfileClick} className="font-semibold" style={{ cursor: 'pointer' }}>
            {user.username}
          </p>
          <p>
            {post.content}
          </p>
        </div>
        {post.totalComments > 0 && (
          post.totalComments === 1 ? (
            <div onClick={handleCommentClick} className="flex space-x-2 pt-4 pb-2 cursor-pointer">
              <span className="font-semibold">{post.comments[0].user.username}</span>
              <span>{post.comments[0].content}</span>
            </div>
          ) : (
            <div onClick={handleCommentClick} className="flex cursor-pointer pb-2">
              댓글 {post.totalComments}개 모두 보기
            </div>
          )
        )}
        <div className="w-full flex items-start">
          <textarea
            type="text"
            placeholder="댓글 달기..."
            className="w-full bg-transparent border-none focus:outline-none resize-none"
            rows="1"
            maxLength="500"
            style={{ height: 'auto', overflow: 'hidden', maxHeight: '40rem' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            value={comment}
            onChange={handleCommentChange}
          />
          <button onClick={() => handleCommentSubmit(post._id)} className="ml-2 font-semibold text-blue-500 focus:outline-none whitespace-nowrap">
            게시
          </button>
        </div>
      </div>
      {selectedPostId && <PostDetailModal post={post} onClose={handleCloseModal} />}
    </div>
  );
};

export default Post;
