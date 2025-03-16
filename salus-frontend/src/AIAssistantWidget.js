import React, { useState, useEffect, useRef } from 'react';
import API from './api';

/**
 * Widget fluttuante per l'Assistente AI Salus
 * 
 * Fornisce accesso rapido all'assistente da qualsiasi parte dell'app
 */
function AIAssistantWidget({ userId, language, darkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);

  // Dizionario traduzioni
  const translations = {
    it: {
      placeholder: 'Scrivi un messaggio...',
      welcomeTitle: 'Ciao, sono Salus',
      welcomeMessage: 'Come posso aiutarti oggi con la tua salute?',
      send: 'Invia',
      loading: 'Salus sta scrivendo...',
      errorMessage: 'Si è verificato un errore. Riprova.',
      suggestedQuestions: 'Domande suggerite',
      tipTitle: 'Suggerimento Salus',
      miniPlaceholder: 'Chiedi a Salus...',
      suggestions: [
        'Come posso migliorare il mio sonno?',
        'Quali sono i sintomi di disidratazione?',
        'Perché mi sento stanco tutto il giorno?',
        'Quando dovrei preoccuparmi per il mal di testa?'
      ],
      contextualTips: [
        {
          id: 'hydration',
          title: 'Idratazione',
          message: 'Ricorda di bere almeno 2 litri di acqua al giorno, specialmente durante l\'estate.'
        },
        {
          id: 'medication',
          title: 'Promemoria farmaci',
          message: 'Hai farmaci programmati per oggi. Ricorda di prenderli con regolarità.'
        },
        {
          id: 'activity',
          title: 'Attività fisica',
          message: 'Non hai registrato attività fisica negli ultimi 3 giorni. Una camminata veloce può migliorare il tuo benessere.'
        }
      ],
      disclaimer: 'Ricorda: le informazioni fornite hanno scopo informativo e non sostituiscono il parere del medico.'
    },
    en: {
      placeholder: 'Type a message...',
      welcomeTitle: 'Hi, I\'m Salus',
      welcomeMessage: 'How can I help with your health today?',
      send: 'Send',
      loading: 'Salus is typing...',
      errorMessage: 'An error occurred. Please try again.',
      suggestedQuestions: 'Suggested questions',
      tipTitle: 'Salus Tip',
      miniPlaceholder: 'Ask Salus...',
      suggestions: [
        'How can I improve my sleep?',
        'What are the symptoms of dehydration?',
        'Why do I feel tired all day?',
        'When should I worry about headaches?'
      ],
      contextualTips: [
        {
          id: 'hydration',
          title: 'Hydration',
          message: 'Remember to drink at least 2 liters of water daily, especially during summer.'
        },
        {
          id: 'medication',
          title: 'Medication reminder',
          message: 'You have medications scheduled for today. Remember to take them regularly.'
        },
        {
          id: 'activity',
          title: 'Physical activity',
          message: 'You haven\'t recorded any physical activity in the last 3 days. A brisk walk can improve your wellbeing.'
        }
      ],
      disclaimer: 'Remember: information provided is for informational purposes and does not replace medical advice.'
    },
    es: {
      placeholder: 'Escribe un mensaje...',
      welcomeTitle: 'Hola, soy Salus',
      welcomeMessage: '¿Cómo puedo ayudarte hoy con tu salud?',
      send: 'Enviar',
      loading: 'Salus está escribiendo...',
      errorMessage: 'Ocurrió un error. Inténtalo de nuevo.',
      suggestedQuestions: 'Preguntas sugeridas',
      tipTitle: 'Consejo de Salus',
      miniPlaceholder: 'Pregunta a Salus...',
      suggestions: [
        '¿Cómo puedo mejorar mi sueño?',
        '¿Cuáles son los síntomas de deshidratación?',
        '¿Por qué me siento cansado todo el día?',
        '¿Cuándo debo preocuparme por los dolores de cabeza?'
      ],
      contextualTips: [
        {
          id: 'hydration',
          title: 'Hidratación',
          message: 'Recuerda beber al menos 2 litros de agua al día, especialmente durante el verano.'
        },
        {
          id: 'medication',
          title: 'Recordatorio de medicamentos',
          message: 'Tienes medicamentos programados para hoy. Recuerda tomarlos con regularidad.'
        },
        {
          id: 'activity',
          title: 'Actividad física',
          message: 'No has registrado actividad física en los últimos 3 días. Una caminata rápida puede mejorar tu bienestar.'
        }
      ],
      disclaimer: 'Recuerda: la información proporcionada es con fines informativos y no reemplaza el consejo médico.'
    }
  };

  // Funzione per ottenere le traduzioni nella lingua selezionata
  const t = (key) => {
    return translations[language]?.[key] || translations['it'][key];
  };

  // Scroll alla fine dei messaggi quando arriva un nuovo messaggio
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Messaggio di benvenuto all'apertura
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Aggiungi il messaggio di benvenuto quando si apre l'assistente la prima volta
      setMessages([
        {
          id: 'welcome',
          type: 'assistant',
          title: t('welcomeTitle'),
          content: t('welcomeMessage'),
          timestamp: new Date()
        }
      ]);
      
      // Seleziona un suggerimento contestuale casuale
      const contextualTips = t('contextualTips');
      // Suggerimenti iniziali per l'utente
      setSuggestions(t('suggestions'));
    }
  }, [isOpen, messages.length, t]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;
    
    const userMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // Invio messaggio all'API
      const response = await API.post('/api/ai/chat', { message: newMessage });
      
      // Aggiungi risposta dell'assistente
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        type: 'assistant',
        content: response.data.reply,
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Genera nuovi suggerimenti in base alla conversazione
      generateSuggestions(userMessage.content, response.data.reply);
    } catch (error) {
      console.error('Errore nella richiesta AI:', error);
      
      // Messaggio di errore
      const errorMessage = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: t('errorMessage'),
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Funzione per generare nuovi suggerimenti in base alla conversazione
  const generateSuggestions = (userMessage, aiReply) => {
    // In una implementazione reale, questo potrebbe essere generato dall'API
    // in base all'analisi della conversazione

    // Per ora, usiamo alcuni suggerimenti predefiniti in base a pattern nella conversazione
    const lowercaseMsg = userMessage.toLowerCase();
    const lowercaseReply = aiReply.toLowerCase();
    
    let newSuggestions = [];
    
    if (lowercaseMsg.includes('sonno') || lowercaseReply.includes('sonno')) {
      newSuggestions = [
        'Quali alimenti favoriscono il sonno?',
        'Quanto sonno è necessario per un adulto?',
        'Come posso ridurre l\'insonnia?'
      ];
    } else if (lowercaseMsg.includes('stress') || lowercaseReply.includes('stress')) {
      newSuggestions = [
        'Quali sono i sintomi fisici dello stress?',
        'Tecniche di respirazione per ridurre l\'ansia',
        'Lo stress può influenzare la pressione sanguigna?'
      ];
    } else if (lowercaseMsg.includes('mal di testa') || lowercaseReply.includes('mal di testa')) {
      newSuggestions = [
        'Quali sono le cause più comuni del mal di testa?',
        'Differenza tra emicrania e cefalea tensiva',
        'Quando devo preoccuparmi per un mal di testa forte?'
      ];
    } else {
      // Suggerimenti generici se non troviamo pattern specifici
      newSuggestions = [
        'Come posso migliorare la mia alimentazione?',
        'Quanto esercizio fisico è consigliato settimanalmente?',
        'Come posso monitorare meglio la mia salute?',
        'Quali sono i segnali di allarme per problemi cardiaci?'
      ];
    }
    
    setSuggestions(newSuggestions);
  };

  const handleSuggestionClick = (suggestion) => {
    setNewMessage(suggestion);
    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : 'it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  const toggleAssistant = () => {
    setIsOpen(!isOpen);
  };

  // Se è aperto, mostra il pannello dell'assistente, altrimenti solo il pulsante
  return (
    <div className={`ai-assistant-widget ${isOpen ? 'open' : ''}`}>
      {!isOpen ? (
        <button 
          className="ai-widget-button pulse-animation" 
          onClick={toggleAssistant}
          aria-label="Apri assistente Salus"
        >
          <div className="ai-widget-icon">
            <img src="/salus-logo.svg" alt="Salus" className="salus-logo" />
          </div>
          <div className="ai-widget-text">{t('miniPlaceholder')}</div>
        </button>
      ) : (
        <div className="ai-assistant-panel">
          <div className="ai-panel-header">
            <div className="ai-identity">
              <img src="/salus-logo.svg" alt="Salus" className="salus-logo" />
              <div className="ai-info">
                <h3>Salus</h3>
                <span className="ai-status">Assistente Sanitario</span>
              </div>
            </div>
            <button className="ai-close-button" onClick={toggleAssistant}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="ai-message-container">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`ai-message ${message.type === 'user' ? 'user-message' : message.type === 'error' ? 'error-message' : 'assistant-message'}`}
              >
                {message.type === 'user' ? (
                  <div className="user-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                ) : (
                  <div className="assistant-avatar">
                    <img src="/salus-logo.svg" alt="Salus" className="salus-logo-small" />
                  </div>
                )}
                <div className="message-content">
                  {message.title && <div className="message-title">{message.title}</div>}
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">{formatTimestamp(message.timestamp)}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="ai-message assistant-message">
                <div className="assistant-avatar">
                  <img src="/salus-logo.svg" alt="Salus" className="salus-logo-small" />
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
          
          {suggestions.length > 0 && (
            <div className="ai-suggestions">
              <div className="suggestions-title">{t('suggestedQuestions')}</div>
              <div className="suggestions-list">
                {suggestions.map((suggestion, index) => (
                  <button 
                    key={index} 
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="ai-disclaimer">{t('disclaimer')}</div>
          
          <div className="ai-input-container">
            <input
              type="text"
              ref={messageInputRef}
              className="ai-input"
              placeholder={t('placeholder')}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              className="ai-send-button" 
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || isLoading}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AIAssistantWidget; 