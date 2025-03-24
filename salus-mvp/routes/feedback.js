const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configura nodemailer con gli stessi parametri usati in auth.js
// In produzione, queste credenziali dovrebbero provenire da file .env
const transporter = nodemailer.createTransport({
  service: 'yahoo',  // Utilizzo Yahoo mail come servizio di invio
  auth: {
    user: process.env.EMAIL_USER || 'michelevalente_94@yahoo.it', // Email Yahoo
    pass: process.env.EMAIL_PASS || 'app_password_here'           // Password specifica per app
  }
});

// Endpoint per inviare feedback via email
router.post('/send', async (req, res) => {
  try {
    // Estrai i dati dal corpo della richiesta
    const feedback = req.body;
    
    if (!feedback) {
      return res.status(400).json({ message: 'Dati di feedback mancanti' });
    }
    
    console.log('Feedback ricevuto:', feedback);
    
    // Formatta il contenuto dell'email
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4A90E2;">Nuovo feedback da Salus App</h2>
        
        <h3>Dettagli feedback:</h3>
        <ul>
          <li><strong>Soddisfazione:</strong> ${feedback.satisfaction}/5</li>
          <li><strong>Funzionalità più utile:</strong> ${feedback.usefulFeature}</li>
          <li><strong>Funzionalità mancante:</strong> ${feedback.missingFeature || 'Nessuna indicata'}</li>
          <li><strong>Facilità d'uso:</strong> ${feedback.usabilityRating}/5</li>
          <li><strong>Probabilità di consigliare:</strong> ${feedback.recommendation}/10</li>
          <li><strong>Email utente:</strong> ${feedback.email || 'Non fornita'}</li>
          <li><strong>Commenti aggiuntivi:</strong> ${feedback.additionalComments || 'Nessun commento'}</li>
        </ul>
        
        <p style="color: #666;">Questo feedback è stato inviato automaticamente dall'app Salus.</p>
      </div>
    `;
    
    // Configura l'email
    const mailOptions = {
      from: '"Salus App Feedback" <noreply@salus-app.com>',
      to: 'michelevalente_94@yahoo.it, pierpaolo.laurito@gmail.com', // Indirizzi di destinazione
      subject: 'Nuovo feedback da utente Salus',
      html: emailContent
    };
    
    // Invia l'email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email inviata:', info.messageId);
    
    // Risposta di successo
    res.status(200).json({ 
      success: true, 
      message: 'Feedback inviato con successo',
      emailInfo: info.messageId
    });
    
  } catch (error) {
    console.error('Errore nell\'invio del feedback:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Errore durante l\'invio del feedback',
      error: error.message
    });
  }
});

module.exports = router; 