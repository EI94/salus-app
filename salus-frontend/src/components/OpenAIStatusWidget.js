import React, { useState, useEffect } from 'react';
import { checkOpenAIConfig, testOpenAIConnection } from '../utils/openaiKeyChecker';

/**
 * Widget per verificare lo stato della configurazione OpenAI
 * Questo componente può essere aggiunto alla dashboard o alle impostazioni
 * per aiutare a diagnosticare problemi con OpenAI
 */
const OpenAIStatusWidget = ({ showDetails = false }) => {
  const [configState, setConfigState] = useState(null);
  const [connectionState, setConnectionState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFix, setShowFix] = useState(false);

  useEffect(() => {
    // Verifica la configurazione all'avvio
    const config = checkOpenAIConfig();
    setConfigState(config);
    
    // Se c'è una chiave API valida, testa la connessione
    if (config.anyValid) {
      testOpenAIConnection().then(result => {
        setConnectionState(result);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  // Gestisce il test manuale della connessione
  const handleTestConnection = async () => {
    setIsLoading(true);
    const result = await testOpenAIConnection();
    setConnectionState(result);
    setIsLoading(false);
  };

  // Stato generale del sistema OpenAI
  const getStatusLabel = () => {
    if (isLoading) return "Verifica in corso...";
    if (!configState?.anyValid) return "Non configurato";
    if (connectionState?.success) return "Connessione funzionante";
    return "Errore di connessione";
  };

  // Classe CSS basata sullo stato
  const getStatusClass = () => {
    if (isLoading) return "status-checking";
    if (!configState?.anyValid) return "status-error";
    if (connectionState?.success) return "status-success";
    return "status-error";
  };

  return (
    <div className="openai-status-widget">
      <div className="widget-header">
        <h3>Stato OpenAI</h3>
        <div className={`status-indicator ${getStatusClass()}`}>
          {getStatusLabel()}
        </div>
      </div>

      {/* Indicatore semplice se non sono richiesti dettagli */}
      {!showDetails && (
        <button 
          className="show-details-btn"
          onClick={() => setShowFix(!showFix)}
        >
          {showFix ? "Nascondi soluzioni" : "Mostra soluzioni"}
        </button>
      )}

      {/* Dettagli di configurazione */}
      {(showDetails || showFix) && (
        <div className="status-details">
          <h4>Stato configurazione</h4>
          
          {configState && (
            <div className="config-status">
              <p>
                <strong>REACT_APP_OPENAI_API_KEY:</strong> {' '}
                {configState.results.REACT_APP_OPENAI_API_KEY.exists 
                  ? (configState.results.REACT_APP_OPENAI_API_KEY.valid 
                    ? <span className="valid">Valida ✓</span> 
                    : <span className="invalid">Non valida ✗</span>)
                  : <span className="missing">Non trovata ✗</span>
                }
              </p>
              
              <p>
                <strong>OPENAI_API_KEY:</strong> {' '}
                {configState.results.OPENAI_API_KEY.exists 
                  ? (configState.results.OPENAI_API_KEY.valid 
                    ? <span className="valid">Valida ✓</span> 
                    : <span className="invalid">Non valida ✗</span>)
                  : <span className="missing">Non trovata ✗</span>
                }
              </p>
              
              <p>
                <strong>NEXT_PUBLIC_OPENAI_API_KEY:</strong> {' '}
                {configState.results.NEXT_PUBLIC_OPENAI_API_KEY.exists 
                  ? (configState.results.NEXT_PUBLIC_OPENAI_API_KEY.valid 
                    ? <span className="valid">Valida ✓</span> 
                    : <span className="invalid">Non valida ✗</span>)
                  : <span className="missing">Non trovata ✗</span>
                }
              </p>
            </div>
          )}
          
          {/* Test di connessione */}
          {configState?.anyValid && (
            <div className="connection-test">
              <h4>Test connessione</h4>
              {connectionState ? (
                <p className={connectionState.success ? "success" : "error"}>
                  {connectionState.success 
                    ? "Connessione all'API OpenAI riuscita ✓" 
                    : `Errore: ${connectionState.error || "Errore sconosciuto"} ✗`}
                </p>
              ) : (
                <p>Test non ancora eseguito</p>
              )}
              
              <button 
                className="test-connection-btn"
                onClick={handleTestConnection}
                disabled={isLoading}
              >
                {isLoading ? "Test in corso..." : "Testa connessione"}
              </button>
            </div>
          )}
          
          {/* Istruzioni per risolvere problemi */}
          {(!configState?.anyValid || (connectionState && !connectionState.success)) && (
            <div className="fix-instructions">
              <h4>Risoluzione problemi</h4>
              
              <div className="fix-steps">
                <h5>In ambiente di sviluppo locale:</h5>
                <ol>
                  <li>Crea o modifica il file <code>.env.local</code> nella cartella principale del progetto</li>
                  <li>Aggiungi la seguente riga: <code>REACT_APP_OPENAI_API_KEY=la_tua_chiave_api</code></li>
                  <li>Sostituisci <code>la_tua_chiave_api</code> con la tua chiave API OpenAI (inizia con "sk-")</li>
                  <li>Riavvia l'applicazione</li>
                </ol>
                
                <h5>Su Vercel:</h5>
                <ol>
                  <li>Vai su <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">Vercel</a> e seleziona il tuo progetto</li>
                  <li>Vai su <strong>Settings</strong> &gt; <strong>Environment Variables</strong></li>
                  <li>Aggiungi una nuova variabile chiamata <code>REACT_APP_OPENAI_API_KEY</code></li>
                  <li>Imposta il valore alla tua chiave API OpenAI (es. <code>sk-...</code>)</li>
                  <li>Clicca su <strong>Save</strong></li>
                  <li>Rideployare l'applicazione con <strong>Redeploy</strong></li>
                </ol>
                
                <h5>Ottieni una chiave API OpenAI:</h5>
                <ol>
                  <li>Vai su <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com/api-keys</a></li>
                  <li>Registrati o accedi al tuo account</li>
                  <li>Crea una nuova chiave API</li>
                  <li>Copia la chiave e usala come indicato sopra</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .openai-status-widget {
          background: white;
          border-radius: 8px;
          padding: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 20px;
        }
        
        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .widget-header h3 {
          margin: 0;
          font-size: 16px;
        }
        
        .status-indicator {
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .status-checking {
          background-color: #f8f9fa;
          color: #6c757d;
        }
        
        .status-success {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-error {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .show-details-btn, .test-connection-btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-top: 10px;
        }
        
        .show-details-btn:hover, .test-connection-btn:hover {
          background: #e9ecef;
        }
        
        .test-connection-btn {
          background: #e9ecef;
        }
        
        .status-details {
          margin-top: 15px;
          border-top: 1px solid #dee2e6;
          padding-top: 15px;
        }
        
        .status-details h4 {
          margin: 0 0 10px 0;
          font-size: 15px;
        }
        
        .config-status p {
          margin: 5px 0;
          font-size: 14px;
        }
        
        .valid {
          color: #28a745;
        }
        
        .invalid, .error, .missing {
          color: #dc3545;
        }
        
        .success {
          color: #28a745;
        }
        
        .fix-instructions {
          margin-top: 15px;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
        }
        
        .fix-instructions h5 {
          margin: 15px 0 5px 0;
          font-size: 14px;
        }
        
        .fix-instructions ol {
          margin: 10px 0;
          padding-left: 20px;
        }
        
        .fix-instructions li {
          margin-bottom: 5px;
          font-size: 14px;
        }
        
        code {
          background: #e9ecef;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }
      `}</style>
    </div>
  );
};

export default OpenAIStatusWidget; 