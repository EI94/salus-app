require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const setupCors = require('./middleware/cors');

// Importazione delle routes (le creeremo più tardi)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const symptomRoutes = require('./routes/symptoms');
const medicationRoutes = require('./routes/medications');
const wellnessRoutes = require('./routes/wellness');
const aiRoutes = require('./routes/ai');
const healthRoutes = require('./routes/health');

const app = express();

// Configurazione CORS basata sull'ambiente
setupCors(app);

// Middleware
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/users', userRoutes);
app.use('/api/symptoms', symptomRoutes);
app.use('/api/medications', medicationRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/health', healthRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('salus-frontend/build'));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'salus-frontend', 'build', 'index.html'));
  });
}

// Gestione errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: process.env.NODE_ENV === 'production' 
      ? 'Si è verificato un errore interno del server'
      : err.message
  });
});

// Connessione al database con la nuova configurazione
connectDB();

// Avvio del server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server in esecuzione sulla porta ${PORT}`));

// Gestione della chiusura del server è già configurata in connectDB 