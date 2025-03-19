import React, { useState, useEffect, useRef } from 'react';
import '../styles/AIAssistant.css';

const AIAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // Suggerimenti predefiniti per l'utente
  const predefinedSuggestions = [
    'Come posso ridurre il dolore alla schiena?',
    'Quali cibi devo evitare con l\'ipertensione?',
    'È normale avere mal di testa ogni giorno?',
    'Quanto sonno è raccomandato per un adulto?',
    'Come posso migliorare la qualità del sonno?'
  ];

  // Risposte predefinite in base alla domanda
  const getAIResponse = (question) => {
    const lowerQuestion = question.toLowerCase();
    
    // Risposte predefinite per domande specifiche
    if (lowerQuestion.includes('mal di testa') || lowerQuestion.includes('emicrania')) {
      return 'I mal di testa frequenti possono essere causati da stress, disidratazione, tensione muscolare o problemi alla vista. Se persiste per più di una settimana, ti consiglio di consultare il tuo medico. Nel frattempo, prova a riposare in una stanza buia, bere molta acqua e fare stretching per il collo.';
    } else if (lowerQuestion.includes('sonno') || lowerQuestion.includes('dormire')) {
      return 'Gli adulti dovrebbero dormire tra 7-9 ore per notte. Per migliorare la qualità del sonno: mantieni orari regolari, evita caffeina e schermi nelle ore serali, crea un ambiente confortevole e fresco per dormire e fai attività fisica durante il giorno, ma non troppo vicino all\'ora di andare a letto.';
    } else if (lowerQuestion.includes('schiena') || lowerQuestion.includes('dolore')) {
      return 'Per il mal di schiena, prova a mantenere una postura corretta, fare esercizi di rinforzo per il core, evitare di stare seduto troppo a lungo e utilizzare un supporto lombare. L\'applicazione di calore o ghiaccio può anche alleviare il dolore. Se il dolore è intenso o persiste, consulta un medico.';
    } else if (lowerQuestion.includes('cibo') || lowerQuestion.includes('dieta') || lowerQuestion.includes('mangiare')) {
      return 'Una dieta equilibrata dovrebbe includere frutta, verdura, proteine magre, cereali integrali e grassi sani. Per l\'ipertensione, limita il sale, l\'alcol e i cibi processati. Aumenta il consumo di potassio con banane, patate e legumi. Ricorda di consultare un nutrizionista per consigli personalizzati.';
    } else if (lowerQuestion.includes('stress') || lowerQuestion.includes('ansia')) {
      return 'Per gestire lo stress, prova tecniche di respirazione profonda, meditazione, yoga o altre attività rilassanti. Mantieni uno stile di vita equilibrato con esercizio regolare, alimentazione sana e sonno adeguato. La condivisione dei tuoi sentimenti con amici o un professionista può anche essere molto utile.';
    } else {
      // Risposta generica per altre domande
      return 'Grazie per la tua domanda. Per una risposta più accurata e personalizzata, ti consiglio di consultare il tuo medico o un professionista sanitario. Ricorda che l\'app Salus è progettata per aiutarti a monitorare la tua salute, ma non sostituisce il parere medico professionale.';
    }
  };

  // Funzione per generare nuovi suggerimenti basati sulla conversazione
  const generateNewSuggestions = () => {
    const newSuggestions = [
      'Come posso gestire lo stress quotidiano?',
      'Quali sono i sintomi dell\'anemia?',
      'Quanto esercizio fisico è consigliato ogni settimana?',
      'Come posso migliorare la mia digestione?',
      'Quali vitamine dovrei assumere ogni giorno?',
    ];
    
    setSuggestions(newSuggestions);
  };

  // Simulazione della risposta dell'AI
  const simulateAIResponse = (userMessage) => {
    setIsTyping(true);
    
    // Simuliamo un ritardo nella risposta per rendere più realistico
    setTimeout(() => {
      const aiResponse = getAIResponse(userMessage);
      
      setMessages(prevMessages => [
        ...prevMessages, 
        { 
          text: aiResponse, 
          sender: 'ai', 
          timestamp: new Date().toISOString() 
        }
      ]);
      
      setIsTyping(false);
      generateNewSuggestions();
    }, 1500);
  };

  // Gestione dell'invio di un messaggio
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (input.trim() === '') return;
    
    // Aggiungiamo il messaggio dell'utente
    setMessages(prevMessages => [
      ...prevMessages, 
      { 
        text: input, 
        sender: 'user', 
        timestamp: new Date().toISOString() 
      }
    ]);
    
    // Simuliamo la risposta dell'AI
    simulateAIResponse(input);
    
    // Reset dell'input
    setInput('');
    
    // Nascondiamo il messaggio di benvenuto
    if (showWelcome) {
      setShowWelcome(false);
    }
  };

  // Gestione del click su un suggerimento
  const handleSuggestionClick = (suggestion) => {
    // Aggiungiamo il messaggio dell'utente
    setMessages(prevMessages => [
      ...prevMessages, 
      { 
        text: suggestion, 
        sender: 'user', 
        timestamp: new Date().toISOString() 
      }
    ]);
    
    // Simuliamo la risposta dell'AI
    simulateAIResponse(suggestion);
    
    // Nascondiamo il messaggio di benvenuto
    if (showWelcome) {
      setShowWelcome(false);
    }
  };

  // Scorrimento automatico verso l'ultimo messaggio
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Caricamento iniziale dei suggerimenti
  useEffect(() => {
    setSuggestions(predefinedSuggestions);
  }, []);

  // Formattazione dell'orario
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="ai-assistant-container">
      <div className="assistant-header">
        <h1 className="page-title">Assistente Virtuale</h1>
      </div>
      
      <div className="chat-container">
        <div className="messages-container">
          {showWelcome && messages.length === 0 && (
            <div className="welcome-message">
              <div className="assistant-avatar">
                <i className="fas fa-robot"></i>
              </div>
              <div className="welcome-content">
                <h2>Ciao, sono il tuo assistente virtuale!</h2>
                <p>Sono qui per rispondere alle tue domande sulla salute e il benessere. Non sono un medico, ma posso fornirti informazioni generali e consigli utili.</p>
                <p>Come posso aiutarti oggi?</p>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              {message.sender === 'ai' && (
                <div className="message-avatar">
                  <i className="fas fa-robot"></i>
                </div>
              )}
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
              {message.sender === 'user' && (
                <div className="message-avatar user">
                  <i className="fas fa-user"></i>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="message ai-message">
              <div className="message-avatar">
                <i className="fas fa-robot"></i>
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
          
          <div ref={messagesEndRef}></div>
        </div>
        
        <div className="suggestions-container">
          <h3>Suggerimenti</h3>
          <div className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <button 
                key={index} 
                className="suggestion-btn"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={isTyping}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
        
        <form className="input-container" onSubmit={handleSendMessage}>
          <input 
            type="text" 
            placeholder="Scrivi un messaggio..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
          />
          <button 
            type="submit" 
            className="send-btn"
            disabled={input.trim() === '' || isTyping}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
      </div>
      
      <div className="disclaimer">
        <i className="fas fa-info-circle"></i>
        <span>
          Le informazioni fornite sono solo a scopo educativo e non sostituiscono
          il parere medico professionale. Consulta sempre il tuo medico per decisioni 
          relative alla tua salute.
        </span>
      </div>
    </div>
  );
};

export default AIAssistant; 