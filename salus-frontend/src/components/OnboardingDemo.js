import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, FiThermometer, FiPills, FiHeart, FiActivity, 
  FiCalendar, FiFileText, FiArrowRight, FiX, FiCheckCircle 
} from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import '../styles/Onboarding.css';

const OnboardingDemo = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  // Demo steps for the onboarding tour
  const steps = [
    {
      title: "Benvenuto in Salus",
      content: "Questa breve introduzione ti mostrerà come utilizzare Salus per gestire la tua salute in modo semplice ed efficace.",
      icon: <FiHome size={28} />,
      highlight: ".dashboard-header"
    },
    {
      title: "Traccia i tuoi sintomi",
      content: "Registra i tuoi sintomi quotidianamente per monitorare la tua salute. Potrai visualizzare statistiche e analisi nel tempo.",
      icon: <FiThermometer size={28} />,
      highlight: ".symptom-card"
    },
    {
      title: "Gestisci i tuoi farmaci",
      content: "Tieni traccia dei tuoi farmaci, imposta promemoria per l'assunzione e non dimenticare mai una dose.",
      icon: <FiPills size={28} />,
      highlight: ".medication-card"
    },
    {
      title: "Monitora il tuo benessere",
      content: "Registra umore, sonno e attività fisica per una visione completa del tuo benessere.",
      icon: <FiHeart size={28} />,
      highlight: ".wellness-card"
    },
    {
      title: "Gestisci i tuoi appuntamenti",
      content: "Organizza le tue visite mediche, ricevi promemoria e mantieni uno storico completo.",
      icon: <FiCalendar size={28} />,
      highlight: ".dashboard-card.appointment-card"
    },
    {
      title: "Salus AI",
      content: "Il tuo assistente personale per la salute. Fai domande, ricevi consigli personalizzati e gestisci la tua salute con l'aiuto dell'intelligenza artificiale.",
      icon: <FaRobot size={28} />,
      highlight: ".dashboard-section.ai-assistant-section"
    }
  ];

  // Handle next step
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  // Handle skip
  const handleSkip = () => {
    completeOnboarding();
  };

  // Complete the onboarding
  const completeOnboarding = () => {
    setVisible(false);
    localStorage.setItem('onboardingCompleted', 'true');
    if (onComplete) onComplete();
  };

  // Highlight the current element
  useEffect(() => {
    const currentHighlight = steps[currentStep]?.highlight;
    if (currentHighlight) {
      const element = document.querySelector(currentHighlight);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-element');

        return () => {
          element.classList.remove('highlight-element');
        };
      }
    }
  }, [currentStep]);

  if (!visible) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <button className="onboarding-close" onClick={handleSkip}>
          <FiX size={24} />
        </button>
        
        <div className="onboarding-header">
          <div className="onboarding-icon">{currentStepData.icon}</div>
          <h2>{currentStepData.title}</h2>
        </div>
        
        <div className="onboarding-content">
          <p>{currentStepData.content}</p>
        </div>
        
        <div className="onboarding-progress">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`progress-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>
        
        <div className="onboarding-actions">
          <button className="onboarding-skip" onClick={handleSkip}>
            Salta introduzione
          </button>
          
          <button 
            className="onboarding-next" 
            onClick={handleNext}
          >
            {currentStep < steps.length - 1 ? (
              <>Avanti <FiArrowRight /></>
            ) : (
              <>Inizia <FiCheckCircle /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDemo; 