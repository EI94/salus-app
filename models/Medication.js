const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
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
  dosage: {
    type: String,
    required: true,
    trim: true
  },
  frequency: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  purpose: {
    type: String,
    trim: true
  },
  instructions: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  reminders: [{
    time: {
      type: String,
      trim: true
    },
    enabled: {
      type: Boolean,
      default: true
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Medication', MedicationSchema); 