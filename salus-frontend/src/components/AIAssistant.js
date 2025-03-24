import React, { useState, useEffect, useRef } from 'react';
import '../styles/AIAssistant.css';

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

  // Simula le risposte dell'assistente IA
  const aiResponse = (query) => {
    // Simula una breve attesa per rendere l'interazione più naturale
    setIsLoading(true);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Risposte predefinite basate su parole chiave nel messaggio dell'utente
        let response = '';
        const lowercaseQuery = query.toLowerCase();
        
        if (lowercaseQuery.includes('mal di testa') || lowercaseQuery.includes('cefalea')) {
          response = "I mal di testa possono essere causati da stress, disidratazione o problemi di vista. Ti consiglio di bere più acqua, riposare in una stanza buia e silenziosa, e se i sintomi persistono, di consultare il tuo medico.";
        } 
        else if (lowercaseQuery.includes('pressione') || lowercaseQuery.includes('ipertensione')) {
          response = "Per gestire la pressione sanguigna è importante mantenere uno stile di vita sano: ridurre il sale nella dieta, fare regolare esercizio fisico, limitare l'alcol e non fumare. Continua a monitorare regolarmente i tuoi valori.";
        }
        else if (lowercaseQuery.includes('diabete') || lowercaseQuery.includes('glicemia')) {
          response = "Il controllo del diabete richiede una combinazione di dieta equilibrata, esercizio fisico regolare e, se prescritti, farmaci. Monitora regolarmente i livelli di zucchero nel sangue e segui le indicazioni del tuo medico.";
        }
        else if (lowercaseQuery.includes('ansia') || lowercaseQuery.includes('stress')) {
          response = "L'ansia e lo stress possono influire negativamente sulla salute. Tecniche di rilassamento come la respirazione profonda, la meditazione e l'attività fisica regolare possono aiutare. Considera anche la possibilità di parlare con un professionista della salute mentale.";
        }
        else if (lowercaseQuery.includes('sonno') || lowercaseQuery.includes('insonnia')) {
          response = "Per migliorare il sonno, mantieni un orario regolare, evita caffeina e schermi luminosi prima di coricarti, e assicurati che la tua camera sia confortevole. Se l'insonnia persiste, consulta il tuo medico.";
        }
        else if (lowercaseQuery.includes('alimentazione') || lowercaseQuery.includes('dieta')) {
          response = "Un'alimentazione equilibrata è fondamentale per la salute. Cerca di includere frutta, verdura, proteine magre e cereali integrali. Limita zuccheri, grassi saturi e sale. Ricorda di idratare adeguatamente il tuo corpo.";
        }
        else if (lowercaseQuery.includes('esercizio') || lowercaseQuery.includes('attività fisica')) {
          response = "L'attività fisica regolare offre numerosi benefici per la salute, tra cui la riduzione del rischio di malattie croniche e il miglioramento dell'umore. Cerca di fare almeno 150 minuti di attività moderata alla settimana.";
        }
        else if (lowercaseQuery.includes('farmaco') || lowercaseQuery.includes('medicinale')) {
          response = "È importante seguire attentamente le prescrizioni mediche. Non interrompere o modificare i dosaggi senza consultare il tuo medico. Se noti effetti collaterali, contatta subito un professionista sanitario.";
        }
        else if (lowercaseQuery.includes('grazie') || lowercaseQuery.includes('grazie mille')) {
          response = "Prego! Sono qui per aiutarti. Non esitare a contattarmi se hai altre domande sulla tua salute.";
        }
        else if (lowercaseQuery.includes('ciao') || lowercaseQuery.includes('salve')) {
          response = "Ciao! Come posso aiutarti oggi con la tua salute?";
        }
        else {
          response = "Mi dispiace, non ho informazioni specifiche su questo argomento. Per consigli personalizzati, ti consiglio di consultare il tuo medico. Posso aiutarti con altro?";
        }
        
        setIsLoading(false);
        resolve(response);
      }, 1500); // Simula un breve ritardo di risposta
    });
  };

  // Gestisce l'invio di un nuovo messaggio
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Aggiunge il messaggio dell'utente
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Ottiene la risposta dell'assistente
    const response = await aiResponse(input);
    
    // Aggiunge la risposta dell'assistente
    const assistantMessage = { role: 'assistant', content: response };
    setMessages(prev => [...prev, assistantMessage]);
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
          
          <div className="ai-assistant-footer">
            <p>Assistente IA - Salus Health App</p>
          </div>
        </>
      )}
    </div>
  );
}

export default AIAssistant; 