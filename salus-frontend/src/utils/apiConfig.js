// Configurazione per l'API OpenAI
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-3.5-turbo';

// Chiave API di OpenAI (definita nell'ambiente)
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';

// Esporta le configurazioni
export const openaiConfig = {
  apiUrl: OPENAI_API_URL,
  model: OPENAI_MODEL,
  
  // Restituisce la chiave API configurata nel sistema
  getApiKey: () => {
    return OPENAI_API_KEY;
  },
  
  // Verifica se la chiave API è impostata
  hasApiKey: () => {
    return !!OPENAI_API_KEY;
  }
}; 