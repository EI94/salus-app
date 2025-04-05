const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Conversione dei logo SVG in PNG...');

// Installa sharp se non esiste
try {
  require.resolve('sharp');
  console.log('Sharp è già installato.');
} catch (e) {
  console.log('Installazione di sharp...');
  execSync('npm install sharp --no-save');
}

const sharp = require('sharp');

const publicDir = path.join(__dirname, '../public');
const logoSvgPath = path.join(publicDir, 'logo-light.svg');
const logoPngPath = path.join(publicDir, 'logo-light.png');
const logoWithTextSvgPath = path.join(publicDir, 'logo-with-text.svg');
const logoWithTextPngPath = path.join(publicDir, 'logo-with-text.png');

// Converte logo-light.svg in logo-light.png
if (fs.existsSync(logoSvgPath)) {
  console.log('Conversione di logo-light.svg in logo-light.png...');
  sharp(logoSvgPath)
    .resize(256, 256) // Risoluzione del logo
    .png()
    .toFile(logoPngPath)
    .then(() => console.log('Conversione completata: logo-light.png'))
    .catch(err => console.error('Errore durante la conversione:', err));
} else {
  console.error('File logo-light.svg non trovato.');
}

// Converte logo-with-text.svg in logo-with-text.png
if (fs.existsSync(logoWithTextSvgPath)) {
  console.log('Conversione di logo-with-text.svg in logo-with-text.png...');
  sharp(logoWithTextSvgPath)
    .resize(512, 512) // Risoluzione del logo con testo
    .png()
    .toFile(logoWithTextPngPath)
    .then(() => console.log('Conversione completata: logo-with-text.png'))
    .catch(err => console.error('Errore durante la conversione:', err));
} else {
  console.error('File logo-with-text.svg non trovato.');
}

console.log('Script di conversione completato.'); 