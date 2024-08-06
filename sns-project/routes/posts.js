const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const auth = require('../middleware/auth');
const router = new express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config');

const calculateTotalComments = async (comments) => {
  let totalComments = comments.length;
  for (const comment of comments) {
    const repliesCount = await Comment.countDocuments({ parentComment: comment._id });
    totalComments += repliesCount;
  }
  return totalComments;
};

// 게시물 작성
router.post('/', auth, async (req, res) => {
  try {
    const { content, imageUrl, isPublic } = req.body;

    const post = new Post({
      content,
      imageUrl,
      user: req.user._id,
      isPublic: isPublic || false
    });

    await post.save();
    res.status(201).send(post);
  } catch (error) {
    console.error("포스트 작성 에러 : ", error);
    res.status(400).send(error);
  }
});

// 게시물 목록 보기
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    let queryConditions = { isPublic: true };

    if (token && token !== "null") {
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = await User.findById(decoded._id);
      if (!user) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const following = await Follow.find({ follower: user._id }).select('following');
      const followingIds = following.map(f => f.following.toString());
      const followers = await Follow.find({ following: user._id }).select('follower');
      const followerIds = followers.map(f => f.follower.toString());
      const mutualFollowIds = followingIds.filter(id => followerIds.includes(id));

      queryConditions = {
        $or: [
          { user: user._id },
          { isPublic: true },
          { user: { $in: mutualFollowIds } }
        ]
      };
    }

    const posts = await Post.find(queryConditions)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const postsWithTotalComments = await Promise.all(posts.map(async (post) => {
      const populatedPost = post.toObject();
      const totalComments = await calculateTotalComments(populatedPost.comments);
      populatedPost.totalComments = totalComments;
      return populatedPost;
    }));

    res.send(postsWithTotalComments);
  } catch (e) {
    console.error("포스트 조회 에러 : ", e);
    res.status(500).send();
  }
});


// 자신의 포스트만 보기
router.get('/my-posts', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token || token === "null") {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded._id);

    if (!user) {
      throw new Error('User not found');
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const totalPosts = await Post.countDocuments({ user: user._id });

    const posts = await Post.find({ user: user._id })
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username profilePicture' }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const postsWithTotalComments = await Promise.all(posts.map(async (post) => {
      const populatedPost = post.toObject();
      const totalComments = await calculateTotalComments(populatedPost.comments);
      populatedPost.totalComments = totalComments;
      return populatedPost;
    }));

    res.send({ totalPosts, posts: postsWithTotalComments });

  } catch (e) {
    console.error("포스트 조회 에러 : ", e);
    res.status(500).send();
  }
});

// 특정 사용자 포스트 조회
router.get('/:id/posts', async (req, res) => {
  try {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;

    const token = req.header('Authorization')?.replace('Bearer ', '');
    let queryConditions = { user: id, isPublic: true };

    if (token && token !== "null") {
      const decoded = jwt.verify(token, config.jwtSecret);
      const currentUser = await User.findById(decoded._id);
      if (!currentUser) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      // 상호 팔로우 상태 확인
      const isFollowing = await Follow.exists({ follower: currentUser._id, following: id });
      const isFollower = await Follow.exists({ follower: id, following: currentUser._id });

      if (isFollowing && isFollower) {
        queryConditions = { user: id };
      }
    }

    const totalPosts = await Post.countDocuments(queryConditions);

    const posts = await Post.find(queryConditions)
      .populate('user', 'username profilePicture')
      .populate({
        path: 'comments',
        populate: { path: 'user', select: 'username profilePicture' }
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const postsWithTotalComments = await Promise.all(posts.map(async (post) => {
      const populatedPost = post.toObject();
      const totalComments = await calculateTotalComments(populatedPost.comments);
      populatedPost.totalComments = totalComments;
      return populatedPost;
    }));

    res.send({ totalPosts, posts: postsWithTotalComments });

  } catch (e) {
    console.error("포스트 조회 에러 : ", e);
    res.status(500).send();
  }
});

// 게시물 상세 보기
router.get('/:id', auth, async (req, res) => {
  try {
    // 특정 게시물 조회
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .populate('comments.replies.user', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .exec();

    if (!post) {
      return res.status(404).send();
    }
    res.send(post);
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
});

// 게시물 상세 보기
// router.get('/:id', auth, async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id)
//       .populate('user', 'username profilePicture')
//       .populate({
//         path: 'comments',
//         select: 'content createdAt replies',
//         populate: {
//           path: 'user',
//           select: 'username profilePicture'
//         }
//       })
//       .populate('likes', 'username profilePicture')
//       .exec();

//     if (!post) {
//       return res.status(404).send();
//     }
//     res.send(post);
//   } catch (e) {
//     console.error(e);
//     res.status(500).send();
//   }
// });



// 게시물 수정
// router.patch('/:id', auth, async (req, res) => {
//   const updates = Object.keys(req.body);
//   const allowedUpdates = ['content', 'imageUrl'];
//   const isValidOperation = updates.every(update => allowedUpdates.includes(update));

//   if (!isValidOperation) {
//     return res.status(400).send({ error: '수정 실패' });
//   }

//   try {
//     const post = await Post.findById(req.params.id);

//     if (!post) {
//       return res.status(404).send();
//     }

//     updates.forEach(update => post[update] = req.body[update]);
//     await post.save();
//     res.send(post);
//   } catch (e) {
//     res.status(400).send(e);
//   }
// });

// 게시물 삭제
// router.delete('/:id', auth, async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);

//     if (!post) {
//       return res.status(404).send();
//     }

//     await post.remove();
//     res.send(post);
//   } catch (e) {
//     res.status(500).send();
//   }
// });

module.exports = router;
