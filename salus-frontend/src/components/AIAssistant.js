import React, { useState, useEffect, useRef, useContext } from 'react';
import '../styles/AIAssistant.css';
import { sendMessageToAI } from '../api';
import { useTranslation } from 'react-i18next';
import { UserContext } from '../context/UserContext';
import { FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';

function AIAssistant() {
  const { t, i18n } = useTranslation();
  const { user } = useContext(UserContext);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('aiWelcomeMessage', 'Ciao! Sono il tuo assistente Salus. Come posso aiutarti con la tua salute oggi?')
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [error, setError] = useState(null);
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
      console.log('Richiedendo risposta AI per:', query);
      setError(null);
      
      if (!user) {
        console.log('Nessun utente autenticato');
        return t('aiAuthMessage', "Per utilizzare l'assistente AI devi effettuare l'accesso. Accedi o registrati per continuare.");
      }
      
      const conversationHistory = messages.map(m => ({ 
        role: m.role, 
        content: m.content 
      }));
      
      const aiResponse = await sendMessageToAI(query, conversationHistory);
      console.log('Risposta AI ricevuta:', aiResponse);
      
      if (aiResponse.offline) {
        console.log('Risposta offline ricevuta');
        setError(t('aiOfflineMessage', "L'assistente è attualmente offline. Riprova più tardi."));
      }
      
      return aiResponse.response || t('aiErrorMessage', "Mi dispiace, ho riscontrato un problema nel processare la tua richiesta. Riprova più tardi.");
    } catch (error) {
      console.error('Errore nella chiamata AI:', error);
      setError(t('aiServiceError', "Impossibile connettersi al servizio AI. Verifica la tua connessione o riprova più tardi."));
      return t('aiErrorMessage', "Mi dispiace, ho riscontrato un problema nel processare la tua richiesta. Riprova più tardi o consulta il tuo medico per informazioni specifiche.");
    }
  };

  // Gestisce l'invio di un nuovo messaggio
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;
    
    // Verifica se l'utente è loggato
    if (!user) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: t('aiAuthMessage', "Per utilizzare l'assistente AI devi effettuare l'accesso. Accedi o registrati per continuare.")
        }
      ]);
      setInput('');
      return;
    }

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
          <FaRobot />
          <h3>{t('aiAssistant', 'Assistente Salus')}</h3>
        </div>
        <div className="ai-assistant-controls">
          <button
            className="ai-assistant-toggle"
            onClick={toggleExpansion}
            title={isExpanded ? t('collapse', 'Comprimi') : t('expand', 'Espandi')}
          >
            {isExpanded ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              :
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            }
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="ai-assistant-messages">
            {error && (
              <div className="ai-error-message">
                <FiAlertTriangle /> {error}
              </div>
            )}
          
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.role === 'assistant' ? 'assistant' : 'user'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="avatar">
                    <FaRobot />
                  </div>
                )}
                <div className="content">
                  <p>{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="avatar">
                    <FiMessageSquare />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message assistant">
                <div className="avatar">
                  <FaRobot />
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
              <FiMessageSquare />
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default AIAssistant; 