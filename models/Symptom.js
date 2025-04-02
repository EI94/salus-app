const mongoose = require('mongoose');

const SymptomSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  severity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  description: {
    type: String,
    trim: true
  },
  duration: {
    type: String,
    trim: true
  },
  triggers: {
    type: String,
    trim: true
  },
  dateReported: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Symptom', SymptomSchema); 