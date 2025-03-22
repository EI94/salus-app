import React, { useState, useEffect, useRef } from 'react';
import '../styles/AIAssistant.css';
import openaiConfig from '../utils/openaiConfig';

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [useSpeech, setUseSpeech] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const chatAreaRef = useRef(null);
  const inputRef = useRef(null);

  // Suggerimenti iniziali
  const suggestions = [
    'Come posso migliorare il mio benessere?',
    'Consigli per dormire meglio',
    'Esercizi per ridurre lo stress',
    'Idee per pasti salutari'
  ];

  // Carica la cronologia e le impostazioni al primo caricamento
  useEffect(() => {
    const savedMessages = localStorage.getItem('ai_assistant_messages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error('Errore nel caricamento dei messaggi salvati:', e);
      }
    }

    // Carica impostazioni
    const darkMode = localStorage.getItem('ai_assistant_dark_mode') === 'true';
    setIsDarkMode(darkMode);
    
    const speech = localStorage.getItem('ai_assistant_speech') === 'true';
    setUseSpeech(speech);
    
    // Verifica se c'è già una chiave API salvata
    if (openaiConfig.hasApiKey()) {
      setApiKey(openaiConfig.getApiKey() || '');
    }
  }, []);

  // Salva i messaggi quando cambiano
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai_assistant_messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Salva le impostazioni quando cambiano
  useEffect(() => {
    localStorage.setItem('ai_assistant_dark_mode', isDarkMode);
    localStorage.setItem('ai_assistant_speech', useSpeech);
  }, [isDarkMode, useSpeech]);

  // Scorrimento automatico alla fine della chat
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Gestisce l'invio della chiave API
  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setApiKeyError('Per favore, inserisci una chiave API valida');
      return;
    }
    
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      setApiKeyError('La chiave API non sembra valida. Deve iniziare con "sk-" e avere la lunghezza corretta');
      return;
    }
    
    openaiConfig.saveApiKey(apiKey);
    setApiKeyError('');
    
    // Aggiunge un messaggio di conferma
    setMessages(prev => [
      ...prev,
      { role: 'assistant', content: 'La chiave API è stata salvata. Ora puoi iniziare a chattare con me!', timestamp: new Date().toISOString() }
    ]);
  };

  // Gestisce l'invio del messaggio
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!message.trim() && !e?.currentTarget?.dataset?.suggestion) return;
    
    // Preparazione del messaggio
    const userMessage = e?.currentTarget?.dataset?.suggestion || message;
    
    // Aggiunge il messaggio dell'utente
    setMessages(prev => [
      ...prev, 
      { role: 'user', content: userMessage, timestamp: new Date().toISOString() }
    ]);
    
    // Resetta il campo di input
    setMessage('');
    
    // Verifica se c'è una chiave API
    if (!openaiConfig.hasApiKey()) {
      setMessages(prev => [
        ...prev,
        { 
          role: 'error', 
          content: 'Per utilizzare l\'assistente, devi prima inserire una chiave API OpenAI valida.',
          timestamp: new Date().toISOString()
        }
      ]);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepara i messaggi per l'API (massimo ultimi 10 messaggi)
      const recentMessages = [...messages.slice(-10), { role: 'user', content: userMessage }]
        .map(msg => ({ role: msg.role === 'error' ? 'user' : msg.role, content: msg.content }));
      
      // Chiamata API OpenAI
      const response = await fetch(openaiConfig.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiConfig.getApiKey()}`
        },
        body: JSON.stringify({
          model: openaiConfig.model,
          messages: recentMessages,
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Errore API: ${response.status}`);
      }
      
      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;
      
      // Aggiunge la risposta dell'assistente
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: assistantMessage, timestamp: new Date().toISOString() }
      ]);
      
      // Sintesi vocale se abilitata
      if (useSpeech && 'speechSynthesis' in window) {
        const speech = new SpeechSynthesisUtterance(assistantMessage);
        speech.lang = 'it-IT';
        window.speechSynthesis.speak(speech);
      }
      
    } catch (error) {
      console.error('Errore nella chiamata API:', error);
      setMessages(prev => [
        ...prev,
        { 
          role: 'error', 
          content: `Si è verificato un errore: ${error.message || 'Controlla la console per maggiori dettagli'}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Gestisce il click su un suggerimento
  const handleSuggestionClick = (suggestion) => {
    setMessage(suggestion);
    handleSubmit({ preventDefault: () => {}, currentTarget: { dataset: { suggestion } } });
  };

  // Pulisce la conversazione
  const clearConversation = () => {
    setMessages([]);
    localStorage.removeItem('ai_assistant_messages');
  };

  return (
    <div className={`ai-assistant ${isDarkMode ? 'dark-mode' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {/* Header */}
      <div className="ai-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="ai-title">
          <i className="fas fa-robot"></i>
          <h3>Assistente Salus</h3>
        </div>
        <div className="ai-controls">
          <button 
            className="ai-control-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setIsDarkMode(!isDarkMode);
            }}
            title={isDarkMode ? "Modalità chiara" : "Modalità scura"}
          >
            <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
          </button>
          <button 
            className="ai-control-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setUseSpeech(!useSpeech);
            }}
            title={useSpeech ? "Disabilita audio" : "Abilita audio"}
          >
            <i className={`fas fa-${useSpeech ? 'volume-up' : 'volume-mute'}`}></i>
          </button>
          <button 
            className="ai-toggle-btn" 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <i className={`fas fa-chevron-${isExpanded ? 'down' : 'up'}`}></i>
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="ai-content">
          {/* Form per la chiave API se non è già impostata */}
          {!openaiConfig.hasApiKey() && (
            <form className="api-key-form" onSubmit={handleApiKeySubmit}>
              <h4>Inserisci la tua chiave API OpenAI</h4>
              <p>Per utilizzare l'assistente IA, è necessaria una chiave API di OpenAI.</p>
              <input
                type="text"
                className="api-key-input"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              {apiKeyError && <div className="api-key-error">{apiKeyError}</div>}
              <button type="submit" className="api-key-submit">Salva Chiave API</button>
              <p className="api-key-info">
                La chiave verrà salvata solo in questo browser. <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">Ottieni una chiave API</a>
              </p>
            </form>
          )}
          
          {/* Area chat */}
          <div className="ai-chat-area" ref={chatAreaRef}>
            {messages.length === 0 ? (
              <div className="ai-welcome">
                <h3>Benvenuto nell'Assistente Salus!</h3>
                <p>Chiedimi informazioni sul benessere o suggerimenti per migliorare il tuo stile di vita.</p>
                <div className="ai-suggestions">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="ai-suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ai-messages">
                {messages.map((msg, idx) => (
                  <div 
                    key={idx} 
                    className={`ai-message ${msg.role}`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Area input */}
          <form className="ai-input-area" onSubmit={handleSubmit}>
            <input
              type="text"
              className="ai-input"
              placeholder={openaiConfig.hasApiKey() ? "Scrivi un messaggio..." : "Prima inserisci la chiave API..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isLoading || !openaiConfig.hasApiKey()}
              ref={inputRef}
            />
            <button 
              type="submit" 
              className="ai-send-btn" 
              disabled={isLoading || !message.trim() || !openaiConfig.hasApiKey()}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
          
          {/* Pulsante per pulire la conversazione */}
          {messages.length > 0 && openaiConfig.hasApiKey() && (
            <div style={{ padding: '10px 15px', textAlign: 'center' }}>
              <button 
                onClick={clearConversation}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff5252',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                <i className="fas fa-trash-alt" style={{ marginRight: '5px' }}></i>
                Cancella conversazione
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIAssistant; 