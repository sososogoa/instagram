const mongoose = require('mongoose');
const config = require('./config');

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log('DB 연결 완료');
  } catch (error) {
    console.log('DB 연결 에러 : ', error);
    process.exit(1);
  }
};

module.exports = connectDB;
