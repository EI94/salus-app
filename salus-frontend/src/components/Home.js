import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import axios from 'axios';
import '../styles/Home.css';

const Home = ({ userId, userName, userData }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    symptomCount: 0,
    medicationCount: 0,
    wellnessScore: 0,
    recentSymptoms: [],
    reminders: []
  });
  const [isNewUser, setIsNewUser] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Funzione per ottenere il colore in base al punteggio di benessere
  // const getWellnessColor = (score) => {
  //   if (score >= 80) return '#10b981'; // verde
  //   if (score >= 60) return '#0ea5e9'; // blu
  //   if (score >= 40) return '#f59e0b'; // giallo
  //   return '#ef4444'; // rosso
  // };
  
  // Funzione per ottenere il colore in base all'intensità del sintomo
  // const getIntensityColor = (intensity) => {
  //   if (intensity <= 2) return '#10b981'; // verde
  //   if (intensity <= 5) return '#f59e0b'; // giallo
  //   if (intensity <= 8) return '#f97316'; // arancione
  //   return '#ef4444'; // rosso
  // };

  // Inizializzazione dati dalla props
  useEffect(() => {
    if (userData) {
      // Se abbiamo dati dell'utente, li utilizziamo
      setStats({
        wellnessScore: calculateWellnessScore(userData.wellnessData),
        symptomCount: userData.symptoms ? userData.symptoms.length : 0,
        medicationCount: userData.medications ? userData.medications.length : 0,
        recentSymptoms: userData.symptoms ? getRecentSymptoms(userData.symptoms) : [],
        reminders: userData.medications ? getMedicationReminders(userData.medications) : []
      });
      setLoading(false);
    }
  }, [userData]);
  
  // Calcola punteggio benessere dalle registrazioni
  const calculateWellnessScore = (wellnessData) => {
    if (!wellnessData || wellnessData.length === 0) {
      return 65; // Valore predefinito neutro
    }
    
    // Ottieni le registrazioni dell'ultima settimana
    const lastWeekData = wellnessData.filter(item => {
      const itemDate = new Date(item.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return itemDate >= weekAgo;
    });
    
    if (lastWeekData.length === 0) return 65;
    
    // Calcola media dei valori di benessere
    const sum = lastWeekData.reduce((total, item) => {
      let score = 0;
      
      // Umore (1-5) → 0-20 punti
      if (item.mood) score += item.mood * 4;
      
      // Qualità del sonno (1-5) → 0-20 punti
      if (item.sleepQuality) score += item.sleepQuality * 4;
      
      // Energia (1-5) → 0-20 punti
      if (item.energyLevel) score += item.energyLevel * 4;
      
      // Stress (1-5, inverso) → 0-20 punti
      if (item.stressLevel) score += (6 - item.stressLevel) * 4;
      
      // Attività fisica (1-5) → 0-20 punti
      if (item.physicalActivity) score += item.physicalActivity * 4;
      
      return total + score;
    }, 0);
    
    return Math.round(sum / lastWeekData.length);
  };
  
  // Ottiene i sintomi più recenti
  const getRecentSymptoms = (symptoms) => {
    if (!symptoms || symptoms.length === 0) return [];
    
    return symptoms
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3)
      .map(symptom => ({
        id: symptom.id,
        name: symptom.name,
        intensity: symptom.intensity,
        date: symptom.date
      }));
  };
  
  // Ottiene i promemoria per i farmaci
  const getMedicationReminders = (medications) => {
    if (!medications || medications.length === 0) return [];
    
    const reminders = [];
    
    medications.forEach(med => {
      if (med.schedule && med.schedule.length > 0) {
        med.schedule.forEach(time => {
          reminders.push({
            id: `${med.id}-${time}`,
            medicationName: med.name,
            dosage: med.dosage,
            time: time,
            taken: false
          });
        });
      }
    });
    
    return reminders.slice(0, 3);
  };
  
  // Formattazione data
  // const formatDate = (dateString) => {
  //   const options = { day: 'numeric', month: 'short', year: 'numeric' };
  //   return new Date(dateString).toLocaleDateString('it-IT', options);
  // };
  
  // Controlla se l'utente è nuovo al primo rendering
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding) {
      setIsNewUser(true);
      // Reset eventuali dati di demo
      localStorage.setItem('resetData', 'true');
    }
  }, []);

  // Completa l'onboarding
  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsNewUser(false);
  };

  // Gestisce il passaggio avanti nella guida
  const handleNextStep = () => {
    if (currentStep === 3) {
      completeOnboarding();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // Guida introduttiva per nuovi utenti
  const renderOnboarding = () => {
    const steps = [
      {
        title: "Benvenuto in Salus!",
        content: "La tua app personale per monitorare salute e benessere. Questo breve tour ti mostrerà tutto ciò che puoi fare.",
        icon: "fas fa-heart"
      },
      {
        title: "Monitora i tuoi sintomi",
        content: "Tieni traccia dei sintomi che provi e la loro intensità. Visualizza grafici e tendenze per comprendere meglio la tua salute.",
        icon: "fas fa-heartbeat"
      },
      {
        title: "Gestisci i tuoi farmaci",
        content: "Salva i tuoi farmaci, imposta promemoria e tieni traccia dell'assunzione per non dimenticare mai una dose.",
        icon: "fas fa-pills"
      },
      {
        title: "Traccia il tuo benessere",
        content: "Registra umore, qualità del sonno, attività fisiche e altro ancora. Costruisci abitudini salutari giorno dopo giorno.",
        icon: "fas fa-spa"
      }
    ];
    
    const currentStepData = steps[currentStep];
    
    return (
      <div className="onboarding-container">
        <div className="onboarding-card">
          <div className="step-indicator">
            {steps.map((_, index) => (
              <div 
                key={index} 
                className={`step-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              />
            ))}
          </div>
          
          <div className="onboarding-icon">
            <i className={currentStepData.icon}></i>
          </div>
          
          <h2 className="onboarding-title">{currentStepData.title}</h2>
          <p className="onboarding-content">{currentStepData.content}</p>
          
          <div className="onboarding-actions">
            {currentStep > 0 && (
              <button 
                className="secondary-button" 
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Indietro
              </button>
            )}
            
            <button 
              className="primary-button" 
              onClick={handleNextStep}
            >
              {currentStep === 3 ? 'Inizia a usare Salus' : 'Continua'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Dashboard standard per utenti esistenti
  const renderDashboard = () => {
    return (
      <div className="dashboard-container">
        <div className="dashboard-welcome">
          <h2>Benvenuto, {userName}!</h2>
          <p>Ecco il riepilogo della tua salute e benessere</p>
        </div>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-heartbeat"></i>
            </div>
            <div className="stat-content">
              <h3>Sintomi</h3>
              <p className="stat-main">Nessun sintomo recente</p>
              <p className="stat-sub">Registra i tuoi sintomi per ottenere analisi</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-pills"></i>
            </div>
            <div className="stat-content">
              <h3>Farmaci</h3>
              <p className="stat-main">Nessun farmaco registrato</p>
              <p className="stat-sub">Aggiungi i tuoi farmaci per ricevere promemoria</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-smile"></i>
            </div>
            <div className="stat-content">
              <h3>Benessere</h3>
              <p className="stat-main">Inizia a tracciare il tuo benessere</p>
              <p className="stat-sub">Registra umore, sonno e attività fisica</p>
            </div>
          </div>
        </div>
        
        <div className="quick-actions">
          <h3>Azioni rapide</h3>
          <div className="action-buttons">
            <a href="/sintomi" className="action-button">
              <i className="fas fa-plus-circle"></i>
              <span>Registra sintomo</span>
            </a>
            <a href="/farmaci" className="action-button">
              <i className="fas fa-plus-circle"></i>
              <span>Aggiungi farmaco</span>
            </a>
            <a href="/benessere" className="action-button">
              <i className="fas fa-plus-circle"></i>
              <span>Aggiorna benessere</span>
            </a>
          </div>
        </div>
        
        <div className="tips-section">
          <h3>Suggerimenti per la salute</h3>
          <div className="tip-card">
            <i className="fas fa-lightbulb"></i>
            <div>
              <h4>Sapevi che...</h4>
              <p>Bere 8 bicchieri d'acqua al giorno può migliorare il tuo benessere generale e la tua energia.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="pulse-loader"></div>
        <p>Caricamento del tuo cruscotto...</p>
      </div>
    );
  }

  return (
    <>
      {isNewUser ? renderOnboarding() : renderDashboard()}
    </>
  );
};

export default Home; 