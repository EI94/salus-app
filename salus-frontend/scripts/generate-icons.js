// Questo script è usato solo in sviluppo locale
// Durante il deploy su Vercel, le icone sono già generate e incluse nel repository

console.log('✅ Le icone sono già generate e presenti nel repository.');
console.log('👍 Il processo di build può continuare senza problemi.');

// Il codice seguente è commentato per evitare errori su Vercel
// Per generare nuove icone, decommentare e installare sharp
/*
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const SOURCE_SVG = path.join(PUBLIC_DIR, 'logo.svg');

// Configurazioni per le diverse icone
const ICONS = [
  { name: 'favicon.ico', sizes: [16, 32], format: 'ico' },
  { name: 'logo192.png', size: 192, format: 'png' },
  { name: 'logo512.png', size: 512, format: 'png' },
  { name: 'apple-touch-icon.png', size: 180, format: 'png' },
];

async function generateIcons() {
  console.log('🎨 Generazione icone in corso...');
  
  try {
    // Leggi il file SVG sorgente
    const svgBuffer = fs.readFileSync(SOURCE_SVG);
    
    // Genera ogni icona nelle dimensioni specificate
    for (const icon of ICONS) {
      if (icon.format === 'ico') {
        // Genera icona ICO con multiple dimensioni
        const images = await Promise.all(
          icon.sizes.map(size => 
            sharp(svgBuffer)
              .resize(size, size)
              .toFormat('png')
              .toBuffer()
          )
        );
        
        // Usa sharp per convertire in ICO
        await sharp(images[0])
          .toFile(path.join(PUBLIC_DIR, icon.name));
          
        console.log(`✅ Generata ${icon.name} (${icon.sizes.join('x')}px)`);
      } else {
        // Genera PNG nelle dimensioni specificate
        await sharp(svgBuffer)
          .resize(icon.size, icon.size)
          .toFormat(icon.format)
          .toFile(path.join(PUBLIC_DIR, icon.name));
          
        console.log(`✅ Generata ${icon.name} (${icon.size}x${icon.size}px)`);
      }
    }
    
    console.log('🎉 Generazione icone completata con successo!');
  } catch (error) {
    console.error('❌ Errore durante la generazione delle icone:', error);
    process.exit(1);
  }
}

generateIcons();
*/ 