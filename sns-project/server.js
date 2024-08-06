const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db');
const setupWebSocket = require('./ws');
const addDummyData = require('./dummyData');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const authRouter = require('./routes/auth');
const userRouter = require('./routes/users');
const postRouter = require('./routes/posts');
const commentRouter = require('./routes/comments');
const likeRouter = require('./routes/likes');
const followRouter = require('./routes/follows');
const messageRouter = require('./routes/messages');
const notificationRouter = require('./routes/notifications');
const { router: fileRouter } = require('./routes/files');

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/likes', likeRouter);
app.use('/api/follows', followRouter);
app.use('/api/messages', messageRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/files', fileRouter);

setupWebSocket(server);

connectDB().then(async () => {
  // await addDummyData();
  server.listen(port, () => {
    console.log(`${port}번 포트에서 서버 실행`);
  });
});
