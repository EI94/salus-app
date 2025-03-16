const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configura nodemailer (utilizza un servizio di prova per simulare l'invio email)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: 'ethereal.user@ethereal.email', // In produzione, usa credenziali vere in .env
    pass: 'ethereal.password'             // In produzione, usa credenziali vere in .env
  }
});

// Registrazione utente
router.post('/register', async (req, res) => {
  try {
    console.log('Richiesta di registrazione ricevuta:', req.body);
    
    // Verifica che i dati necessari siano presenti
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      console.log('Dati mancanti:', { name: !!name, email: !!email, password: !!password });
      return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
    }
    
    // Controlla se l'utente esiste già
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Utente già esistente con email:', email);
      return res.status(400).json({ message: 'Utente già registrato con questa email' });
    }
    
    // Hash della password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Genera token di conferma
    const emailToken = crypto.randomBytes(64).toString('hex');
    const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 ore
    
    // Crea nuovo utente
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      emailToken,
      emailTokenExpires,
      isEmailVerified: false
    });
    
    console.log('Tentativo di salvataggio utente:', { name, email });
    
    // Salva utente
    const savedUser = await newUser.save();
    
    console.log('Utente salvato con successo:', savedUser._id);
    
    // Prepara l'URL di conferma
    const confirmUrl = `http://localhost:3000/verify-email?token=${emailToken}`;
    
    // Simula invio email (in un ambiente reale, configura un servizio email)
    try {
      // Invia email di conferma
      const mailOptions = {
        from: '"Salus App" <noreply@salus-app.com>',
        to: email,
        subject: 'Conferma la tua email per Salus',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4A90E2;">Benvenuto in Salus!</h2>
            <p>Grazie per esserti registrato. Per completare la registrazione, conferma il tuo indirizzo email cliccando sul link qui sotto:</p>
            <p><a href="${confirmUrl}" style="display: inline-block; background-color: #4A90E2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Conferma Email</a></p>
            <p>Oppure copia e incolla questo URL nel tuo browser:</p>
            <p>${confirmUrl}</p>
            <p>Il link scadrà tra 24 ore.</p>
            <p>Se non hai richiesto questa email, ignorala.</p>
            <p>Grazie,<br/>Il team di Salus</p>
          </div>
        `
      };
      
      // Email invio simulato
      console.log('Email di conferma da inviare:', mailOptions);
      
      // In ambiente di sviluppo, non inviamo realmente l'email ma simuliamo il successo
      // transporter.sendMail(mailOptions); // Decommentare in produzione
      
      console.log('Email di conferma inviata (simulata) a:', email);
    } catch (emailError) {
      console.error('Errore nell\'invio dell\'email:', emailError);
      // Continuiamo comunque, l'utente può richiedere un nuovo link
    }
    
    res.status(201).json({
      userId: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      message: 'Utente registrato! Controlla la tua email per completare la registrazione.'
    });
  } catch (error) {
    console.error('Errore durante la registrazione:', error);
    res.status(500).json({ 
      message: 'Errore durante la registrazione',
      error: error.message
    });
  }
});

// Endpoint per verificare l'email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Trova l'utente con il token di verifica
    const user = await User.findOne({
      emailToken: token,
      emailTokenExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Token non valido o scaduto' });
    }
    
    // Aggiorna l'utente
    user.isEmailVerified = true;
    user.emailToken = undefined;
    user.emailTokenExpires = undefined;
    
    await user.save();
    
    res.status(200).json({ message: 'Email verificata con successo! Ora puoi accedere.' });
  } catch (error) {
    console.error('Errore durante la verifica email:', error);
    res.status(500).json({ message: 'Errore durante la verifica dell\'email' });
  }
});

// Login utente
router.post('/login', async (req, res) => {
  try {
    console.log('Richiesta di login ricevuta:', { email: req.body.email });
    
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e password sono obbligatori' });
    }
    
    // Trova l'utente
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Utente non trovato con email:', email);
      return res.status(400).json({ message: 'Email o password non validi' });
    }
    
    // *** BYPASS TEMPORANEO PER AMBIENTE DI SVILUPPO ***
    // Verifica se l'email è stata confermata - BYPASS attivato per test
    // Invece di bloccare il login, verifichiamo automaticamente l'email per scopi di test
    if (!user.isEmailVerified) {
      console.log('Bypass verifica email per utente:', email);
      user.isEmailVerified = true;
      await user.save();
      // In un ambiente di produzione, utilizzare questo codice invece:
      // return res.status(401).json({ 
      //   message: 'Email non verificata. Per favore, controlla la tua casella email.',
      //   needsVerification: true
      // });
    }
    
    // Verifica password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      console.log('Password non valida per utente:', email);
      return res.status(400).json({ message: 'Email o password non validi' });
    }
    
    // Aggiorna l'ultimo accesso
    user.lastLogin = Date.now();
    await user.save();
    
    console.log('Login effettuato con successo per:', email);
    
    res.status(200).json({
      userId: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Errore durante il login:', error);
    res.status(500).json({ 
      message: 'Errore durante il login',
      error: error.message
    });
  }
});

// Endpoint per richiedere un nuovo link di verifica
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email obbligatoria' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'Email già verificata' });
    }
    
    // Genera nuovo token
    const emailToken = crypto.randomBytes(64).toString('hex');
    const emailTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 ore
    
    // Aggiorna l'utente
    user.emailToken = emailToken;
    user.emailTokenExpires = emailTokenExpires;
    await user.save();
    
    // Prepara l'URL di conferma
    const confirmUrl = `http://localhost:3000/verify-email?token=${emailToken}`;
    
    // Simulazione invio email
    console.log('Nuovo link di verifica:', confirmUrl);
    
    res.status(200).json({ message: 'Nuovo link di verifica inviato. Controlla la tua email.' });
  } catch (error) {
    console.error('Errore nell\'invio del nuovo link:', error);
    res.status(500).json({ message: 'Errore nell\'invio del nuovo link di verifica' });
  }
});

// Ottieni dati di un utente specifico
router.get('/users/:userId', async (req, res) => {
  try {
    console.log(`Richiesta dati per utente ${req.params.userId}`);
    
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Invia solo le informazioni sicure (non la password)
    res.status(200).json({
      userId: user._id,
      name: user.name,
      email: user.email,
      registrationDate: user.registrationDate,
      lastLogin: user.lastLogin,
      isEmailVerified: user.isEmailVerified
    });
  } catch (error) {
    console.error('Errore nel recupero dei dati utente:', error);
    res.status(500).json({ message: 'Errore durante il recupero dei dati utente' });
  }
});

// ENDPOINT ADMIN: Verifica manuale dell'email (SOLO PER SVILUPPO)
router.post('/admin/verify-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email obbligatoria' });
    }
    
    // Trova l'utente
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    // Verifica manualmente l'email
    user.isEmailVerified = true;
    user.emailToken = undefined;
    user.emailTokenExpires = undefined;
    
    await user.save();
    
    console.log(`Email verificata manualmente per l'utente: ${email}`);
    
    res.status(200).json({ 
      message: 'Email verificata manualmente con successo!',
      user: {
        userId: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Errore durante la verifica manuale:', error);
    res.status(500).json({ message: 'Errore durante la verifica manuale dell\'email' });
  }
});

module.exports = router; 