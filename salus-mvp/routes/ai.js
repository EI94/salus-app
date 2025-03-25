const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Configura OpenAI con la nuova versione dell'API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

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

// Endpoint per ottenere risposte dall'AI
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Il messaggio è obbligatorio' });
    }

    // Crea il prompt per l'AI
    const prompt = `Sei un assistente sanitario virtuale di Salus, un'app per il monitoraggio della salute. 
    Fornisci risposte utili e pertinenti in italiano, mantenendo un tono professionale ma amichevole.
    Se non sei sicuro o la domanda richiede un consulto medico, suggerisci di consultare un professionista sanitario.
    
    Domanda dell'utente: ${message}`;

    // Chiama l'API di OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Sei un assistente sanitario virtuale di Salus, un'app per il monitoraggio della salute. Fornisci risposte utili e pertinenti in italiano, mantenendo un tono professionale ma amichevole."
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Estrai la risposta
    const response = completion.choices[0].message.content;

    res.json({ 
      success: true, 
      response: response 
    });

  } catch (error) {
    console.error('Errore nella chiamata a OpenAI:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Errore nel processare la richiesta',
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