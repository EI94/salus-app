import React, { useState, useEffect, useRef } from 'react';
import API from './api';

function AIAssistant({ userId }) {
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [userSymptoms, setUserSymptoms] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Come posso alleviare il mal di testa?",
    "Quali sono i sintomi più comuni dell'influenza?",
    "Dovresti consultare un medico per mal di stomaco persistente?",
    "Come posso migliorare la qualità del sonno?",
    "Quali sono i benefici dell'esercizio fisico regolare?"
  ]);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Messaggio di benvenuto
  const welcomeMessage = {
    id: 'welcome',
    text: 'Ciao! Sono Salus, il tuo assistente personale per la salute. Posso aiutarti a monitorare i tuoi sintomi, rispondere a domande mediche generali, e fornirti informazioni sui tuoi dati di salute. Ricorda che non posso sostituire un medico - le mie risposte sono solo informative e mai diagnostiche. Come posso aiutarti oggi?',
    isAI: true
  };

  // Carica i dati dell'utente all'avvio
  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchUserSymptoms();
      
      // Carica la conversazione precedente dal localStorage
      const savedConversation = localStorage.getItem(`aiConversation_${userId}`);
      if (savedConversation) {
        try {
          setConversation(JSON.parse(savedConversation));
          setShowIntro(false);
        } catch (e) {
          console.error('Errore nel parsing della conversazione salvata:', e);
        }
      }
    }
  }, [userId]);

  // Salva la conversazione nel localStorage quando cambia
  useEffect(() => {
    if (userId && conversation.length > 0) {
      localStorage.setItem(`aiConversation_${userId}`, JSON.stringify(conversation));
    }
  }, [conversation, userId]);

  // Scroll automatico alla fine della conversazione
  useEffect(() => {
    scrollToBottom();
  }, [conversation, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserData = async () => {
    try {
      const response = await API.get(`/auth/users/${userId}`);
      setUserProfile(response.data);
    } catch (error) {
      console.error('Errore nel caricamento del profilo:', error);
      showErrorToast('Impossibile caricare il profilo utente');
    }
  };

  const fetchUserSymptoms = async () => {
    try {
      const response = await API.get(`/symptoms/${userId}`);
      setUserSymptoms(response.data);
      
      // Genera domande suggerite in base ai sintomi
      if (response.data.length > 0) {
        generateSuggestedQuestions(response.data);
      }
    } catch (error) {
      console.error('Errore nel caricamento dei sintomi:', error);
      showErrorToast('Impossibile caricare i sintomi');
    }
  };

  const generateSuggestedQuestions = (symptoms) => {
    if (symptoms.length === 0) return;
    
    // Prendi i sintomi più recenti
    const recentSymptoms = symptoms.slice(0, 3);
    
    // Genera domande personalizzate
    const customQuestions = recentSymptoms.map(symptom => 
      `Come posso gestire il mio ${symptom.description.toLowerCase()}?`
    );
    
    // Aggiungi domande generali
    const generalQuestions = [
      "Quali sono i pattern nei miei sintomi?",
      "Dovrei essere preoccupato per questi sintomi?",
      "Cosa posso fare per migliorare il mio benessere generale?"
    ];
    
    setSuggestedQuestions([...customQuestions, ...generalQuestions].slice(0, 5));
  };

  const handleSuggestedQuestionClick = (question) => {
    setUserMessage(question);
    sendMessageToAI(question);
  };

  const sendMessageToAI = async (messageToSend = null) => {
    const messageText = messageToSend || userMessage;
    if (!messageText.trim() && !isLoading) return;
    
    // Aggiungi il messaggio utente alla conversazione
    const newUserMessage = { role: 'user', content: messageText };
    const updatedConversation = [...conversation, newUserMessage];
    setConversation(updatedConversation);
    if (!messageToSend) setUserMessage('');
    setShowIntro(false);
    
    // Prepara il contesto per OpenAI
    setIsLoading(true);
    
    try {
      // Animazione di "sta scrivendo"
      setTimeout(() => {
        scrollToBottom();
      }, 100);
      
      // Chiamata all'API
      console.log('Invio messaggio all\'AI:', messageText);
      
      try {
        const response = await API.post('/ai/chat', {
          message: messageText
        });
        
        console.log('Risposta ricevuta:', response.data);
        
        // Se c'è una risposta, aggiungila alla conversazione
        if (response.data && response.data.reply) {
          // Aggiungi la risposta alla conversazione
          setConversation([
            ...updatedConversation, 
            { role: 'assistant', content: response.data.reply }
          ]);
          
          // Se c'è stato un errore nel backend ma abbiamo comunque una risposta di fallback
          if (response.data.errorOccurred) {
            showErrorToast('C\'è stato un problema con l\'assistente AI, ma ho comunque cercato di rispondere al meglio.');
          }
        } else {
          throw new Error('Risposta AI non valida');
        }
      } catch (apiError) {
        console.error('Errore nella chiamata API:', apiError);
        // Utilizziamo una risposta predefinita per mantenere l'utente informato
        setConversation([
          ...updatedConversation, 
          { 
            role: 'assistant', 
            content: 'Mi dispiace, sto riscontrando problemi tecnici nel rispondere alla tua domanda. Come assistente per la salute, posso comunque ricordarti che è sempre consigliabile consultare un medico per qualsiasi preoccupazione relativa alla tua salute. Riprova più tardi con la tua domanda.',
            error: true
          }
        ]);
        
        showErrorToast('Problema di connessione con l\'assistente AI. Riprova più tardi.');
      }
    } catch (error) {
      console.error('Errore nella chiamata AI:', error);
      setConversation([
        ...updatedConversation, 
        { 
          role: 'assistant', 
          content: 'Mi dispiace, si è verificato un errore imprevisto. Il nostro team è stato notificato del problema. Riprova più tardi o contatta l\'assistenza se il problema persiste.',
          error: true
        }
      ]);
      showErrorToast('Errore nella comunicazione con l\'assistente: ' + (error.message || 'Errore sconosciuto'));
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  };
  
  // Prepara il contesto con i dati dell'utente
  const prepareContext = () => {
    const recentSymptoms = userSymptoms.slice(0, 5);
    return {
      profile: userProfile,
      recentSymptoms: recentSymptoms,
      symptomSummary: summarizeSymptoms(userSymptoms)
    };
  };
  
  // Crea un riepilogo dei sintomi
  const summarizeSymptoms = (symptoms) => {
    const symptomsGrouped = {};
    symptoms.forEach(s => {
      if (!symptomsGrouped[s.description]) {
        symptomsGrouped[s.description] = [];
      }
      symptomsGrouped[s.description].push(s.intensity);
    });
    
    return Object.keys(symptomsGrouped).map(desc => ({
      description: desc,
      avgIntensity: calculateAverage(symptomsGrouped[desc]),
      occurrences: symptomsGrouped[desc].length
    }));
  };
  
  const calculateAverage = (arr) => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageToAI();
    }
  };
  
  const useSuggestedQuestion = (question) => {
    setUserMessage(question);
    // Focus all'input
    document.getElementById('messageInput')?.focus();
  };
  
  const showErrorToast = (message) => {
    // Implementazione semplice di un toast di errore
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };
  
  const clearConversation = () => {
    if (window.confirm('Sei sicuro di voler cancellare tutta la conversazione?')) {
      setConversation([]);
      setShowIntro(true);
      localStorage.removeItem(`aiConversation_${userId}`);
    }
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-header">
        <div className="ai-identity">
          <div className="salus-logo-container">
            <img src="/logo.svg" alt="Salus Logo" className="salus-logo" />
          </div>
          <span className="ai-assistant-name">Salus</span>
        </div>
        <button 
          onClick={clearConversation} 
          className="btn btn-sm btn-outline"
          title="Cancella conversazione"
        >
          <i className="fas fa-trash-alt"></i>
        </button>
      </div>
      
      {/* Disclaimer medico */}
      <div className="ai-disclaimer">
        <div className="disclaimer-content">
          <i className="fas fa-stethoscope"></i> <strong>Nota importante:</strong> L'assistente Salus fornisce informazioni generali ma <strong>non sostituisce il parere medico professionale</strong>. Consulta sempre un medico per diagnosi e trattamenti.
        </div>
      </div>
      
      <div className="chat-container" ref={chatContainerRef}>
        {showIntro && (
          <div className="intro-container">
            <div className="salus-logo-large-container">
              <img src="/logo.svg" alt="Salus Logo" className="salus-logo-large" />
            </div>
            <h3>{welcomeMessage.text}</h3>
            
            {/* Disclaimer dettagliato nell'introduzione */}
            <div className="ai-detailed-disclaimer">
              <p><i className="fas fa-exclamation-triangle"></i> <strong>Ricorda:</strong></p>
              <ul>
                <li>Non posso fornire diagnosi mediche o prescrizioni.</li>
                <li>Le informazioni che fornisco sono di carattere generale.</li>
                <li>In caso di emergenza, chiama immediatamente il 118.</li>
                <li>Consulta sempre un medico per i tuoi problemi di salute.</li>
                <li>Non ritardare mai una visita medica basandoti sui miei consigli.</li>
              </ul>
            </div>
            
            <div className="suggested-questions">
              <h4>Domande suggerite:</h4>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  className="suggested-question"
                  onClick={() => handleSuggestedQuestionClick(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="messages-container">
          {conversation.length === 0 && !showIntro && (
            <div className="message assistant-message">
              <div className="message-avatar">
                <div className="avatar-container">
                  <img src="/logo.svg" alt="Salus Logo" className="salus-avatar" />
                </div>
              </div>
              <div className="message-content">
                <p>{welcomeMessage.text}</p>
              </div>
            </div>
          )}
          
          {conversation.map((message, index) => (
            <div key={index} className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
              {message.role === 'assistant' && (
                <div className="message-avatar">
                  <div className="avatar-container">
                    <img src="/logo.svg" alt="Salus Logo" className="salus-avatar" />
                  </div>
                </div>
              )}
              <div className={`message-content ${message.error ? 'error' : ''}`}>
                <p>{message.content}</p>
                <div className="message-time">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant-message">
              <div className="message-avatar">
                <div className="avatar-container">
                  <img src="/logo.svg" alt="Salus Logo" className="salus-avatar" />
                </div>
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="input-container">
        <textarea
          id="messageInput"
          className="message-input"
          placeholder="Scrivi un messaggio..."
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={1}
        />
        <button
          className="send-button"
          onClick={() => sendMessageToAI()}
          disabled={isLoading || !userMessage.trim()}
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
      
      <div className="powered-by">
        Powered by <span className="brand">OpenAI</span> <i className="fas fa-bolt"></i>
      </div>
      
      {/* Stili specifici del componente */}
      <style>{`
        .ai-assistant-container {
          padding: var(--space-3);
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        
        .ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-3);
          border-bottom: 1px solid var(--gray-200);
        }
        
        .ai-identity {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .ai-assistant-name {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--primary-600);
        }
        
        .salus-logo-container {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .salus-logo {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }
        
        .salus-logo-large-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          margin: 0 auto 20px;
          overflow: hidden;
        }
        
        .salus-logo-large {
          width: 80px;
          height: 80px;
          object-fit: contain;
        }
        
        .avatar-container {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .salus-avatar {
          width: 28px;
          height: 28px;
          object-fit: contain;
        }
        
        .chat-container {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 300px;
          max-height: calc(100vh - 300px);
          border-radius: var(--radius-lg);
          overflow: hidden;
          background-color: var(--gray-100);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--gray-200);
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        
        .message {
          display: flex;
          max-width: 85%;
          margin-bottom: var(--space-3);
          animation: fadeIn 0.3s ease;
        }
        
        .user-message {
          margin-left: auto;
          flex-direction: row-reverse;
        }
        
        .assistant-message {
          margin-right: auto;
        }
        
        .message-avatar {
          display: flex;
          align-items: flex-start;
          margin-right: var(--space-2);
        }
        
        .message-content {
          background-color: var(--white);
          padding: var(--space-3);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          position: relative;
          min-width: 80px;
        }
        
        .user-message .message-content {
          background-color: var(--primary-600);
          color: var(--white);
          border-bottom-right-radius: var(--space-1);
        }
        
        .assistant-message .message-content {
          background-color: var(--white);
          border-bottom-left-radius: var(--space-1);
        }
        
        .message-error .message-content {
          background-color: var(--danger);
          color: var(--white);
        }
        
        .message-time {
          font-size: 0.7rem;
          color: var(--gray-500);
          margin-top: var(--space-1);
          text-align: right;
        }
        
        .user-message .message-time {
          color: rgba(255, 255, 255, 0.7);
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 5px;
          padding: 8px 0;
        }
        
        .typing-indicator span {
          width: 8px;
          height: 8px;
          background-color: var(--primary-600);
          border-radius: 50%;
          display: inline-block;
          opacity: 0.6;
          animation: typing 1.4s infinite both;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
        
        .intro-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-4);
          background-color: var(--white);
          border-radius: var(--radius-lg);
          margin: var(--space-3);
          box-shadow: var(--shadow-md);
          text-align: center;
        }
        
        .intro-container h3 {
          margin-top: 0;
          margin-bottom: var(--space-3);
          color: var(--gray-900);
          font-size: 1.1rem;
          line-height: 1.5;
        }
        
        .suggested-questions {
          width: 100%;
          margin-top: var(--space-4);
        }
        
        .suggested-questions h4 {
          margin-bottom: var(--space-2);
          color: var(--gray-700);
          font-size: 0.9rem;
        }
        
        .suggested-question {
          display: block;
          width: 100%;
          padding: var(--space-2) var(--space-3);
          margin-bottom: var(--space-2);
          border: 1px solid var(--primary-200);
          background-color: var(--primary-50);
          border-radius: var(--radius-md);
          text-align: left;
          transition: all 0.2s ease;
          font-size: 0.9rem;
          cursor: pointer;
        }
        
        .suggested-question:hover {
          background-color: var(--primary-100);
          border-color: var(--primary-300);
        }
        
        .input-container {
          display: flex;
          margin-top: var(--space-3);
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-lg);
          background-color: var(--white);
          padding: var(--space-2);
          box-shadow: var(--shadow-md);
        }
        
        .message-input {
          flex: 1;
          border: none;
          padding: var(--space-2);
          font-size: 0.95rem;
          resize: none;
          max-height: 100px;
          overflow-y: auto;
          background: transparent;
        }
        
        .message-input:focus {
          outline: none;
        }
        
        .send-button {
          background-color: var(--primary-600);
          color: white;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .send-button:hover {
          background-color: var(--primary-700);
        }
        
        .send-button:disabled {
          background-color: var(--gray-400);
          cursor: not-allowed;
        }
        
        .powered-by {
          text-align: center;
          font-size: var(--font-size-xs);
          color: var(--gray-500);
          margin-top: var(--space-3);
        }
        
        .brand {
          font-weight: 600;
          color: var(--gray-700);
        }
        
        .error-toast {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: var(--danger);
          color: white;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-md);
          z-index: 1000;
          animation: slideInUp 0.3s ease;
        }
        
        .fade-out {
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @media (max-width: 768px) {
          .chat-container {
            max-height: calc(100vh - 250px);
          }
        }
        
        /* Stili per i disclaimer */
        .ai-disclaimer {
          background-color: rgba(220, 53, 69, 0.1);
          padding: 10px 15px;
          border-radius: 8px;
          border-left: 3px solid #dc3545;
          margin-bottom: 15px;
          font-size: 0.85rem;
        }
        
        .ai-disclaimer .disclaimer-content {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .ai-disclaimer i {
          color: #dc3545;
        }
        
        .ai-disclaimer strong {
          color: #dc3545;
        }
        
        .ai-detailed-disclaimer {
          background-color: #f8f9fa;
          border-radius: 8px;
          padding: 12px 15px;
          margin: 15px 0;
          border-left: 3px solid #dc3545;
          font-size: 0.9rem;
          text-align: left;
        }
        
        .ai-detailed-disclaimer p {
          margin-bottom: 8px;
          color: #dc3545;
        }
        
        .ai-detailed-disclaimer ul {
          margin: 0;
          padding-left: 20px;
        }
        
        .ai-detailed-disclaimer li {
          margin-bottom: 5px;
          color: #555;
          text-align: left;
        }
      `}</style>
    </div>
  );
}

export default AIAssistant; 