import React, { useState, useEffect, useRef } from 'react';
import { salusAI } from '../services/aiAssistant';
import { useUser } from '../context/UserContext';
import '../styles/SalusChat.css';

const SalusChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated } = useUser();
  const messagesEndRef = useRef(null);

  // Scroll automatico alla fine dei messaggi
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Verifica l'autenticazione
    if (!isAuthenticated) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Per utilizzare l\'assistente Salus, devi effettuare l\'accesso.'
      }]);
      return;
    }

    // Aggiungi il messaggio dell'utente
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Ottieni la risposta da Salus AI
      const response = await salusAI.handleUserQuery(input);
      
      // Aggiungi la risposta
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Errore:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Mi dispiace, si è verificato un errore. Riprova più tardi.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="salus-chat">
      <div className="chat-header">
        <h2>Assistente Salus</h2>
        <p>Come posso aiutarti oggi?</p>
      </div>
      
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAuthenticated ? "Scrivi il tuo messaggio..." : "Accedi per utilizzare l'assistente"}
          disabled={isLoading || !isAuthenticated}
        />
        <button 
          type="submit" 
          disabled={isLoading || !isAuthenticated || !input.trim()}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? 'Invio...' : 'Invia'}
        </button>
      </form>
    </div>
  );
};

export default SalusChat; 