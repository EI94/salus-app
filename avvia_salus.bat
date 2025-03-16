@echo off
title Avvio Salus App

echo ===================================
echo       AVVIO DELL'APP SALUS      
echo ===================================
echo.

REM Controlla se è installato Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERRORE] Node.js non trovato. Assicurati di avere Node.js installato.
    echo Puoi scaricarlo da https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js trovato: 
node --version
echo.

REM Controlla MongoDB
echo [INFO] Verifica che MongoDB sia in esecuzione...
echo.

REM Avvia il backend
echo [INFO] Avvio del backend Salus...
start cmd /k "cd %~dp0salus-mvp && npm start"
echo [INFO] Il backend è stato avviato in un'altra finestra.
echo.

REM Attendi alcuni secondi per far partire il backend
timeout /t 5 /nobreak >nul

REM Avvia il frontend
echo [INFO] Avvio del frontend Salus...
start cmd /k "cd %~dp0salus-frontend && npm start"
echo [INFO] Il frontend è stato avviato in un'altra finestra.
echo.

echo [INFO] L'app Salus è in avvio...
echo.
echo [INFO] Per visualizzare l'app, apri http://localhost:3000 nel tuo browser
echo [INFO] Backend API disponibile su http://localhost:5000
echo.
echo [INFO] Per terminare l'applicazione, chiudi tutte le finestre del prompt dei comandi.
echo ===================================

pause 