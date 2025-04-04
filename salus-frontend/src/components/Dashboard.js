import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const [symptoms, /*setSymptoms*/] = useState([]);
  const [medications, /*setMedications*/] = useState([]);
  const [wellness, /*setWellness*/] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simuliamo il caricamento dei dati
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const EmptyStateCard = ({ icon, title, description, buttonText, to }) => (
    <Link to={to} className="dashboard-card empty">
      <div className="empty-state-icon">
        <i className={`fas ${icon}`}></i>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      <button className="empty-state-button">{buttonText}</button>
    </Link>
  );

  if (loading) {
    return <div className="loading">Caricamento...</div>;
  }

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">{t('dashboard')}</h1>
      <div className="dashboard-grid">
        {/* Sintomi */}
        {symptoms.length === 0 ? (
          <EmptyStateCard
            icon="fa-heartbeat"
            title={t('symptoms')}
            description={t('noSymptomsDescription')}
            buttonText={t('addSymptoms')}
            to="/symptoms"
          />
        ) : (
          <div className="dashboard-card">
            <h2>{t('symptoms')}</h2>
            {/* Contenuto sintomi */}
          </div>
        )}

        {/* Farmaci */}
        {medications.length === 0 ? (
          <EmptyStateCard
            icon="fa-pills"
            title={t('medications')}
            description={t('noMedicationsDescription')}
            buttonText={t('addMedications')}
            to="/medications"
          />
        ) : (
          <div className="dashboard-card">
            <h2>{t('medications')}</h2>
            {/* Contenuto farmaci */}
          </div>
        )}

        {/* Benessere */}
        {wellness.length === 0 ? (
          <EmptyStateCard
            icon="fa-smile"
            title={t('wellness')}
            description={t('noWellnessDescription')}
            buttonText={t('addWellness')}
            to="/wellness"
          />
        ) : (
          <div className="dashboard-card">
            <h2>{t('wellness')}</h2>
            {/* Contenuto benessere */}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 