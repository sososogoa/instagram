const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = new express.Router();

// 댓글 작성
router.post('/', auth, async (req, res) => {
  const comment = new Comment({
    ...req.body,
    user: req.user._id
  });

  try {
    await comment.save();
    const post = await Post.findById(comment.post);
    post.comments.push(comment._id);
    await post.save();

    if (post.user.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        userId: post.user._id,
        postId: post._id,
        type: 'comment',
        requester: req.user._id,
        commentId: comment._id,
        commentContent: comment.content
      });
      await notification.save();
    }

    const populatedComment = await Comment.findById(comment._id).populate('user', 'username profilePicture');

    res.status(201).send(populatedComment);
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// 대댓글 작성
router.post('/reply', auth, async (req, res) => {
  const { content, postId, parentCommentId } = req.body;
  const reply = new Comment({
    content,
    post: postId,
    parentComment: parentCommentId,
    user: req.user._id
  });

  try {
    await reply.save();
    res.status(201).send(reply);
  } catch (e) {
    res.status(400).send(e);
  }
});

// 댓글 목록 조회
router.get('/post/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId, parentComment: null })
      .populate('user', 'username profilePicture')
      .populate('likes', 'username profilePicture')
      .sort({ createdAt: -1 });

    const commentsWithReplies = await Promise.all(comments.map(async (comment) => {
      const replies = await Comment.find({ parentComment: comment._id })
        .populate('user', 'username profilePicture')
        .populate('likes', 'username profilePicture')
        .sort({ createdAt: -1 });
      return { ...comment._doc, replies };
    }));

    res.status(200).send(commentsWithReplies);
  } catch (error) {
    res.status(500).send(error);
  }
});

// 댓글 좋아요
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment.likes.includes(req.user._id)) {
      comment.likes.push(req.user._id);
      await comment.save();
    }
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: "댓글 좋아요 실패" });
  }
});

// 댓글 좋아요 취소
router.delete('/:id/unlike', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    comment.likes = comment.likes.filter(userId => userId.toString() !== req.user._id.toString());
    await comment.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: "댓글 좋아요 취소 실패" });
  }
});

// 댓글 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).send({ error: "댓글 찾을 수 없음" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).send({ error: "사용자 미일치" });
    }

    if (comment.parentComment) {
      await Comment.deleteOne({ _id: comment._id });
    } else {
      await Comment.deleteMany({ parentComment: comment._id });
      await Comment.deleteOne({ _id: comment._id });
    }

    res.send({ message: "댓글 삭제 완료" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "댓글 삭제 실패" });
  }
});

module.exports = router;
