import React, { useState, useEffect, useRef } from 'react';
import API from '../api';
import { toggleOfflineMode, isInOfflineMode } from '../api';
import '../styles/AIAssistant.css';

const AIAssistant = ({ userId }) => {
  const [userMessage, setUserMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    "Come posso alleviare il mal di testa?",
    "Quali sono i sintomi più comuni dell'influenza?",
    "Dovresti consultare un medico per mal di stomaco persistente?",
    "Come posso migliorare la qualità del sonno?",
    "Quali sono i benefici dell'esercizio fisico regolare?"
  ]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [offlineMode, setOfflineMode] = useState(isInOfflineMode());
  const [darkMode, setDarkMode] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (userId) {
      // Carica la conversazione precedente dal localStorage
      const savedConversation = localStorage.getItem(`aiConversation_${userId}`);
      if (savedConversation) {
        try {
          const parsedConversation = JSON.parse(savedConversation);
          setConversation(parsedConversation);
          setShowIntro(parsedConversation.length > 0 ? false : true);
        } catch (e) {
          console.error('Errore nel parsing della conversazione salvata:', e);
        }
      }
      
      // Carica le preferenze dell'utente
      const savedDarkMode = localStorage.getItem(`aiDarkMode_${userId}`);
      if (savedDarkMode) {
        setDarkMode(savedDarkMode === 'true');
      }
      
      const savedVoiceEnabled = localStorage.getItem(`aiVoiceEnabled_${userId}`);
      if (savedVoiceEnabled) {
        setVoiceEnabled(savedVoiceEnabled === 'true');
      }
    }
  }, [userId]);

  // Salva la conversazione nel localStorage quando cambia
  useEffect(() => {
    if (userId && conversation.length > 0) {
      localStorage.setItem(`aiConversation_${userId}`, JSON.stringify(conversation));
    }
  }, [conversation, userId]);

  // Salva le preferenze dell'utente
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`aiDarkMode_${userId}`, darkMode);
      localStorage.setItem(`aiVoiceEnabled_${userId}`, voiceEnabled);
    }
  }, [darkMode, voiceEnabled, userId]);

  // Scroll automatico alla fine della conversazione
  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Aggiorna lo stato della modalità offline
  useEffect(() => {
    setOfflineMode(isInOfflineMode());
  }, [isInOfflineMode()]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    
    if (!userMessage.trim() && !e.currentTarget.dataset.question) return;
    
    // Determina il messaggio da inviare (dall'input o da suggerimento)
    const messageToSend = e.currentTarget.dataset.question || userMessage;
    
    // Aggiungi il messaggio dell'utente alla conversazione
    const newUserMessage = {
      content: messageToSend,
      isAI: false,
      timestamp: new Date().toISOString()
    };
    
    setConversation(prev => [...prev, newUserMessage]);
    setShowIntro(false);
    setUserMessage('');
    setIsLoading(true);
    
    try {
      // Effettua la chiamata API
      const response = await API.post('/ai/chat', { message: messageToSend });
      const aiResponse = {
        content: response.data.reply,
        isAI: true,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, aiResponse]);
      
      // Se è abilitata la sintesi vocale, leggi la risposta
      if (voiceEnabled && 'speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(response.data.reply);
        utterance.lang = 'it-IT';
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Errore nella comunicazione con l\'AI:', error);
      
      // Aggiungi un messaggio di errore alla conversazione
      const errorMessage = {
        content: "Mi dispiace, sto riscontrando problemi di comunicazione. Riprova più tardi o verifica la tua connessione.",
        isAI: true,
        isError: true,
        timestamp: new Date().toISOString()
      };
      
      setConversation(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      // Focus sull'input dopo aver ricevuto la risposta
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleClearConversation = () => {
    if (window.confirm('Sei sicuro di voler cancellare tutta la conversazione?')) {
      setConversation([]);
      setShowIntro(true);
      localStorage.removeItem(`aiConversation_${userId}`);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const toggleVoiceEnabled = () => {
    setVoiceEnabled(!voiceEnabled);
  };
  
  const toggleOfflineModeHandler = () => {
    const newMode = !offlineMode;
    toggleOfflineMode(newMode);
    setOfflineMode(newMode);
  };
  
  const toggleChatExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className={`ai-assistant-container ${darkMode ? 'dark-mode' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="ai-assistant-header">
        <div className="ai-assistant-title">
          <i className="fas fa-robot"></i>
          <h2>Assistente Salus</h2>
          {offlineMode && <span className="offline-badge">OFFLINE</span>}
        </div>
        <div className="ai-assistant-controls">
          <button 
            className="control-button settings-button" 
            onClick={() => setShowSettings(!showSettings)}
            aria-label="Impostazioni"
          >
            <i className="fas fa-cog"></i>
          </button>
          <button 
            className="control-button expand-button" 
            onClick={toggleChatExpanded}
            aria-label={isExpanded ? "Minimizza" : "Espandi"}
          >
            <i className={`fas ${isExpanded ? 'fa-compress-alt' : 'fa-expand-alt'}`}></i>
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className="ai-assistant-settings">
          <div className="setting-option">
            <label>Modalità scura</label>
            <label className="switch">
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="setting-option">
            <label>Sintesi vocale</label>
            <label className="switch">
              <input type="checkbox" checked={voiceEnabled} onChange={toggleVoiceEnabled} />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="setting-option">
            <label>Modalità offline</label>
            <label className="switch">
              <input type="checkbox" checked={offlineMode} onChange={toggleOfflineModeHandler} />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="setting-option">
            <button className="clear-conversation-button" onClick={handleClearConversation}>
              Cancella conversazione
            </button>
          </div>
        </div>
      )}
      
      {isExpanded && (
        <>
          <div className="ai-assistant-chat" ref={chatContainerRef}>
            {showIntro ? (
              <div className="ai-assistant-intro">
                <div className="ai-assistant-avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="ai-intro-message">
                  <h3>Ciao, sono Salus!</h3>
                  <p>
                    Il tuo assistente personale per la salute. Posso aiutarti a monitorare i tuoi sintomi, 
                    rispondere a domande sulla salute e fornirti consigli sul benessere.
                  </p>
                  <p className="ai-disclaimer">
                    Ricorda: non sono un medico e le mie risposte sono solo informative, mai diagnostiche.
                  </p>
                </div>
              </div>
            ) : (
              <div className="ai-assistant-messages">
                {conversation.map((message, index) => (
                  <div 
                    key={index} 
                    className={`message ${message.isAI ? 'ai-message' : 'user-message'} ${message.isError ? 'error-message' : ''}`}
                  >
                    {message.isAI && (
                      <div className="message-avatar">
                        <i className="fas fa-robot"></i>
                      </div>
                    )}
                    <div className="message-content">
                      <div className="message-text">{message.content}</div>
                      <div className="message-timestamp">{formatTimestamp(message.timestamp)}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message ai-message loading-message">
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
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="ai-suggested-questions">
            {suggestedQuestions.map((question, index) => (
              <button 
                key={index} 
                className="suggested-question" 
                onClick={handleSubmit} 
                data-question={question}
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>
          
          <form className="ai-assistant-input" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Scrivi un messaggio..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              disabled={isLoading}
              ref={inputRef}
            />
            <button 
              type="submit" 
              disabled={!userMessage.trim() || isLoading}
              className="send-button"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default AIAssistant; 