import React, { useState, useEffect, useRef } from 'react';
import '../styles/AIAssistant.css';

const AIAssistant = () => {
  // Stati per i messaggi e l'input
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recentSymptoms, setRecentSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Suggerimenti predefiniti
  const [suggestions, setSuggestions] = useState([
    "Come posso gestire il mio mal di testa?",
    "Quali sono i sintomi dell'influenza?",
    "Consigli per dormire meglio",
    "Quando dovrei consultare un medico per la febbre?",
    "Come posso ridurre lo stress?"
  ]);
  
  // Riferimento per scorrere automaticamente alla fine della chat
  const messagesEndRef = useRef(null);
  
  // Caricamento dei dati iniziali
  useEffect(() => {
    // Aggiungi un messaggio di benvenuto
    const welcomeMessage = {
      id: Date.now(),
      text: "Ciao! Sono Salus, il tuo assistente sanitario virtuale. Come posso aiutarti oggi?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    };
    
    setMessages([welcomeMessage]);
    
    // Simula il caricamento dei sintomi recenti
    const fetchRecentSymptoms = async () => {
      try {
        console.log("Modalità demo: uso dati di esempio per i sintomi recenti");
        
        // Simula un ritardo di caricamento
        setTimeout(() => {
          // Dati di esempio per i sintomi recenti
          const symptomData = [
            { id: 1, name: "Mal di testa", intensity: 3, date: "2023-07-18" },
            { id: 2, name: "Stanchezza", intensity: 4, date: "2023-07-19" },
            { id: 3, name: "Tosse", intensity: 2, date: "2023-07-20" }
          ];
          
          setRecentSymptoms(symptomData);
          
          // Aggiorna i suggerimenti con sintomi recenti
          if (Array.isArray(symptomData) && symptomData.length > 0) {
            const symptomSuggestions = [
              `Come posso gestire il mio ${symptomData[0].name.toLowerCase()}?`,
              `Quanto dovrebbe durare la ${symptomData[symptomData.length - 1].name.toLowerCase()}?`
            ];
            
            setSuggestions(prevSuggestions => {
              // Prendi i primi 3 suggerimenti predefiniti e aggiungi quelli basati sui sintomi
              return [...prevSuggestions.slice(0, 3), ...symptomSuggestions];
            });
          }
          
          setLoading(false);
        }, 1500);
      } catch (err) {
        console.error('Errore nel caricamento dei sintomi recenti:', err);
        setError('Errore nel caricamento dei dati: ' + err.message);
        setLoading(false);
      }
    };
    
    fetchRecentSymptoms();
  }, []);
  
  // Effetto per scorrere alla fine della chat quando vengono aggiunti messaggi
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Funzione per generare una risposta dell'assistente AI
  const generateAIResponse = (userMessage) => {
    setIsTyping(true);
    
    // Simula un ritardo di risposta per un effetto più realistico
    setTimeout(() => {
      let response = "Mi dispiace, non ho una risposta per questa domanda. Potresti provare a chiedere qualcos'altro?";
      
      // Semplici risposte predefinite basate su parole chiave
      const lowercaseMessage = userMessage.toLowerCase();
      
      if (lowercaseMessage.includes('mal di testa')) {
        response = "Per il mal di testa, puoi provare:\n\n1. Riposo in un ambiente buio e silenzioso\n2. Applicare impacchi freddi sulla fronte\n3. Bere molta acqua per evitare la disidratazione\n4. Prendere un analgesico come paracetamolo o ibuprofene secondo le indicazioni\n\nSe il mal di testa è grave, improvviso o accompagnato da altri sintomi come confusione o rigidità al collo, consulta immediatamente un medico.";
      } else if (lowercaseMessage.includes('influenza') || lowercaseMessage.includes('sintomi')) {
        response = "I sintomi comuni dell'influenza includono:\n\n• Febbre alta improvvisa (38°C o più)\n• Dolori muscolari e articolari\n• Stanchezza e debolezza\n• Mal di testa\n• Tosse secca\n• Mal di gola\n• Congestione nasale\n• Brividi e sudorazione\n\nIl riposo, l'idratazione e farmaci da banco per alleviare i sintomi sono generalmente consigliati. Consulta un medico se i sintomi sono gravi o se fai parte di un gruppo a rischio.";
      } else if (lowercaseMessage.includes('dormire') || lowercaseMessage.includes('sonno')) {
        response = "Per migliorare la qualità del sonno:\n\n1. Mantieni un orario regolare per andare a letto e svegliarti\n2. Crea un ambiente confortevole, buio e fresco\n3. Limita l'uso di dispositivi elettronici prima di dormire\n4. Evita caffeina, alcol e pasti pesanti nelle ore serali\n5. Fai attività fisica regolare, ma non poco prima di dormire\n6. Prova tecniche di rilassamento come la meditazione\n\nSe continui ad avere problemi di sonno, considera di consultare un medico.";
      } else if (lowercaseMessage.includes('febbre')) {
        response = "Dovresti consultare un medico per la febbre nei seguenti casi:\n\n• Se supera i 39,4°C\n• Se dura più di tre giorni\n• Se è accompagnata da forte mal di testa, rigidità del collo, eruzione cutanea, confusione, difficoltà respiratorie\n• Nei bambini molto piccoli o negli anziani\n• Se hai condizioni mediche preesistenti\n\nIn caso di febbre, è importante mantenersi idratati e riposare adeguatamente.";
      } else if (lowercaseMessage.includes('stress')) {
        response = "Per ridurre lo stress puoi provare:\n\n1. Tecniche di respirazione profonda e meditazione\n2. Attività fisica regolare\n3. Mantenere una dieta equilibrata\n4. Dormire a sufficienza\n5. Limitare caffeina e alcol\n6. Attività piacevoli e hobby\n7. Trascorrere tempo all'aria aperta\n8. Limitare l'uso dei dispositivi digitali\n\nSe lo stress interferisce con la tua vita quotidiana, considera di parlare con un professionista della salute mentale.";
      } else if (lowercaseMessage.includes('tosse')) {
        response = "Per la tosse, ecco alcuni consigli:\n\n1. Bevi molti liquidi per mantenerti idratato\n2. Usa un umidificatore o fai docce calde per allentare il muco\n3. Miele e limone in acqua calda possono aiutare (non per bambini sotto 1 anno)\n4. Caramelle per la gola o sciroppi possono dare sollievo temporaneo\n\nSe la tosse persiste più di 2 settimane, è accompagnata da febbre alta, sangue, o difficoltà respiratorie, consulta un medico.";
      } else if (lowercaseMessage.includes('stanchezza') || lowercaseMessage.includes('affaticamento')) {
        response = "La stanchezza persistente può essere causata da:\n\n• Mancanza di sonno o sonno di scarsa qualità\n• Stress e ansia\n• Dieta sbilanciata o disidratazione\n• Sedentarietà o eccesso di attività fisica\n• Condizioni mediche come anemia o problemi tiroidei\n\nMigliorare le abitudini di sonno, fare esercizio regolare, mantenere una dieta equilibrata e gestire lo stress possono aiutare. Se la stanchezza persiste o è grave, consulta un medico.";
      } else if (lowercaseMessage.includes('medico') || lowercaseMessage.includes('dottore')) {
        response = "È importante consultare un medico quando:\n\n• I sintomi sono gravi o peggiorano rapidamente\n• Hai dolore intenso o improvviso\n• Hai difficoltà a respirare o dolore al petto\n• Hai febbre alta persistente\n• Noti cambiamenti inspiegabili nel tuo corpo o nella tua salute\n• I sintomi interferiscono con la tua vita quotidiana\n\nRicorda che questa app non sostituisce il parere medico professionale.";
      }
      
      const newMessage = {
        id: Date.now(),
        text: response,
        sender: 'ai',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  // Funzione per inviare un messaggio
  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Crea il messaggio dell'utente
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Aggiungi il messaggio alla chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Genera la risposta dell'assistente
    generateAIResponse(input);
    
    // Resetta l'input
    setInput('');
  };
  
  // Funzione per gestire i click sui suggerimenti
  const handleSuggestionClick = (suggestion) => {
    // Crea il messaggio dell'utente dal suggerimento
    const userMessage = {
      id: Date.now(),
      text: suggestion,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Aggiungi il messaggio alla chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Genera la risposta dell'assistente
    generateAIResponse(suggestion);
  };
  
  // Scorre alla fine della chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Funzione per formattare la data
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // Aggiorna i suggerimenti in base ai sintomi recenti
  useEffect(() => {
    if (loading) return;
    
    // Verifica che recentSymptoms sia un array prima di usare map
    if (Array.isArray(recentSymptoms) && recentSymptoms.length > 0) {
      const symptomSuggestions = [
        `Come posso gestire il mio ${recentSymptoms[0].name.toLowerCase()}?`,
        `È normale avere ${recentSymptoms[recentSymptoms.length - 1].name.toLowerCase()} per diversi giorni?`
      ];
      
      setSuggestions(prevSuggestions => {
        // Assicurati che prevSuggestions sia un array prima di usare slice
        const baseSuggestions = Array.isArray(prevSuggestions) ? prevSuggestions.slice(0, 3) : [
          "Come posso gestire il mio mal di testa?",
          "Quali sono i sintomi dell'influenza?",
          "Consigli per dormire meglio"
        ];
        
        return [...baseSuggestions, ...symptomSuggestions];
      });
    }
  }, [recentSymptoms, loading]);

  return (
    <div className="ai-assistant">
      <header className="assistant-header">
        <h2>Assistente Salus</h2>
        <p className="assistant-subtitle">Risposte immediate alle tue domande sulla salute</p>
      </header>
      
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Inizializzazione dell'assistente...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="chat-container">
            <div className="messages">
              {messages.map(message => (
                <div 
                  key={message.id} 
                  className={`message ${message.sender}`}
                >
                  <div className="message-content">
                    {message.text.split('\n').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < message.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="message-timestamp">
                    {formatTimestamp(message.timestamp)}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="typing-indicator">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              )}
              
              <div ref={messagesEndRef}></div>
            </div>
            
            <div className="suggestions-container">
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
            
            <form className="input-container" onSubmit={sendMessage}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Fai una domanda sulla salute..."
                disabled={isTyping}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isTyping}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
          
          <div className="assistant-disclaimer">
            <p><strong>Nota:</strong> Questo assistente fornisce informazioni generali sulla salute e non sostituisce la consulenza medica professionale. In caso di emergenza o problemi di salute seri, consulta un medico.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant; 