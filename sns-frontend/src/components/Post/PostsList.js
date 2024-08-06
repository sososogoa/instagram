import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Post from './Post';
import { getPosts } from '../../api';
import LikesModal from '../PostDetail/LikesModal';
import { useModal } from '../../context/ModalContext';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const [likesList, setLikesList] = useState([]);
  const [likesModalOpen, setLikesModalOpen] = useState(false);
  const navigate = useNavigate();
  const { newPostCreated } = useModal();

  const updatePostComments = (postId, newComment) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId
          ? {
            ...post,
            comments: [...post.comments, newComment],
            totalComments: post.totalComments + 1,
          }
          : post
      )
    );
    console.log(posts);
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getPosts(page);
      console.log(response.data);
      const fetchedPosts = response.data.posts || response.data;
      setPosts((prevPosts) => {
        const postIds = new Set(prevPosts.map(post => post._id));
        const newPosts = fetchedPosts.filter(post => !postIds.has(post._id));
        return [...prevPosts, ...newPosts];
      });
      setHasMore(fetchedPosts.length > 0);
    } catch (error) {
      console.error('Failed to fetch posts', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const handleProfileClick = (id) => {
    navigate(`/profile/${id}`);
  };

  const handleLikesModalOpen = (likes) => {
    setLikesList(likes);
    setLikesModalOpen(true);
  };

  const handleLikesModalClose = () => {
    setLikesModalOpen(false);
  };

  const lastPostElementRef = useCallback((node) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    if (newPostCreated) {
      setPage(1);
      setPosts([]);
      fetchPosts();
    }
  }, [newPostCreated]);

  return (
    <Box sx={{ maxWidth: 800, margin: '20px auto', padding: 2 }}>
      {posts.length === 0 && (
        <>
          <p className="font-semibold">등록된 포스트가 존재하지 않습니다</p>
        </>
      )}
      {posts.map((post, index) => (
        <div key={post._id} ref={index === posts.length - 1 ? lastPostElementRef : null}>
          <Post post={post} handleLikesModalOpen={handleLikesModalOpen} updatePostComments={updatePostComments} />
        </div>
      ))}
      {loading && <CircularProgress />}

      <LikesModal
        open={likesModalOpen}
        onClose={handleLikesModalClose}
        likesList={likesList}
        handleProfileClick={handleProfileClick}
      />
    </Box>
  );
};

export default PostsList;
