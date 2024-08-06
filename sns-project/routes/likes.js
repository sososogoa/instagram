const express = require('express');
const Like = require('../models/Like');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = new express.Router();

// 좋아요 추가
router.post('/:postId', auth, async (req, res) => {
  try {
    const existingLike = await Like.findOne({
      user: req.user._id,
      post: req.params.postId
    });

    if (existingLike) {
      return res.status(400).send({ error: "중복 좋아요 안됨" });
    }

    const like = new Like({
      user: req.user._id,
      post: req.params.postId
    });

    await like.save();

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send({ error: "게시글 삭제됨" });
    }
    post.likes.push(req.user._id);
    await post.save();

    if (post.user.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        userId: post.user._id,
        postId: req.params.postId,
        type: 'like',
        requester: req.user._id
      });
      await notification.save();
    }
    res.status(201).send(like);
  } catch (e) {
    res.status(400).send(e);
  }
});


// 좋아요 삭제
router.delete('/:postId', auth, async (req, res) => {
  try {
    const like = await Like.findOneAndDelete({
      user: req.user._id,
      post: req.params.postId
    });

    if (!like) {
      return res.status(404).send({ error: "좋아요 찾을 수 없음" });
    }

    const post = await Post.findById(req.params.postId);
    post.likes = post.likes.filter(like => like.toString() !== req.user._id.toString());
    await post.save();

    res.send(like);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
