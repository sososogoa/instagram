const WebSocket = require('ws');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Notification = require('./models/Notification');
const mongoose = require('mongoose');

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log("웹 소켓 연결");

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'NEW_MESSAGE') {
          const { text, sender, receiver, conversationId, createdAt } = data;

          if (!text || !sender || !receiver || !conversationId) {
            throw new Error('Missing required message fields');
          }

          let conversation = await Conversation.findById(conversationId);
          if (!conversation) {
            conversation = new Conversation({
              participants: [new mongoose.Types.ObjectId(sender._id), new mongoose.Types.ObjectId(receiver._id)],
              lastMessage: ''
            });
            await conversation.save();
          }

          const newMessage = new Message({
            conversationId: conversation._id,
            sender: new mongoose.Types.ObjectId(sender._id),
            text,
            createdAt: new Date(createdAt)
          });
          await newMessage.save();

          conversation.messages.push(newMessage._id);
          conversation.lastMessage = text;
          await conversation.save();

          const notificationData = {
            userId: receiver._id,
            requester: sender._id,
            messageId: newMessage._id,
            type: 'message'
          };

          const notification = new Notification(notificationData);
          await notification.save();

          const broadcastData = {
            type: 'SEND_MESSAGE',
            conversationId: conversation._id,
            message: {
              ...newMessage.toObject(),
              sender: {
                _id: sender._id,
                username: sender.username,
                profilePicture: sender.profilePicture
              }
            }
          };
          broadcast(wss, broadcastData);
        }
      } catch (error) {
        console.error("웹 소켓 메시지 에러 : ", error);
      }
    });

    ws.on('close', () => {
      console.log("웹 소켓 연결 해제");
    });
  });
};

const broadcast = (wss, data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = setupWebSocket;
