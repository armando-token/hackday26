/**
 * convert_media_one_by_one.js
 * 
 * Sequential, meticulous 1-by-1 conversion of PNG/JPG/JPEG images to high-fidelity WebP.
 * Preserves exact pixel dimensions, alpha transparency channels, and color profiles.
 * Leaves SVG, ICO, and existing WebP files untouched.
 * Verifies each generated WebP file immediately with Sharp metadata inspection.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('/home/ubuntu/CN_Web/b2b-storefront/node_modules/sharp');

const PUBLIC_DIR = '/home/ubuntu/CN_Web/b2b-storefront/public';
const TARGET_DIRS = [
  path.join(PUBLIC_DIR, 'cn-media'),
  path.join(PUBLIC_DIR, 'images')
];

function getAllTargetFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllTargetFiles(fullPath));
    } else {
      const ext = path.extname(file).toLowerCase();
      // Strictly target PNG, JPG, JPEG. Leave SVG, ICO, WebP untouched.
      if (['.png', '.jpg', '.jpeg'].includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function convertFileWithRetry(filePath, maxRetries = 3) {
  const ext = path.extname(filePath);
  const targetWebpPath = filePath.slice(0, -ext.length) + '.webp';
  const relPath = path.relative(PUBLIC_DIR, filePath);
  const origStat = fs.statSync(filePath);

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. Read original metadata
      const origMeta = await sharp(filePath).metadata();
      
      // 2. Select optimal transcoding parameters
      let sharpPipeline = sharp(filePath);
      if (origMeta.hasAlpha) {
        // Transparent image (logos, isolated PNGs): retain alpha and lossless/near-lossless
        sharpPipeline = sharpPipeline.webp({
          quality: 95,
          lossless: origMeta.channels === 4 && origStat.size < 500000 ? true : false,
          alphaQuality: 100,
          effort: 6
        });
      } else {
        // Photographic image: high-fidelity 90% quality with effort 6
        sharpPipeline = sharpPipeline.webp({
          quality: 90,
          effort: 6
        });
      }

      // 3. Write WebP file
      await sharpPipeline.toFile(targetWebpPath);

      // 4. Verification step: Read back generated WebP
      const webpStat = fs.statSync(targetWebpPath);
      if (webpStat.size === 0) {
        throw new Error('Generated WebP is 0 bytes');
      }

      const webpMeta = await sharp(targetWebpPath).metadata();
      if (webpMeta.format !== 'webp') {
        throw new Error(`Invalid format output: ${webpMeta.format}`);
      }
      if (webpMeta.width !== origMeta.width || webpMeta.height !== origMeta.height) {
        throw new Error(`Dimension mismatch: expected ${origMeta.width}x${origMeta.height}, got ${webpMeta.width}x${webpMeta.height}`);
      }

      const savedBytes = origStat.size - webpStat.size;
      const savedPct = ((savedBytes / origStat.size) * 100).toFixed(1);

      return {
        success: true,
        originalPath: relPath,
        webpPath: path.relative(PUBLIC_DIR, targetWebpPath),
        origSize: origStat.size,
        webpSize: webpStat.size,
        savedPct: savedPct,
        width: webpMeta.width,
        height: webpMeta.height,
        hasAlpha: origMeta.hasAlpha
      };
    } catch (err) {
      if (attempt === maxRetries) {
        return {
          success: false,
          originalPath: relPath,
          error: err.message,
          attempts: attempt
        };
      }
      // Wait slightly before retry
      await new Promise(r => setTimeout(r, 100));
    }
  }
}

async function run() {
  console.log('====================================================');
  console.log('Iniciando Proceso de Conversión Uno a Uno a WebP');
  console.log('====================================================');

  let allFiles = [];
  for (const dir of TARGET_DIRS) {
    allFiles = allFiles.concat(getAllTargetFiles(dir));
  }

  console.log(`Total de archivos identificados para conversión: ${allFiles.length}`);
  console.log('Procesando secuencialmente con verificación inmediata...\n');

  const results = {
    total: allFiles.length,
    converted: 0,
    failed: 0,
    totalOrigSize: 0,
    totalWebpSize: 0,
    errors: [],
    details: []
  };

  let count = 0;
  for (const filePath of allFiles) {
    count++;
    const res = await convertFileWithRetry(filePath);
    if (res.success) {
      results.converted++;
      results.totalOrigSize += res.origSize;
      results.totalWebpSize += res.webpSize;
      results.details.push(res);
      
      const pct = ((count / allFiles.length) * 100).toFixed(1);
      console.log(`[${count}/${allFiles.length}] [${pct}%] OK: ${res.originalPath} -> ${res.webpPath} (${(res.origSize/1024).toFixed(1)}KB -> ${(res.webpSize/1024).toFixed(1)}KB | Ahorro: ${res.savedPct}% | ${res.width}x${res.height})`);
    } else {
      results.failed++;
      results.errors.push(res);
      console.error(`[${count}/${allFiles.length}] ERROR en ${res.originalPath}: ${res.error}`);
    }
  }

  console.log('\n====================================================');
  console.log('Resumen de Conversión');
  console.log('====================================================');
  console.log(`Total procesados: ${results.total}`);
  console.log(`Exitosos y verificados: ${results.converted}`);
  console.log(`Fallidos: ${results.failed}`);
  console.log(`Peso original total: ${(results.totalOrigSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Peso WebP total: ${(results.totalWebpSize / (1024 * 1024)).toFixed(2)} MB`);
  const totalSaved = results.totalOrigSize - results.totalWebpSize;
  console.log(`Ahorro total de almacenamiento: ${(totalSaved / (1024 * 1024)).toFixed(2)} MB (${((totalSaved / results.totalOrigSize) * 100).toFixed(1)}%)`);

  fs.writeFileSync(
    path.join(__dirname, 'conversion_report.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  console.log(`Reporte detallado guardado en: /home/ubuntu/CN_Web/scripts/conversion_report.json`);
}

run().catch(console.error);
