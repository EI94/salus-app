// Configurazione per l'integrazione con OpenAI API

// URL dell'API OpenAI e modello predefinito
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-3.5-turbo';

// Chiave API di OpenAI centralizzata - caricata da variabile d'ambiente
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

/**
 * Configurazione per l'API di OpenAI
 */
const openaiConfig = {
  /**
   * Ottiene la chiave API configurata nel sistema
   * @returns {string} La chiave API 
   */
  getApiKey: () => {
    return OPENAI_API_KEY;
  },
  
  /**
   * Verifica se è disponibile una chiave API
   * @returns {boolean} True se la chiave API è impostata
   */
  hasApiKey: () => {
    return !!OPENAI_API_KEY;
  },
  
  // URL dell'API
  apiUrl: OPENAI_API_URL,
  
  // Modello predefinito
  model: DEFAULT_MODEL
};

export default openaiConfig; 