/**
 * File di test per verificare la connessione all'API OpenAI
 * Può essere usato nella console del browser per testare la configurazione
 */

import openaiConfig from './openaiConfig';

/**
 * Testa la connessione all'API OpenAI
 * @returns {Promise<Object>} Risultato del test
 */
export const testOpenAIConnection = async () => {
  console.log('Inizio test connessione OpenAI...');
  
  try {
    // Verifica la presenza di una chiave API
    const apiKey = openaiConfig.getApiKey();
    if (!apiKey) {
      return {
        success: false,
        error: 'Nessuna chiave API trovata. Imposta prima una chiave API.'
      };
    }
    
    console.log('Chiave API trovata, test in corso...');
    
    // Effettua una semplice richiesta di test
    const response = await fetch(openaiConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: openaiConfig.model,
        messages: [
          { role: 'system', content: 'Sei un assistente di test.' },
          { role: 'user', content: 'Rispondi solamente con "Test riuscito!"' }
        ],
        temperature: 0.5,
        max_tokens: 50
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        status: response.status,
        statusText: response.statusText,
        error: errorData.error?.message || 'Errore API OpenAI',
        raw: errorData
      };
    }
    
    const data = await response.json();
    return {
      success: true,
      model: data.model,
      response: data.choices[0].message.content,
      usage: data.usage
    };
    
  } catch (error) {
    console.error('Errore durante il test:', error);
    return {
      success: false,
      error: error.message || 'Errore durante la connessione all\'API',
      stack: error.stack
    };
  }
};

// Funzioni utili per la console

/**
 * Imposta una nuova chiave API (da usare nella console)
 * @param {string} apiKey - La chiave API da salvare
 */
export const setTestApiKey = (apiKey) => {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.startsWith('sk-')) {
    console.error('Chiave API non valida. Deve iniziare con "sk-"');
    return false;
  }
  
  openaiConfig.saveApiKey(apiKey);
  console.log('Chiave API salvata con successo!');
  return true;
};

/**
 * Ottieni la chiave API attuale (da usare nella console)
 * @returns {string|null} Chiave API o null
 */
export const getTestApiKey = () => {
  const key = openaiConfig.getApiKey();
  if (!key) {
    console.log('Nessuna chiave API configurata');
    return null;
  }
  
  // Mostra solo gli ultimi 4 caratteri per sicurezza
  const hiddenKey = `sk-...${key.slice(-4)}`;
  console.log('Chiave API configurata:', hiddenKey);
  return hiddenKey;
};

/**
 * Esempio di utilizzo nella console:
 * 
 * import { testOpenAIConnection, setTestApiKey, getTestApiKey } from './utils/openaiTest';
 * 
 * // Imposta una chiave API per il test
 * setTestApiKey('sk-your-api-key');
 * 
 * // Verifica la chiave configurata
 * getTestApiKey();
 * 
 * // Testa la connessione
 * testOpenAIConnection().then(result => console.log(result));
 */

export default {
  testOpenAIConnection,
  setTestApiKey,
  getTestApiKey
}; 