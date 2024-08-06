import React from 'react';
import { Avatar } from '@mui/material';

const PostHeader = ({ post, handleProfileClick }) => (
  <div className="p-4 flex items-center border-b">
    <Avatar src={`http://localhost:5000${post.user.profilePicture}`} alt={post.user.username} className="w-12 h-12 rounded-full mr-4 cursor-pointer" onClick={() => handleProfileClick(post.user._id)} />
    <div>
      <span className="font-semibold cursor-pointer" onClick={() => handleProfileClick(post.user._id)}>{post.user.username}</span>
      <p className="text-sm text-gray-500">{post.isPublic ? "공개 게시글" : "비공개 게시글"}</p>
      <span>{post.content}</span>
    </div>
  </div>
);

export default PostHeader;
