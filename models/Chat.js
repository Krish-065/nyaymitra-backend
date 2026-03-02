const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  topic:    { type: String, default: 'All Topics' },
  question: { type: String },
  messages: { type: Array, default: [] },
  date:     { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);