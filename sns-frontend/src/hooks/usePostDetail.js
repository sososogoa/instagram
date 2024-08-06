import { useState, useEffect } from 'react';
import { getPostById, getCommentsByPostId, likePost, unlikePost, likeComment, unlikeComment, createComment, createReply, deleteComment } from '../api';

const usePostDetail = (postId, currentUser) => {
  const [postDetail, setPostDetail] = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState({});

  const fetchPostDetail = async () => {
    try {
      const postResponse = await getPostById(postId);
      setPostDetail(postResponse.data);
      console.log(postResponse.data);
      setLiked(postResponse.data.likes.some((like) => like._id === currentUser._id));
      // setLiked(postResponse.data.likes.includes(currentUser._id));
    } catch (error) {
      console.error('Failed to fetch post details', error);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsResponse = await getCommentsByPostId(postId);
      console.log(commentsResponse.data);
      setComments(commentsResponse.data.reverse());
    } catch (error) {
      console.error('Failed to fetch comments', error);
    }
  };

  const fetchPostDetailAndComments = async () => {
    await Promise.all([fetchPostDetail(), fetchComments()]);
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetailAndComments();
    }
  }, [postId, currentUser._id]);

  const handleLikeClick = async () => {
    try {
      if (liked) {
        await unlikePost(postId);
      } else {
        await likePost(postId);
      }
      setLiked(!liked);
      setPostDetail((prevDetail) => ({
        ...prevDetail,
        likes: liked
          ? prevDetail.likes.filter(userId => userId !== currentUser._id)
          : [...prevDetail.likes, currentUser._id]
      }));
    } catch (error) {
      console.error('Failed to update like status', error);
    }
  };

  const handleCommentLikeClick = async (commentId, liked) => {
    try {
      if (liked) {
        await unlikeComment(commentId);
      } else {
        await likeComment(commentId);
      }
      fetchComments();
    } catch (error) {
      console.error('Failed to update comment like status', error);
    }
  };

  const handleCommentSubmit = async (comment, replyParentId) => {
    try {
      if (replyParentId) {
        console.log(replyParentId);
        await createReply(comment, postId, replyParentId);
      } else {
        await createComment(comment, postId);
      }
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      fetchComments();
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  };

  return {
    postDetail,
    comments,
    liked,
    showReplies,
    setShowReplies,
    handleLikeClick,
    handleCommentLikeClick,
    handleCommentSubmit,
    handleDeleteComment,
    fetchComments
  };
};

export default usePostDetail;
