/**
 * update_catalog_data_webp.js
 * 
 * Updates all catalog data files to reference .webp extensions instead of .png/.jpg/.jpeg.
 * Preserves .svg files intact.
 * Validates that every referenced .webp file actually exists on disk.
 */

const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = '/home/ubuntu/CN_Web/b2b-storefront/public';
const DATA_DIR = '/home/ubuntu/CN_Web/b2b-storefront/src/lib/cn-catalog/data';

function toWebpPath(imgPath) {
  if (!imgPath || typeof imgPath !== 'string') return imgPath;
  // If it is an SVG, keep it as SVG
  if (imgPath.toLowerCase().endsWith('.svg') || imgPath.toLowerCase().endsWith('.ico')) {
    return imgPath;
  }
  return imgPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
}

function verifyDiskFile(relUri) {
  if (!relUri || typeof relUri !== 'string') return false;
  // Remove leading slash if any
  const cleanRel = relUri.startsWith('/') ? relUri.slice(1) : relUri;
  const fullPath = path.join(PUBLIC_DIR, cleanRel);
  return fs.existsSync(fullPath);
}

// 1. Update products.json
const productsJsonPath = path.join(DATA_DIR, 'products.json');
const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf-8'));
let prodUpdated = 0;
let missingFiles = [];

products.forEach(p => {
  if (p.thumbnail) {
    p.thumbnail = toWebpPath(p.thumbnail);
    if (!verifyDiskFile(p.thumbnail)) missingFiles.push({ type: 'product_thumbnail', id: p.id || p.handle, path: p.thumbnail });
  }
  if (p.image) {
    p.image = toWebpPath(p.image);
    if (!verifyDiskFile(p.image)) missingFiles.push({ type: 'product_image', id: p.id || p.handle, path: p.image });
  }
  if (p.images && Array.isArray(p.images)) {
    p.images = p.images.map(img => {
      if (typeof img === 'string') {
        const webp = toWebpPath(img);
        if (!verifyDiskFile(webp)) missingFiles.push({ type: 'product_images_str', id: p.id || p.handle, path: webp });
        return webp;
      } else if (img && img.url) {
        img.url = toWebpPath(img.url);
        if (!verifyDiskFile(img.url)) missingFiles.push({ type: 'product_images_obj', id: p.id || p.handle, path: img.url });
        return img;
      }
      return img;
    });
  }
  prodUpdated++;
});

fs.writeFileSync(productsJsonPath, JSON.stringify(products, null, 2), 'utf-8');
console.log(`products.json actualizado: ${prodUpdated} productos procesados.`);

// 2. Update products-slim.json
const productsSlimPath = path.join(DATA_DIR, 'products-slim.json');
if (fs.existsSync(productsSlimPath)) {
  const productsSlim = JSON.parse(fs.readFileSync(productsSlimPath, 'utf-8'));
  productsSlim.forEach(p => {
    if (p.thumbnail) p.thumbnail = toWebpPath(p.thumbnail);
    if (p.image) p.image = toWebpPath(p.image);
    if (p.images && Array.isArray(p.images)) {
      p.images = p.images.map(img => typeof img === 'string' ? toWebpPath(img) : (img && img.url ? { ...img, url: toWebpPath(img.url) } : img));
    }
  });
  fs.writeFileSync(productsSlimPath, JSON.stringify(productsSlim, null, 2), 'utf-8');
  console.log(`products-slim.json actualizado.`);
}

// 3. Update category-images.json
const categoryImagesPath = path.join(DATA_DIR, 'category-images.json');
if (fs.existsSync(categoryImagesPath)) {
  const catImages = JSON.parse(fs.readFileSync(categoryImagesPath, 'utf-8'));
  for (const k of Object.keys(catImages)) {
    catImages[k] = toWebpPath(catImages[k]);
    if (!verifyDiskFile(catImages[k])) missingFiles.push({ type: 'category_image', key: k, path: catImages[k] });
  }
  fs.writeFileSync(categoryImagesPath, JSON.stringify(catImages, null, 2), 'utf-8');
  console.log(`category-images.json actualizado.`);
}

// 4. Update image-manifest.json
const manifestPath = path.join(DATA_DIR, 'image-manifest.json');
if (fs.existsSync(manifestPath)) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  for (const k of Object.keys(manifest)) {
    if (Array.isArray(manifest[k])) {
      manifest[k] = manifest[k].map(toWebpPath);
    } else if (typeof manifest[k] === 'string') {
      manifest[k] = toWebpPath(manifest[k]);
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`image-manifest.json actualizado.`);
}

// 5. Update product-details.json
const productDetailsPath = path.join(DATA_DIR, 'product-details.json');
if (fs.existsSync(productDetailsPath)) {
  const details = JSON.parse(fs.readFileSync(productDetailsPath, 'utf-8'));
  if (Array.isArray(details)) {
    details.forEach(p => {
      if (p.images) p.images = p.images.map(toWebpPath);
      if (p.thumbnail) p.thumbnail = toWebpPath(p.thumbnail);
    });
  } else if (typeof details === 'object') {
    for (const k of Object.keys(details)) {
      if (details[k].images) details[k].images = details[k].images.map(toWebpPath);
      if (details[k].thumbnail) details[k].thumbnail = toWebpPath(details[k].thumbnail);
    }
  }
  fs.writeFileSync(productDetailsPath, JSON.stringify(details, null, 2), 'utf-8');
  console.log(`product-details.json actualizado.`);
}

console.log(`\nVerificación de archivos en disco: ${missingFiles.length} archivos faltantes.`);
if (missingFiles.length > 0) {
  console.error('Faltantes detectados:', missingFiles);
}
