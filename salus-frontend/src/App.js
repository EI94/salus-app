import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import API from './api';
import SymptomTracker from './SymptomTracker';
import AIAssistant from './AIAssistant';
import WellnessTracker from './WellnessTracker';
import MedicationTracker from './MedicationTracker';
import NotificationCenter from './NotificationCenter';
import AIAssistantWidget from './AIAssistantWidget';
import { useTranslation } from 'react-i18next';
import Onboarding from './components/Onboarding';
import Auth from './components/Auth';
import Home from './components/Home';
import './App.css';

// Componenti di Onboarding
const OnboardingSlide = ({ title, description, image, active }) => {
  return (
    <div className="onboarding-slide">
      <img src={image} alt={title} className="onboarding-illustration" />
      <h2 className="onboarding-title">{title}</h2>
      <p className="onboarding-desc">{description}</p>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [completedOnboarding, setCompletedOnboarding] = useState(false);
  
  // Check for existing session
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    
    if (storedUserId) {
      setUserId(storedUserId);
      setUserName(storedUserName || 'Utente');
      setIsLoggedIn(true);
      
      if (storedUserId.startsWith('temp-') && !onboardingCompleted) {
        setShowOnboarding(true);
      } else {
        setCompletedOnboarding(true);
      }
    }
  }, []);
  
  const handleLogin = (userId, userName) => {
    setUserId(userId);
    setUserName(userName);
    setIsLoggedIn(true);
    
    if (userId.startsWith('temp-')) {
      setShowOnboarding(true);
    } else {
      const onboardingCompleted = localStorage.getItem('onboardingCompleted');
      if (!onboardingCompleted) {
        setShowOnboarding(true);
      } else {
        setCompletedOnboarding(true);
      }
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setUserId(null);
    setUserName('');
    setIsLoggedIn(false);
    setShowOnboarding(false);
    setCompletedOnboarding(false);
  };
  
  const completeOnboarding = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setShowOnboarding(false);
    setCompletedOnboarding(true);
  };
  
  // Render login/register form if not logged in
  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }
  
  // Show onboarding for first-time users
  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }
  
  // Main app after login and onboarding
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <Link to="/" className="app-logo">
            <img src="/logo.svg" alt="Salus" />
            <span>Salus</span>
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="notification-icon">
              <i className="far fa-bell"></i>
              <div className="notification-badge">3</div>
            </div>
            
            <div onClick={handleLogout} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: 'var(--radius-full)', 
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '600'
              }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'block' } }}>
                Esci
              </span>
            </div>
          </div>
        </header>
        
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home userId={userId} userName={userName} />} />
            <Route path="/symptoms" element={<SymptomTracker userId={userId} />} />
            <Route path="/medications" element={<MedicationTracker userId={userId} />} />
            <Route path="/wellness" element={<WellnessTracker userId={userId} />} />
            <Route path="/assistant" element={<AIAssistant userId={userId} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        
        <nav className="bottom-nav">
          <Link to="/" className="bottom-nav-item">
            <i className="fas fa-home"></i>
            <span>Home</span>
          </Link>
          <Link to="/symptoms" className="bottom-nav-item">
            <i className="fas fa-thermometer-half"></i>
            <span>Sintomi</span>
          </Link>
          <Link to="/medications" className="bottom-nav-item">
            <i className="fas fa-pills"></i>
            <span>Farmaci</span>
          </Link>
          <Link to="/wellness" className="bottom-nav-item">
            <i className="fas fa-heart"></i>
            <span>Benessere</span>
          </Link>
          <Link to="/assistant" className="bottom-nav-item">
            <i className="fas fa-robot"></i>
            <span>Assistente</span>
          </Link>
        </nav>
      </div>
    </Router>
  );
}

export default App; 