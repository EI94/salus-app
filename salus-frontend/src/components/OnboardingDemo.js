import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiHome, FiThermometer, FiHeart, FiActivity, 
  FiCalendar, FiFileText, FiArrowRight, FiX, FiCheckCircle, FiPackage
} from 'react-icons/fi';
import { FaRobot, FaPills } from 'react-icons/fa';
import '../styles/Onboarding.css';
import { useAppTranslation } from '../context/TranslationContext';
import { Trans } from '../utils/translationUtils';

const OnboardingDemo = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();
  const { t } = useAppTranslation();

  // Demo steps for the onboarding tour
  const steps = [
    {
      title: t('onboarding.welcome.title', "Benvenuto in Salus"),
      content: t('onboarding.welcome.content', "Questa breve introduzione ti mostrerà come utilizzare Salus per gestire la tua salute in modo semplice ed efficace."),
      icon: <FiHome size={28} />,
      highlight: ".dashboard-header"
    },
    {
      title: t('onboarding.symptoms.title', "Traccia i tuoi sintomi"),
      content: t('onboarding.symptoms.content', "Registra i tuoi sintomi quotidianamente per monitorare la tua salute. Potrai visualizzare statistiche e analisi nel tempo."),
      icon: <FiThermometer size={28} />,
      highlight: ".symptom-card"
    },
    {
      title: t('onboarding.medications.title', "Gestisci i tuoi farmaci"),
      content: t('onboarding.medications.content', "Tieni traccia dei tuoi farmaci, imposta promemoria per l'assunzione e non dimenticare mai una dose."),
      icon: <FaPills size={28} />,
      highlight: ".medication-card"
    },
    {
      title: t('onboarding.wellness.title', "Monitora il tuo benessere"),
      content: t('onboarding.wellness.content', "Registra umore, sonno e attività fisica per una visione completa del tuo benessere."),
      icon: <FiHeart size={28} />,
      highlight: ".wellness-card"
    },
    {
      title: t('onboarding.appointments.title', "Gestisci i tuoi appuntamenti"),
      content: t('onboarding.appointments.content', "Organizza le tue visite mediche, ricevi promemoria e mantieni uno storico completo."),
      icon: <FiCalendar size={28} />,
      highlight: ".dashboard-card.appointment-card"
    },
    {
      title: t('onboarding.ai.title', "Salus AI"),
      content: t('onboarding.ai.content', "Il tuo assistente personale per la salute. Fai domande, ricevi consigli personalizzati e gestisci la tua salute con l'aiuto dell'intelligenza artificiale."),
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
            <Trans i18nKey="onboarding.skipIntro" fallback="Salta introduzione" />
          </button>
          
          <button 
            className="onboarding-next" 
            onClick={handleNext}
          >
            {currentStep < steps.length - 1 ? (
              <><Trans i18nKey="onboarding.next" fallback="Avanti" /> <FiArrowRight /></>
            ) : (
              <><Trans i18nKey="onboarding.start" fallback="Inizia" /> <FiCheckCircle /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingDemo; 