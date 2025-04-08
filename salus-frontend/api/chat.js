// File: api/chat.js - Endpoint serverless per Vercel
import axios from 'axios';

// Funzione serverless per interagire con OpenAI
export default async function handler(req, res) {
  // Configura intestazioni CORS per permettere richieste cross-origin
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Gestisci la richiesta preflight OPTIONS
  if (req.method === 'OPTIONS') {
    console.log('Ricevuta richiesta preflight OPTIONS');
    res.status(200).end();
    return;
  }

  // Verifica che sia una richiesta POST
  if (req.method !== 'POST') {
    console.log(`Metodo non consentito: ${req.method}`);
    return res.status(405).json({ error: 'Metodo non consentito' });
  }

  try {
    console.log('Richiesta ricevuta al serverless function di Vercel');
    // Verifica le credenziali e il corpo della richiesta
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.log('Formato richiesta non valido:', req.body);
      return res.status(400).json({ 
        error: 'Formato richiesta non valido',
        message: 'La richiesta deve includere un array "messages"'
      });
    }
    
    // Ottieni la chiave API di OpenAI dalle variabili d'ambiente
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('Chiave API OpenAI non trovata nelle variabili d\'ambiente');
      return res.status(500).json({ 
        error: 'Configurazione server non valida',
        message: 'Il server non è configurato correttamente. Contatta l\'amministratore.'
      });
    }
    
    console.log('Invio richiesta a OpenAI API');
    // Invia la richiesta a OpenAI
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    // Estrai e restituisci la risposta
    const responseMessage = openaiResponse.data.choices[0].message.content;
    console.log('Risposta ricevuta da OpenAI');
    
    return res.status(200).json({
      message: responseMessage,
      usage: openaiResponse.data.usage
    });
    
  } catch (error) {
    console.error('Errore durante la comunicazione con OpenAI:', error);
    
    // Gestisce gli errori comuni
    if (error.response) {
      // Errore dalla risposta di OpenAI
      const statusCode = error.response.status;
      const errorData = error.response.data;
      
      if (statusCode === 401) {
        return res.status(500).json({ 
          error: 'Autenticazione OpenAI non riuscita',
          message: 'Chiave API non valida. Contatta l\'amministratore.'
        });
      }
      
      if (statusCode === 429) {
        return res.status(429).json({ 
          error: 'Limite di richieste superato',
          message: 'Hai superato il limite di richieste. Riprova più tardi.'
        });
      }
      
      return res.status(statusCode).json({ 
        error: 'Errore OpenAI',
        message: errorData.error?.message || 'Si è verificato un errore durante l\'elaborazione della richiesta.'
      });
    }
    
    // Errore generico
    return res.status(500).json({ 
      error: 'Errore interno del server',
      message: 'Si è verificato un errore durante l\'elaborazione della richiesta.'
    });
  }
} 