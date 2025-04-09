/**
 * Utilità per la gestione dei dati dell'applicazione
 */

// Funzione per determinare se è necessario ripristinare i dati
export const shouldResetData = () => {
  const resetData = localStorage.getItem('resetData');
  if (resetData === 'true') {
    // Rimuove il flag dopo averlo controllato
    localStorage.removeItem('resetData');
    return true;
  }
  return false;
};

// Funzione per ripristinare i dati demo e inizializzare dati vuoti
export const resetDemoData = () => {
  // Rimuove tutti i dati demo
  localStorage.removeItem('symptoms');
  localStorage.removeItem('medications');
  localStorage.removeItem('wellnessData');
  localStorage.removeItem('userProfile');
  localStorage.removeItem('recentConsultations');
  
  // Inizializza dati vuoti
  localStorage.setItem('symptoms', JSON.stringify([]));
  localStorage.setItem('medications', JSON.stringify([]));
  localStorage.setItem('wellnessData', JSON.stringify([]));
  
  // Salva un profilo base per l'utente
  const emptyProfile = {
    name: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    allergies: [],
    conditions: [],
    emergencyContact: {
      name: '',
      phone: ''
    },
    language: 'italian', // Impostazione predefinita della lingua
    lastUpdate: new Date().toISOString()
  };
  
  localStorage.setItem('userProfile', JSON.stringify(emptyProfile));
  
  console.log('Dati dimostrativi rimossi. Inizializzati dati vuoti per un nuovo utente.');
  return true;
};

// Funzione per caricare i dati dell'utente
export const loadUserData = (userId) => {
  // Qui in futuro possiamo fare una chiamata API per caricare i dati reali dell'utente
  // Per ora utilizziamo localStorage
  
  try {
    console.log('Caricando dati utente per ID:', userId);
    
    // Controlla se è necessario ripristinare i dati
    if (shouldResetData()) {
      resetDemoData();
    }
    
    // Prima verifica se esistono dati specifici dell'utente
    const userSpecificData = localStorage.getItem('userData_' + userId);
    if (userSpecificData) {
      console.log('Trovati dati specifici per utente:', userId);
      // Abbiamo dati specifici per questo utente
      return JSON.parse(userSpecificData);
    }
    
    console.log('Nessun dato specifico trovato, caricando dati generici');
    
    // Se non esistono dati specifici, carica i dati generici (legacy)
    const symptoms = JSON.parse(localStorage.getItem('symptoms')) || [];
    const medications = JSON.parse(localStorage.getItem('medications')) || [];
    const wellnessData = JSON.parse(localStorage.getItem('wellnessData')) || [];
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    
    // Assicurati che ci sia un'impostazione della lingua
    if (!userProfile.language) {
      userProfile.language = 'italian';
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }
    
    // Crea un oggetto che rappresenta i dati dell'utente
    const userData = {
      userId,
      symptoms,
      medications,
      wellnessData,
      userProfile,
      language: userProfile.language || 'italian',
      lastUpdate: new Date().toISOString()
    };
    
    // Salva questi dati anche come specifici dell'utente per uso futuro
    localStorage.setItem('userData_' + userId, JSON.stringify(userData));
    console.log('Salvati dati generici come specifici per utente:', userId);
    
    return userData;
  } catch (error) {
    console.error('Errore nel caricamento dei dati utente:', error);
    return {
      userId,
      error: error.message,
      lastUpdate: new Date().toISOString()
    };
  }
};

// Funzione per salvare i dati dell'utente
export const saveUserData = (userId, userData) => {
  // Qui in futuro possiamo fare una chiamata API per salvare i dati reali dell'utente
  // Per ora utilizziamo localStorage
  
  try {
    console.log('Salvando dati utente:', userData);
    
    // Salva le preferenze di lingua nell'app
    if (userData.language) {
      // Salva la lingua nelle impostazioni generali dell'app
      localStorage.setItem('userLanguage', userData.language);
      localStorage.setItem('preferredLanguage', userData.language);
      
      // Se disponibile, importa e utilizza il modulo i18n per aggiornare la lingua in tempo reale
      try {
        // Utilizziamo import dinamico per evitare dipendenze circolari
        import('../i18n').then(({ changeLanguage }) => {
          changeLanguage(userData.language);
        }).catch(err => {
          console.error('Impossibile importare il modulo i18n:', err);
        });
      } catch (e) {
        console.warn('Modulo i18n non disponibile per il cambio lingua:', e);
      }
    }
    
    // Salva tutti i dati dell'utente nel localStorage
    const existingData = localStorage.getItem('userData_' + userId);
    let mergedData = userData;
    
    if (existingData) {
      try {
        // Combina i dati esistenti con i nuovi dati
        const parsedExistingData = JSON.parse(existingData);
        mergedData = {
          ...parsedExistingData,
          ...userData
        };
      } catch (parseError) {
        console.warn('Errore parsing dati esistenti, sovrascrivendo:', parseError);
      }
    }
    
    // Assicuriamoci che tutti i campi del profilo siano salvati
    localStorage.setItem('userData_' + userId, JSON.stringify(mergedData));
    
    // Debug - verifica cosa è stato effettivamente salvato
    const savedData = localStorage.getItem('userData_' + userId);
    console.log('Dati salvati in localStorage:', JSON.parse(savedData));
    
    // Aggiorna anche l'utente corrente se l'ID corrisponde
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id === userId) {
      // Aggiorna solo i campi appropriati dell'utente corrente
      if (userData.name) currentUser.name = userData.name;
      if (userData.email) currentUser.email = userData.email;
      if (userData.language) currentUser.language = userData.language;
      
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    return {
      success: true,
      message: 'Dati utente salvati con successo',
      lastUpdate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Errore nel salvare i dati utente:', error);
    return {
      success: false,
      message: 'Errore nel salvare i dati: ' + error.message,
      lastUpdate: null
    };
  }
}; 