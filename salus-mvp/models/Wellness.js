const mongoose = require('mongoose');

const WellnessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  mood: {
    type: String,
    enum: ['ottimo', 'buono', 'neutro', 'triste', 'pessimo'],
    required: true
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  activities: {
    type: [String],
    default: []
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Wellness', WellnessSchema); 