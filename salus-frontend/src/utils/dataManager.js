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
  
  // Assicurati che l'impostazione della lingua venga salvata
  if (userData.language) {
    // Salva le preferenze di lingua nel localStorage
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};
    userProfile.language = userData.language;
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    
    // Aggiorna eventuali altre impostazioni dell'utente
    localStorage.setItem('userData_' + userId, JSON.stringify(userData));
  }
  
  return {
    success: true,
    message: 'Dati utente salvati con successo',
    lastUpdate: new Date().toISOString()
  };
}; 