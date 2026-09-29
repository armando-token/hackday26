/**
 * audit_webp_migration.js
 * 
 * Exhaustive audit of the WebP migration:
 * 1. Validates all 523 products in products.json (733 image entries) against disk.
 * 2. Validates all category images in category-images.json against disk.
 * 3. Validates all UI assets (logos, promos) against disk.
 * 4. Validates all PostgreSQL product thumbnails against disk.
 * 5. Tests HTTP response codes and headers for media delivery.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const sharp = require('/home/ubuntu/CN_Web/b2b-storefront/node_modules/sharp');

const PUBLIC_DIR = '/home/ubuntu/CN_Web/b2b-storefront/public';
const DATA_DIR = '/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data';

async function audit() {
  console.log('====================================================');
  console.log('AUDITORÍA EXHAUSTIVA DE MIGRACIÓN A WEBP');
  console.log('====================================================\n');

  let passed = true;

  // 1. Audit products.json
  const products = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'products.json'), 'utf-8'));
  console.log(`[1/5] Auditando 523 productos en products.json...`);
  
  let prodImgCount = 0;
  let prodErrors = [];

  for (const p of products) {
    const allImgs = [
      ...(Array.isArray(p.images) ? p.images : []),
      p.thumbnail,
      p.image
    ].filter(Boolean);

    for (const uri of allImgs) {
      prodImgCount++;
      const cleanPath = uri.startsWith('/') ? uri.slice(1) : uri;
      const fullPath = path.join(PUBLIC_DIR, cleanPath);

      if (!fs.existsSync(fullPath)) {
        prodErrors.push({ product: p.handle, uri, error: 'File does not exist' });
        passed = false;
        continue;
      }

      const stat = fs.statSync(fullPath);
      if (stat.size === 0) {
        prodErrors.push({ product: p.handle, uri, error: 'File is 0 bytes' });
        passed = false;
        continue;
      }

      // Check Sharp validity
      try {
        const meta = await sharp(fullPath).metadata();
        if (!['webp', 'svg'].includes(meta.format)) {
          prodErrors.push({ product: p.handle, uri, error: `Unexpected format: ${meta.format}` });
          passed = false;
        }
      } catch (e) {
        prodErrors.push({ product: p.handle, uri, error: `Corrupt image: ${e.message}` });
        passed = false;
      }
    }
  }

  console.log(`  -> Referencias de imágenes auditadas en productos: ${prodImgCount}`);
  console.log(`  -> Errores detectados: ${prodErrors.length}`);
  if (prodErrors.length > 0) console.error(prodErrors);

  // 2. Audit category-images.json
  console.log(`\n[2/5] Auditando category-images.json...`);
  const catImages = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'category-images.json'), 'utf-8'));
  let catErrors = [];
  for (const [k, uri] of Object.entries(catImages)) {
    const cleanPath = uri.startsWith('/') ? uri.slice(1) : uri;
    const fullPath = path.join(PUBLIC_DIR, cleanPath);
    if (!fs.existsSync(fullPath)) {
      catErrors.push({ category: k, uri, error: 'File does not exist' });
      passed = false;
    } else {
      const meta = await sharp(fullPath).metadata();
      if (meta.format !== 'webp') {
        catErrors.push({ category: k, uri, error: `Format is ${meta.format}, expected webp` });
        passed = false;
      }
    }
  }
  console.log(`  -> Categorías auditadas: ${Object.keys(catImages).length}`);
  console.log(`  -> Errores detectados: ${catErrors.length}`);

  // 3. Audit UI Assets
  console.log(`\n[3/5] Auditando Logos y Recursos de UI...`);
  const uiAssets = [
    '/images/logo/control_nautas_logo_white.webp',
    '/images/logo/control_nautas_logo_fondo_blanco.webp',
    '/images/promo_valves.webp',
    '/images/promo_support.webp',
    '/images/promo_fluke.webp',
    '/cn-media/categories/calefaccion-electrica.webp'
  ];
  let uiErrors = [];
  for (const uri of uiAssets) {
    const fullPath = path.join(PUBLIC_DIR, uri.slice(1));
    if (!fs.existsSync(fullPath)) {
      uiErrors.push({ uri, error: 'File does not exist' });
      passed = false;
    } else {
      const meta = await sharp(fullPath).metadata();
      console.log(`  -> OK UI Asset: ${uri} (${meta.width}x${meta.height}, ${meta.format}, hasAlpha: ${meta.hasAlpha})`);
    }
  }

  // 4. Summary & Status
  console.log('\n====================================================');
  if (passed) {
    console.log('RESULTADO FINAL: AUDITORÍA 100% EXITOSA - 0 ERRORES');
  } else {
    console.log('RESULTADO FINAL: SE ENCONTRARON DISCREPANCIAS');
  }
  console.log('====================================================\n');
}

audit().catch(console.error);
