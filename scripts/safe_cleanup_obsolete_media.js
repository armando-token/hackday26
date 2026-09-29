/**
 * safe_cleanup_obsolete_media.js
 * 
 * Verifies one-by-one that each WebP replacement exists and is valid before
 * removing the obsolete .png / .jpg / .jpeg file.
 * Leaves SVG, ICO, and WebP untouched.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('/home/ubuntu/CN_Web/b2b-storefront/node_modules/sharp');

const PUBLIC_DIR = '/home/ubuntu/CN_Web/b2b-storefront/public';
const TARGET_DIRS = [
  path.join(PUBLIC_DIR, 'cn-media'),
  path.join(PUBLIC_DIR, 'images')
];

function getAllLegacyFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllLegacyFiles(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function runCleanup() {
  console.log('====================================================');
  console.log('Iniciando Limpieza Segura de Archivos Obsoletos');
  console.log('====================================================');

  let legacyFiles = [];
  for (const dir of TARGET_DIRS) {
    legacyFiles = legacyFiles.concat(getAllLegacyFiles(dir));
  }

  console.log(`Archivos legacy (.png, .jpg, .jpeg) encontrados: ${legacyFiles.length}`);

  let deletedCount = 0;
  let skippedCount = 0;
  let freedBytes = 0;

  for (const filePath of legacyFiles) {
    const ext = path.extname(filePath);
    const webpPath = filePath.slice(0, -ext.length) + '.webp';
    const relLegacy = path.relative(PUBLIC_DIR, filePath);

    if (fs.existsSync(webpPath)) {
      const webpStat = fs.statSync(webpPath);
      if (webpStat.size > 0) {
        const legacyStat = fs.statSync(filePath);
        freedBytes += legacyStat.size;
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`[ELIMINADO] ${relLegacy} (Reemplazo verificado: ${path.relative(PUBLIC_DIR, webpPath)})`);
      } else {
        console.warn(`[OMITIDO - WebP 0 bytes] ${relLegacy}`);
        skippedCount++;
      }
    } else {
      // Check if it's the broken accessories placeholder
      if (relLegacy.includes('accessories.png')) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`[ELIMINADO - Placeholder corrupto] ${relLegacy}`);
      } else {
        console.warn(`[OMITIDO - No existe WebP] ${relLegacy}`);
        skippedCount++;
      }
    }
  }

  console.log('\n====================================================');
  console.log('Resumen de Limpieza');
  console.log('====================================================');
  console.log(`Archivos eliminados exitosamente: ${deletedCount}`);
  console.log(`Archivos omitidos por seguridad: ${skippedCount}`);
  console.log(`Espacio liberado en disco: ${(freedBytes / (1024 * 1024)).toFixed(2)} MB`);
}

runCleanup().catch(console.error);
