import React, { useState } from 'react';
import { Avatar, IconButton, Modal, Box } from '@mui/material';
import { Favorite, FavoriteBorder, MoreHoriz } from '@mui/icons-material';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'long', day: 'numeric' };
  return date.toLocaleDateString('ko-KR', options);
};

const formatContentWithMentions = (content) => {
  const parts = content.split(/(@[^\s@]+)/g);

  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      return (
        <span key={index} className="text-blue-500">
          {part}
        </span>
      );
    }

    return <span key={index}>{part}</span>;
  });
};


const CommentItem = ({
  comment,
  currentUser,
  handleProfileClick,
  handleCommentLikeClick,
  handleCommentLikesModalOpen,
  handleReplyClick,
  toggleReplies,
  showReplies,
  handleDeleteComment
}) => {
  const [hovered, setHovered] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const handleMouseEnter = (id) => {
    setHovered((prev) => ({ ...prev, [id]: true }));
  };

  const handleMouseLeave = (id) => {
    setHovered((prev) => ({ ...prev, [id]: false }));
  };

  const handleModalOpen = (id) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setDeleteId(null);
  };

  const handleDelete = () => {
    handleDeleteComment(deleteId);
    handleModalClose();
  };

  const isAuthor = (userId) => userId === currentUser._id;

  return (
    <div className="mb-4" onMouseEnter={() => handleMouseEnter(comment._id)} onMouseLeave={() => handleMouseLeave(comment._id)}>
      <div className="flex items-start mb-2">
        <Avatar
          src={`http://localhost:5000${comment.user.profilePicture}`}
          alt={comment.user.username}
          className="w-8 h-8 rounded-full mr-2 cursor-pointer"
          onClick={() => handleProfileClick(comment.user._id)}
        />
        <div className="flex flex-col w-full">
          <div className="flex items-center mb-1">
            <span className="mr-2 font-bold cursor-pointer" onClick={() => handleProfileClick(comment.user._id)}>
              {comment.user.username}
            </span>
            <span className="flex-1">{formatContentWithMentions(comment.content)}</span>
            <IconButton
              onClick={() => handleCommentLikeClick(comment._id, comment.likes.some((like) => like._id === currentUser._id))}
              style={{ marginLeft: 'auto' }}
              sx={{ padding: '4px', '&:hover': { backgroundColor: 'transparent' } }}
            >
              {comment.likes.some((like) => like._id === currentUser._id) ? <Favorite color="error" /> : <FavoriteBorder />}
            </IconButton>
          </div>
          <div className="flex items-center text-xs text-gray-500 space-x-2">
            <span>{formatDate(comment.createdAt)}</span>
            {comment.likes.length > 0 && (
              <span onClick={() => handleCommentLikesModalOpen(comment.likes)} className="cursor-pointer">
                좋아요 {comment.likes.length}개
              </span>
            )}
            <button className="text-xs text-gray-500" onClick={() => handleReplyClick(comment.user.username, comment._id)}>
              답글 달기
            </button>
            {hovered[comment._id] && isAuthor(comment.user._id) && !modalOpen && (
              <IconButton
                onClick={() => handleModalOpen(comment._id)}
                sx={{ height: '0px', '&:hover': { backgroundColor: 'transparent' } }}
              >
                <MoreHoriz fontSize="small" />
              </IconButton>
            )}
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              <button className="text-xs text-gray-500 ml-4 mb-4" onClick={() => toggleReplies(comment._id)}>
                {showReplies[comment._id] ? `답글 숨기기(${comment.replies.length})` : `답글 보기(${comment.replies.length})`}
              </button>
              {showReplies[comment._id] && (
                <div className="ml-10">
                  {comment.replies.slice().reverse().map((reply, replyIndex) => (
                    <div key={replyIndex} className="flex items-start mb-2" onMouseEnter={() => handleMouseEnter(reply._id)} onMouseLeave={() => handleMouseLeave(reply._id)}>
                      <Avatar
                        src={`http://localhost:5000${reply.user.profilePicture}`}
                        alt={reply.user.username}
                        className="w-8 h-8 rounded-full mr-2 cursor-pointer"
                        onClick={() => handleProfileClick(reply.user._id)}
                      />
                      <div className="flex flex-col w-full">
                        <div className="flex items-center mb-1">
                          <span className="mr-2 font-bold cursor-pointer" onClick={() => handleProfileClick(reply.user._id)}>
                            {reply.user.username}
                          </span>
                          <span className="flex-1">{formatContentWithMentions(reply.content)}</span>
                          <IconButton
                            onClick={() => handleCommentLikeClick(reply._id, reply.likes.some((like) => like._id === currentUser._id))}
                            style={{ marginLeft: 'auto' }}
                            sx={{ padding: '4px', '&:hover': { backgroundColor: 'transparent' } }}
                          >
                            {reply.likes.some((like) => like._id === currentUser._id) ? <Favorite color="error" /> : <FavoriteBorder />}
                          </IconButton>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                          <span>{formatDate(reply.createdAt)}</span>
                          {reply.likes.length > 0 && (
                            <span onClick={() => handleCommentLikesModalOpen(reply.likes)} className="cursor-pointer">
                              좋아요 {reply.likes.length}개
                            </span>
                          )}
                          <button className="text-xs text-gray-500" onClick={() => handleReplyClick(reply.user.username, comment._id)}>
                            답글 달기
                          </button>
                          {hovered[reply._id] && isAuthor(reply.user._id) && !modalOpen && (
                            <IconButton
                              onClick={() => handleModalOpen(reply._id)}
                              sx={{ height: '0px', '&:hover': { backgroundColor: 'transparent' } }}
                            >
                              <MoreHoriz fontSize="small" />
                            </IconButton>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box className="fixed inset-0 flex items-center justify-center" onClick={handleModalClose}>
          <div className="bg-white rounded shadow-lg p-4 w-[400px] h-[100px] flex flex-col justify-center items-center">
            <button onClick={handleDelete} className="w-full text-red-500 py-2 border-b border-gray-300">
              삭제
            </button>
            <button onClick={handleModalClose} className="w-full text-gray-500 py-2 mt-2">
              취소
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default CommentItem;
