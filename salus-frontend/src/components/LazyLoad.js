import React, { lazy, Suspense } from 'react';

/**
 * Componente di fallback durante il caricamento dei componenti lazy-loaded
 */
const LoadingFallback = ({ type = 'component' }) => {
  let message = 'Caricamento in corso...';
  
  if (type === 'page') {
    message = 'Caricamento della pagina...';
  } else if (type === 'chart') {
    message = 'Preparazione dei grafici...';
  } else if (type === 'data') {
    message = 'Caricamento dei dati...';
  }
  
  return (
    <div className="lazy-loading-placeholder">
      <div className="pulse-animation"></div>
      <p>{message}</p>
    </div>
  );
};

/**
 * HOC (Higher-Order Component) per caricare in lazy-loading i componenti
 * @param {Function} importFunction - Funzione di importazione dinamica del componente
 * @param {Object} options - Opzioni di configurazione
 * @param {string} options.type - Tipo di componente ('component', 'page', 'chart', 'data')
 * @param {number} options.delay - Ritardo artificiale in ms (utile solo in sviluppo)
 * @returns {React.LazyExoticComponent} Componente React lazy-loaded
 */
const withLazyLoading = (importFunction, options = {}) => {
  const { type = 'component', delay = 0 } = options;
  
  // Se siamo in development e c'è un ritardo, aggiungiamolo per testare il caricamento
  const importWithDelay = process.env.NODE_ENV === 'development' && delay > 0
    ? () => new Promise(resolve => setTimeout(() => importFunction().then(resolve), delay))
    : importFunction;
  
  // Crea un componente React.lazy
  const LazyComponent = lazy(importWithDelay);
  
  // Restituisci un componente che usa Suspense per gestire il caricamento
  return (props) => (
    <Suspense fallback={<LoadingFallback type={type} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Funzione helper per lazy-loadare un componente
 * @param {string} path - Percorso del componente da importare
 * @param {Object} options - Opzioni di configurazione
 * @returns {React.LazyExoticComponent} Componente React lazy-loaded
 */
export const lazyLoad = (path, options = {}) => {
  return withLazyLoading(() => import(`../${path}`), options);
};

export default withLazyLoading; 