import React, { useState, useEffect } from 'react';
import API from './api';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, isEqual, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Registra i componenti di ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function SymptomTracker({ userId }) {
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSymptoms, setFilteredSymptoms] = useState([]);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [symptomSuggestions, setSymptomSuggestions] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'calendar', 'chart'

  // Stato per i grafici
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  // Stato per i dati del calendario
  const [calendarDates, setCalendarDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [symptomsOnSelectedDate, setSymptomsOnSelectedDate] = useState([]);

  // Lista di comuni sintomi per l'autocompletamento
  const commonSymptoms = [
    'Mal di testa', 'Febbre', 'Tosse', 'Dolore muscolare', 'Nausea',
    'Fatica', 'Vertigini', 'Mal di stomaco', 'Dolore al petto', 'Dolore alla schiena',
    'Difficoltà respiratorie', 'Mal di gola', 'Congestione nasale', 'Diarrea', 'Eruzione cutanea'
  ];

  useEffect(() => {
    if (userId) {
      fetchSymptoms();
    }
  }, [userId]);

  useEffect(() => {
    if (symptoms.length > 0) {
      const filtered = symptoms.filter(sym => 
        sym.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSymptoms(filtered);
    } else {
      setFilteredSymptoms([]);
    }
  }, [symptoms, searchTerm]);

  useEffect(() => {
    if (description) {
      const matches = commonSymptoms.filter(sym => 
        sym.toLowerCase().includes(description.toLowerCase()) && 
        sym.toLowerCase() !== description.toLowerCase()
      );
      setSymptomSuggestions(matches.slice(0, 5));
    } else {
      setSymptomSuggestions([]);
    }
  }, [description]);

  useEffect(() => {
    if (symptoms.length > 0) {
      prepareChartData();
      prepareCalendarData();
    }
  }, [symptoms]);

  useEffect(() => {
    if (symptoms.length > 0 && selectedDate) {
      const formattedSelectedDate = format(selectedDate, 'yyyy-MM-dd');
      const filtered = symptoms.filter(symptom => {
        const symptomDate = format(new Date(symptom.date), 'yyyy-MM-dd');
        return symptomDate === formattedSelectedDate;
      });
      setSymptomsOnSelectedDate(filtered);
    } else {
      setSymptomsOnSelectedDate([]);
    }
  }, [selectedDate, symptoms]);

  const fetchSymptoms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get(`/symptoms/${userId}`);
      setSymptoms(response.data);
      setFilteredSymptoms(response.data);
    } catch (error) {
      console.error('Errore nel caricamento dei sintomi:', error);
      setError('Impossibile caricare i sintomi. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

  const addSymptom = async () => {
    if (!description.trim()) {
      return;
    }
    
    try {
      setLoading(true);
      await API.post('/symptoms', {
        userId,
        description,
        intensity
      });
      
      // Reset form
      setDescription('');
      setIntensity(5);
      setShowForm(false);
      setSymptomSuggestions([]);
      
      // Aggiorna la lista
      fetchSymptoms();
      
      // Mostra conferma
      showNotification('Sintomo registrato con successo!');
    } catch (error) {
      console.error('Errore nella registrazione del sintomo:', error);
      showNotification('Errore durante la registrazione del sintomo', 'error');
    } finally {
      setLoading(false);
    }
  };

  const viewSymptomDetails = (symptom) => {
    setSelectedSymptom(symptom);
  };

  const closeSymptomDetails = () => {
    setSelectedSymptom(null);
  };

  const selectSuggestion = (suggestion) => {
    setDescription(suggestion);
    setSymptomSuggestions([]);
  };

  const handleIntensityChange = (value) => {
    setIntensity(Number(value));
  };

  const getIntensityLevel = (value) => {
    if (value <= 3) return 'level-low';
    if (value <= 7) return 'level-medium';
    return 'level-high';
  };

  const getIntensityText = (value) => {
    if (value <= 3) return 'Lieve';
    if (value <= 7) return 'Moderato';
    return 'Severo';
  };

  const showNotification = (message, type = 'success') => {
    const notificationElement = document.createElement('div');
    notificationElement.className = `notification notification-${type}`;
    notificationElement.textContent = message;
    document.body.appendChild(notificationElement);
    
    setTimeout(() => {
      notificationElement.classList.add('fade-out');
      setTimeout(() => {
        document.body.removeChild(notificationElement);
      }, 500);
    }, 3000);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  const getRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        if (diffMinutes === 0) {
          return 'Appena registrato';
        }
        return `${diffMinutes} minuti fa`;
      }
      return `${diffHours} ore fa`;
    } else if (diffDays === 1) {
      return 'Ieri';
    } else if (diffDays < 7) {
      return `${diffDays} giorni fa`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'settimana' : 'settimane'} fa`;
    } else {
      return formatDate(dateString);
    }
  };

  // Prepara i dati per il grafico
  const prepareChartData = () => {
    // Raggruppa i sintomi per tipo
    const symptomTypes = {};
    symptoms.forEach(symptom => {
      if (!symptomTypes[symptom.description]) {
        symptomTypes[symptom.description] = [];
      }
      symptomTypes[symptom.description].push({
        date: new Date(symptom.date),
        intensity: symptom.intensity
      });
    });

    // Ordina ogni gruppo di sintomi per data
    Object.keys(symptomTypes).forEach(type => {
      symptomTypes[type].sort((a, b) => a.date - b.date);
    });

    // Prepara i dati per il grafico
    const datasets = Object.keys(symptomTypes).map((type, index) => {
      // Genera un colore basato sull'indice
      const hue = (index * 137) % 360; // Distribuzione uniforme di colori
      const color = `hsla(${hue}, 70%, 60%, 0.7)`;
      
      return {
        label: type,
        data: symptomTypes[type].map(item => item.intensity),
        fill: false,
        backgroundColor: color,
        borderColor: color,
        tension: 0.3
      };
    });

    // Crea le etichette per l'asse X (date) dal sintomo più recente agli ultimi 7 giorni
    const allDates = symptoms.map(s => new Date(s.date));
    allDates.sort((a, b) => a - b);
    
    const labels = [...new Set(allDates.map(date => format(date, 'dd/MM/yyyy')))];
    
    setChartData({
      labels,
      datasets
    });
  };

  // Prepara i dati per il calendario
  const prepareCalendarData = () => {
    const dates = symptoms.map(symptom => new Date(symptom.date));
    setCalendarDates(dates);
  };

  // Funzione per gestire la selezione di una data nel calendario
  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  // Funzione per verificare se una data ha sintomi
  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const hasSymptom = calendarDates.some(d => isEqual(new Date(format(d, 'yyyy-MM-dd')), new Date(format(date, 'yyyy-MM-dd'))));
      return hasSymptom ? 'calendar-has-symptom' : null;
    }
  };

  // Contenuto della vista calendario
  const renderCalendarView = () => {
    return (
      <div className="calendar-view slide-in-up">
        <div className="calendar-container">
          <Calendar 
            onChange={handleDateChange} 
            value={selectedDate}
            tileClassName={tileClassName}
            locale="it-IT"
            formatMonthYear={(locale, date) => format(date, 'MMMM yyyy', { locale: it })}
          />
        </div>
        
        <div className="selected-date-symptoms">
          <h3 className="text-primary">
            Sintomi per il {format(selectedDate, 'dd MMMM yyyy', { locale: it })}
          </h3>
          
          {symptomsOnSelectedDate.length === 0 ? (
            <p className="text-muted">Nessun sintomo registrato per questa data</p>
          ) : (
            <ul className="symptom-list">
              {symptomsOnSelectedDate.map((symptom, index) => (
                <li key={index} className="symptom-item-card">
                  <div className="d-flex justify-between align-center">
                    <h4>{symptom.description}</h4>
                    <span className={`intensity-badge ${getIntensityLevel(symptom.intensity)}`}>
                      {symptom.intensity}/10
                    </span>
                  </div>
                  <div className="text-muted">
                    {format(new Date(symptom.date), 'HH:mm', { locale: it })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };

  // Contenuto della vista grafico
  const renderChartView = () => {
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Intensità dei sintomi nel tempo',
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.raw}/10`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          title: {
            display: true,
            text: 'Intensità'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Data'
          }
        }
      }
    };

    return (
      <div className="chart-view slide-in-up">
        <div className="chart-container">
          <Line data={chartData} options={options} />
        </div>
        
        <div className="chart-container mt-4">
          <h3 className="text-primary mb-3">Distribuzione dell'intensità dei sintomi</h3>
          <Bar 
            data={{
              labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
              datasets: [{
                label: 'Numero di sintomi',
                data: Array(10).fill(0).map((_, i) => 
                  symptoms.filter(s => s.intensity === i + 1).length
                ),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }]
            }}
            options={{
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Numero di sintomi'
                  }
                },
                x: {
                  title: {
                    display: true,
                    text: 'Intensità'
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="symptom-tracker">
      <div className="section-header">
        <h2><i className="fas fa-notes-medical"></i> Tracciamento Sintomi</h2>
        <div className="action-buttons">
          <div className="view-toggle">
            <button 
              className={`btn btn-icon ${viewMode === 'list' ? 'active' : ''}`} 
              onClick={() => setViewMode('list')}
              title="Vista elenco"
            >
              <i className="fas fa-list"></i>
            </button>
            <button 
              className={`btn btn-icon ${viewMode === 'calendar' ? 'active' : ''}`} 
              onClick={() => setViewMode('calendar')}
              title="Vista calendario"
            >
              <i className="fas fa-calendar-alt"></i>
            </button>
            <button 
              className={`btn btn-icon ${viewMode === 'chart' ? 'active' : ''}`} 
              onClick={() => setViewMode('chart')}
              title="Vista grafico"
            >
              <i className="fas fa-chart-bar"></i>
            </button>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? (
              <><i className="fas fa-times"></i> Annulla</>
            ) : (
              <><i className="fas fa-plus"></i> Aggiungi Sintomo</>
            )}
          </button>
        </div>
      </div>
      
      {showForm && (
        <div className="symptom-form card slide-in-up">
          <div className="card-header">
            <h3 className="text-primary">Registra un nuovo sintomo</h3>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Descrizione del sintomo:</label>
              <div className="autocomplete">
                <input 
                  type="text"
                  className="form-control"
                  placeholder="Es: Mal di testa, tosse, ecc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {symptomSuggestions.length > 0 && (
                  <div className="autocomplete-items">
                    {symptomSuggestions.map((symptom, index) => (
                      <div 
                        key={index} 
                        className="autocomplete-item"
                        onClick={() => selectSuggestion(symptom)}
                      >
                        {symptom}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Intensità: <span className={`intensity-label ${getIntensityLevel(intensity)}`}>{getIntensityText(intensity)} ({intensity}/10)</span>
              </label>
              <div className="slider-container">
                <input 
                  type="range"
                  min="1"
                  max="10"
                  value={intensity}
                  onChange={(e) => handleIntensityChange(e.target.value)}
                  className={`custom-slider ${getIntensityLevel(intensity)}`}
                />
                <div className="slider-labels">
                  <span>Lieve</span>
                  <span>Moderato</span>
                  <span>Severo</span>
                </div>
              </div>
            </div>
            
            <div className="form-group">
              <button 
                className="btn btn-primary btn-lg w-100"
                onClick={addSymptom}
                disabled={!description.trim() || loading}
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>} Registra Sintomo
              </button>
            </div>
          </div>
        </div>
      )}
      
      {!showForm && (
        <div className="search-container">
          <div className="search-input">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text"
              placeholder="Cerca nei tuoi sintomi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
            {searchTerm && (
              <button 
                className="btn-clear"
                onClick={() => setSearchTerm('')}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
      )}
      
      {loading && !showForm ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Caricamento sintomi...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      ) : (
        <div className="symptom-content">
          {viewMode === 'list' && (
            <>
              {filteredSymptoms.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-clipboard-list fa-3x"></i>
                  <p>
                    {searchTerm 
                      ? `Nessun sintomo trovato per "${searchTerm}"`
                      : "Non hai ancora registrato alcun sintomo"
                    }
                  </p>
                  {!searchTerm && (
                    <button 
                      className="btn btn-primary mt-3"
                      onClick={() => setShowForm(true)}
                    >
                      <i className="fas fa-plus"></i> Registra il tuo primo sintomo
                    </button>
                  )}
                </div>
              ) : (
                <div className="timeline">
                  {filteredSymptoms.map((symptom) => (
                    <div className="timeline-item" key={symptom._id}>
                      <div className="timeline-date">
                        {getRelativeTime(symptom.date)}
                      </div>
                      <div className="timeline-content card" onClick={() => viewSymptomDetails(symptom)}>
                        <div className="symptom-card-header">
                          <h4>{symptom.description}</h4>
                          <span className={`intensity-badge ${getIntensityLevel(symptom.intensity)}`}>
                            {symptom.intensity}/10
                          </span>
                        </div>
                        <div className="symptom-level">
                          <div 
                            className={`symptom-level-fill ${getIntensityLevel(symptom.intensity)}`}
                            style={{ width: `${symptom.intensity * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          
          {viewMode === 'calendar' && renderCalendarView()}
          
          {viewMode === 'chart' && renderChartView()}
        </div>
      )}
      
      {/* Modal per i dettagli del sintomo */}
      {selectedSymptom && (
        <div className="modal-overlay fade-in" onClick={closeSymptomDetails}>
          <div className="modal-container symptom-details slide-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedSymptom.description}</h3>
              <button className="btn-close" onClick={closeSymptomDetails}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-item">
                <span className="detail-label">Intensità:</span>
                <div className="detail-value">
                  <span className={`intensity-badge ${getIntensityLevel(selectedSymptom.intensity)}`}>
                    {selectedSymptom.intensity}/10 - {getIntensityText(selectedSymptom.intensity)}
                  </span>
                </div>
              </div>
              <div className="detail-item">
                <span className="detail-label">Registrato:</span>
                <span className="detail-value">{formatDate(selectedSymptom.date)}</span>
              </div>
              <div className="symptom-level mt-3">
                <div 
                  className={`symptom-level-fill ${getIntensityLevel(selectedSymptom.intensity)}`}
                  style={{ width: `${selectedSymptom.intensity * 10}%` }}
                ></div>
              </div>
              
              <div className="symptom-recommendations mt-4">
                <h4><i className="fas fa-lightbulb"></i> Possibili azioni</h4>
                <ul className="recommendations-list">
                  <li>
                    <i className="fas fa-history"></i> Confronta con i sintomi precedenti
                  </li>
                  <li>
                    <i className="fas fa-notes-medical"></i> Registra un follow-up
                  </li>
                  <li>
                    <i className="fas fa-pills"></i> Collega a un medicinale
                  </li>
                  <li>
                    <i className="fas fa-robot"></i> Chiedi all'assistente AI
                  </li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline mr-2" onClick={closeSymptomDetails}>
                <i className="fas fa-times"></i> Chiudi
              </button>
              <button className="btn btn-primary">
                <i className="fas fa-edit"></i> Modifica
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Stili componente-specifici */}
      <style jsx>{`
        .symptom-tracker {
          padding: var(--space-2);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
          gap: var(--space-3);
        }
        
        .section-header h2 {
          margin: 0;
          color: var(--gray-800);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .section-header h2 i {
          color: var(--primary-600);
        }
        
        .action-buttons {
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }
        
        .view-toggle {
          display: flex;
          border: 1px solid var(--gray-300);
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-right: var(--space-2);
        }
        
        .view-toggle .btn {
          border-radius: 0;
          background-color: var(--white);
          color: var(--gray-600);
          border: none;
          padding: var(--space-2);
        }
        
        .view-toggle .btn.active {
          background-color: var(--primary-600);
          color: var(--white);
        }
        
        .symptom-form {
          margin-bottom: var(--space-4);
        }
        
        .slider-container {
          position: relative;
          padding: var(--space-2) 0;
        }
        
        .slider-labels {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-1);
          font-size: var(--font-size-sm);
          color: var(--gray-600);
        }
        
        .intensity-label {
          display: inline-block;
          margin-left: var(--space-2);
          font-weight: 500;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: var(--font-size-sm);
        }
        
        .level-low {
          color: #0f5132;
          background-color: #d1e7dd;
        }
        
        .level-medium {
          color: #664d03;
          background-color: #fff3cd;
        }
        
        .level-high {
          color: #842029;
          background-color: #f8d7da;
        }
        
        .search-container {
          margin-bottom: var(--space-4);
        }
        
        .search-input {
          position: relative;
        }
        
        .search-icon {
          position: absolute;
          left: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-500);
        }
        
        .search-input input {
          padding-left: 2.5rem;
        }
        
        .btn-clear {
          position: absolute;
          right: var(--space-3);
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--gray-500);
          cursor: pointer;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
          color: var(--gray-600);
        }
        
        .loading-container .loader {
          margin-bottom: var(--space-3);
        }
        
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
          color: var(--gray-600);
          text-align: center;
        }
        
        .empty-state i {
          margin-bottom: var(--space-3);
          color: var(--gray-400);
        }
        
        .timeline {
          position: relative;
          margin-top: var(--space-4);
        }
        
        .symptom-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-2);
        }
        
        .symptom-card-header h4 {
          margin: 0;
          font-size: var(--font-size-md);
        }
        
        .intensity-badge {
          font-size: var(--font-size-xs);
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
        }
        
        .autocomplete {
          position: relative;
        }
        
        .autocomplete-items {
          position: absolute;
          border: 1px solid var(--gray-300);
          border-top: none;
          z-index: 99;
          top: 100%;
          left: 0;
          right: 0;
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          background-color: var(--white);
          box-shadow: var(--shadow-md);
        }
        
        .autocomplete-item {
          padding: var(--space-2) var(--space-3);
          cursor: pointer;
          border-bottom: 1px solid var(--gray-200);
        }
        
        .autocomplete-item:last-child {
          border-bottom: none;
        }
        
        .autocomplete-item:hover {
          background-color: var(--primary-100);
        }
        
        .calendar-view, .chart-view {
          padding: var(--space-4);
          text-align: center;
        }
        
        .calendar-placeholder, .chart-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-6);
          color: var(--gray-600);
        }
        
        .calendar-placeholder i, .chart-placeholder i {
          margin-bottom: var(--space-3);
          color: var(--gray-400);
        }
        
        .symptom-details {
          width: 95%;
          max-width: 500px;
        }
        
        .detail-item {
          margin-bottom: var(--space-3);
          display: flex;
          flex-wrap: wrap;
        }
        
        .detail-label {
          font-weight: 600;
          color: var(--gray-700);
          margin-right: var(--space-2);
          min-width: 80px;
        }
        
        .symptom-recommendations {
          margin-top: var(--space-4);
          padding-top: var(--space-3);
          border-top: 1px solid var(--gray-200);
        }
        
        .symptom-recommendations h4 {
          margin-bottom: var(--space-3);
          color: var(--gray-800);
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        
        .symptom-recommendations h4 i {
          color: var(--warning);
        }
        
        .recommendations-list {
          list-style: none;
          padding: 0;
        }
        
        .recommendations-list li {
          padding: var(--space-2) 0;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          color: var(--gray-700);
        }
        
        .recommendations-list li i {
          color: var(--primary-600);
          width: 20px;
        }
        
        .notification {
          position: fixed;
          bottom: 20px;
          right: 20px;
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-md);
          background-color: var(--success);
          color: white;
          box-shadow: var(--shadow-md);
          z-index: 1000;
          animation: slideInUp 0.3s ease;
        }
        
        .notification-error {
          background-color: var(--danger);
        }
        
        .notification-warning {
          background-color: var(--warning);
          color: var(--gray-900);
        }
        
        .fade-out {
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .w-100 { width: 100%; }
        .mt-3 { margin-top: var(--space-3); }
        .mt-4 { margin-top: var(--space-4); }
        .mr-2 { margin-right: var(--space-2); }
        
        @media (max-width: 768px) {
          .section-header {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .action-buttons {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </div>
  );
}

export default SymptomTracker; 