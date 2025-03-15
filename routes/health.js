const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

/**
 * @route   GET /api/health
 * @desc    Verifica lo stato del server e le connessioni
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Verifica connessione database
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    // Informazioni sul sistema
    const serverInfo = {
      timestamp: new Date().toISOString(),
      status: 'online',
      database: {
        status: dbStatus,
        name: mongoose.connection.name || 'unknown'
      },
      environment: process.env.NODE_ENV,
      uptime: Math.floor(process.uptime()) + ' seconds',
      memory: process.memoryUsage(),
      version: process.version
    };

    // Risposta con stato 200 OK
    return res.status(200).json({
      message: 'Server is healthy',
      info: serverInfo
    });
  } catch (error) {
    console.error('Health check error:', error);
    return res.status(500).json({
      message: 'Server health check failed',
      error: error.message
    });
  }
});

module.exports = router; 