// File WellnessTracker Component

import React, { useState, useEffect } from 'react';
import { saveUserData } from '../utils/dataManager';
import '../styles/WellnessTracker.css';

const WellnessTracker = ({ userId }) => {
  const [wellnessData, setWellnessData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 3,
    sleepQuality: 3,
    energyLevel: 3,
    stressLevel: 3,
    physicalActivity: 3,
    notes: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Carica i dati esistenti
  useEffect(() => {
    const loadWellnessData = () => {
      setLoading(true);
      try {
        // In un'app reale, questo sarebbe una chiamata API
        const storedData = JSON.parse(localStorage.getItem('wellnessData')) || [];
        setWellnessData(storedData);
      } catch (error) {
        console.error('Errore nel caricamento dei dati di benessere:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWellnessData();
  }, [userId]);

  // Gestisce i cambiamenti nei campi del form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'notes' ? value : parseInt(value, 10)
    }));
  };

  // Invia i dati del form
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Crea un nuovo record di benessere
      const newWellnessRecord = {
        id: `wellness-${Date.now()}`,
        userId,
        ...formData,
        timestamp: new Date().toISOString()
      };

      // Aggiorna lo stato locale
      const updatedData = [...wellnessData, newWellnessRecord];
      setWellnessData(updatedData);

      // Salva nel localStorage (in un'app reale sarebbe un'API)
      saveUserData('wellnessData', updatedData);

      // Mostra messaggio di successo
      setSuccessMessage('Dati di benessere salvati con successo!');
      setTimeout(() => setSuccessMessage(''), 3000);

      // Resetta il form e nascondilo
      setFormData({
        date: new Date().toISOString().split('T')[0],
        mood: 3,
        sleepQuality: 3,
        energyLevel: 3,
        stressLevel: 3,
        physicalActivity: 3,
        notes: ''
      });
      setShowForm(false);
    } catch (error) {
      console.error('Errore nel salvataggio dei dati di benessere:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // Formatta la data per la visualizzazione
  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  // Restituisce un'etichetta in base al valore numerico
  const getMoodLabel = (value) => {
    const labels = ['Molto basso', 'Basso', 'Medio', 'Buono', 'Ottimo'];
    return labels[value - 1] || 'Non specificato';
  };

  if (loading) {
    return (
      <div className="wellness-loading">
        <div className="pulse-loader"></div>
        <p>Caricamento dati di benessere...</p>
      </div>
    );
  }

  return (
    <div className="wellness-container">
      <div className="wellness-header">
        <h1>Tracciamento del Benessere</h1>
        <p>Monitora il tuo umore, qualità del sonno e livelli di energia per migliorare il tuo benessere complessivo.</p>
        
        <button 
          className="add-wellness-btn" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Annulla' : 'Registra Benessere'}
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}

      {showForm && (
        <div className="wellness-form-container">
          <h2>Come ti senti oggi?</h2>
          <form onSubmit={handleSubmit} className="wellness-form">
            <div className="form-group">
              <label htmlFor="date">Data</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group range-group">
              <label htmlFor="mood">Umore</label>
              <div className="range-container">
                <input
                  type="range"
                  id="mood"
                  name="mood"
                  min="1"
                  max="5"
                  value={formData.mood}
                  onChange={handleChange}
                  className="range-slider"
                />
                <div className="range-value">{getMoodLabel(formData.mood)}</div>
              </div>
            </div>

            <div className="form-group range-group">
              <label htmlFor="sleepQuality">Qualità del Sonno</label>
              <div className="range-container">
                <input
                  type="range"
                  id="sleepQuality"
                  name="sleepQuality"
                  min="1"
                  max="5"
                  value={formData.sleepQuality}
                  onChange={handleChange}
                  className="range-slider"
                />
                <div className="range-value">{getMoodLabel(formData.sleepQuality)}</div>
              </div>
            </div>

            <div className="form-group range-group">
              <label htmlFor="energyLevel">Livello di Energia</label>
              <div className="range-container">
                <input
                  type="range"
                  id="energyLevel"
                  name="energyLevel"
                  min="1"
                  max="5"
                  value={formData.energyLevel}
                  onChange={handleChange}
                  className="range-slider"
                />
                <div className="range-value">{getMoodLabel(formData.energyLevel)}</div>
              </div>
            </div>

            <div className="form-group range-group">
              <label htmlFor="stressLevel">Livello di Stress</label>
              <div className="range-container">
                <input
                  type="range"
                  id="stressLevel"
                  name="stressLevel"
                  min="1"
                  max="5"
                  value={formData.stressLevel}
                  onChange={handleChange}
                  className="range-slider"
                />
                <div className="range-value">{getMoodLabel(formData.stressLevel)}</div>
              </div>
            </div>

            <div className="form-group range-group">
              <label htmlFor="physicalActivity">Attività Fisica</label>
              <div className="range-container">
                <input
                  type="range"
                  id="physicalActivity"
                  name="physicalActivity"
                  min="1"
                  max="5"
                  value={formData.physicalActivity}
                  onChange={handleChange}
                  className="range-slider"
                />
                <div className="range-value">{getMoodLabel(formData.physicalActivity)}</div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Note</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Scrivi eventuali note sul tuo benessere..."
                rows="3"
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                Annulla
              </button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Salvataggio...' : 'Salva'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="wellness-history">
        <h2>Storico Benessere</h2>
        
        {wellnessData.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-spa"></i>
            <p>Non hai ancora registrato dati sul tuo benessere</p>
            <button className="empty-action-btn" onClick={() => setShowForm(true)}>
              Registra il tuo primo dato
            </button>
          </div>
        ) : (
          <div className="wellness-cards">
            {wellnessData
              .sort((a, b) => new Date(b.date) - new Date(a.date))
              .map(entry => (
                <div key={entry.id} className="wellness-card">
                  <div className="wellness-card-date">
                    {formatDate(entry.date)}
                  </div>
                  
                  <div className="wellness-metrics">
                    <div className="metric">
                      <i className="fas fa-smile"></i>
                      <span>Umore</span>
                      <div className="metric-value">{getMoodLabel(entry.mood)}</div>
                    </div>
                    
                    <div className="metric">
                      <i className="fas fa-bed"></i>
                      <span>Sonno</span>
                      <div className="metric-value">{getMoodLabel(entry.sleepQuality)}</div>
                    </div>
                    
                    <div className="metric">
                      <i className="fas fa-bolt"></i>
                      <span>Energia</span>
                      <div className="metric-value">{getMoodLabel(entry.energyLevel)}</div>
                    </div>
                    
                    <div className="metric">
                      <i className="fas fa-brain"></i>
                      <span>Stress</span>
                      <div className="metric-value">{getMoodLabel(entry.stressLevel)}</div>
                    </div>
                    
                    <div className="metric">
                      <i className="fas fa-running"></i>
                      <span>Attività</span>
                      <div className="metric-value">{getMoodLabel(entry.physicalActivity)}</div>
                    </div>
                  </div>
                  
                  {entry.notes && (
                    <div className="wellness-notes">
                      <h4>Note:</h4>
                      <p>{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WellnessTracker;
