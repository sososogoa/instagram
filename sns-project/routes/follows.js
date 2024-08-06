const express = require('express');
const Follow = require('../models/Follow');
const FollowRequest = require('../models/FollowRequest');
const User = require('../models/User');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = new express.Router();

// 모든 팔로우 요청 상태 조회
router.get('/requests', auth, async (req, res) => {
  try {
    const followRequests = await FollowRequest.find({
      recipient: req.user._id,
      status: 'pending'
    }).populate('requester', 'username');

    res.send(followRequests);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 특정 사용자에 대한 팔로우 요청 상태 조회
router.get('/requests/status/:userId', auth, async (req, res) => {
  try {
    const followRequest = await FollowRequest.findOne({
      requester: req.user._id,
      recipient: req.params.userId,
    });

    if (!followRequest) {
      return res.send(null);
    }

    res.send(followRequest);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 팔로우 요청
router.post('/:userId/request-follow', auth, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.userId) {
      return res.status(400).send({ error: "자기 자신은 팔로우할 수 없어" });
    }

    const existingRequest = await FollowRequest.findOne({
      requester: req.user._id,
      recipient: req.params.userId,
      status: 'pending'
    });

    const rejectedRequest = await FollowRequest.findOne({
      requester: req.user._id,
      recipient: req.params.userId,
      status: 'rejected'
    });

    const acceptedRequest = await FollowRequest.findOne({
      requester: req.user._id,
      recipient: req.params.userId,
      status: 'accepted'
    });

    if (existingRequest) {
      return res.status(400).send({ error: "이미 팔로우를 신청했음" });
    }

    if (rejectedRequest || acceptedRequest) {
      await FollowRequest.findOneAndDelete({
        requester: req.user._id,
        recipient: req.params.userId,
        status: rejectedRequest ? 'rejected' : 'accepted'
      });
    }

    const followRequest = new FollowRequest({
      requester: req.user._id,
      recipient: req.params.userId
    });
    await followRequest.save();

    const notification = new Notification({
      userId: req.params.userId,
      type: 'follow-request',
      requester: req.user._id
    });
    await notification.save();

    res.status(201).send(followRequest);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 팔로우 요청 취소
router.post('/:userId/cancel-follow-request', auth, async (req, res) => {
  try {
    const followRequest = await FollowRequest.findOneAndDelete({
      requester: req.user._id,
      recipient: req.params.userId,
      status: 'pending'
    });

    if (!followRequest) {
      return res.status(404).send({ error: "팔로우 신청을 찾을 수 없음" });
    }

    res.send(followRequest);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 팔로우 요청 승인
router.post('/:userId/accept-follow', auth, async (req, res) => {
  try {
    const followRequest = await FollowRequest.findOneAndUpdate(
      { requester: req.params.userId, recipient: req.user._id, status: 'pending' },
      { status: 'accepted' }
    );

    if (!followRequest) {
      return res.status(404).send({ error: "팔로우 신청을 찾을 수 없음" });
    }

    const follow = new Follow({
      follower: req.params.userId,
      following: req.user._id
    });
    await follow.save();

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { followers: req.params.userId } });
    await User.findByIdAndUpdate(req.params.userId, { $addToSet: { following: req.user._id } });

    const notification = new Notification({
      userId: req.params.userId,
      type: 'follow-accepted',
      requester: req.user._id
    });
    await notification.save();

    res.send(followRequest);
  } catch (e) {
    res.status(500).send(e);
  }
});



// 팔로우 요청 거절
router.post('/:userId/reject-follow', auth, async (req, res) => {
  try {
    const followRequest = await FollowRequest.findOneAndUpdate(
      { requester: req.params.userId, recipient: req.user._id, status: 'pending' },
      { status: 'rejected' }
    );

    if (!followRequest) {
      return res.status(404).send({ error: "팔로우 신청을 찾을 수 없음" });
    }

    res.send(followRequest);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 팔로워 목록
router.get('/:id/followers', auth, async (req, res) => {
  try {
    const followers = await Follow.find({ following: req.params.id })
      .populate('follower', 'username profilePicture');

    const result = await Promise.all(followers.map(async (f) => {
      const isFollowing = await Follow.findOne({ follower: req.params.id, following: f.follower._id });
      return {
        ...f.follower.toObject(),
        isFollowing: !!isFollowing
      };
    }));

    res.send(result);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 팔로잉 목록
router.get('/:id/following', auth, async (req, res) => {
  try {
    const following = await Follow.find({ follower: req.params.id })
      .populate('following', 'username profilePicture');

    const result = await Promise.all(following.map(async (f) => {
      const isFollower = await Follow.findOne({ follower: f.following._id, following: req.params.id });
      return {
        ...f.following.toObject(),
        isFollower: !!isFollower
      };
    }));

    res.send(result);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 언팔로우
router.post('/:id/unfollow', auth, async (req, res) => {
  try {
    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: req.params.id
    });

    if (!follow) {
      return res.status(404).send({ error: "팔로우 상태가 아닌듯" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }

    user.followers = user.followers.filter(follower => follower.toString() !== req.user._id.toString());
    req.user.following = req.user.following.filter(following => following.toString() !== user._id.toString());

    await user.save();
    await req.user.save();

    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 팔로우 요청 없이 팔로우
router.post('/:id/follow', auth, async (req, res) => {
  try {
    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.id
    });

    if (existingFollow) {
      return res.status(400).send({ error: "이미 팔로우 상태여" });
    }

    const follow = new Follow({
      follower: req.user._id,
      following: req.params.id
    });
    await follow.save();

    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
    await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });

    res.status(201).send(follow);
  } catch (e) {
    res.status(500).send(e);
  }
});

// 팔로워 삭제
router.post('/:id/remove-follower', auth, async (req, res) => {
  try {
    const follow = await Follow.findOneAndDelete({
      follower: req.params.id,
      following: req.user._id
    });

    if (!follow) {
      return res.status(404).send({ error: "팔로우 상태가 아닌듯" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }

    user.following = user.following.filter(following => following.toString() !== req.user._id.toString());
    req.user.followers = req.user.followers.filter(follower => follower.toString() !== user._id.toString());

    await user.save();
    await req.user.save();

    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
