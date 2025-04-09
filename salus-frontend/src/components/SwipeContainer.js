import React, { useRef, useState, useEffect } from 'react';

/**
 * Componente che gestisce i gesti swipe in modo ottimizzato per mobile
 * 
 * @param {Object} props - Props del componente
 * @param {React.ReactNode} props.children - Elementi figli
 * @param {Function} props.onSwipeLeft - Callback per swipe a sinistra
 * @param {Function} props.onSwipeRight - Callback per swipe a destra
 * @param {Function} props.onSwipeUp - Callback per swipe verso l'alto
 * @param {Function} props.onSwipeDown - Callback per swipe verso il basso
 * @param {number} props.threshold - Soglia minima in pixel per considerare uno swipe (default: 50)
 * @param {string} props.className - Classi CSS aggiuntive
 * @param {Object} props.style - Stili CSS inline
 * @returns {JSX.Element} - Componente React
 */
const SwipeContainer = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = '',
  style = {},
  ...props
}) => {
  const containerRef = useRef(null);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [swiping, setSwiping] = useState(false);
  const [direction, setDirection] = useState(null);
  
  // Gestisce l'inizio del touch
  const handleTouchStart = (e) => {
    setSwiping(true);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  // Gestisce il movimento durante il touch
  const handleTouchMove = (e) => {
    if (!swiping) return;
    
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
    
    // Calcola la direzione e la distanza dello swipe
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    
    // Determina la direzione predominante (orizzontale o verticale)
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Swipe orizzontale
      if (deltaX > 0) {
        setDirection('right');
      } else {
        setDirection('left');
      }
      
      // Applica lo spostamento solo se lo swipe è orizzontale e c'è un gestore
      if ((deltaX > 0 && onSwipeRight) || (deltaX < 0 && onSwipeLeft)) {
        // Limita lo spostamento per un effetto elastico
        const resistance = 0.4;
        const translateX = deltaX * resistance;
        
        if (containerRef.current) {
          containerRef.current.style.transform = `translateX(${translateX}px)`;
        }
      }
    } else {
      // Swipe verticale
      if (deltaY > 0) {
        setDirection('down');
      } else {
        setDirection('up');
      }
      
      // Applica lo spostamento solo se lo swipe è verticale e c'è un gestore
      if ((deltaY > 0 && onSwipeDown) || (deltaY < 0 && onSwipeUp)) {
        // Limita lo spostamento per un effetto elastico
        const resistance = 0.4;
        const translateY = deltaY * resistance;
        
        if (containerRef.current) {
          containerRef.current.style.transform = `translateY(${translateY}px)`;
        }
      }
    }
  };
  
  // Gestisce la fine del touch
  const handleTouchEnd = () => {
    if (!swiping) return;
    
    // Calcola la distanza dello swipe
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    
    // Verifica se lo swipe supera la soglia
    if (Math.abs(deltaX) > threshold) {
      // Swipe orizzontale
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else if (Math.abs(deltaY) > threshold) {
      // Swipe verticale
      if (deltaY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
    
    // Ripristina lo stato e la posizione
    setSwiping(false);
    setDirection(null);
    
    if (containerRef.current) {
      containerRef.current.style.transform = '';
    }
  };
  
  // Gestisce l'annullamento del touch (es. quando il dito esce dall'elemento)
  const handleTouchCancel = () => {
    setSwiping(false);
    setDirection(null);
    
    if (containerRef.current) {
      containerRef.current.style.transform = '';
    }
  };
  
  // Aggiunge la classe appropriata in base alla direzione dello swipe
  const getDirectionClass = () => {
    if (!direction) return '';
    return `swiping-${direction}`;
  };
  
  // Rimuove gli event listener quando il componente viene smontato
  useEffect(() => {
    const currentRef = containerRef.current;
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('touchstart', handleTouchStart);
        currentRef.removeEventListener('touchmove', handleTouchMove);
        currentRef.removeEventListener('touchend', handleTouchEnd);
        currentRef.removeEventListener('touchcancel', handleTouchCancel);
      }
    };
  }, []);
  
  return (
    <div
      ref={containerRef}
      className={`swipe-container ${className} ${getDirectionClass()}`}
      style={{
        ...style,
        transition: swiping ? 'none' : 'transform 0.3s ease-out'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      {...props}
    >
      <div className="swipe-content">
        {children}
      </div>
    </div>
  );
};

export default SwipeContainer; 