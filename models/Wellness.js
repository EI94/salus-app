const mongoose = require('mongoose');

const WellnessSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: true
  },
  mood: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  energy: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  sleep: {
    hours: {
      type: Number,
      min: 0,
      max: 24
    },
    quality: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  nutrition: {
    quality: {
      type: Number,
      min: 1,
      max: 10
    },
    hydration: {
      type: Number,
      min: 1,
      max: 10
    }
  },
  stress: {
    type: Number,
    min: 1,
    max: 10
  },
  physicalActivity: {
    type: Number,
    min: 0,
    max: 600, // minuti di attività fisica
  },
  notes: {
    type: String,
    trim: true
  }
}, { timestamps: true });

// Indice composto per evitare duplicati per utente e data
WellnessSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Wellness', WellnessSchema); 