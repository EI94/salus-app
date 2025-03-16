import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';

// Service Worker per funzionalità offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(registration => {
      console.log('SW registrato:', registration);
    }).catch(error => {
      console.log('SW registrazione fallita:', error);
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 