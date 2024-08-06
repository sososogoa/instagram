import React from 'react';
import { Favorite as FavoriteIcon, Comment as CommentIcon } from '@mui/icons-material';

const PostGrid = ({ posts, handlePostClick }) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {posts.map((post, index) => (
        <div
          key={post._id}
          className="relative aspect-square"
          onClick={() => handlePostClick(post)}
          style={{ cursor: 'pointer' }}
        >
          <img
            src={`http://localhost:5000${post.imageUrl}` || `https://via.placeholder.com/300x300?text=Post+${index + 1}`}
            alt={`Post ${index + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-row justify-center items-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <div className="text-white flex items-center mr-5">
              <FavoriteIcon className="mr-1" />
              {post.likes.length}
            </div>
            <div className="text-white flex items-center">
              <CommentIcon className="mr-1" />
              {post.totalComments}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostGrid;
