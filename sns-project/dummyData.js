const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

const addDummyData = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('DB 연결 에러');
    }

    await db.dropDatabase();

    const userA = new User({
      username: 'A',
      email: 'a@a.com',
      password: '1',
    });

    const userB = new User({
      username: 'B',
      email: 'b@b.com',
      password: '1',
    });

    const userC = new User({
      username: 'C',
      email: 'c@c.com',
      password: '1',
    });

    await userA.save();
    await userB.save();
    await userC.save();

    const postA_Public = new Post({
      content: 'Post by A (Public)',
      imageUrl: 'https://via.placeholder.com/300',
      user: userA._id,
      isPublic: true,
    });
    const postA_Private = new Post({
      content: 'Post by A (Private)',
      imageUrl: 'https://via.placeholder.com/300',
      user: userA._id,
      isPublic: false,
    });
    const postB_Public = new Post({
      content: 'Post by B (Public)',
      imageUrl: 'https://via.placeholder.com/300',
      user: userB._id,
      isPublic: true,
    });
    const postB_Private = new Post({
      content: 'Post by B (Private)',
      imageUrl: 'https://via.placeholder.com/300',
      user: userB._id,
      isPublic: false,
    });
    const postC_Public = new Post({
      content: 'Post by C (Public)',
      imageUrl: 'https://via.placeholder.com/300',
      user: userC._id,
      isPublic: true,
    });
    const postC_Private = new Post({
      content: 'Post by C (Private)',
      imageUrl: 'https://via.placeholder.com/300',
      user: userC._id,
      isPublic: false,
    });

    await postA_Public.save();
    await postA_Private.save();
    await postB_Public.save();
    await postB_Private.save();
    await postC_Public.save();
    await postC_Private.save();
  } catch (error) {
    console.error(error);
  }
};

module.exports = addDummyData;
