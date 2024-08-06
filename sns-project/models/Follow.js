const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const followSchema = new Schema({
  follower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  following: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const Follow = mongoose.model('Follow', followSchema);
module.exports = Follow;