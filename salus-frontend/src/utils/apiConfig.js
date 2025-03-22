// Configurazione per l'API OpenAI
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-3.5-turbo';

// Esporta le configurazioni
export const openaiConfig = {
  apiUrl: OPENAI_API_URL,
  model: OPENAI_MODEL,
  // La chiave API viene caricata dall'ambiente o dalle localStorage per sicurezza
  getApiKey: () => {
    // Prima cerca nei localStorage (impostata dall'utente)
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) return savedKey;
    
    // Fallback a variabile d'ambiente (quando disponibile)
    return process.env.REACT_APP_OPENAI_API_KEY || '';
  },
  
  // Verifica se la chiave API è impostata
  hasApiKey: () => {
    return !!localStorage.getItem('openai_api_key') || !!process.env.REACT_APP_OPENAI_API_KEY;
  },
  
  // Salva la chiave API
  saveApiKey: (key) => {
    localStorage.setItem('openai_api_key', key);
    return true;
  }
}; 