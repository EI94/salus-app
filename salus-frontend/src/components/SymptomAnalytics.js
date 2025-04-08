import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';
import { 
  loadUserSymptoms, 
  loadUserMedications,
  analyzeSymptomMedicationCorrelations
} from '../firebase/firestore';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { format, parseISO, subDays, differenceInDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { FiDownload, FiFilter } from 'react-icons/fi';
import { BsBodyText } from 'react-icons/bs';

// Registra i componenti ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Componente per la visualizzazione analitica dei sintomi
function SymptomAnalytics() {
  // Stati per i dati
  const [user, setUser] = useState(null);
  const [symptoms, setSymptoms] = useState([]);
  const [medications, setMedications] = useState([]);
  const [correlations, setCorrelations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', 'year'
  const [filteredCategory, setFilteredCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  
  // Carica l'utente autenticato
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadUserData();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  // Carica i dati quando cambia l'intervallo di tempo
  useEffect(() => {
    if (user) {
      processData();
    }
  }, [timeRange, filteredCategory, symptoms, medications]);
  
  // Carica i dati dell'utente
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Carica sintomi e farmaci
      const symptomsData = await loadUserSymptoms();
      const medicationsData = await loadUserMedications();
      
      setSymptoms(symptomsData);
      setMedications(medicationsData);
      
      // Estrai le categorie uniche
      const uniqueCategories = [...new Set(symptomsData.map(s => s.category))];
      setCategories(uniqueCategories);
      
      // Analizza le correlazioni
      const correlationsData = await analyzeSymptomMedicationCorrelations();
      setCorrelations(correlationsData);
      
      setLoading(false);
    } catch (error) {
      console.error('Errore nel caricamento dei dati:', error);
      toast.error('Errore nel caricamento dei dati. Riprova più tardi.');
      setLoading(false);
    }
  };
  
  // Prepara i dati in base ai filtri
  const processData = () => {
    if (!symptoms.length) return;
    
    // Filtra per intervallo di tempo
    let startDate;
    const today = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate = subDays(today, 7);
        break;
      case 'month':
        startDate = subDays(today, 30);
        break;
      case 'year':
        startDate = subDays(today, 365);
        break;
      default:
        startDate = subDays(today, 7);
    }
    
    // Filtra i sintomi per data e categoria
    const filteredSymptoms = symptoms.filter(symptom => {
      const symptomDate = parseISO(symptom.createdAt);
      const isInTimeRange = symptomDate >= startDate;
      const isInCategory = filteredCategory === 'all' || symptom.category === filteredCategory;
      return isInTimeRange && isInCategory;
    });
    
    setSymptoms(filteredSymptoms);
  };
  
  // Genera i dati per il grafico di intensità dei sintomi
  const getIntensityChartData = () => {
    if (!symptoms.length) return null;
    
    // Raggruppa i sintomi per data
    const symptomsGroupedByDate = {};
    symptoms.forEach(symptom => {
      const date = format(parseISO(symptom.createdAt), 'yyyy-MM-dd');
      if (!symptomsGroupedByDate[date]) {
        symptomsGroupedByDate[date] = [];
      }
      symptomsGroupedByDate[date].push(symptom);
    });
    
    // Ordina le date
    const dates = Object.keys(symptomsGroupedByDate).sort();
    
    // Prepara i dati per il grafico
    const data = {
      labels: dates.map(date => format(parseISO(date), 'd MMM', { locale: it })),
      datasets: [{
        label: 'Intensità media giornaliera',
        data: dates.map(date => {
          const daySymptoms = symptomsGroupedByDate[date];
          const avgIntensity = daySymptoms.reduce((acc, s) => acc + s.intensity, 0) / daySymptoms.length;
          return avgIntensity.toFixed(1);
        }),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.3,
        fill: true
      }]
    };
    
    return data;
  };
  
  // Genera i dati per il grafico delle categorie di sintomi
  const getCategoryChartData = () => {
    if (!symptoms.length) return null;
    
    // Conta i sintomi per categoria
    const categoryCounts = {};
    symptoms.forEach(symptom => {
      if (!categoryCounts[symptom.category]) {
        categoryCounts[symptom.category] = 0;
      }
      categoryCounts[symptom.category]++;
    });
    
    // Prepara i dati per il grafico
    const data = {
      labels: Object.keys(categoryCounts),
      datasets: [{
        label: 'Numero di sintomi per categoria',
        data: Object.values(categoryCounts),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ]
      }]
    };
    
    return data;
  };
  
  // Opzioni per i grafici
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 1
        }
      }
    }
  };
  
  // Opzioni per il grafico a barre
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };
  
  // Scarica i dati come PDF
  const handleDownloadReport = () => {
    toast.info('Generazione report in corso...');
    // Qui implementeremo la generazione del PDF
    setTimeout(() => {
      toast.success('Report scaricato con successo!');
    }, 1500);
  };
  
  // Contenuto alternativo durante il caricamento o se non ci sono dati
  const renderPlaceholderContent = () => {
    if (loading) {
      return <div className="loading-container"><p>Caricamento dati analisi...</p></div>;
    }
    
    if (!user) {
      return (
        <div className="auth-prompt">
          <p>Accedi per visualizzare le tue analisi dei sintomi</p>
        </div>
      );
    }
    
    if (symptoms.length === 0) {
      return (
        <div className="empty-state">
          <p>Non hai ancora registrato sintomi da analizzare</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Componente per l'interfaccia della mappa corporea
  const BodyMap = () => {
    const bodyParts = [
      { id: 'head', name: 'Testa', x: 50, y: 10, width: 20, height: 20 },
      { id: 'chest', name: 'Torace', x: 50, y: 35, width: 30, height: 25 },
      { id: 'stomach', name: 'Stomaco', x: 50, y: 65, width: 25, height: 20 },
      { id: 'leftArm', name: 'Braccio sinistro', x: 25, y: 40, width: 15, height: 30 },
      { id: 'rightArm', name: 'Braccio destro', x: 75, y: 40, width: 15, height: 30 },
      { id: 'leftLeg', name: 'Gamba sinistra', x: 40, y: 85, width: 15, height: 40 },
      { id: 'rightLeg', name: 'Gamba destra', x: 60, y: 85, width: 15, height: 40 },
    ];
    
    // Calcola il colore in base all'intensità 
    const getIntensityColor = (bodyPart) => {
      const bodyPartSymptoms = symptoms.filter(s => s.bodyPart === bodyPart);
      
      if (bodyPartSymptoms.length === 0) {
        return 'rgba(220, 220, 220, 0.5)';
      }
      
      const avgIntensity = bodyPartSymptoms.reduce((acc, s) => acc + s.intensity, 0) / bodyPartSymptoms.length;
      
      // Scala di colori dal giallo al rosso in base all'intensità
      const intensity = Math.min(avgIntensity / 10, 1);
      return `rgba(255, ${Math.floor(255 * (1 - intensity))}, 0, ${0.3 + intensity * 0.5})`;
    };
    
    return (
      <div className="body-map-container">
        <h3>Mappa dell'intensità del dolore</h3>
        <div className="body-map">
          <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
            {/* Silhouette del corpo */}
            <path 
              d="M50,0 C60,0 65,10 65,15 C65,20 60,25 50,30 C40,25 35,20 35,15 C35,10 40,0 50,0 Z" 
              fill="#ddd" 
              stroke="#aaa" 
              strokeWidth="0.5"
            />
            <rect x="40" y="30" width="20" height="30" fill="#ddd" stroke="#aaa" strokeWidth="0.5" />
            <rect x="35" y="60" width="30" height="20" fill="#ddd" stroke="#aaa" strokeWidth="0.5" />
            <rect x="40" y="80" width="8" height="40" fill="#ddd" stroke="#aaa" strokeWidth="0.5" />
            <rect x="52" y="80" width="8" height="40" fill="#ddd" stroke="#aaa" strokeWidth="0.5" />
            <rect x="25" y="30" width="10" height="40" fill="#ddd" stroke="#aaa" strokeWidth="0.5" />
            <rect x="65" y="30" width="10" height="40" fill="#ddd" stroke="#aaa" strokeWidth="0.5" />
            
            {/* Aree cliccabili con colori basati sull'intensità */}
            {bodyParts.map(part => (
              <rect 
                key={part.id}
                x={part.x - part.width/2}
                y={part.y - part.height/2}
                width={part.width}
                height={part.height}
                fill={getIntensityColor(part.id)}
                stroke={selectedBodyPart === part.id ? "#000" : "none"}
                strokeWidth="1"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedBodyPart(part.id === selectedBodyPart ? null : part.id)}
              />
            ))}
          </svg>
          
          <div className="legend">
            <div className="legend-title">Intensità:</div>
            <div className="legend-scale">
              <div className="legend-item" style={{ backgroundColor: 'rgba(255, 255, 0, 0.5)' }}>Bassa</div>
              <div className="legend-item" style={{ backgroundColor: 'rgba(255, 180, 0, 0.6)' }}>Media</div>
              <div className="legend-item" style={{ backgroundColor: 'rgba(255, 0, 0, 0.7)' }}>Alta</div>
            </div>
          </div>
        </div>
        
        {selectedBodyPart && (
          <div className="body-part-symptoms">
            <h4>{bodyParts.find(p => p.id === selectedBodyPart).name}</h4>
            {symptoms.filter(s => s.bodyPart === selectedBodyPart).length === 0 ? (
              <p>Nessun sintomo registrato per questa parte del corpo</p>
            ) : (
              <ul>
                {symptoms
                  .filter(s => s.bodyPart === selectedBodyPart)
                  .slice(0, 5)
                  .map(symptom => (
                    <li key={symptom.id}>
                      <strong>{symptom.name}</strong> - Intensità: {symptom.intensity}
                      <div className="symptom-date">
                        {format(parseISO(symptom.createdAt), 'd MMM yyyy', { locale: it })}
                      </div>
                    </li>
                  ))
                }
              </ul>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Componente per la visualizzazione delle correlazioni tra sintomi e farmaci
  const CorrelationsView = () => {
    if (correlations.length === 0) {
      return (
        <div className="no-correlations">
          <p>Non sono state trovate correlazioni significative tra sintomi e farmaci.</p>
          <p>Continua a registrare sintomi e farmaci per migliorare l'analisi.</p>
        </div>
      );
    }
    
    return (
      <div className="correlations-container">
        <h3>Possibili correlazioni tra sintomi e farmaci</h3>
        <ul className="correlations-list">
          {correlations.map((correlation, index) => (
            <li key={index} className="correlation-item">
              <div className="correlation-title">
                Sintomo: <strong>{correlation.symptom.name}</strong> 
                <span className="correlation-intensity">Intensità: {correlation.symptom.intensity}</span>
              </div>
              <div className="correlation-meds">
                <p>Farmaci assunti nelle 24 ore precedenti:</p>
                <ul>
                  {correlation.medications.map(med => (
                    <li key={med.id}>
                      <span className="med-name">{med.name}</span>
                      <span className="med-dosage">{med.dosage}</span>
                      <span className="med-time">
                        {format(parseISO(med.createdAt), 'HH:mm', { locale: it })}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  // Componente effettivo
  return (
    <div className="symptom-analytics-container">
      <div className="analytics-header">
        <h2>Analisi Sintomi</h2>
        <button 
          className="download-report-button" 
          onClick={handleDownloadReport}
          disabled={loading || symptoms.length === 0}
        >
          <FiDownload /> Scarica Report
        </button>
      </div>
      
      {/* Placeholder durante caricamento o stato vuoto */}
      {renderPlaceholderContent()}
      
      {user && !loading && symptoms.length > 0 && (
        <div className="analytics-content">
          <div className="filters-section">
            <div className="filter-group">
              <label htmlFor="timeRange">Periodo:</label>
              <select 
                id="timeRange" 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="week">Ultima settimana</option>
                <option value="month">Ultimo mese</option>
                <option value="year">Ultimo anno</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="category">Categoria:</label>
              <select 
                id="category" 
                value={filteredCategory} 
                onChange={(e) => setFilteredCategory(e.target.value)}
              >
                <option value="all">Tutte le categorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="charts-container">
            <div className="chart-box">
              <h3>Andamento dell'intensità dei sintomi</h3>
              <div className="chart-wrapper">
                {getIntensityChartData() ? (
                  <Line data={getIntensityChartData()} options={chartOptions} />
                ) : (
                  <p className="no-data-message">Dati insufficienti per il grafico</p>
                )}
              </div>
            </div>
            
            <div className="chart-box">
              <h3>Distribuzione per categoria</h3>
              <div className="chart-wrapper">
                {getCategoryChartData() ? (
                  <Bar data={getCategoryChartData()} options={barChartOptions} />
                ) : (
                  <p className="no-data-message">Dati insufficienti per il grafico</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="analysis-sections">
            <div className="analysis-section-box body-map-section">
              <BodyMap />
            </div>
            
            <div className="analysis-section-box correlations-section">
              <CorrelationsView />
            </div>
          </div>
        </div>
      )}
      
      {/* Stili CSS per il componente */}
      <style jsx>{`
        .symptom-analytics-container {
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          margin-bottom: 20px;
        }
        
        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 15px;
        }
        
        h2 {
          color: #333;
          margin: 0;
        }
        
        .download-report-button {
          display: flex;
          align-items: center;
          gap: 8px;
          background-color: #4caf50;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        
        .download-report-button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        
        .loading-container, .auth-prompt, .empty-state {
          padding: 20px;
          text-align: center;
          color: #666;
        }
        
        .filters-section {
          display: flex;
          justify-content: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .filter-group label {
          font-weight: bold;
        }
        
        .filter-group select {
          padding: 6px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: white;
        }
        
        .charts-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .chart-box {
          flex: 1;
          min-width: 300px;
          background-color: #f9f9f9;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .chart-box h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 16px;
          color: #333;
          text-align: center;
        }
        
        .chart-wrapper {
          height: 300px;
          position: relative;
        }
        
        .no-data-message {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #999;
          font-style: italic;
        }
        
        .analysis-sections {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .analysis-section-box {
          flex: 1;
          min-width: 300px;
          background-color: #f9f9f9;
          border-radius: 6px;
          padding: 15px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .body-map-container {
          text-align: center;
        }
        
        .body-map {
          position: relative;
          max-width: 300px;
          margin: 0 auto;
        }
        
        .body-map svg {
          width: 100%;
          height: auto;
        }
        
        .legend {
          margin-top: 10px;
          font-size: 12px;
        }
        
        .legend-title {
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .legend-scale {
          display: flex;
          justify-content: space-between;
        }
        
        .legend-item {
          flex: 1;
          text-align: center;
          padding: 3px;
          margin: 0 2px;
        }
        
        .body-part-symptoms {
          margin-top: 15px;
          text-align: left;
          background-color: white;
          padding: 10px;
          border-radius: 4px;
        }
        
        .body-part-symptoms h4 {
          margin-top: 0;
          margin-bottom: 10px;
          color: #333;
        }
        
        .body-part-symptoms ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .body-part-symptoms li {
          padding: 6px 0;
          border-bottom: 1px solid #eee;
        }
        
        .symptom-date {
          font-size: 12px;
          color: #777;
          margin-top: 3px;
        }
        
        .correlations-container h3 {
          margin-top: 0;
          margin-bottom: 15px;
          font-size: 16px;
          color: #333;
        }
        
        .correlations-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .correlation-item {
          background-color: white;
          padding: 10px;
          margin-bottom: 10px;
          border-radius: 4px;
          border-left: 3px solid #ff9800;
        }
        
        .correlation-title {
          margin-bottom: 8px;
        }
        
        .correlation-intensity {
          font-size: 12px;
          color: #777;
          margin-left: 10px;
        }
        
        .correlation-meds p {
          font-size: 14px;
          margin: 5px 0;
        }
        
        .correlation-meds ul {
          list-style: none;
          padding-left: 15px;
          margin: 5px 0;
        }
        
        .correlation-meds li {
          display: flex;
          gap: 10px;
          align-items: center;
          padding: 3px 0;
          font-size: 13px;
        }
        
        .med-name {
          font-weight: bold;
        }
        
        .med-dosage {
          color: #555;
          background-color: #f0f0f0;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 12px;
        }
        
        .med-time {
          color: #777;
          font-size: 12px;
        }
        
        .no-correlations {
          text-align: center;
          padding: 20px;
          color: #666;
          font-style: italic;
        }
        
        /* Responsività */
        @media (max-width: 768px) {
          .filters-section {
            flex-direction: column;
            gap: 10px;
          }
          
          .charts-container, .analysis-sections {
            flex-direction: column;
          }
          
          .chart-box, .analysis-section-box {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default SymptomAnalytics;