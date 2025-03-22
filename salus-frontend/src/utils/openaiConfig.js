// Configurazione per l'integrazione con OpenAI API

// URL dell'API OpenAI e modello predefinito
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-3.5-turbo';

/**
 * Configurazione per l'API di OpenAI
 */
const openaiConfig = {
  /**
   * Ottiene la chiave API da localStorage o variabili d'ambiente
   * @returns {string|null} La chiave API o null se non è impostata
   */
  getApiKey: () => {
    // Prima controlla se l'utente ha inserito una chiave
    const userApiKey = localStorage.getItem('openai_api_key');
    if (userApiKey) return userApiKey;
    
    // Altrimenti usa la chiave di ambiente se disponibile
    return process.env.REACT_APP_OPENAI_API_KEY || null;
  },
  
  /**
   * Verifica se è disponibile una chiave API
   * @returns {boolean} True se la chiave API è impostata
   */
  hasApiKey: () => {
    return !!(openaiConfig.getApiKey());
  },
  
  /**
   * Salva la chiave API in localStorage
   * @param {string} apiKey - La chiave API da salvare
   */
  saveApiKey: (apiKey) => {
    localStorage.setItem('openai_api_key', apiKey);
  },
  
  // URL dell'API
  apiUrl: OPENAI_API_URL,
  
  // Modello predefinito
  model: DEFAULT_MODEL
};

export default openaiConfig; 