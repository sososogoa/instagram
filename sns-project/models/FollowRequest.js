const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followRequestSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

followRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

const FollowRequest = mongoose.model('FollowRequest', followRequestSchema);
module.exports = FollowRequest;
