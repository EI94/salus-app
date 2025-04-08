/**
 * Utilità per verificare la configurazione della chiave API OpenAI
 * Questo file può essere importato nella console o in qualsiasi componente
 * per verificare se le chiavi API sono configurate correttamente.
 */

/**
 * Verifica se le variabili d'ambiente per OpenAI sono configurate correttamente
 * @returns {Object} - Stato delle variabili d'ambiente OpenAI
 */
export function checkOpenAIConfig() {
  console.log('Verifica configurazione OpenAI...');
  
  const configs = {
    REACT_APP_OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  };
  
  const results = {};
  
  // Controlla ogni possibile variabile d'ambiente
  Object.entries(configs).forEach(([key, value]) => {
    results[key] = {
      exists: !!value,
      valid: value?.startsWith('sk-') || false,
      length: value?.length || 0,
      hint: value ? `${value.substring(0, 5)}...${value.substring(value.length - 4)}` : null
    };
  });
  
  // Verifica complessiva
  const anyValid = Object.values(results).some(r => r.valid);
  
  console.log('Risultati verifica:');
  console.table(results);
  
  if (!anyValid) {
    console.error('ERRORE: Nessuna chiave API OpenAI valida trovata!');
    console.log('========================================================');
    console.log('ISTRUZIONI PER RISOLVERE:');
    console.log('1. In ambiente di sviluppo locale:');
    console.log('   - Crea o modifica il file .env.local');
    console.log('   - Aggiungi REACT_APP_OPENAI_API_KEY=la_tua_chiave_api');
    console.log('   - Riavvia l\'applicazione');
    console.log('2. In ambiente Vercel:');
    console.log('   - Vai su https://vercel.com e seleziona il tuo progetto');
    console.log('   - Vai su Settings > Environment Variables');
    console.log('   - Aggiungi REACT_APP_OPENAI_API_KEY=la_tua_chiave_api');
    console.log('   - Rideployare l\'applicazione');
    console.log('========================================================');
  } else {
    console.log('✓ Trovata almeno una chiave API valida.');
  }
  
  return {
    results,
    anyValid,
    bestKey: anyValid ? 
      (results.REACT_APP_OPENAI_API_KEY.valid ? configs.REACT_APP_OPENAI_API_KEY : 
       results.OPENAI_API_KEY.valid ? configs.OPENAI_API_KEY : 
       configs.NEXT_PUBLIC_OPENAI_API_KEY) 
      : null
  };
}

/**
 * Testa effettivamente la connessione all'API OpenAI
 * @returns {Promise<Object>} Risultato del test
 */
export async function testOpenAIConnection() {
  console.log('Test connessione all\'API OpenAI...');
  
  // Prima verifica se abbiamo una chiave valida
  const { anyValid, bestKey } = checkOpenAIConfig();
  
  if (!anyValid || !bestKey) {
    console.error('Impossibile testare: nessuna chiave API valida');
    return {
      success: false,
      error: 'Nessuna chiave API valida configurata'
    };
  }
  
  try {
    // Test di connessione minimo
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bestKey}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Errore nell\'API OpenAI:', errorData);
      return {
        success: false,
        status: response.status,
        error: errorData.error?.message || 'Errore API OpenAI sconosciuto'
      };
    }
    
    const data = await response.json();
    console.log('✓ Connessione all\'API OpenAI riuscita!');
    console.log(`Modelli disponibili: ${data.data.length}`);
    
    return {
      success: true,
      models: data.data.length,
      message: 'Connessione all\'API OpenAI funzionante correttamente'
    };
    
  } catch (error) {
    console.error('Errore durante il test dell\'API:', error);
    return {
      success: false,
      error: error.message || 'Errore durante la connessione all\'API'
    };
  }
}

// Esporta l'utilità per l'uso nella console
export default {
  checkOpenAIConfig,
  testOpenAIConnection
}; 