const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Abilita CORS per tutte le richieste
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware per logging delle richieste
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Proxy per le richieste API
app.use('/api', createProxyMiddleware({
  target: 'https://salus-ai-backend.vercel.app',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api', // mantiene il prefisso /api
  },
  onProxyRes: function(proxyRes, req, res) {
    // Aggiungi header CORS alla risposta
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
}));

// Gestione errori 404
app.use((req, res) => {
  res.status(404).send({ error: 'Risorsa non trovata' });
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server proxy avviato sulla porta ${PORT}`);
  console.log(`Proxy API disponibile su http://localhost:${PORT}/api`);
}); 