const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'follow-request', 'follow-accepted', 'message', 'mention'], required: true },
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  requester: { type: Schema.Types.ObjectId, ref: 'User' },
  commentId: { type: Schema.Types.ObjectId, ref: 'Comment' },
  commentContent: { type: String },
  messageId: { type: Schema.Types.ObjectId, ref: 'Message' },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
