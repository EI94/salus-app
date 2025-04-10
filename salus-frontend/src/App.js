import React, { useState, useEffect, useContext, useRef } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { lazyLoad } from './components/LazyLoad';
import './styles/complete-app.css'; /* Tutti gli stili dell'app */
import './App.css';  /* File minimo solo per compatibilità */
import './styles/mobile.css';

// Importazioni non lazy-loaded (componenti piccoli e critici)
import { UserProvider, UserContext } from './context/UserContext';
import { TranslationProvider } from './context/TranslationContext';
import MobileBottomNav from './components/MobileBottomNav';
import FeedbackWidget from './components/FeedbackWidget';
import LanguageSelector from './components/LanguageSelector';
import { Trans } from './utils/translationUtils';

// Lazy loading dei componenti principali per migliorare le prestazioni, specialmente su mobile
const Auth = lazyLoad('components/Auth', { type: 'page' });
const Dashboard = lazyLoad('components/Dashboard', { type: 'page' });
const SymptomTracker = lazyLoad('components/SymptomTracker', { type: 'page' });
const MedicationTracker = lazyLoad('components/MedicationTracker', { type: 'page' });
const WellnessTracker = lazyLoad('components/WellnessTracker', { type: 'page' });
const AIAssistant = lazyLoad('components/AIAssistant', { type: 'page' });
const NotificationCenter = lazyLoad('components/NotificationCenter', { type: 'component' });
const Profile = lazyLoad('components/Profile', { type: 'page' });
const Settings = lazyLoad('components/Settings', { type: 'page' });
const MedicationReminder = lazyLoad('components/MedicationReminder', { type: 'page' });
const SymptomAnalytics = lazyLoad('components/SymptomAnalytics', { type: 'page' });
const AppointmentManager = lazyLoad('components/AppointmentManager', { type: 'page' });

// Componente per rotte protette (solo per utenti autenticati)
const ProtectedRoute = ({ children }) => {
  const userContext = useContext(UserContext);
  
  // Verifica se il contesto utente è disponibile e se l'utente è autenticato
  if (!userContext || !userContext.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Componente per rotte pubbliche (non accessibili se autenticati)
const PublicRoute = ({ children }) => {
  const userContext = useContext(UserContext);
  
  // Se l'utente è già autenticato, reindirizza alla dashboard
  if (userContext && userContext.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Componente per reindirizzamento dalla root
const RootRedirect = () => {
  const userContext = useContext(UserContext);
  
  if (userContext && userContext.isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

// Layout che include la barra di navigazione e il layout comune
function Layout({ children }) {
  const { t, i18n } = useTranslation();
  const [isSidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIWidget, setShowAIWidget] = useState(false);
  const { user, logout } = useContext(UserContext);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determina quale pagina è attiva in base all'URL
  const getActivePageClass = (path) => {
    return location.pathname === path ? 'active' : '';
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <div className="app-layout">
      {window.innerWidth > 768 ? (
        <div className="sidebar-wrapper">
          <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`} ref={sidebarRef}>
            <div className="sidebar-header">
              <div className="app-logo">
                <img src="/logo-light.svg" alt="Salus Logo" />
                <h1>Salus</h1>
              </div>
              <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                <i className={`fas fa-${isSidebarOpen ? 'times' : 'bars'}`}></i>
              </button>
            </div>
            
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user-circle"></i>
              </div>
              <div className="user-details">
                <h3>{user?.name || <Trans i18nKey="guest" fallback="Ospite" />}</h3>
                <p>{user?.email || ''}</p>
              </div>
            </div>
            
            <nav className="sidebar-nav">
              <ul>
                <li>
                  <Link to="/dashboard" className={getActivePageClass('/dashboard')}>
                    <i className="fas fa-home"></i>
                    <span><Trans i18nKey="dashboard" fallback="Dashboard" /></span>
                  </Link>
                </li>
                <li>
                  <Link to="/sintomi" className={getActivePageClass('/sintomi')}>
                    <i className="fas fa-heartbeat"></i>
                    <span><Trans i18nKey="symptoms" fallback="Sintomi" /></span>
                  </Link>
                </li>
                <li>
                  <Link to="/farmaci" className={getActivePageClass('/farmaci')}>
                    <i className="fas fa-pills"></i>
                    <span><Trans i18nKey="medications" fallback="Farmaci" /></span>
                  </Link>
                </li>
                <li>
                  <Link to="/benessere" className={getActivePageClass('/benessere')}>
                    <i className="fas fa-heart"></i>
                    <span><Trans i18nKey="wellness" fallback="Benessere" /></span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className={getActivePageClass('/profile')}>
                    <i className="fas fa-user"></i>
                    <span><Trans i18nKey="profile" fallback="Profilo" /></span>
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className={getActivePageClass('/settings')}>
                    <i className="fas fa-cog"></i>
                    <span><Trans i18nKey="settings" fallback="Impostazioni" /></span>
                  </Link>
                </li>
                <li>
                  <Link to="/assistente" className={getActivePageClass('/assistente')}>
                    <i className="fas fa-robot"></i>
                    <span><Trans i18nKey="aiAssistant" fallback="Assistente IA" /></span>
                  </Link>
                </li>
              </ul>
            </nav>
            
            <div className="sidebar-language">
              <LanguageSelector />
            </div>
            
            <div className="sidebar-footer">
              <button 
                className="notification-button"
                onClick={() => setShowNotifications(!showNotifications)}
                title={t('notifications', 'Notifiche')}
              >
                <i className="fas fa-bell"></i>
                <span><Trans i18nKey="notifications" fallback="Notifiche" /></span>
              </button>
              
              <button 
                className="assistant-button"
                onClick={() => setShowAIWidget(!showAIWidget)}
                title={t('quickAssistant', 'Assistente Rapido')}
              >
                <i className="fas fa-robot"></i>
                <span><Trans i18nKey="quickAssistant" fallback="Assistente Rapido" /></span>
              </button>
              
              <button 
                className="logout-button"
                onClick={handleLogout}
                title={t('logout', 'Esci dall\'applicazione')}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span><Trans i18nKey="logout" fallback="Esci" /></span>
              </button>
            </div>
          </div>
          
          <main className="content">
            {children}
          </main>
        </div>
      ) : (
        <>
          <MobileBottomNav />
          <div className="mobile-language-selector-container">
            <LanguageSelector variant="dropdown" />
          </div>
        </>
      )}
      
      <div className="main-content">
        {children}
      </div>
      
      {showAIWidget && (
        <div className="ai-widget-container">
          <AIAssistant />
        </div>
      )}
      
      {showNotifications && <NotificationCenter onClose={() => setShowNotifications(false)} />}
      
      <FeedbackWidget />
    </div>
  );
}

// Componente principale dell'applicazione
function AppContent() {
  // Funzionalità interne che richiedono hook di routing
  return (
    <Routes>
      {/* Reindirizzamento dalla root */}
      <Route path="/" element={<RootRedirect />} />
      
      {/* Pagine pubbliche */}
      <Route path="/login" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Auth />
        </PublicRoute>
      } />
      
      {/* Rotte protette */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout>
            <Dashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/sintomi" element={
        <ProtectedRoute>
          <Layout>
            <SymptomTracker />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/farmaci" element={
        <ProtectedRoute>
          <Layout>
            <MedicationTracker />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/benessere" element={
        <ProtectedRoute>
          <Layout>
            <WellnessTracker />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/assistente" element={
        <ProtectedRoute>
          <Layout>
            <AIAssistant />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Aggiungi le nuove rotte */}
      <Route path="/medication-reminders" element={
        <ProtectedRoute>
          <Layout>
            <MedicationReminder />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/symptom-analytics" element={
        <ProtectedRoute>
          <Layout>
            <SymptomAnalytics />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/appointments" element={
        <ProtectedRoute>
          <Layout>
            <AppointmentManager />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Fallback per rotte inesistenti */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Applicazione principale
function App() {
  return (
    <HashRouter>
      <UserProvider>
        <TranslationProvider>
          <AppContent />
        </TranslationProvider>
      </UserProvider>
    </HashRouter>
  );
}

export default App; 