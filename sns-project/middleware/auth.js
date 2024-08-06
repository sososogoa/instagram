const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) {
      return res.status(401).send({ error: 'Authorization header missing.' });
    }

    const tokenString = token.replace('Bearer ', '');
    const decoded = jwt.verify(tokenString, config.jwtSecret);
    const user = await User.findOne({ _id: decoded._id });

    if (!user) {
      return res.status(401).send({ error: 'User not found.' });
    }

    req.user = user;
    req.token = tokenString;
    next();
  } catch (e) {
    console.error('Authentication error:', e);
    res.status(401).send({ error: 'Please authenticate.' });
  }
};


module.exports = auth;
