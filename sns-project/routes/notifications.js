const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// 특정 사용자의 알림 가져오기
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('requester', 'username profilePicture')
      .populate('postId', 'imageUrl')
      .populate('messageId');

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 알림 읽음 상태로 업데이트
router.patch('/read/:notificationId', async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).send({ error: 'Notification not found' });
    }

    res.send(notification);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
