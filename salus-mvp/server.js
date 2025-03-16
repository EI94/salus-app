require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Configurazione CORS per supportare domini multipli
const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'];
console.log('CORS configurato per gli origin:', allowedOrigins);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Permetti richieste senza origin (come curl o app mobile)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Origin non consentito: ${origin}`);
      callback(null, true); // Permetti comunque per ora, ma logga il warning
    }
  },
  credentials: true
}));

app.use(express.json()); // integra body-parser

// Middleware di logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Connessione al DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connesso a MongoDB');
}).catch(err => {
  console.error('Errore di connessione:', err);
});

// Gestione errori di connessione a MongoDB
mongoose.connection.on('error', err => {
  console.error('Errore MongoDB:', err);
});

// Import delle route
const authRoutes = require('./routes/auth');
const symptomRoutes = require('./routes/symptoms');
const aiRoutes = require('./routes/ai');
const wellnessRoutes = require('./routes/wellness');
const medicationRoutes = require('./routes/medications');

// Uso delle route
app.use('/api/auth', authRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/medications', medicationRoutes);

// Endpoint di healthcheck per servizi di hosting
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server Salus funzionante' });
});

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('Server in ascolto sulla porta', PORT);
}); 