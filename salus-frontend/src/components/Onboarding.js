import React, { useState } from 'react';
import '../styles/Onboarding.css';

const OnboardingSlide = ({ title, description, image, active }) => {
  return (
    <div className={`onboarding-slide ${active ? 'active' : ''}`}>
      <img src={image} alt={title} className="onboarding-illustration" />
      <h2 className="onboarding-title">{title}</h2>
      <p className="onboarding-desc">{description}</p>
    </div>
  );
};

const Onboarding = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Benvenuto in Salus",
      description: "La tua app per il monitoraggio completo della salute. Scopri tutti gli strumenti che abbiamo creato per aiutarti a stare meglio.",
      image: "/onboarding/tracking.svg"
    },
    {
      title: "Traccia i tuoi sintomi",
      description: "Registra e monitora i tuoi sintomi nel tempo. Visualizza grafici e tendenze per comprendere meglio la tua salute.",
      image: "/onboarding/tracking.svg"
    },
    {
      title: "Gestisci i tuoi farmaci",
      description: "Tieni traccia dei tuoi farmaci, dosaggi e orari. Ricevi promemoria per non dimenticare mai una dose.",
      image: "/onboarding/medication.svg"
    },
    {
      title: "Monitora il tuo benessere",
      description: "Segui l'andamento del tuo umore, sonno, livello di stress e attività quotidiane.",
      image: "/onboarding/wellness.svg"
    },
    {
      title: "Assistente AI personale",
      description: "L'assistente Salus risponde alle tue domande sulla salute e ti fornisce consigli personalizzati.",
      image: "/onboarding/assistant.svg"
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="onboarding-container">
      <div className="onboarding-slider">
        <div
          className="onboarding-slides"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <OnboardingSlide
              key={index}
              title={slide.title}
              description={slide.description}
              image={slide.image}
              active={index === currentSlide}
            />
          ))}
        </div>
      </div>
      <div className="onboarding-controls">
        <button
          className="onboarding-btn prev"
          onClick={handlePrev}
          disabled={currentSlide === 0}
        >
          <i className="fas fa-arrow-left"></i> Indietro
        </button>
        <div className="onboarding-dots">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`onboarding-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
        {currentSlide < slides.length - 1 ? (
          <button className="onboarding-btn next" onClick={handleNext}>
            Avanti <i className="fas fa-arrow-right"></i>
          </button>
        ) : (
          <button className="onboarding-btn complete" onClick={handleNext}>
            Inizia <i className="fas fa-check"></i>
          </button>
        )}
      </div>
      <button className="onboarding-skip" onClick={handleSkip}>
        Salta
      </button>
    </div>
  );
};

export default Onboarding; 