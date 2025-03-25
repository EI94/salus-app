import React, { useState, useEffect, useRef } from 'react';
import '../styles/AIAssistant.css';
import axios from 'axios';

function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente Salus. Come posso aiutarti con la tua salute oggi?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  // Ottiene una risposta dall'API di OpenAI
  const getAIResponse = async (query) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await axios.post(`${apiUrl}/api/ai/chat`, {
        message: query
      });

      if (response.data.success) {
        return response.data.response;
      } else {
        throw new Error(response.data.error || 'Errore nella risposta del server');
      }
    } catch (error) {
      console.error('Errore nella chiamata API:', error);
      return "Mi dispiace, ho riscontrato un problema nel processare la tua richiesta. Riprova più tardi o consulta il tuo medico per informazioni specifiche.";
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
        content: "Mi dispiace, ho riscontrato un problema nel processare la tua richiesta. Riprova più tardi o consulta il tuo medico per informazioni specifiche."
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
          <h3>Assistente Salus</h3>
        </div>
        <div className="ai-assistant-controls">
          <button
            className="ai-assistant-toggle"
            onClick={toggleExpansion}
            title={isExpanded ? 'Comprimi' : 'Espandi'}
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
              placeholder="Scrivi un messaggio..."
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              title="Invia messaggio"
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