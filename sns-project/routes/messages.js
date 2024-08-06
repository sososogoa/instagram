const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Conversation = require('../models/Conversation');

router.get('/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "유저 못찾음" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
      participants: userObjectId
    })
      .populate('participants', 'username profilePicture')
      .populate({
        path: 'messages',
        options: { sort: { 'createdAt': -1 }, limit: 1 }
      });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/conversations', async (req, res) => {
  const { participants } = req.body;

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: participants }
    }).populate('participants', 'username profilePicture');

    if (!conversation) {
      conversation = new Conversation({ participants });
      await conversation.save();
      conversation = await Conversation.findById(conversation._id).populate('participants', 'username profilePicture');
    }

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:user1/:user2', async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const user1Id = new mongoose.Types.ObjectId(user1);
    const user2Id = new mongoose.Types.ObjectId(user2);

    let conversation = await Conversation.findOne({
      participants: { $all: [user1Id, user2Id] }
    }).populate({
      path: 'messages',
      populate: { path: 'sender', select: 'username profilePicture' },
      options: { sort: { 'createdAt': -1 }, skip, limit }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [user1Id, user2Id],
        messages: [],
      });
      await conversation.save();
    }

    res.json(conversation.messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
