// Firebase Functions
import { functions } from './config';
import { httpsCallable } from 'firebase/functions';

/**
 * Chiama un'assistente AI tramite Firebase Functions
 * @param {string} message - Il messaggio da inviare all'assistente
 * @param {Array} conversationHistory - La storia della conversazione 
 * @returns {Promise<Object>} - La risposta dall'assistente AI
 */
export const callAIAssistant = async (message, conversationHistory = []) => {
  try {
    // Crea una funzione callable di Firebase Functions
    const callAI = httpsCallable(functions, 'aiAssistant');
    
    // Prepara i dati della richiesta
    const requestData = {
      message,
      conversation: conversationHistory
    };
    
    console.log('Chiamata a Firebase Function aiAssistant', requestData);
    
    // Chiama la funzione Firebase
    const result = await callAI(requestData);
    
    console.log('Risposta da Firebase Function ricevuta', result.data);
    
    // Restituisce i dati formattati
    return {
      response: result.data.message || result.data.response || "Non ho capito la tua richiesta, puoi riprovare?",
      offline: false
    };
  } catch (error) {
    console.error('Errore durante la chiamata a Firebase Function:', error);
    
    return {
      response: "Mi dispiace, ho riscontrato un problema nel comunicare con il servizio AI. Riprova più tardi.",
      offline: true,
      error: error.message
    };
  }
};

export default {
  callAIAssistant
}; 