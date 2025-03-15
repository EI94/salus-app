const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Registra un nuovo utente
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    console.log(`Richiesta di registrazione ricevuta: ${JSON.stringify(req.body)}`);

    // Controlla se l'utente esiste già
    let user = await User.findOne({ email });
    if (user) {
      console.log(`Utente già esistente con email: ${email}`);
      return res.status(400).json({ message: 'Utente già registrato' });
    }

    // Crea una nuova istanza utente
    user = new User({
      name,
      email,
      password
    });

    console.log(`Tentativo di salvataggio utente: ${JSON.stringify({ name, email })}`);
    
    // Salva l'utente (la password viene hashata nel middleware pre-save)
    await user.save();
    
    console.log(`Utente salvato con successo: ${user._id}`);

    // Simula l'invio di una email di conferma
    const emailToken = require('crypto').randomBytes(32).toString('hex');
    console.log(`Email di conferma da inviare: ${JSON.stringify({
      from: '"Salus App" <noreply@salus-app.com>',
      to: email,
      subject: 'Conferma la tua email per Salus',
      html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Benvenuto in Salus!</h2>
            <p>Grazie per esserti registrato. Per completare la registrazione, conferma il tuo indirizzo email cliccando sul link qui sotto:</p>
            <p><a href="http://localhost:3000/verify-email?token=${emailToken}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Conferma Email</a></p>
            <p>Oppure copia e incolla questo URL nel tuo browser:</p>
            <p>http://localhost:3000/verify-email?token=${emailToken}</p>
            <p>Il link scadrà tra 24 ore.</p>
            <p>Se non hai richiesto questa email, ignorala.</p>
            <p>Grazie,<br/>Il team di Salus</p>
          </div>
        `
    })}`);
    
    console.log(`Email di conferma inviata (simulata) a: ${email}`);

    // Genera un token JWT
    const payload = {
      user: {
        id: user._id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error('Errore durante la registrazione:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   POST /api/auth/login
// @desc    Autenticazione utente e generazione token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log(`Richiesta di login ricevuta: ${JSON.stringify({ email })}`);

    // Controlla se l'utente esiste
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // In ambiente di sviluppo, potremmo voler bypassare la verifica email
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Bypass verifica email per utente: ${email}`);
    }

    // Confronta le password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Password non valida per utente: ${email}`);
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    console.log(`Login effettuato con successo per: ${email}`);

    // Genera un token JWT
    const payload = {
      user: {
        id: user._id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email
          }
        });
      }
    );
  } catch (err) {
    console.error('Errore durante il login:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   GET /api/auth/user
// @desc    Ottiene i dati utente
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error('Errore nel recupero dati utente:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Esporta il router
module.exports = router; 