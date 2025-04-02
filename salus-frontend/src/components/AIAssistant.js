import React, { useState, useEffect, useRef } from 'react';
import '../styles/AIAssistant.css';
import { sendMessageToAI } from '../api';
import { useTranslation } from 'react-i18next';

function AIAssistant() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('aiWelcomeMessage', 'Ciao! Sono il tuo assistente Salus. Come posso aiutarti con la tua salute oggi?')
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  // Aggiorna il messaggio di benvenuto quando cambia la lingua
  useEffect(() => {
    setMessages(prev => {
      // Mantiene tutti i messaggi eccetto il primo
      const otherMessages = prev.length > 1 ? prev.slice(1) : [];
      
      // Aggiorna solo il messaggio di benvenuto (il primo)
      return [
        {
          role: 'assistant',
          content: t('aiWelcomeMessage', 'Ciao! Sono il tuo assistente Salus. Come posso aiutarti con la tua salute oggi?')
        },
        ...otherMessages
      ];
    });
  }, [i18n.language, t]);

  // Ottiene una risposta dall'API di OpenAI
  const getAIResponse = async (query) => {
    try {
      // Utilizziamo la funzione sendMessageToAI dal nostro file api.js
      // che gestisce sia le richieste online che la modalità offline
      const response = await sendMessageToAI(query);
      
      if (response && response.reply) {
        return response.reply;
      } else {
        throw new Error('Risposta non valida dal servizio AI');
      }
    } catch (error) {
      console.error('Errore nella chiamata API:', error);
      return t('aiErrorMessage', "Mi dispiace, ho riscontrato un problema nel processare la tua richiesta. Riprova più tardi o consulta il tuo medico per informazioni specifiche.");
    }
  };

  // Gestisce l'invio di un nuovo messaggio
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Aggiunge il messaggio dell'utente
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Ottiene la risposta dall'AI
      const response = await getAIResponse(input);

      // Aggiunge la risposta dell'assistente
      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Errore nel processare il messaggio:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: t('aiErrorMessage', "Mi dispiace, ho riscontrato un problema nel processare la tua richiesta. Riprova più tardi o consulta il tuo medico per informazioni specifiche.")
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Scorre automaticamente ai messaggi più recenti
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Espande/comprime l'assistente
  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`ai-assistant-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="ai-assistant-header">
        <div className="ai-assistant-title">
          <i className="fas fa-robot"></i>
          <h3>{t('aiAssistant', 'Assistente Salus')}</h3>
        </div>
        <div className="ai-assistant-controls">
          <button
            className="ai-assistant-toggle"
            onClick={toggleExpansion}
            title={isExpanded ? t('collapse', 'Comprimi') : t('expand', 'Espandi')}
          >
            <i className={`fas fa-${isExpanded ? 'minus' : 'plus'}`}></i>
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="ai-assistant-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === 'assistant' ? 'assistant' : 'user'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="avatar">
                    <i className="fas fa-robot"></i>
                  </div>
                )}
                <div className="content">
                  <p>{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="avatar">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="avatar">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="content typing">
                  <span className="dot"></span>
                  <span className="dot"></span>
                  <span className="dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-assistant-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('writeMessage', 'Scrivi un messaggio...')}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              title={t('sendMessage', 'Invia messaggio')}
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default AIAssistant; 