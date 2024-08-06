import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import LikesModal from './LikesModal';
import PostHeader from './PostHeader';
import PostFooter from './PostFooter';
import CommentItem from './CommentItem';
import usePostDetail from '../../hooks/usePostDetail';

const PostDetailModal = ({ post, onClose }) => {
  const [comment, setComment] = useState('');
  const [replyParentId, setReplyParentId] = useState(null);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const [commentLikesModalOpen, setCommentLikesModalOpen] = useState(false);
  const [likesList, setLikesList] = useState([]);
  const [commentLikesList, setCommentLikesList] = useState([]);
  const commentInputRef = useRef();
  const { user: currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
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
  } = usePostDetail(post._id, currentUser);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSubmitWrapper = (e) => {
    e.preventDefault();
    handleCommentSubmit(comment, replyParentId);
    setComment('');
    setReplyParentId(null);
  };

  const handleCommentClick = () => {
    commentInputRef.current.focus();
  };

  const handleProfileClick = (id) => {
    navigate(`/profile/${id}`);
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prevState => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));
  };

  const handleReplyClick = (username, commentId) => {
    setComment(`@${username} `);
    setReplyParentId(commentId);
    commentInputRef.current.focus();
  };

  const handleLikesModalOpen = () => {
    // const users = postDetail.likes.map(userId => {
    //   const user = postDetail.user._id === userId
    //     ? postDetail.user
    //     : (comments.find(comment => comment.user._id === userId) || {}).user;
    //   return user || { _id: userId, username: 'Unknown' };
    // });
    setLikesList(postDetail.likes);
    setLikesModalOpen(true);
  };

  const handleCommentLikesModalOpen = (likes) => {
    // const users = likes.map(userId => {
    //   let user = comments.find(comment => comment.user._id === userId)?.user || comments.flatMap(comment => comment.replies).find(reply => reply.user._id === userId)?.user;
    //   return user ? { _id: user._id, username: user.username, profilePicture: user.profilePicture } : { _id: userId, username: 'Unknown' };
    // });
    // console.log(users);
    setCommentLikesList(likes);
    setCommentLikesModalOpen(true);
  };

  const handleLikesModalClose = () => {
    setLikesModalOpen(false);
  };

  const handleCommentLikesModalClose = () => {
    setCommentLikesModalOpen(false);
  };

  if (!postDetail) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg overflow-hidden w-4/5 max-w-5xl flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        <img src={`http://localhost:5000${post.imageUrl}` || 'https://via.placeholder.com/300'} alt="Post" className="w-full md:w-3/5 h-auto object-cover" />

        <div className="flex-1 flex flex-col custom-scroll">
          <PostHeader post={post} handleProfileClick={handleProfileClick} />
          <div className="p-4 flex-1 overflow-y-auto max-h-96 custom-scroll">
            {comments.map((comment, index) => (
              <CommentItem
                key={index}
                comment={comment}
                currentUser={currentUser}
                handleProfileClick={handleProfileClick}
                handleCommentLikeClick={handleCommentLikeClick}
                handleCommentLikesModalOpen={handleCommentLikesModalOpen}
                handleReplyClick={handleReplyClick}
                toggleReplies={toggleReplies}
                showReplies={showReplies}
                handleDeleteComment={handleDeleteComment}
              />
            ))}
          </div>
          <PostFooter
            liked={liked}
            handleLikeClick={handleLikeClick}
            handleCommentClick={handleCommentClick}
            handleLikesModalOpen={handleLikesModalOpen}
            postDetail={postDetail}
            comment={comment}
            handleCommentChange={handleCommentChange}
            handleCommentSubmit={handleCommentSubmitWrapper}
            commentInputRef={commentInputRef}
          />
        </div>
      </div>

      <LikesModal
        open={likesModalOpen}
        onClose={handleLikesModalClose}
        likesList={likesList}
        handleProfileClick={handleProfileClick}
      />

      <LikesModal
        open={commentLikesModalOpen}
        onClose={handleCommentLikesModalClose}
        likesList={commentLikesList}
        handleProfileClick={handleProfileClick}
      />
    </div>
  );
};

export default PostDetailModal;
