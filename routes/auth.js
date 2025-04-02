const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Configurazione per l'invio di email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production'
  }
});

// Funzione per inviare email
const sendEmail = async (to, subject, html) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      // In sviluppo, logga l'email invece di inviarla
      console.log(`
        === SIMULAZIONE INVIO EMAIL ===
        A: ${to}
        Oggetto: ${subject}
        Contenuto: ${html}
        =============================
      `);
      return true;
    }
    
    const mailOptions = {
      from: `"Salus App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Errore invio email:', error);
    return false;
  }
};

// @route   POST /api/auth/register
// @desc    Registra un nuovo utente
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, language = 'italian' } = req.body;
    
    console.log(`Richiesta di registrazione ricevuta: ${JSON.stringify({name, email, language})}`);

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
      password,
      language
    });
    
    // Genera token di verifica email
    const emailToken = user.generateVerificationToken();
    
    console.log(`Tentativo di salvataggio utente: ${JSON.stringify({ name, email })}`);
    
    // Salva l'utente (la password viene hashata nel middleware pre-save)
    await user.save();
    
    console.log(`Utente salvato con successo: ${user._id}`);

    // Invia email di verifica
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;
    const emailSent = await sendEmail(
      email,
      'Conferma la tua email per Salus',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A90E2;">Benvenuto in Salus!</h2>
        <p>Grazie per esserti registrato. Per completare la registrazione, conferma il tuo indirizzo email cliccando sul link qui sotto:</p>
        <p><a href="${verificationUrl}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Conferma Email</a></p>
        <p>Oppure copia e incolla questo URL nel tuo browser:</p>
        <p>${verificationUrl}</p>
        <p>Il link scadrà tra 24 ore.</p>
        <p>Se non hai richiesto questa email, ignorala.</p>
        <p>Grazie,<br/>Il team di Salus</p>
      </div>
      `
    );
    
    if (emailSent) {
      console.log(`Email di verifica inviata a: ${email}`);
    } else {
      console.log(`Errore invio email di verifica a: ${email}`);
    }

    // Genera un token JWT
    const payload = {
      user: {
        id: user._id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ 
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            language: user.language,
            isEmailVerified: user.isEmailVerified
          },
          message: 'Registrazione completata con successo. Controlla la tua email per verificare il tuo account.'
        });
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

    // Controlla se l'email è verificata (in dev possiamo ignorare)
    if (process.env.NODE_ENV === 'production' && !user.isEmailVerified) {
      return res.status(401).json({ 
        message: 'Email non verificata. Controlla la tua casella di posta o richiedi un nuovo link di verifica.',
        needsVerification: true
      });
    }

    // Confronta le password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`Password non valida per utente: ${email}`);
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // Aggiorna l'ultimo accesso
    user.lastLogin = Date.now();
    await user.save();

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
      { expiresIn: process.env.JWT_EXPIRE || '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            language: user.language || 'italian',
            profilePicture: user.profilePicture,
            isEmailVerified: user.isEmailVerified
          }
        });
      }
    );
  } catch (err) {
    console.error('Errore durante il login:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   GET /api/auth/verify-email/:token
// @desc    Verifica email utente
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Il token di verifica non è valido o è scaduto. Richiedi un nuovo link di verifica.' 
      });
    }
    
    // Aggiorna lo stato di verifica dell'utente
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    
    await user.save();
    
    return res.status(200).json({ 
      message: 'Email verificata con successo. Ora puoi accedere al tuo account.' 
    });
  } catch (err) {
    console.error('Errore durante la verifica email:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   POST /api/auth/resend-verification
// @desc    Richiede nuovo link di verifica email
// @access  Public
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Per sicurezza non riveliamo che l'utente non esiste
      return res.status(200).json({ 
        message: 'Se il tuo indirizzo email è registrato, riceverai una nuova email di verifica.' 
      });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ 
        message: 'Questo account è già verificato. Puoi accedere normalmente.' 
      });
    }
    
    // Genera nuovo token di verifica
    const emailToken = user.generateVerificationToken();
    await user.save();
    
    // Invia email di verifica
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;
    await sendEmail(
      email,
      'Nuovo link di verifica email per Salus',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A90E2;">Verifica il tuo account Salus</h2>
        <p>Hai richiesto un nuovo link di verifica. Clicca sul pulsante qui sotto per verificare il tuo indirizzo email:</p>
        <p><a href="${verificationUrl}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verifica Email</a></p>
        <p>Oppure copia e incolla questo URL nel tuo browser:</p>
        <p>${verificationUrl}</p>
        <p>Il link scadrà tra 24 ore.</p>
        <p>Se non hai richiesto questa email, ignorala.</p>
        <p>Grazie,<br/>Il team di Salus</p>
      </div>
      `
    );
    
    return res.status(200).json({ 
      message: 'Se il tuo indirizzo email è registrato, riceverai una nuova email di verifica.' 
    });
  } catch (err) {
    console.error('Errore nell\'invio del link di verifica:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Richiedi reset password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // Per sicurezza non riveliamo che l'utente non esiste
      return res.status(200).json({ 
        message: 'Se il tuo indirizzo email è registrato, riceverai una email con le istruzioni per reimpostare la password.' 
      });
    }
    
    // Genera token reset password
    const resetToken = user.generatePasswordResetToken();
    await user.save();
    
    // Invia email con link reset password
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await sendEmail(
      email,
      'Reimposta la tua password Salus',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A90E2;">Reimposta la tua password</h2>
        <p>Hai richiesto di reimpostare la tua password. Clicca sul pulsante qui sotto per procedere:</p>
        <p><a href="${resetUrl}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reimposta Password</a></p>
        <p>Oppure copia e incolla questo URL nel tuo browser:</p>
        <p>${resetUrl}</p>
        <p>Il link scadrà tra 1 ora.</p>
        <p>Se non hai richiesto di reimpostare la password, ignora questa email e la tua password rimarrà invariata.</p>
        <p>Grazie,<br/>Il team di Salus</p>
      </div>
      `
    );
    
    return res.status(200).json({ 
      message: 'Se il tuo indirizzo email è registrato, riceverai una email con le istruzioni per reimpostare la password.' 
    });
  } catch (err) {
    console.error('Errore nella richiesta di reset password:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password con token
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ 
        message: 'Il token di reset non è valido o è scaduto. Richiedi un nuovo reset della password.' 
      });
    }
    
    // Aggiorna la password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    // Invia email di conferma
    await sendEmail(
      user.email,
      'Password reimpostata con successo',
      `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A90E2;">Password reimpostata con successo</h2>
        <p>La tua password è stata reimpostata correttamente.</p>
        <p>Puoi ora accedere al tuo account con la nuova password.</p>
        <p>Se non hai richiesto questa modifica, contatta immediatamente il supporto.</p>
        <p>Grazie,<br/>Il team di Salus</p>
      </div>
      `
    );
    
    return res.status(200).json({ 
      message: 'Password reimpostata con successo. Puoi ora accedere con la nuova password.' 
    });
  } catch (err) {
    console.error('Errore nel reset della password:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   GET /api/auth/user
// @desc    Ottiene i dati utente
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires');
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Errore nel recupero dati utente:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   PUT /api/auth/user
// @desc    Aggiorna i dati utente
// @access  Private
router.put('/user', auth, async (req, res) => {
  try {
    const { name, language, age, gender } = req.body;
    
    // Trova e aggiorna l'utente
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Aggiorna i campi modificabili
    if (name) user.name = name;
    if (language) user.language = language;
    if (age !== undefined) user.age = age;
    if (gender) user.gender = gender;
    
    await user.save();
    
    // Ritorna l'utente aggiornato senza campi sensibili
    const updatedUser = await User.findById(req.user.id).select('-password -emailVerificationToken -emailVerificationExpires -resetPasswordToken -resetPasswordExpires');
    
    res.json(updatedUser);
  } catch (err) {
    console.error('Errore nell\'aggiornamento dati utente:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Cambia password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Verifica password attuale
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password attuale non valida' });
    }
    
    // Aggiorna la password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password aggiornata con successo' });
  } catch (err) {
    console.error('Errore nel cambio password:', err.message);
    res.status(500).json({ message: 'Errore del server' });
  }
});

// Esporta il router
module.exports = router; 