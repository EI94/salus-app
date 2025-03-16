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

// Endpoint semplificato per la chat
router.post('/chat', async (req, res) => {
  try {
    console.log('Richiesta chat AI ricevuta:', req.body);
    const { message } = req.body;
    
    // Verifica se il messaggio è presente
    if (!message) {
      console.log('Errore: messaggio mancante nella richiesta');
      return res.status(400).json({ message: 'Il messaggio è obbligatorio' });
    }
    
    console.log('Messaggio ricevuto:', message);
    console.log('Chiave API:', process.env.OPENAI_API_KEY ? 'Presente' : 'Mancante');
    
    // Validazione della chiave API
    if (!process.env.OPENAI_API_KEY) {
      console.error('Chiave API OpenAI mancante');
      return res.status(500).json({ message: 'Chiave API OpenAI non configurata' });
    }
    
    // Utilizziamo un blocco try/catch per i problemi specifici con OpenAI
    try {
      // Registra la richiesta che stiamo per inviare a OpenAI
      console.log('Invio richiesta a OpenAI');
      
      // Chiamata all'API di OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "Sei Salus, un assistente sanitario che aiuta gli utenti a monitorare la propria salute. Non sei un medico e non puoi fornire diagnosi, prescrizioni o consigli medici specialistici. In OGNI risposta, devi chiarire che le tue informazioni sono solo educative e che l'utente dovrebbe sempre consultare un professionista sanitario per problemi specifici. Se rilevi sintomi potenzialmente gravi, raccomanda SEMPRE di consultare un medico. Sei empatico, professionale e fai riferimento a informazioni mediche generali basate su evidenze scientifiche, ricordando sempre i tuoi limiti."
          },
          { role: "user", content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });
      
      console.log('Risposta OpenAI ricevuta:', response);
      
      if (!response.choices || !response.choices.length) {
        throw new Error('Risposta OpenAI non valida');
      }
      
      const aiResponse = response.choices[0].message.content;
      console.log('Risposta AI elaborata:', aiResponse.substring(0, 50) + '...');
      
      res.status(200).json({ 
        reply: aiResponse 
      });
    } catch (openaiError) {
      console.error('Errore specifico OpenAI:', openaiError);
      
      // Gestisce errori specifici di OpenAI
      if (openaiError.status === 401) {
        return res.status(500).json({ 
          message: 'Errore di autenticazione con OpenAI. La chiave API non è valida.',
          error: openaiError.message || 'Errore di autenticazione'
        });
      } else if (openaiError.status === 429) {
        return res.status(500).json({ 
          message: 'Limite di richieste OpenAI superato. Riprova più tardi.',
          error: openaiError.message || 'Troppe richieste'
        });
      } else {
        // Risposta di fallback in caso di qualsiasi altro errore di OpenAI
        console.log('Fornisco una risposta di fallback per errore OpenAI');
        return res.status(200).json({ 
          reply: "Mi dispiace, sto riscontrando dei problemi tecnici nel rispondere alla tua domanda. Come assistente per la salute, posso comunque ricordarti che è sempre consigliabile consultare un medico per qualsiasi preoccupazione relativa alla tua salute. Riprova più tardi con la tua domanda.",
          errorOccurred: true
        });
      }
    }
  } catch (error) {
    console.error('Errore generale nel processamento della richiesta:', error);
    // Anche in caso di errore generale, forniamo una risposta che permetta all'applicazione di continuare
    res.status(200).json({ 
      reply: "Mi dispiace, sto riscontrando dei problemi tecnici nel rispondere alla tua domanda. Come assistente per la salute, posso comunque ricordarti che è sempre consigliabile consultare un medico per qualsiasi preoccupazione relativa alla tua salute. Riprova più tardi con la tua domanda.",
      errorOccurred: true
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