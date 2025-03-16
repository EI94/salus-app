const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // Campi per la verifica dell'email
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailToken: {
    type: String
  },
  emailTokenExpires: {
    type: Date
  },
  // Preferenze utente
  preferences: {
    language: {
      type: String,
      enum: ['it', 'en', 'es'],
      default: 'it'
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', UserSchema); 