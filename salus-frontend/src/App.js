import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Auth from './components/Auth';
import './App.css';

// Configurazione di base per axios
const API = axios.create({
  baseURL: 'https://api.salusapp.it',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor per aggiungere il token di autenticazione alle richieste
API.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire le risposte
API.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    // Se il token è scaduto (status 401), logout automatico
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Componente principale per la Dashboard utente
const Dashboard = ({ userId, userName, onLogout }) => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <img src="/logo.svg" alt="Salus" />
          <span>Salus</span>
        </div>
        <div className="user-controls">
          <div className="user-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <button className="logout-button" onClick={onLogout}>
              <i className="fas fa-sign-out-alt"></i> Esci
            </button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content">
        <div className="welcome-message">
          <h1>Benvenuto, {userName}!</h1>
          <p>Il sistema è in fase di implementazione. Presto potrai usare tutte le funzionalità di Salus per monitorare la tua salute.</p>
        </div>
        
        <div className="coming-soon">
          <h2>Funzionalità in arrivo</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-heartbeat"></i>
              <h3>Monitoraggio Sintomi</h3>
              <p>Tieni traccia dei tuoi sintomi e della loro evoluzione nel tempo</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-pills"></i>
              <h3>Gestione Farmaci</h3>
              <p>Gestisci i tuoi farmaci e ricevi promemoria per assumerli</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-brain"></i>
              <h3>Benessere Mentale</h3>
              <p>Monitora il tuo benessere mentale e la qualità del sonno</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-robot"></i>
              <h3>Assistente Virtuale</h3>
              <p>Ricevi consigli personalizzati e risposte alle tue domande</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="dashboard-footer">
        <p>&copy; 2025 Salus App. Tutti i diritti riservati.</p>
      </footer>
    </div>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');

  // Verifica se esiste già una sessione
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    const token = localStorage.getItem('token');

    if (storedUserId && token) {
      setUserId(storedUserId);
      setUserName(storedUserName || 'Utente');
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userId, userName) => {
    setUserId(userId);
    setUserName(userName);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('token');
    setUserId(null);
    setUserName('');
    setIsLoggedIn(false);
  };

  // Mostra il componente di autenticazione se l'utente non è loggato
  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  // Mostra la dashboard per gli utenti loggati
  return <Dashboard userId={userId} userName={userName} onLogout={handleLogout} />;
}

export default App; 