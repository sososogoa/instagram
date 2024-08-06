const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');
const auth = require('../middleware/auth');
const { upload } = require('./files');
const router = express.Router();

// 회원가입
router.post('/register', upload.single('profileImage'), async (req, res) => {
  const { username, email, password } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : '';

  try {
    const user = new User({ username, email, password, profilePicture: profileImage });
    user.password = await bcrypt.hash(user.password, 8);
    await user.save();
    const token = jwt.sign({ _id: user._id.toString() }, config.jwtSecret);
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({ error: "회원가입 안한듯" });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(400).send({ error: "로그인정보 틀린듯" });
    }

    const token = jwt.sign({ _id: user._id.toString() }, config.jwtSecret);
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

// 토큰 검증
router.get('/verify-token', auth, (req, res) => {
  res.send({ valid: true });
});

module.exports = router;
