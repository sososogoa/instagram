const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { upload } = require('./files');
const router = new express.Router();

// 사용자 검색
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const regex = new RegExp(q, 'i');
    const users = await User.find({ username: { $regex: regex } }).select('username profilePicture');
    console.log(JSON.stringify(users));
    res.send(users);
  } catch (e) {
    res.status(500).send({ error: e.message });
  }
});

// 현재 로그인된 사용자 정보 반환
// router.get('/me', auth, async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) {
//       return res.status(404).send();
//     }
//     res.send(user);
//   } catch (e) {
//     res.status(500).send();
//   }
// });

// 프로필 보기
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send();
  }
});

router.get('/public/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username _id');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 프로필 수정
router.patch('/profile', auth, upload.single('profilePicture'), async (req, res) => {
  const { username } = req.body;
  const profilePicture = req.file ? `/uploads/${req.file.filename}` : req.user.profilePicture;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('User not found');
      return res.status(404).send({ error: 'User not found' });
    }

    if (username) {
      console.log('Updating username to:', username);
      user.username = username;
    }
    user.profilePicture = profilePicture;

    await user.save();
    console.log('Profile updated successfully:', user);
    res.send({ user });
  } catch (e) {
    console.log('Error updating profile:', e);
    res.status(400).send(e);
  }
});

// 멘션 알림 생성
router.post('/mention', auth, async (req, res) => {
  try {
    const { mentionUserId, postId, commentId, commentContent } = req.body;
    const notification = new Notification({
      userId: mentionUserId,
      type: 'mention',
      postId,
      requester: req.user._id,
      commentId,
      commentContent,
      isRead: false
    });
    await notification.save();
    res.status(201).send(notification);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
