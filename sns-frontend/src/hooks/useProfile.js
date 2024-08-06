import { useState, useEffect, useCallback } from 'react';
import {
  getUserById,
  getPostsByUserId,
  getMyPosts,
  getFollowRequestStatus,
  getFollowers,
  getFollowing
} from '../api';

const useProfile = (id, currentUser, authLoading) => {
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [totalPosts, setTotalPosts] = useState();
  const [allPostLoaded, setAllPostLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followRequestStatus, setFollowRequestStatus] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [page, setPage] = useState(1);

  const fetchProfileUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserById(id);
      console.log(response.data);
      setProfileUser(response.data);
      if (currentUser) {
        const isFollowingUser = response.data.followers.some(follower => follower._id === currentUser._id);
        setIsFollowing(isFollowingUser);

        const followRequestResponse = await getFollowRequestStatus(id);
        setFollowRequestStatus(followRequestResponse.data ? followRequestResponse.data.status : null);
      }
    } catch (error) {
      setError('Failed to fetch user');
      console.error('Failed to fetch user', error);
    } finally {
      setLoading(false);
    }
  }, [id, currentUser]);

  useEffect(() => {
    if (!authLoading && currentUser) {
      fetchProfileUser();
    }
  }, [fetchProfileUser, authLoading, currentUser]);

  const fetchPostsUser = useCallback(async () => {
    if (!profileUser) return;
    try {
      const response = currentUser && currentUser._id !== profileUser._id
        ? await getPostsByUserId(id, page)
        : await getMyPosts(page);

      console.log(response.data.posts.length);
      setPosts(prevPosts => [...prevPosts, ...response.data.posts]);

      response.data.posts.length < 9 ? setAllPostLoaded(true) : setAllPostLoaded(false);
      setTotalPosts(response.data.totalPosts);
    } catch (error) {
      setError('Failed to fetch posts');
      console.error('Failed to fetch posts', error);
    }
  }, [currentUser, profileUser, id, page]);

  useEffect(() => {
    fetchPostsUser();
  }, [fetchPostsUser]);

  const fetchFollowers = useCallback(async () => {
    try {
      const response = await getFollowers(id);
      setFollowers(response.data);
    } catch (error) {
      console.error('Failed to fetch followers', error);
    }
  }, [id]);

  const fetchFollowing = useCallback(async () => {
    try {
      const response = await getFollowing(id);
      setFollowing(response.data);
    } catch (error) {
      console.error('Failed to fetch following', error);
    }
  }, [id]);

  const loadMorePosts = () => {
    setPage(prevPage => prevPage + 1);
  };

  return {
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
  };
};

export default useProfile;