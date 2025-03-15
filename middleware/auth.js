const jwt = require('jsonwebtoken');

// Middleware per verificare il token JWT
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    
    if (!token) {
      return res.status(401).json({ message: 'Nessun token, autorizzazione negata' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token non valido' });
  }
};

module.exports = authMiddleware; 