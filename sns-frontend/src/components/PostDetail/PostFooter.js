import React, { useState, useEffect } from 'react';
import { IconButton, Avatar } from '@mui/material';
import { Favorite, FavoriteBorder, Comment } from '@mui/icons-material';
import { searchUser } from '../../api';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { month: 'long', day: 'numeric' };
  return date.toLocaleDateString('ko-KR', options);
};

const PostFooter = ({
  liked,
  handleLikeClick,
  handleCommentClick,
  handleLikesModalOpen,
  postDetail,
  comment,
  handleCommentChange,
  handleCommentSubmit,
  commentInputRef
}) => {
  const [searchResults, setSearchResults] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  useEffect(() => {
    const handleSearch = async (query) => {
      try {
        const response = await searchUser(query);
        console.log(response.data);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Failed to search users', error);
      }
    };

    if (mentionQuery) {
      handleSearch(mentionQuery);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  }, [mentionQuery]);

  const handleUserClick = (username) => {
    const newComment = comment.replace(/@\w*$/, `@${username} `);
    handleCommentChange({ target: { value: newComment } });
    setShowMentions(false);
    setMentionQuery('');
  };

  const handleInputChange = (e) => {
    handleCommentChange(e);
    const currentComment = e.target.value;

    if (currentComment.includes('@')) {
      const query = currentComment.split('@').pop();
      setMentionQuery(query);
    } else {
      setMentionQuery('');
    }
  };

  return (
    <div className="border-t">
      <div className="flex items-center pr-4 pl-2">
        <IconButton onClick={handleLikeClick}>
          {liked ? <Favorite color="error" /> : <FavoriteBorder />}
        </IconButton>
        <IconButton onClick={handleCommentClick}>
          <Comment />
        </IconButton>
      </div>
      <div className="flex items-center justify-between pr-4 pl-4">
        <span onClick={handleLikesModalOpen} className="font-semibold cursor-pointer">좋아요 {postDetail.likes.length}개</span>
      </div>
      <div className="flex text-xs items-center justify-between pr-4 pl-4 pb-4">
        <span className="text-gray-500">{formatDate(postDetail.createdAt)}</span>
      </div>
      <form onSubmit={handleCommentSubmit} className="relative">
        <input
          type="text"
          placeholder="댓글 달기..."
          className="w-full p-4 border outline-none"
          value={comment}
          onChange={handleInputChange}
          ref={commentInputRef}
        />
        {showMentions && (
          <ul className="absolute bottom-0 left-0 w-3/5 bg-white border mb-14">
            {searchResults.map((user) => (
              <li
                key={user._id}
                onClick={() => handleUserClick(user.username)}
                className="flex items-center justify-start p-4 cursor-pointer hover:bg-gray-200"
              >
                <Avatar
                  src={user.profilePicture ? `http://localhost:5000${user.profilePicture}` : ''}
                >
                  {!user.profilePicture && user.username.charAt(0).toUpperCase()}
                </Avatar>
                <span className="ml-4">
                  {user.username}
                </span>
              </li>
            ))}
          </ul>
        )}
      </form>
    </div>
  );
};

export default PostFooter;
