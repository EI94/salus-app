// Servizi Firestore per Salus App
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

// ----- FUNZIONI DI UTILITÀ PER CACHE LOCALE ----- //

/**
 * Aggiorna la cache locale per una collezione
 * @param {string} collectionName Nome della collezione ('symptoms' o 'medications')
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
 * @param {string} collectionName Nome della collezione ('symptoms' o 'medications')
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