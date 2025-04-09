import { db, auth } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import OpenAI from 'openai';

class SalusAIAssistant {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.REACT_APP_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
    this.context = {
      userData: null,
      conversationHistory: []
    };
  }

  // Carica i dati dell'utente da Firebase
  async loadUserData() {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;

    try {
      const userData = {
        medications: await this.getUserMedications(userId),
        symptoms: await this.getUserSymptoms(userId),
        wellness: await this.getUserWellness(userId),
        appointments: await this.getUserAppointments(userId)
      };

      this.context.userData = userData;
      return userData;
    } catch (error) {
      console.error('Errore nel caricamento dei dati utente:', error);
      return null;
    }
  }

  // Genera il prompt per OpenAI basato sui dati dell'utente
  generatePrompt(userQuery) {
    const userData = this.context.userData;
    
    return `Sei Salus, un assistente virtuale per la salute. 
    Ecco i dati dell'utente:
    - Farmaci: ${JSON.stringify(userData.medications)}
    - Sintomi recenti: ${JSON.stringify(userData.symptoms)}
    - Benessere: ${JSON.stringify(userData.wellness)}
    - Appuntamenti: ${JSON.stringify(userData.appointments)}
    
    Domanda dell'utente: ${userQuery}
    
    Rispondi in modo professionale e utile, considerando i dati dell'utente.
    Se non hai informazioni sufficienti per rispondere, dillo chiaramente.
    Non dare mai consigli medici diretti, ma suggerisci di consultare un medico.`;
  }

  // Gestisce la conversazione con l'utente
  async handleUserQuery(userQuery) {
    // Carica i dati aggiornati
    await this.loadUserData();
    
    // Genera il prompt
    const prompt = this.generatePrompt(userQuery);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Sei Salus, un assistente virtuale per la salute. Rispondi sempre in italiano. Non dare mai consigli medici diretti, ma suggerisci di consultare un medico."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      // Aggiungi la conversazione alla storia
      this.context.conversationHistory.push({
        query: userQuery,
        response: response.choices[0].message.content
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Errore nella generazione della risposta:', error);
      return "Mi dispiace, si è verificato un errore. Riprova più tardi.";
    }
  }

  // Metodi per recuperare i dati da Firebase
  async getUserMedications(userId) {
    const q = query(
      collection(db, 'medications'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  async getUserSymptoms(userId) {
    const q = query(
      collection(db, 'symptoms'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  async getUserWellness(userId) {
    const q = query(
      collection(db, 'wellness'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(7)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }

  async getUserAppointments(userId) {
    const q = query(
      collection(db, 'appointments'), 
      where('userId', '==', userId),
      orderBy('date', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }
}

export const salusAI = new SalusAIAssistant(); 