const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SymptomLogSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  intensity: {
    type: Number,
    default: 1
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SymptomLog', SymptomLogSchema); 