const express = require('express');
const router = express.Router();
const { Configuration, OpenAIApi } = require('openai');
const authenticateToken = require('../middleware/auth');

// Configurazione OpenAI
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Endpoint di test per verificare che OpenAI funzioni
router.get('/test', async (req, res) => {
  try {
    // Verifica se la chiave API è troppo corta o ha un formato non valido
    const apiKey = process.env.OPENAI_API_KEY || '';
    let apiStatus = 'Non configurata';
    
    if (apiKey) {
      apiStatus = 'Configurata (Prime 5 lettere: ' + apiKey.substring(0, 5) + '...)';
    }
    
    res.status(200).json({ 
      message: 'API AI funzionante',
      apiKey: apiStatus
    });
  } catch (error) {
    console.error('Errore nel test API:', error);
    res.status(500).json({ message: 'Errore nel test dell\'API' });
  }
});

// Route per la chat con l'AI
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Il messaggio è obbligatorio' });
    }

    // Chiamata a OpenAI
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sei un assistente sanitario virtuale. Fornisci informazioni utili sulla salute e il benessere, ma ricorda di non sostituire mai un medico. Per questioni mediche specifiche, consiglia sempre di consultare un professionista sanitario."
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    // Invia la risposta
    res.json({ 
      response: completion.data.choices[0].message.content,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Errore nella chiamata a OpenAI:', error);
    res.status(500).json({ 
      error: 'Errore nella generazione della risposta',
      details: error.message 
    });
  }
});

// Manteniamo gli altri endpoint per compatibilità
router.post('/ask', async (req, res) => {
  // Reindirizza alla nuova implementazione
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ message: 'Il messaggio è obbligatorio' });
    }
    
    // Usa l'implementazione semplificata
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Sei un assistente sanitario che aiuta gli utenti a monitorare la propria salute." },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });
      
      const aiResponse = response.choices[0].message.content;
      res.status(200).json({ reply: aiResponse });
    } catch (openaiError) {
      console.error('Errore specifico OpenAI in /ask:', openaiError);
      // Risposta di fallback
      res.status(200).json({ 
        reply: "Mi dispiace, sto riscontrando dei problemi tecnici nel rispondere alla tua domanda. Riprova più tardi.",
        errorOccurred: true 
      });
    }
  } catch (error) {
    console.error('Errore in /ask:', error);
    res.status(200).json({ 
      reply: "Mi dispiace, sto riscontrando dei problemi tecnici nel rispondere alla tua domanda. Riprova più tardi.",
      errorOccurred: true 
    });
  }
});

module.exports = router; 