// Servizi Firestore per Salus App
// NOTA: Questo file esporta le seguenti funzioni per la gestione degli appuntamenti:
// - loadUserAppointments
// - addAppointment
// - updateAppointment
// - deleteAppointment
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from './config';
import { localStorageService } from '../api';

// ----- SINTOMI ----- //

/**
 * Carica tutti i sintomi dell'utente corrente
 * @returns {Promise<Array>} Lista dei sintomi
 */
export const loadUserSymptoms = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    const userId = currentUser.uid;
    console.log('Caricamento sintomi per utente:', userId);

    const symptomsQuery = query(
      collection(db, 'symptoms'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(symptomsQuery);
    const symptoms = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Caricati ${symptoms.length} sintomi da Firestore`);
    
    // Salva anche in localStorage come cache
    localStorageService.setItem('symptoms', JSON.stringify(symptoms));
    
    return symptoms;
  } catch (error) {
    console.error('Errore nel caricamento dei sintomi da Firestore:', error);
    
    // Fallback a localStorage
    try {
      const localData = localStorageService.getItem('symptoms');
      if (localData) {
        console.log('Usando sintomi da localStorage (fallback)');
        return JSON.parse(localData);
      }
    } catch (localError) {
      console.error('Errore nella lettura da localStorage:', localError);
    }
    
    // Se tutto fallisce, ritorna array vuoto
    return [];
  }
};

/**
 * Aggiunge un nuovo sintomo
 * @param {Object} symptomData Dati del sintomo da aggiungere
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const addSymptom = async (symptomData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    const userId = currentUser.uid;
    
    // Dati da salvare
    const symptomToAdd = {
      ...symptomData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Salva su Firestore
    const docRef = await addDoc(collection(db, 'symptoms'), symptomToAdd);
    console.log('Sintomo aggiunto con ID:', docRef.id);
    
    // Aggiorna la cache locale
    updateLocalCache('symptoms', {
      id: docRef.id,
      ...symptomToAdd,
      createdAt: new Date().toISOString(), // Per localStorage usiamo una data stringa
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      id: docRef.id,
      data: { ...symptomToAdd, id: docRef.id }
    };
  } catch (error) {
    console.error('Errore nell\'aggiunta del sintomo su Firestore:', error);
    
    // Fallback a localStorage
    try {
      const id = Date.now().toString();
      const symptomToSave = {
        ...symptomData,
        id,
        userId: auth.currentUser?.uid || 'offline-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLocalOnly: true // Flag per indicare che il dato è solo locale
      };
      
      updateLocalCache('symptoms', symptomToSave);
      console.log('Sintomo salvato in localStorage (modalità offline)');
      
      return {
        success: true,
        id,
        data: symptomToSave,
        isLocalOnly: true
      };
    } catch (localError) {
      console.error('Errore nel salvataggio locale del sintomo:', localError);
      return {
        success: false,
        error: 'Impossibile salvare il sintomo: ' + error.message
      };
    }
  }
};

/**
 * Elimina un sintomo
 * @param {string} symptomId ID del sintomo da eliminare
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const deleteSymptom = async (symptomId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    await deleteDoc(doc(db, 'symptoms', symptomId));
    console.log('Sintomo eliminato con ID:', symptomId);
    
    // Rimuovi anche dalla cache locale
    removeFromLocalCache('symptoms', symptomId);
    
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'eliminazione del sintomo da Firestore:', error);
    
    // Se offline, rimuovi solo dalla cache locale
    try {
      removeFromLocalCache('symptoms', symptomId);
      console.log('Sintomo rimosso da localStorage (modalità offline)');
      return { success: true, isLocalOnly: true };
    } catch (localError) {
      console.error('Errore nella rimozione locale del sintomo:', localError);
      return {
        success: false,
        error: 'Impossibile eliminare il sintomo: ' + error.message
      };
    }
  }
};

// ----- FARMACI ----- //

/**
 * Carica tutti i farmaci dell'utente corrente
 * @returns {Promise<Array>} Lista dei farmaci
 */
export const loadUserMedications = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    const userId = currentUser.uid;
    console.log('Caricamento farmaci per utente:', userId);

    const medicationsQuery = query(
      collection(db, 'medications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(medicationsQuery);
    const medications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Caricati ${medications.length} farmaci da Firestore`);
    
    // Salva anche in localStorage come cache
    localStorageService.setItem('medications', JSON.stringify(medications));
    
    return medications;
  } catch (error) {
    console.error('Errore nel caricamento dei farmaci da Firestore:', error);
    
    // Fallback a localStorage
    try {
      const localData = localStorageService.getItem('medications');
      if (localData) {
        console.log('Usando farmaci da localStorage (fallback)');
        return JSON.parse(localData);
      }
    } catch (localError) {
      console.error('Errore nella lettura da localStorage:', localError);
    }
    
    // Se tutto fallisce, ritorna array vuoto
    return [];
  }
};

/**
 * Aggiunge un nuovo farmaco
 * @param {Object} medicationData Dati del farmaco da aggiungere
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const addMedication = async (medicationData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    const userId = currentUser.uid;
    
    // Dati da salvare
    const medicationToAdd = {
      ...medicationData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Salva su Firestore
    const docRef = await addDoc(collection(db, 'medications'), medicationToAdd);
    console.log('Farmaco aggiunto con ID:', docRef.id);
    
    // Aggiorna la cache locale
    updateLocalCache('medications', {
      id: docRef.id,
      ...medicationToAdd,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      id: docRef.id,
      data: { ...medicationToAdd, id: docRef.id }
    };
  } catch (error) {
    console.error('Errore nell\'aggiunta del farmaco su Firestore:', error);
    
    // Fallback a localStorage
    try {
      const id = Date.now().toString();
      const medicationToSave = {
        ...medicationData,
        id,
        userId: auth.currentUser?.uid || 'offline-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isLocalOnly: true
      };
      
      updateLocalCache('medications', medicationToSave);
      console.log('Farmaco salvato in localStorage (modalità offline)');
      
      return {
        success: true,
        id,
        data: medicationToSave,
        isLocalOnly: true
      };
    } catch (localError) {
      console.error('Errore nel salvataggio locale del farmaco:', localError);
      return {
        success: false,
        error: 'Impossibile salvare il farmaco: ' + error.message
      };
    }
  }
};

/**
 * Elimina un farmaco
 * @param {string} medicationId ID del farmaco da eliminare
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const deleteMedication = async (medicationId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    await deleteDoc(doc(db, 'medications', medicationId));
    console.log('Farmaco eliminato con ID:', medicationId);
    
    // Rimuovi anche dalla cache locale
    removeFromLocalCache('medications', medicationId);
    
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'eliminazione del farmaco da Firestore:', error);
    
    // Se offline, rimuovi solo dalla cache locale
    try {
      removeFromLocalCache('medications', medicationId);
      console.log('Farmaco rimosso da localStorage (modalità offline)');
      return { success: true, isLocalOnly: true };
    } catch (localError) {
      console.error('Errore nella rimozione locale del farmaco:', localError);
      return {
        success: false,
        error: 'Impossibile eliminare il farmaco: ' + error.message
      };
    }
  }
};

// ----- PROMEMORIA FARMACI ----- //

/**
 * Carica tutti i promemoria dell'utente corrente
 * @returns {Promise<Array>} Lista dei promemoria
 */
export const loadUserReminders = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    const userId = currentUser.uid;
    console.log('Caricamento promemoria per utente:', userId);

    const remindersQuery = query(
      collection(db, 'reminders'),
      where('userId', '==', userId),
      orderBy('nextDueDate', 'asc')
    );

    const querySnapshot = await getDocs(remindersQuery);
    const reminders = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Caricati ${reminders.length} promemoria da Firestore`);
    
    // Salva anche in localStorage come cache
    localStorageService.setItem('reminders', JSON.stringify(reminders));
    
    return reminders;
  } catch (error) {
    console.error('Errore nel caricamento dei promemoria da Firestore:', error);
    
    // Fallback a localStorage
    try {
      const localData = localStorageService.getItem('reminders');
      if (localData) {
        console.log('Usando promemoria da localStorage (fallback)');
        return JSON.parse(localData);
      }
    } catch (localError) {
      console.error('Errore nella lettura da localStorage:', localError);
    }
    
    return [];
  }
};

/**
 * Aggiunge un nuovo promemoria per un farmaco
 * @param {Object} reminderData Dati del promemoria da aggiungere
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const addReminder = async (reminderData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    const userId = currentUser.uid;
    
    // Calcola la prossima data di assunzione
    const nextDueDate = calculateNextDueDate(reminderData);
    
    // Dati da salvare
    const reminderToAdd = {
      ...reminderData,
      userId,
      nextDueDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'active'
    };
    
    // Salva su Firestore
    const docRef = await addDoc(collection(db, 'reminders'), reminderToAdd);
    console.log('Promemoria aggiunto con ID:', docRef.id);
    
    // Aggiorna la cache locale
    updateLocalCache('reminders', {
      id: docRef.id,
      ...reminderToAdd,
      nextDueDate: nextDueDate.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      id: docRef.id,
      data: { ...reminderToAdd, id: docRef.id }
    };
  } catch (error) {
    console.error('Errore nell\'aggiunta del promemoria su Firestore:', error);
    
    // Fallback a localStorage
    try {
      const id = Date.now().toString();
      const nextDueDate = calculateNextDueDate(reminderData);
      
      const reminderToSave = {
        ...reminderData,
        id,
        userId: auth.currentUser?.uid || 'offline-user',
        nextDueDate: nextDueDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        isLocalOnly: true
      };
      
      updateLocalCache('reminders', reminderToSave);
      console.log('Promemoria salvato in localStorage (modalità offline)');
      
      return {
        success: true,
        id,
        data: reminderToSave,
        isLocalOnly: true
      };
    } catch (localError) {
      console.error('Errore nel salvataggio locale del promemoria:', localError);
      return {
        success: false,
        error: 'Impossibile salvare il promemoria: ' + error.message
      };
    }
  }
};

/**
 * Aggiorna lo stato di un promemoria (completato, saltato, ecc.)
 * @param {string} reminderId ID del promemoria
 * @param {string} status Nuovo stato ('completed', 'skipped', 'active')
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const updateReminderStatus = async (reminderId, status) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    // Ottieni il promemoria attuale
    const reminderRef = doc(db, 'reminders', reminderId);
    const reminderSnap = await getDoc(reminderRef);
    
    if (!reminderSnap.exists()) {
      throw new Error('Promemoria non trovato');
    }
    
    const reminderData = reminderSnap.data();
    
    // Calcola la prossima data di assunzione se completato
    let updates = { status, updatedAt: serverTimestamp() };
    
    if (status === 'completed') {
      // Aggiorna la cronologia delle assunzioni
      const history = reminderData.history || [];
      history.push({
        date: new Date().toISOString(),
        status: 'completed'
      });
      
      // Calcola la prossima data di assunzione
      const nextDueDate = calculateNextDueDate(reminderData);
      
      updates = {
        ...updates,
        history,
        nextDueDate,
        status: 'active' // Reimposta lo stato a active dopo aver completato
      };
    }
    
    // Aggiorna il documento
    await updateDoc(reminderRef, updates);
    console.log('Promemoria aggiornato con ID:', reminderId);
    
    // Aggiorna la cache locale
    const localData = localStorageService.getItem('reminders');
    if (localData) {
      try {
        const reminders = JSON.parse(localData);
        const updatedReminders = reminders.map(r => {
          if (r.id === reminderId) {
            return {
              ...r,
              ...updates,
              updatedAt: new Date().toISOString()
            };
          }
          return r;
        });
        
        localStorageService.setItem('reminders', JSON.stringify(updatedReminders));
      } catch (e) {
        console.error('Errore nell\'aggiornamento locale del promemoria:', e);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'aggiornamento del promemoria:', error);
    return {
      success: false,
      error: 'Impossibile aggiornare il promemoria: ' + error.message
    };
  }
};

/**
 * Elimina un promemoria
 * @param {string} reminderId ID del promemoria da eliminare
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const deleteReminder = async (reminderId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    await deleteDoc(doc(db, 'reminders', reminderId));
    console.log('Promemoria eliminato con ID:', reminderId);
    
    // Rimuovi anche dalla cache locale
    removeFromLocalCache('reminders', reminderId);
    
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'eliminazione del promemoria da Firestore:', error);
    
    // Se offline, rimuovi solo dalla cache locale
    try {
      removeFromLocalCache('reminders', reminderId);
      console.log('Promemoria rimosso da localStorage (modalità offline)');
      return { success: true, isLocalOnly: true };
    } catch (localError) {
      console.error('Errore nella rimozione locale del promemoria:', localError);
      return {
        success: false,
        error: 'Impossibile eliminare il promemoria: ' + error.message
      };
    }
  }
};

// ----- APPUNTAMENTI MEDICI ----- //

/**
 * Carica tutti gli appuntamenti medici dell'utente corrente
 * @returns {Promise<Array>} Lista degli appuntamenti
 */
export const loadUserAppointments = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    const userId = currentUser.uid;
    console.log('Caricamento appuntamenti per utente:', userId);

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('userId', '==', userId),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(appointmentsQuery);
    const appointments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`Caricati ${appointments.length} appuntamenti da Firestore`);
    
    // Salva anche in localStorage come cache
    localStorageService.setItem('appointments', JSON.stringify(appointments));
    
    return appointments;
  } catch (error) {
    console.error('Errore nel caricamento degli appuntamenti da Firestore:', error);
    
    // Fallback a localStorage
    try {
      const localData = localStorageService.getItem('appointments');
      if (localData) {
        console.log('Usando appuntamenti da localStorage (fallback)');
        return JSON.parse(localData);
      }
    } catch (localError) {
      console.error('Errore nella lettura da localStorage:', localError);
    }
    
    return [];
  }
};

/**
 * Aggiunge un nuovo appuntamento medico
 * @param {Object} appointmentData Dati dell'appuntamento da aggiungere
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const addAppointment = async (appointmentData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }

    const userId = currentUser.uid;
    
    // Dati da salvare
    const appointmentToAdd = {
      ...appointmentData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'scheduled'
    };
    
    // Salva su Firestore
    const docRef = await addDoc(collection(db, 'appointments'), appointmentToAdd);
    console.log('Appuntamento aggiunto con ID:', docRef.id);
    
    // Aggiorna la cache locale
    updateLocalCache('appointments', {
      id: docRef.id,
      ...appointmentToAdd,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    return {
      success: true,
      id: docRef.id,
      data: { ...appointmentToAdd, id: docRef.id }
    };
  } catch (error) {
    console.error('Errore nell\'aggiunta dell\'appuntamento su Firestore:', error);
    
    // Fallback a localStorage
    try {
      const id = Date.now().toString();
      const appointmentToSave = {
        ...appointmentData,
        id,
        userId: auth.currentUser?.uid || 'offline-user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'scheduled',
        isLocalOnly: true
      };
      
      updateLocalCache('appointments', appointmentToSave);
      console.log('Appuntamento salvato in localStorage (modalità offline)');
      
      return {
        success: true,
        id,
        data: appointmentToSave,
        isLocalOnly: true
      };
    } catch (localError) {
      console.error('Errore nel salvataggio locale dell\'appuntamento:', localError);
      return {
        success: false,
        error: 'Impossibile salvare l\'appuntamento: ' + error.message
      };
    }
  }
};

/**
 * Aggiorna un appuntamento medico
 * @param {string} appointmentId ID dell'appuntamento
 * @param {Object} appointmentData Nuovi dati dell'appuntamento
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    const appointmentRef = doc(db, 'appointments', appointmentId);
    
    // Dati da aggiornare
    const updates = {
      ...appointmentData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(appointmentRef, updates);
    console.log('Appuntamento aggiornato con ID:', appointmentId);
    
    // Aggiorna la cache locale
    const localData = localStorageService.getItem('appointments');
    if (localData) {
      try {
        const appointments = JSON.parse(localData);
        const updatedAppointments = appointments.map(a => {
          if (a.id === appointmentId) {
            return {
              ...a,
              ...updates,
              updatedAt: new Date().toISOString()
            };
          }
          return a;
        });
        
        localStorageService.setItem('appointments', JSON.stringify(updatedAppointments));
      } catch (e) {
        console.error('Errore nell\'aggiornamento locale dell\'appuntamento:', e);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'aggiornamento dell\'appuntamento:', error);
    return {
      success: false,
      error: 'Impossibile aggiornare l\'appuntamento: ' + error.message
    };
  }
};

/**
 * Elimina un appuntamento medico
 * @param {string} appointmentId ID dell'appuntamento da eliminare
 * @returns {Promise<Object>} Risultato dell'operazione
 */
export const deleteAppointment = async (appointmentId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('Utente non autenticato');
    }
    
    await deleteDoc(doc(db, 'appointments', appointmentId));
    console.log('Appuntamento eliminato con ID:', appointmentId);
    
    // Rimuovi anche dalla cache locale
    removeFromLocalCache('appointments', appointmentId);
    
    return { success: true };
  } catch (error) {
    console.error('Errore nell\'eliminazione dell\'appuntamento da Firestore:', error);
    
    // Se offline, rimuovi solo dalla cache locale
    try {
      removeFromLocalCache('appointments', appointmentId);
      console.log('Appuntamento rimosso da localStorage (modalità offline)');
      return { success: true, isLocalOnly: true };
    } catch (localError) {
      console.error('Errore nella rimozione locale dell\'appuntamento:', localError);
      return {
        success: false,
        error: 'Impossibile eliminare l\'appuntamento: ' + error.message
      };
    }
  }
};

// ----- ANALISI DATI E CORRELAZIONI ----- //

/**
 * Analizza correlazioni tra sintomi e farmaci
 * @returns {Promise<Array>} Risultati dell'analisi
 */
export const analyzeSymptomMedicationCorrelations = async () => {
  try {
    // Carica sintomi e farmaci
    const symptoms = await loadUserSymptoms();
    const medications = await loadUserMedications();
    
    // Semplice algoritmo di correlazione temporale
    const correlations = [];
    
    // Per ogni sintomo, trova farmaci assunti poco prima
    symptoms.forEach(symptom => {
      const symptomDate = new Date(symptom.createdAt);
      
      // Cerca farmaci assunti nelle 24 ore precedenti
      const relatedMeds = medications.filter(med => {
        const medDate = new Date(med.createdAt);
        const hoursDiff = (symptomDate - medDate) / (1000 * 60 * 60);
        // Considera solo farmaci assunti da 0 a 24 ore prima del sintomo
        return hoursDiff >= 0 && hoursDiff <= 24;
      });
      
      if (relatedMeds.length > 0) {
        correlations.push({
          symptom,
          medications: relatedMeds,
          type: 'possible_side_effect'
        });
      }
    });
    
    // Salva i risultati in localStorage per accesso rapido
    localStorageService.setItem('correlations', JSON.stringify(correlations));
    
    return correlations;
  } catch (error) {
    console.error('Errore nell\'analisi delle correlazioni:', error);
    return [];
  }
};

// ----- FUNZIONI DI UTILITÀ PER CACHE LOCALE ----- //

/**
 * Aggiorna la cache locale per una collezione
 * @param {string} collectionName Nome della collezione
 * @param {Object} newItem Nuovo elemento da aggiungere
 */
const updateLocalCache = (collectionName, newItem) => {
  try {
    // Ottieni i dati attuali
    const localData = localStorageService.getItem(collectionName);
    let items = [];
    
    if (localData) {
      try {
        items = JSON.parse(localData);
        if (!Array.isArray(items)) items = [];
      } catch (e) {
        console.error(`Errore parsing localStorage per ${collectionName}:`, e);
        items = [];
      }
    }
    
    // Aggiungi il nuovo elemento all'inizio dell'array
    items = [newItem, ...items.filter(item => item.id !== newItem.id)];
    
    // Salva i dati aggiornati
    localStorageService.setItem(collectionName, JSON.stringify(items));
  } catch (error) {
    console.error(`Errore nell'aggiornamento della cache per ${collectionName}:`, error);
  }
};

/**
 * Rimuove un elemento dalla cache locale
 * @param {string} collectionName Nome della collezione
 * @param {string} itemId ID dell'elemento da rimuovere
 */
const removeFromLocalCache = (collectionName, itemId) => {
  try {
    // Ottieni i dati attuali
    const localData = localStorageService.getItem(collectionName);
    if (!localData) return;
    
    let items = [];
    try {
      items = JSON.parse(localData);
      if (!Array.isArray(items)) return;
    } catch (e) {
      console.error(`Errore parsing localStorage per ${collectionName}:`, e);
      return;
    }
    
    // Rimuovi l'elemento dall'array
    items = items.filter(item => item.id !== itemId);
    
    // Salva i dati aggiornati
    localStorageService.setItem(collectionName, JSON.stringify(items));
  } catch (error) {
    console.error(`Errore nella rimozione dalla cache per ${collectionName}:`, error);
  }
};

/**
 * Calcola la prossima data di assunzione del farmaco in base alla frequenza
 * @param {Object} reminderData Dati del promemoria
 * @returns {Date} La prossima data di assunzione
 */
const calculateNextDueDate = (reminderData) => {
  const { frequency, time } = reminderData;
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  
  // Imposta l'ora specificata per oggi
  const nextDate = new Date(now);
  nextDate.setHours(hours, minutes, 0, 0);
  
  // Se l'ora è già passata, calcola per domani
  if (nextDate < now) {
    nextDate.setDate(nextDate.getDate() + 1);
  }
  
  // Aggiusta in base alla frequenza
  switch(frequency) {
    case 'daily':
      // Già impostato per oggi/domani
      break;
    case 'weekly':
      const targetDay = reminderData.dayOfWeek || 0; // 0-6, domenica-sabato
      while (nextDate.getDay() !== targetDay) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
      break;
    case 'monthly':
      const targetDate = reminderData.dayOfMonth || 1; // 1-31
      nextDate.setDate(targetDate);
      if (nextDate < now) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      break;
    case 'custom':
      // Aggiunge il numero specificato di ore
      const hoursToAdd = reminderData.intervalHours || 24;
      nextDate.setTime(now.getTime() + hoursToAdd * 60 * 60 * 1000);
      break;
    default:
      // Impostazione predefinita: giornaliera
      break;
  }
  
  return nextDate;
}; 