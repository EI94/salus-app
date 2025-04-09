import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/AdvancedFeatures.css';
import '../styles/AIAssistant.css';
import { UserContext } from '../context/UserContext';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  FiActivity, FiCalendar, FiPlusCircle, FiThermometer,
  FiPieChart, FiFileText, FiHeart, FiTrendingUp, FiBell, FiMessageSquare, FiAlertTriangle
} from 'react-icons/fi';
import { 
  FaPills, FaChartLine, FaSmile, FaClipboardList, 
  FaSun, FaCloudRain, FaMoon, FaLightbulb, FaRobot
} from 'react-icons/fa';
import { sendMessageToAI } from '../api';
import AppointmentsManager from './AppointmentsManager';
import OnboardingDemo from './OnboardingDemo';
import SalusChat from './SalusChat';

const DashboardAIAssistant = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('aiWelcomeMessage', 'Ciao! Sono Salus AI, il tuo assistente personale per la salute. Come posso aiutarti oggi?')
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useContext(UserContext);
  const messagesEndRef = React.useRef(null);
  
  // Ottiene una risposta dall'assistente simulato AI
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
      
      // Non mostrare più l'errore "offline", la risposta viene generata localmente
      
      return aiResponse.response || t('aiErrorMessage', "Mi dispiace, ho riscontrato un problema nel processare la tua richiesta. Riprova più tardi.");
    } catch (error) {
      console.error('Errore nella chiamata AI:', error);
      setError('Impossibile generare una risposta. Per favore riprova.');
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

  return (
    <div className="dashboard-ai-assistant-card">
      <div className="ai-assistant-container dashboard-integrated">
        <div className="ai-assistant-header">
          <div className="ai-assistant-title">
            <FaRobot />
            <h3>Salus AI</h3>
          </div>
        </div>

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
            className="send-button"
          >
            <FiMessageSquare />
          </button>
        </form>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const userName = userContext?.user?.name || 'Utente';
  
  // Stati per i dati
  const [symptoms, setSymptoms] = useState([]);
  const [medications, setMedications] = useState([]);
  const [wellness, setWellness] = useState([]);
  const [loading, setLoading] = useState(true);
  const [healthTip, setHealthTip] = useState('');
  const [weather, setWeather] = useState(null);
  const [showTodayModal, setShowTodayModal] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Consigli di salute casuali
  const healthTips = [
    "Bere 8 bicchieri d'acqua al giorno migliora il tuo benessere generale e la tua energia.",
    "30 minuti di attività fisica moderata ogni giorno possono ridurre il rischio di malattie croniche.",
    "Una dieta ricca di frutta e verdura aiuta a rafforzare il sistema immunitario.",
    "Meditare per 10 minuti al giorno può ridurre lo stress e migliorare la concentrazione.",
    "Un sonno regolare di 7-8 ore migliora la memoria e le funzioni cognitive.",
    "Piccole pause durante il lavoro possono aumentare la produttività e ridurre l'affaticamento."
  ];

  useEffect(() => {
    // Verifica se è il primo accesso dell'utente
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && userContext?.user) {
      setShowOnboarding(true);
      // Salva che l'utente ha visto l'onboarding
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
    
    // Impostiamo la data corrente e la aggiorniamo ogni minuto
    const dateInterval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    // Simuliamo il caricamento dei dati
    setTimeout(() => {
      setLoading(false);
      
      // Seleziona un consiglio di salute casuale
      const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
      setHealthTip(randomTip);
      
      // Simula dati meteo
      setWeather({
        temp: Math.floor(Math.random() * 15) + 15, // Temperatura tra 15-30°C
        condition: ['Soleggiato', 'Nuvoloso', 'Pioggia leggera', 'Sereno'][Math.floor(Math.random() * 4)],
        humidity: Math.floor(Math.random() * 40) + 40 // Umidità tra 40-80%
      });
    }, 800);
    
    return () => clearInterval(dateInterval);
  }, [userContext?.user]);

  // Funzione per navigare direttamente alla schermata di aggiunta
  const navigateToAdd = (path, action) => {
    navigate(path, { state: { showAddForm: true, action } });
  };
  
  // Componente per data e ora corrente
  const CurrentDateTime = () => (
    <div className="current-date-time">
      <div className="date-display">
        <div className="day-name">{format(currentDate, 'EEEE', { locale: it })}</div>
        <div className="date-number">
          <span className="day">{format(currentDate, 'd', { locale: it })}</span>
          <span className="month-year">
            {format(currentDate, 'MMMM yyyy', { locale: it })}
          </span>
        </div>
      </div>
      <div className="time-display">
        {format(currentDate, 'HH:mm', { locale: it })}
      </div>
    </div>
  );
  
  // Componente statistiche rapide  
  const QuickStats = () => (
    <div className="quick-stats">
      <div className="stat-item">
        <div className="stat-icon">
          <FiCalendar />
        </div>
        <div className="stat-data">
          <span className="stat-value">0/3</span>
          <span className="stat-label">Attività completate oggi</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">
          <FiTrendingUp />
        </div>
        <div className="stat-data">
          <span className="stat-value">+2%</span>
          <span className="stat-label">Benessere rispetto alla settimana scorsa</span>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">
          <FiBell />
        </div>
        <div className="stat-data">
          <span className="stat-value">2</span>
          <span className="stat-label">Promemoria per oggi</span>
        </div>
      </div>
    </div>
  );
  
  // Componente per la sezione "Il mio giorno"
  const MyDaySection = () => (
    <div className="my-day-section">
      <div className="section-header">
        <h2>
          <span className="section-icon"><FiActivity /></span>
          Il mio giorno
        </h2>
        <button 
          className="add-today-button" 
          onClick={() => setShowTodayModal(true)}
          aria-label="Aggiorna il mio stato"
        >
          <FiPlusCircle /> Aggiorna
        </button>
      </div>
      
      <div className="today-summary">
        <CurrentDateTime />
        
        <div className="today-cards">
          <div className="today-card">
            <div className="today-card-icon mood">
              <FaSmile />
            </div>
            <div className="today-card-label">Umore</div>
            <div className="today-card-value">Non registrato</div>
          </div>
          
          <div className="today-card">
            <div className="today-card-icon sleep">
              <FaMoon />
            </div>
            <div className="today-card-label">Sonno</div>
            <div className="today-card-value">Non registrato</div>
          </div>
          
          <div className="today-card">
            <div className="today-card-icon weather">
              {weather?.condition === 'Soleggiato' || weather?.condition === 'Sereno' ? 
                <FaSun /> : weather?.condition === 'Nuvoloso' ? 
                <FaCloudRain opacity={0.5} /> : <FaCloudRain />}
            </div>
            <div className="today-card-label">Meteo</div>
            <div className="today-card-value">{weather ? `${weather.temp}°C, ${weather.condition}` : 'Caricamento...'}</div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Componente per le azioni rapide
  const QuickActions = () => (
    <div className="quick-actions-section">
      <h2>
        <span className="section-icon"><FiPlusCircle /></span>
        Azioni rapide
      </h2>
      <div className="quick-actions">
        <button className="action-button" onClick={() => navigateToAdd('/sintomi', 'add')}>
          <div className="action-icon symptom">
            <FiThermometer />
          </div>
          <span className="action-label">Registra sintomo</span>
        </button>
        
        <button className="action-button" onClick={() => navigateToAdd('/farmaci', 'add')}>
          <div className="action-icon medication">
            <FaPills />
          </div>
          <span className="action-label">Aggiungi farmaco</span>
        </button>
        
        <button className="action-button" onClick={() => navigateToAdd('/benessere', 'add')}>
          <div className="action-icon wellness">
            <FiHeart />
          </div>
          <span className="action-label">Aggiorna benessere</span>
        </button>
        
        <button className="action-button" onClick={() => navigate('/assistente')}>
          <div className="action-icon assistant">
            <FaRobot />
          </div>
          <span className="action-label">Chiedi all'assistente</span>
        </button>
      </div>
    </div>
  );
  
  // Componente per consigli sulla salute
  const HealthTips = () => (
    <div className="health-tips-section">
      <h2>
        <span className="section-icon"><FaLightbulb /></span>
        Suggerimento del giorno
      </h2>
      <div className="tip-card">
        <div className="tip-content">
          <p>{healthTip}</p>
        </div>
      </div>
    </div>
  );
  
  // Componente card per le sezioni principali
  const TrackingCard = ({ icon, title, description, buttonText, to, emptyState = true, data = [], color }) => (
    <div className={`tracking-card ${emptyState ? 'empty' : ''} ${color}-card`}>
      <div className="card-header">
        <div className="card-icon">
          {icon}
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
      
      <div className="card-content">
        {emptyState ? (
          <p className="empty-state-description">{description}</p>
        ) : (
          <div className="card-data">
            {/* Qui verrebbero mostrati i dati se ce ne fossero */}
            <p>Hai {data.length} elementi registrati</p>
          </div>
        )}
      </div>
      
      <div className="card-actions">
        <Link to={to} className="card-button">
          {buttonText}
        </Link>
        
        <button 
          className="add-button" 
          onClick={() => navigateToAdd(to, 'add')}
          aria-label={`Aggiungi nuovo ${title.toLowerCase()}`}
        >
          <FiPlusCircle /> Aggiungi
        </button>
      </div>
    </div>
  );
  
  // Componente modale per aggiornamento giornaliero
  const TodayModal = () => {
    // Stato per gestire la selezione dell'umore
    const [selectedMood, setSelectedMood] = useState(null);
    // Stato per gestire la qualità del sonno
    const [sleepQuality, setSleepQuality] = useState(3);
    
    // Funzione per gestire il salvataggio dei dati
    const handleSave = () => {
      // Qui potremmo inviare i dati al backend
      // Per ora, chiudiamo semplicemente il modale e mostriamo un messaggio
      setShowTodayModal(false);
      
      // Esempio di messaggio di conferma che potremmo mostrare
      alert("Dati salvati con successo!");
    };
    
    // Funzione per navigare all'aggiunta di un sintomo
    const handleAddSymptom = (e) => {
      e.preventDefault(); // Previene la chiusura del modale
      setShowTodayModal(false);
      navigateToAdd('/sintomi', 'add');
    };
    
    return (
      <div className={`modal-overlay ${showTodayModal ? 'active' : ''}`} onClick={() => setShowTodayModal(false)}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Come ti senti oggi?</h2>
            <button 
              className="close-modal" 
              onClick={() => setShowTodayModal(false)}
              aria-label="Chiudi"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          
          <div className="modal-body">
            <div className="mood-selector">
              <h3>Il tuo umore</h3>
              <div className="mood-options">
                <button 
                  className={`mood-option ${selectedMood === 'sad' ? 'selected' : ''}`}
                  onClick={() => setSelectedMood('sad')}
                  type="button"
                  aria-label="Umore triste"
                >
                  <span className="mood-emoji">😔</span>
                  <span>Triste</span>
                </button>
                <button 
                  className={`mood-option ${selectedMood === 'neutral' ? 'selected' : ''}`}
                  onClick={() => setSelectedMood('neutral')}
                  type="button"
                  aria-label="Umore neutro"
                >
                  <span className="mood-emoji">😐</span>
                  <span>Neutro</span>
                </button>
                <button 
                  className={`mood-option ${selectedMood === 'good' ? 'selected' : ''}`}
                  onClick={() => setSelectedMood('good')}
                  type="button"
                  aria-label="Umore buono"
                >
                  <span className="mood-emoji">😊</span>
                  <span>Bene</span>
                </button>
                <button 
                  className={`mood-option ${selectedMood === 'great' ? 'selected' : ''}`}
                  onClick={() => setSelectedMood('great')}
                  type="button"
                  aria-label="Umore ottimo"
                >
                  <span className="mood-emoji">😄</span>
                  <span>Ottimo</span>
                </button>
              </div>
            </div>
            
            <div className="sleep-selector">
              <h3>Qualità del sonno</h3>
              <div className="sleep-slider">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(parseInt(e.target.value))}
                  aria-label="Seleziona qualità del sonno"
                />
                <div className="range-labels">
                  <span>Scarsa</span>
                  <span>Media</span>
                  <span>Ottima</span>
                </div>
              </div>
            </div>
            
            <div className="symptoms-quick-add">
              <h3>Hai sintomi oggi?</h3>
              <button 
                className="quick-add-button"
                onClick={handleAddSymptom}
                type="button"
              >
                <FiPlusCircle /> Aggiungi sintomo
              </button>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              className="secondary-button" 
              onClick={() => setShowTodayModal(false)}
              type="button"
            >
              Annulla
            </button>
            <button 
              className="primary-button"
              onClick={handleSave}
              type="button"
            >
              Salva
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Preparando la tua dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {showOnboarding && <OnboardingDemo onComplete={() => setShowOnboarding(false)} />}
      <div className="dashboard-header">
        <h1 className="dashboard-title">Ciao, {userName}!</h1>
        <p className="dashboard-subtitle">Ecco il riepilogo della tua salute e benessere</p>
      </div>
      
      <QuickStats />
      
      <MyDaySection />
      
      <QuickActions />
      
      <div className="tracking-sections">
        <TrackingCard
          icon={<FiThermometer />}
          title={t('symptoms')}
          description={t('noSymptomsDescription', 'Registra i tuoi sintomi per tenere traccia della tua salute nel tempo')}
          buttonText={t('viewSymptoms', 'Visualizza sintomi')}
          to="/sintomi"
          emptyState={symptoms.length === 0}
          data={symptoms}
          color="symptom"
        />
        
        <TrackingCard
          icon={<FaPills />}
          title={t('medications')}
          description={t('noMedicationsDescription', 'Aggiungi i tuoi farmaci per ricevere promemoria e monitorare l\'assunzione')}
          buttonText={t('viewMedications', 'Visualizza farmaci')}
          to="/farmaci"
          emptyState={medications.length === 0}
          data={medications}
          color="medication"
        />
        
        <TrackingCard
          icon={<FiHeart />}
          title={t('wellness')}
          description={t('noWellnessDescription', 'Tieni traccia del tuo umore, sonno e attività fisica')}
          buttonText={t('viewWellness', 'Visualizza benessere')}
          to="/benessere"
          emptyState={wellness.length === 0}
          data={wellness}
          color="wellness"
        />
      </div>
      
      <HealthTips />
      
      <div className="additional-features highlight-section">
        <h2>
          <span className="section-icon"><FiPieChart /></span>
          Funzionalità avanzate
        </h2>
        
        <p className="section-description">
          Esplora le nuove funzionalità avanzate di Salus per migliorare la gestione della tua salute
        </p>
        
        <div className="dashboard-cards">
          <Link to="/medication-reminders" className="dashboard-card reminder-card">
            <div className="card-icon"><FiBell /></div>
            <div className="card-content">
              <h3>Promemoria Farmaci</h3>
              <p>Imposta promemoria personalizzati per i tuoi farmaci</p>
            </div>
            <span className="new-badge">Nuovo</span>
          </Link>
          
          <Link to="/symptom-analytics" className="dashboard-card analytics-card">
            <div className="card-icon"><FaChartLine /></div>
            <div className="card-content">
              <h3>Analisi Sintomi</h3>
              <p>Visualizza grafici e correlazioni tra sintomi e farmaci</p>
            </div>
            <span className="new-badge">Nuovo</span>
          </Link>
          
          <Link to="/appointments" className="dashboard-card appointment-card">
            <div className="card-icon"><FiFileText /></div>
            <div className="card-content">
              <h3>Appuntamenti</h3>
              <p>Gestisci i tuoi appuntamenti medici con promemoria</p>
            </div>
            <span className="new-badge">Nuovo</span>
          </Link>
        </div>
      </div>
      
      <TodayModal />
      
      <div className="dashboard-section ai-assistant-section">
        <h2>
          <span className="section-icon"><FaRobot /></span>
          Assistente AI
        </h2>
        <DashboardAIAssistant />
      </div>

      <div className="dashboard-content">
        {activeTab === 'home' && (
          <div className="dashboard-home">
            <h2>Benvenuto nel tuo pannello di controllo per la salute</h2>
            <p>Qui puoi monitorare e gestire tutte le informazioni relative alla tua salute.</p>
          </div>
        )}
        {activeTab === 'appointments' && (
          <AppointmentsManager />
        )}
      </div>

      <div className="dashboard-sidebar">
        <SalusChat />
      </div>
    </div>
  );
};

export default Dashboard; 