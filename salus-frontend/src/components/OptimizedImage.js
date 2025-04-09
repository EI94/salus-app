import React, { useState, useEffect } from 'react';
import ImageCache from '../services/ImageCache';

/**
 * Componente per la visualizzazione ottimizzata delle immagini con supporto per cache,
 * lazy loading e placeholder.
 * 
 * @param {Object} props - Proprietà del componente
 * @param {string} props.src - URL dell'immagine da caricare
 * @param {string} props.alt - Testo alternativo per l'immagine
 * @param {string} props.className - Classi CSS da applicare all'immagine
 * @param {Function} props.onLoad - Callback chiamata quando l'immagine è caricata
 * @param {Function} props.onError - Callback chiamata in caso di errore
 * @param {string} props.placeholderSrc - URL dell'immagine placeholder da mostrare durante il caricamento
 * @param {Object} props.style - Stili CSS inline da applicare all'immagine
 * @param {boolean} props.lazy - Se true, abilita il lazy loading
 * @param {string} props.blurHash - BlurHash per generare un placeholder sfocato
 * @returns {JSX.Element} Componente React
 */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  onLoad,
  onError,
  placeholderSrc = '/placeholder.svg',
  style = {},
  lazy = true,
  blurHash,
  ...rest
}) => {
  // Stato per tracciare l'URL effettivo dell'immagine (che potrebbe provenire dalla cache)
  const [imageUrl, setImageUrl] = useState(placeholderSrc);
  
  // Stato per tracciare se l'immagine è in caricamento
  const [isLoading, setIsLoading] = useState(true);
  
  // Stato per tracciare se c'è stato un errore nel caricamento
  const [hasError, setHasError] = useState(false);
  
  // Recupera l'immagine dalla cache o caricala
  useEffect(() => {
    if (!src) {
      setImageUrl(placeholderSrc);
      setIsLoading(false);
      return;
    }
    
    let isMounted = true;
    
    const loadImage = async () => {
      try {
        // Ottieni l'immagine dalla cache o caricala
        const cachedUrl = await ImageCache.getImage(src);
        
        // Se il componente è ancora montato, aggiorna lo stato
        if (isMounted) {
          setImageUrl(cachedUrl);
          setIsLoading(false);
          if (onLoad) onLoad();
        }
      } catch (error) {
        console.error(`Errore nel caricamento dell'immagine ${src}:`, error);
        
        // Se il componente è ancora montato, aggiorna lo stato
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
          if (onError) onError(error);
        }
      }
    };
    
    // Carica l'immagine solo se il componente è visibile (per lazy loading)
    if (lazy) {
      // Crea un IntersectionObserver per rilevare quando l'immagine diventa visibile
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Se l'immagine è visibile, caricala
            if (entry.isIntersecting) {
              loadImage();
              observer.disconnect();
            }
          });
        },
        { rootMargin: '200px' } // Precarica l'immagine quando è a 200px di distanza dal viewport
      );
      
      // Crea un elemento di riferimento per l'observer
      const element = document.createElement('div');
      observer.observe(element);
      
      // Clean up
      return () => {
        isMounted = false;
        observer.disconnect();
      };
    } else {
      // Se lazy loading non è abilitato, carica l'immagine immediatamente
      loadImage();
      
      // Clean up
      return () => {
        isMounted = false;
      };
    }
  }, [src, placeholderSrc, onLoad, onError, lazy]);
  
  // Stili per il contenitore dell'immagine
  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    ...style
  };
  
  // Stili per l'immagine
  const imgStyle = {
    opacity: isLoading ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out'
  };
  
  // Stili per il placeholder
  const placeholderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: isLoading ? 'block' : 'none'
  };
  
  return (
    <div className={`optimized-image-container ${className}`} style={containerStyle} {...rest}>
      {/* Placeholder durante il caricamento */}
      {isLoading && (
        <div className="optimized-image-placeholder" style={placeholderStyle}>
          <img 
            src={placeholderSrc} 
            alt={alt ? `${alt} placeholder` : 'Immagine in caricamento'} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}
      
      {/* Immagine effettiva */}
      {!hasError ? (
        <img
          src={imageUrl}
          alt={alt}
          className="optimized-image"
          style={imgStyle}
          onLoad={() => {
            setIsLoading(false);
            if (onLoad) onLoad();
          }}
          onError={(e) => {
            setHasError(true);
            setIsLoading(false);
            if (onError) onError(e);
          }}
        />
      ) : (
        // Immagine di fallback in caso di errore
        <div className="optimized-image-error">
          <img 
            src="/error-image.svg" 
            alt={`Errore nel caricamento di ${alt}`} 
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      )}
    </div>
  );
};

export default OptimizedImage; 