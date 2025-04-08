import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Inizializza Firebase Admin
admin.initializeApp();

/**
 * Funzione callable per l'assistente AI
 * Chiamata da: Firebase Client SDK
 */
export const aiAssistant = functions.https.onCall(async (data, context) => {
  try {
    // Verifica che l'utente sia autenticato
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'L\'utente deve essere autenticato per utilizzare questa funzione'
      );
    }

    // Ottieni i dati dalla richiesta
    const { message, conversation = [] } = data;
    
    if (!message || typeof message !== 'string') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'È necessario fornire un messaggio valido'
      );
    }
    
    // Prepara la richiesta per OpenAI
    const messages = [
      { 
        role: "system", 
        content: "Sei un assistente medico chiamato Salus che aiuta gli utenti a gestire la loro salute. Fornisci consigli generali sulla salute, ma ricorda all'utente di consultare un medico per diagnosi o trattamenti specifici. Rispondi in italiano." 
      },
      ...conversation,
      { role: "user", content: message }
    ];
    
    // Ottieni la chiave API di OpenAI dalle variabili d'ambiente
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'Chiave API OpenAI non configurata'
      );
    }
    
    functions.logger.log('Invio richiesta a OpenAI API', { userId: context.auth.uid });
    
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
    
    functions.logger.log('Risposta ricevuta da OpenAI', { userId: context.auth.uid });
    
    // Salva la conversazione in Firestore per riferimento futuro (opzionale)
    try {
      await admin.firestore()
        .collection('users')
        .doc(context.auth.uid)
        .collection('conversations')
        .add({
          userMessage: message,
          aiResponse: responseMessage,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (dbError) {
      functions.logger.error('Errore nel salvare la conversazione in Firestore', dbError);
      // Non blocchiamo la risposta se il salvataggio fallisce
    }
    
    // Restituisci la risposta al client
    return {
      message: responseMessage,
      timestamp: Date.now()
    };
    
  } catch (error: any) {
    functions.logger.error('Errore in aiAssistant:', error);
    
    // Gestisci errori di OpenAI
    if (error.response && error.response.data) {
      throw new functions.https.HttpsError(
        'internal',
        error.response.data.error?.message || 'Errore nel servizio OpenAI',
        { details: error.response.data }
      );
    }
    
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Si è verificato un errore sconosciuto',
      { originalError: error.toString() }
    );
  }
});

/**
 * Endpoint HTTP per l'assistente AI (alternativa alla funzione callable)
 * Chiamata da: Client attraverso chiamate API REST
 */
export const aiAssistantHttp = functions.https.onRequest(async (request, response) => {
  // Abilita CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Gestisci la richiesta preflight OPTIONS
  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }
  
  // Verifica che sia una richiesta POST
  if (request.method !== 'POST') {
    response.status(405).send({ error: 'Metodo non consentito' });
    return;
  }
  
  try {
    // Estrai token di autenticazione
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      response.status(401).send({ error: 'Token di autenticazione mancante' });
      return;
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verifica il token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    
    // Estrai messaggio e conversazione
    const { messages } = request.body;
    
    if (!messages || !Array.isArray(messages)) {
      response.status(400).send({ 
        error: 'Formato richiesta non valido',
        message: 'La richiesta deve includere un array "messages"'
      });
      return;
    }
    
    // Chiave API OpenAI
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      response.status(500).send({ 
        error: 'Configurazione server non valida',
        message: 'Il server non è configurato correttamente'
      });
      return;
    }
    
    // Chiamata a OpenAI
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
    
    // Estrai la risposta
    const responseMessage = openaiResponse.data.choices[0].message.content;
    
    // Restituisci la risposta
    response.status(200).send({
      message: responseMessage,
      timestamp: Date.now()
    });
    
  } catch (error: any) {
    functions.logger.error('Errore in aiAssistantHttp:', error);
    
    if (error.code === 'auth/argument-error' || error.code === 'auth/invalid-id-token') {
      response.status(401).send({ 
        error: 'Token non valido',
        message: 'Il token di autenticazione non è valido o è scaduto'
      });
      return;
    }
    
    if (error.response) {
      // Errore da OpenAI
      response.status(error.response.status || 500).send({
        error: 'Errore OpenAI',
        message: error.response.data.error?.message || 'Errore nel servizio OpenAI'
      });
      return;
    }
    
    // Errore generico
    response.status(500).send({
      error: 'Errore interno',
      message: error.message || 'Si è verificato un errore sconosciuto'
    });
  }
}); 