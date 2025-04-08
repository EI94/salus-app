const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Abilita CORS per tutte le richieste
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept']
}));

// Proxy per le richieste API
const apiProxy = createProxyMiddleware('/api', {
  target: 'https://salus-backend.onrender.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api': '/api' // mantiene il prefisso /api
  },
  onProxyRes: (proxyRes) => {
    // Aggiungi header CORS alla risposta
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, Origin, X-Requested-With, Accept';
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({
      error: 'Errore nella comunicazione con il server API. Riprova più tardi.'
    });
  }
});

// Usa il proxy per le richieste API
app.use('/api', apiProxy);

// Serve file statici dalla cartella build se in produzione
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('build'));
  
  // Servi sempre il file index.html per qualsiasi percorso non riconosciuto (per React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server proxy in esecuzione sulla porta ${PORT}`);
  console.log(`API proxy attivo per ${apiProxy.options.target}`);
}); 