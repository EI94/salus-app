import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { UserContext, UserProvider } from './context/UserContext';
import { TranslationProvider } from './context/TranslationContext';
import { Trans } from './utils/translationUtils';
import { auth } from './firebase';
import { useTranslation } from 'react-i18next';
import './App.css';

import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Symptoms from './components/Symptoms';
import Medications from './components/Medications';
import Wellness from './components/Wellness';
import LanguageSelector from './components/LanguageSelector';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Navigation from './components/Navigation';
import SalusChat from './components/SalusChat';
import Notifications from './components/Notifications';

// Renderizza solo se l'utente è autenticato
const ProtectedRoute = () => {
  const { user, loading } = useContext(UserContext);
  const location = useLocation();

  // Mostra un loader mentre verifichiamo lo stato di autenticazione
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loader"></div>
        <p><Trans i18nKey="loading" fallback="Caricamento..." /></p>
      </div>
    );
  }

  // Se non c'è un utente autenticato, reindirizza al login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Se l'utente è autenticato, mostra il componente richiesto
  return <Outlet />;
};

function App() {
  const [showChat, setShowChat] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // Imposta il titolo della pagina dinamicamente
    document.title = t('appTitle', 'Salus - La tua salute in un\'app');
  }, [t]);

  return (
    <Router>
      <UserProvider>
        <TranslationProvider>
          <div className="app">
            <div className="app-container">
              <Routes>
                <Route path="/auth" element={<Auth />} />
                
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/symptoms" element={<Symptoms />} />
                  <Route path="/medications" element={<Medications />} />
                  <Route path="/wellness" element={<Wellness />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              
              {/* ChatBot flotante mostrado quando è activato */}
              {showChat && (
                <div className="floating-chat">
                  <button className="close-chat" onClick={() => setShowChat(false)}>
                    ✕
                  </button>
                  <SalusChat />
                </div>
              )}
              
              {/* Centro de notificaciones */}
              {showNotifications && (
                <div className="floating-notifications">
                  <button className="close-notifications" onClick={() => setShowNotifications(false)}>
                    ✕
                  </button>
                  <Notifications />
                </div>
              )}
              
              {/* Navegación inferior (muestra solo si el usuario está autenticado) */}
              {auth.currentUser && (
                <div className="bottom-controls">
                  <button 
                    className="chat-button"
                    onClick={() => {
                      setShowChat(!showChat);
                      setShowNotifications(false);
                    }}
                    title={t('quickAssistant', 'Assistente Rapido')}
                    aria-label={t('quickAssistant', 'Assistente Rapido')}
                  >
                    <span className="icon">💬</span>
                  </button>
                  
                  <button 
                    className="notifications-button"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowChat(false);
                    }}
                    title={t('notifications', 'Notifiche')}
                    aria-label={t('notifications', 'Notifiche')}
                  >
                    <span className="icon">🔔</span>
                    <span className="notification-badge">3</span>
                  </button>
                  
                  <LanguageSelector variant="dropdown" />
                </div>
              )}
              
              {/* Menú de navegación lateral (solo se muestra si el usuario está autenticado) */}
              {auth.currentUser && <Navigation />}
            </div>
          </div>
        </TranslationProvider>
      </UserProvider>
    </Router>
  );
}

export default App;