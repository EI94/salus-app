const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WellnessLogSchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mood: {
    type: Number,
    min: 1,
    max: 10,
    required: true
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  nutrition: {
    type: String,
    enum: ['poor', 'average', 'good', 'excellent']
  },
  activities: [{
    type: String
  }],
  notes: {
    type: String
  }
});

module.exports = mongoose.model('WellnessLog', WellnessLogSchema); 