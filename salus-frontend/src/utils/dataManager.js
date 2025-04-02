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
  
  // Controlla se è necessario ripristinare i dati
  if (shouldResetData()) {
    resetDemoData();
  }
  
  // Carica dati dal localStorage
  const symptoms = JSON.parse(localStorage.getItem('symptoms')) || [];
  const medications = JSON.parse(localStorage.getItem('medications')) || [];
  const wellnessData = JSON.parse(localStorage.getItem('wellnessData')) || [];
  const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
  
  // Assicurati che ci sia un'impostazione della lingua
  if (!userProfile.language) {
    userProfile.language = 'italian';
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }
  
  return {
    userId,
    symptoms,
    medications,
    wellnessData,
    userProfile,
    language: userProfile.language || 'italian',
    lastUpdate: new Date().toISOString()
  };
};

// Funzione per salvare i dati dell'utente
export const saveUserData = (userId, userData) => {
  // Qui in futuro possiamo fare una chiamata API per salvare i dati reali dell'utente
  // Per ora utilizziamo localStorage
  
  try {
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
    localStorage.setItem('userData_' + userId, JSON.stringify(userData));
    
    // Aggiorna anche l'utente corrente se l'ID corrisponde
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id === userId) {
      currentUser.language = userData.language || currentUser.language;
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