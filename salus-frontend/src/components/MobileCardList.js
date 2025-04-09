import React, { useState, useCallback } from 'react';
import SwipeContainer from './SwipeContainer';
import OptimizedImage from './OptimizedImage';

/**
 * Componente per la visualizzazione di una lista di card ottimizzata per mobile con swipe
 * 
 * @param {Object} props - Props del componente
 * @param {Array} props.items - Array di oggetti da visualizzare
 * @param {string} props.title - Titolo della lista
 * @param {function} props.onItemClick - Callback per il click su un item
 * @param {function} props.onAddItem - Callback per l'aggiunta di un nuovo item
 * @param {function} props.onDeleteItem - Callback per l'eliminazione di un item
 * @returns {JSX.Element} Componente React
 */
const MobileCardList = ({
  items = [],
  title = 'Lista',
  onItemClick,
  onAddItem,
  onDeleteItem
}) => {
  const [activeItemId, setActiveItemId] = useState(null);
  
  // Gestisce lo swipe a sinistra (elimina)
  const handleSwipeLeft = useCallback((id) => {
    if (onDeleteItem) {
      onDeleteItem(id);
    }
  }, [onDeleteItem]);
  
  // Gestisce lo swipe a destra (dettagli)
  const handleSwipeRight = useCallback((id) => {
    if (onItemClick) {
      onItemClick(id);
    }
  }, [onItemClick]);
  
  // Gestisce il click su un item
  const handleItemClick = useCallback((id) => {
    if (onItemClick) {
      onItemClick(id);
    }
  }, [onItemClick]);
  
  // Gestisce il click sul pulsante di aggiunta
  const handleAddClick = useCallback(() => {
    if (onAddItem) {
      onAddItem();
    }
  }, [onAddItem]);
  
  // Ottiene l'icona appropriata per un item in base al tipo
  const getItemIcon = (item) => {
    if (!item.type) return 'fas fa-sticky-note';
    
    switch (item.type.toLowerCase()) {
      case 'symptom':
        return 'fas fa-heartbeat';
      case 'medication':
        return 'fas fa-pills';
      case 'wellness':
        return 'fas fa-heart';
      case 'appointment':
        return 'fas fa-calendar-alt';
      case 'note':
        return 'fas fa-sticky-note';
      default:
        return 'fas fa-sticky-note';
    }
  };
  
  return (
    <div className="mobile-card-list">
      <div className="mobile-card-list-header">
        <h2>{title}</h2>
        <button 
          className="add-button" 
          onClick={handleAddClick}
          aria-label="Aggiungi nuovo elemento"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>
      
      <div className="mobile-card-list-content">
        {items.length === 0 ? (
          <div className="empty-list">
            <i className="fas fa-inbox empty-icon"></i>
            <p>Nessun elemento presente</p>
            <button className="add-first-button" onClick={handleAddClick}>
              Aggiungi il primo elemento
            </button>
          </div>
        ) : (
          <ul className="card-items">
            {items.map((item) => (
              <li key={item.id} className="card-item-wrapper">
                <SwipeContainer
                  onSwipeLeft={() => handleSwipeLeft(item.id)}
                  onSwipeRight={() => handleSwipeRight(item.id)}
                  className={`card-item ${activeItemId === item.id ? 'active' : ''}`}
                >
                  <div 
                    className="card-item-content" 
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="card-item-icon">
                      <i className={getItemIcon(item)}></i>
                    </div>
                    <div className="card-item-info">
                      <h3 className="card-item-title">{item.title}</h3>
                      <p className="card-item-description">{item.description}</p>
                      <div className="card-item-meta">
                        {item.date && (
                          <span className="card-item-date">
                            <i className="fas fa-calendar"></i>
                            {new Date(item.date).toLocaleDateString('it-IT')}
                          </span>
                        )}
                        {item.tags && item.tags.length > 0 && (
                          <div className="card-item-tags">
                            {item.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="card-item-tag">{tag}</span>
                            ))}
                            {item.tags.length > 2 && <span className="card-item-tag-more">+{item.tags.length - 2}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.imageUrl && (
                      <div className="card-item-image">
                        <OptimizedImage 
                          src={item.imageUrl} 
                          alt={item.title}
                          lazy={true}
                          className="card-thumbnail"
                        />
                      </div>
                    )}
                  </div>
                </SwipeContainer>
                <div className="swipe-actions">
                  <div className="swipe-action swipe-action-right">
                    <i className="fas fa-info"></i>
                    <span>Dettagli</span>
                  </div>
                  <div className="swipe-action swipe-action-left">
                    <i className="fas fa-trash"></i>
                    <span>Elimina</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="swipe-hint">
        <p>
          <i className="fas fa-hand-pointer"></i>
          Scorri a sinistra per eliminare, a destra per i dettagli
        </p>
      </div>
    </div>
  );
};

export default MobileCardList; 