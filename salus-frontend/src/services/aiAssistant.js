import { db, auth } from '../firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
// import OpenAI from 'openai';

class SalusAIAssistant {
  constructor() {
    this.openai = null;
    // Non creare l'istanza OpenAI se non c'è la chiave API
    // this.openai = new OpenAI({
    //   apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    //   dangerouslyAllowBrowser: true
    // });
    
    this.context = {
      userData: null,
      conversationHistory: []
    };
    
    // Log per debug
    console.log('SalusAIAssistant inizializzato');
    // console.log('OpenAI API Key disponibile:', !!process.env.REACT_APP_OPENAI_API_KEY);
  }

  // Carica i dati dell'utente da Firebase
  async loadUserData() {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        console.log('Nessun utente autenticato per caricare i dati.');
        return null;
      }

      console.log('Caricamento dati utente per ID:', userId);

      const userData = {
        medications: await this.getUserMedications(userId),
        symptoms: await this.getUserSymptoms(userId),
        wellness: await this.getUserWellness(userId),
        appointments: await this.getUserAppointments(userId)
      };

      console.log('Dati utente caricati con successo:', userData);
      this.context.userData = userData;
      return userData;
    } catch (error) {
      console.error('Errore nel caricamento dei dati utente:', error);
      return null;
    }
  }

  // Genera il prompt per OpenAI basato sui dati dell'utente
  generatePrompt(userQuery) {
    try {
      const userData = this.context.userData;
      if (!userData) {
        return `Domanda dell'utente: ${userQuery}\nRispondi in modo professionale, ma non hai accesso ai dati dell'utente.`;
      }
      
      return `Sei Salus, un assistente virtuale per la salute. 
      Ecco i dati dell'utente:
      - Farmaci: ${JSON.stringify(userData.medications || [])}
      - Sintomi recenti: ${JSON.stringify(userData.symptoms || [])}
      - Benessere: ${JSON.stringify(userData.wellness || [])}
      - Appuntamenti: ${JSON.stringify(userData.appointments || [])}
      
      Domanda dell'utente: ${userQuery}
      
      Rispondi in modo professionale e utile, considerando i dati dell'utente.
      Se non hai informazioni sufficienti per rispondere, dillo chiaramente.
      Non dare mai consigli medici diretti, ma suggerisci di consultare un medico.`;
    } catch (error) {
      console.error('Errore nella generazione del prompt:', error);
      return `Domanda dell'utente: ${userQuery}\nRispondi in modo professionale.`;
    }
  }

  // Crea una risposta simulata quando OpenAI non è disponibile
  createSimulatedResponse(userQuery) {
    const commonResponses = [
      "Comprendo la tua domanda. Basandomi sui dati disponibili, ti suggerisco di consultare il tuo medico per un parere professionale su questo argomento.",
      "Grazie per la tua domanda. Non posso fornire consigli medici specifici, ma posso aiutarti a monitorare i tuoi sintomi e farmaci attraverso l'app Salus.",
      "Interessante domanda. L'app Salus ti permette di tenere traccia dei tuoi dati sanitari, ma per una valutazione medica accurata, ti consiglio di parlare con uno specialista.",
      "Ho notato dai tuoi dati che stai monitorando diversi aspetti della tua salute. Continua così e ricorda di consultare regolarmente il tuo medico.",
      "La tua salute è importante. Salus ti aiuta a tenere traccia dei tuoi dati, ma ricorda che questa app non sostituisce il parere di un professionista sanitario."
    ];
    
    // Semplice logica per selezionare una risposta basata sulla query
    let responseIndex = 0;
    
    if (userQuery.toLowerCase().includes("farmac") || userQuery.toLowerCase().includes("medicin")) {
      responseIndex = 0;
    } else if (userQuery.toLowerCase().includes("sintom") || userQuery.toLowerCase().includes("dolor")) {
      responseIndex = 1;
    } else if (userQuery.toLowerCase().includes("consig") || userQuery.toLowerCase().includes("aiut")) {
      responseIndex = 2;
    } else if (userQuery.toLowerCase().includes("dat") || userQuery.toLowerCase().includes("monitor")) {
      responseIndex = 3;
    } else {
      responseIndex = 4;
    }
    
    return commonResponses[responseIndex];
  }

  // Gestisce la conversazione con l'utente
  async handleUserQuery(userQuery) {
    console.log('Gestione query utente:', userQuery);
    
    // Carica i dati aggiornati
    await this.loadUserData();
    
    // Verifica se OpenAI è disponibile
    if (!process.env.REACT_APP_OPENAI_API_KEY) {
      console.log('OpenAI API Key non disponibile, generando risposta simulata');
      return this.createSimulatedResponse(userQuery);
    }
    
    // Inizializza OpenAI se non è già stato fatto
    if (!this.openai) {
      try {
        const OpenAI = (await import('openai')).default;
        this.openai = new OpenAI({
          apiKey: process.env.REACT_APP_OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        });
      } catch (error) {
        console.error('Errore nell\'inizializzazione di OpenAI:', error);
        return this.createSimulatedResponse(userQuery);
      }
    }
    
    // Genera il prompt
    const prompt = this.generatePrompt(userQuery);
    
    try {
      console.log('Invio richiesta a OpenAI');
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

      console.log('Risposta ricevuta da OpenAI');
      
      // Aggiungi la conversazione alla storia
      this.context.conversationHistory.push({
        query: userQuery,
        response: response.choices[0].message.content
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Errore nella generazione della risposta:', error);
      return this.createSimulatedResponse(userQuery);
    }
  }

  // Metodi per recuperare i dati da Firebase
  async getUserMedications(userId) {
    try {
      const q = query(
        collection(db, 'medications'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Errore nel recupero dei farmaci:', error);
      return [];
    }
  }

  async getUserSymptoms(userId) {
    try {
      const q = query(
        collection(db, 'symptoms'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Errore nel recupero dei sintomi:', error);
      return [];
    }
  }

  async getUserWellness(userId) {
    try {
      const q = query(
        collection(db, 'wellness'), 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(7)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Errore nel recupero del benessere:', error);
      return [];
    }
  }

  async getUserAppointments(userId) {
    try {
      const q = query(
        collection(db, 'appointments'), 
        where('userId', '==', userId),
        orderBy('date', 'asc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data());
    } catch (error) {
      console.error('Errore nel recupero degli appuntamenti:', error);
      return [];
    }
  }
}

export const salusAI = new SalusAIAssistant(); 