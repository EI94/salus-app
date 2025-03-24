import React, { useState } from 'react';
import '../styles/FeedbackWidget.css';

function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [feedback, setFeedback] = useState({
    satisfaction: null,
    usefulFeature: "",
    missingFeature: "",
    usabilityRating: null,
    recommendation: null,
    email: "",
    additionalComments: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const questions = [
    {
      id: 'satisfaction',
      question: 'Quanto sei soddisfatto/a di Salus finora?',
      type: 'rating',
      options: [1, 2, 3, 4, 5]
    },
    {
      id: 'usefulFeature',
      question: 'Quale funzionalità hai trovato più utile?',
      type: 'select',
      options: [
        'Monitoraggio sintomi',
        'Gestione farmaci',
        'Assistente IA',
        'Dashboard dati',
        'Altro (specificare nei commenti)'
      ]
    },
    {
      id: 'missingFeature',
      question: 'C\'è qualche funzionalità che ti manca in Salus?',
      type: 'text',
      placeholder: 'La tua risposta...'
    },
    {
      id: 'usabilityRating',
      question: 'Quanto è facile da usare Salus?',
      type: 'rating',
      options: [1, 2, 3, 4, 5]
    },
    {
      id: 'recommendation',
      question: 'Quanto è probabile che consiglieresti Salus ad amici o familiari?',
      type: 'rating',
      options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    },
    {
      id: 'additionalInfo',
      question: 'Vuoi aggiungere altri commenti o fornire la tua email per aggiornamenti?',
      type: 'final',
      emailPlaceholder: 'La tua email (opzionale)',
      commentsPlaceholder: 'Commenti aggiuntivi...'
    }
  ];

  const toggleWidget = () => {
    setIsOpen(!isOpen);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleInputChange = (questionId, value) => {
    setFeedback({
      ...feedback,
      [questionId]: value
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Qui andrebbe l'implementazione reale dell'invio dell'email
      // Per ora simulo un'attesa
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In un'implementazione reale, qui si invierebbe una richiesta a un endpoint del backend
      // che gestisce l'invio delle email a michelevalente_94@yahoo.it e pierpaolo.laurito@gmail.com
      console.log('Feedback inviato:', feedback);
      
      // Feedback inviato con successo
      setIsSubmitted(true);
    } catch (error) {
      console.error('Errore durante l\'invio del feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setCurrentStep(0);
    setFeedback({
      satisfaction: null,
      usefulFeature: "",
      missingFeature: "",
      usabilityRating: null,
      recommendation: null,
      email: "",
      additionalComments: ""
    });
    setIsOpen(false);
  };

  const renderQuestion = () => {
    const currentQuestion = questions[currentStep];
    
    switch (currentQuestion.type) {
      case 'rating':
        return (
          <div className="feedback-rating">
            <p className="feedback-question">{currentQuestion.question}</p>
            <div className="rating-options">
              {currentQuestion.options.map(option => (
                <button
                  key={option}
                  className={`rating-button ${feedback[currentQuestion.id] === option ? 'selected' : ''}`}
                  onClick={() => handleInputChange(currentQuestion.id, option)}
                >
                  {option}
                </button>
              ))}
            </div>
            <div className="rating-labels">
              <span>Poco</span>
              <span>Molto</span>
            </div>
          </div>
        );
      
      case 'select':
        return (
          <div className="feedback-select">
            <p className="feedback-question">{currentQuestion.question}</p>
            <div className="select-options">
              {currentQuestion.options.map(option => (
                <div className="select-option" key={option}>
                  <input
                    type="radio"
                    id={option}
                    name={currentQuestion.id}
                    value={option}
                    checked={feedback[currentQuestion.id] === option}
                    onChange={() => handleInputChange(currentQuestion.id, option)}
                  />
                  <label htmlFor={option}>{option}</label>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'text':
        return (
          <div className="feedback-text">
            <p className="feedback-question">{currentQuestion.question}</p>
            <textarea
              value={feedback[currentQuestion.id]}
              onChange={(e) => handleInputChange(currentQuestion.id, e.target.value)}
              placeholder={currentQuestion.placeholder}
              rows={4}
            />
          </div>
        );
      
      case 'final':
        return (
          <div className="feedback-final">
            <p className="feedback-question">{currentQuestion.question}</p>
            <input
              type="email"
              value={feedback.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder={currentQuestion.emailPlaceholder}
              className="feedback-email"
            />
            <textarea
              value={feedback.additionalComments}
              onChange={(e) => handleInputChange('additionalComments', e.target.value)}
              placeholder={currentQuestion.commentsPlaceholder}
              rows={3}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="feedback-widget">
      <button
        className="feedback-toggle-button"
        onClick={toggleWidget}
        title="Condividi il tuo feedback"
      >
        <i className="fas fa-comment-dots"></i>
      </button>
      
      {isOpen && (
        <div className="feedback-panel">
          <div className="feedback-header">
            <h3>Aiutaci a migliorare Salus</h3>
            <button className="close-button" onClick={toggleWidget}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="feedback-content">
            {!isSubmitted ? (
              <>
                <div className="feedback-progress">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
                
                <div className="feedback-question-container">
                  {renderQuestion()}
                </div>
                
                <div className="feedback-actions">
                  {currentStep > 0 && (
                    <button className="action-button prev" onClick={handlePrev}>
                      <i className="fas fa-arrow-left"></i> Indietro
                    </button>
                  )}
                  
                  {currentStep < questions.length - 1 ? (
                    <button 
                      className="action-button next" 
                      onClick={handleNext}
                      disabled={
                        (questions[currentStep].type === 'rating' && feedback[questions[currentStep].id] === null) ||
                        (questions[currentStep].type === 'select' && !feedback[questions[currentStep].id])
                      }
                    >
                      Avanti <i className="fas fa-arrow-right"></i>
                    </button>
                  ) : (
                    <button 
                      className="action-button submit" 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Invio in corso...' : 'Invia feedback'}
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="feedback-success">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h4>Grazie per il tuo feedback!</h4>
                <p>I tuoi commenti ci aiuteranno a migliorare Salus.</p>
                <button className="close-feedback" onClick={handleReset}>
                  Chiudi
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackWidget; 