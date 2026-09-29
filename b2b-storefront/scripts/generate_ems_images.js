const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/products.json');
const EMS_MEDIA_DIR = path.join(__dirname, '../public/cn-media/products/ems');

if (!fs.existsSync(EMS_MEDIA_DIR)) {
  fs.mkdirSync(EMS_MEDIA_DIR, { recursive: true });
}

// Clean up all existing files in EMS_MEDIA_DIR first
fs.readdirSync(EMS_MEDIA_DIR).forEach(f => {
  fs.unlinkSync(path.join(EMS_MEDIA_DIR, f));
});

let products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

// Helper to generate customized SVGs based on product model and category
function generateProductSvg(product) {
  const model = product.mfrModel || 'EMS';
  const categorySlug = product.categorySlug;

  let themeColor = '#1e3a8a'; // Deep Navy blue default
  let accentColor = '#e11d48'; // Red accent
  let categoryLabel = 'EMS KONTROL';
  let specBadge1 = 'Modbus RTU';
  let specBadge2 = '24V AC/DC';

  if (categorySlug.includes('gases-co2')) {
    themeColor = '#0d9488'; // Teal
    accentColor = '#f59e0b'; // Amber
    categoryLabel = 'SENSOR DE GAS / CO₂';
    if (model.includes('KT')) specBadge1 = 'NDIR CO₂';
    else if (model.includes('AT')) specBadge1 = 'Amoniaco (NH₃)';
    else if (model.includes('ET')) specBadge1 = 'Etileno (C₂H₄)';
    else if (model.includes('CT')) specBadge1 = 'Monóxido (CO)';
    else if (model.includes('OT')) specBadge1 = 'Oxígeno (O₂)';
    else if (model.includes('UT')) specBadge1 = 'Dióxido Azufre (SO₂)';
    else specBadge1 = 'Sensor Electroquímico';
    
    if (model.includes('KS') || model.includes('AS') || model.includes('ES') || model.includes('CS') || model.includes('OS') || model.includes('SS') || model.includes('BS')) {
      specBadge2 = 'Portátil / Mano';
    } else if (model.includes('391') || model.includes('390')) {
      specBadge2 = '433 MHz RF';
    } else {
      specBadge2 = '4-20mA / 0-10V';
    }
  } else if (categorySlug.includes('presion-proceso')) {
    themeColor = '#2563eb'; // Royal Blue
    accentColor = '#0284c7'; // Light Blue
    categoryLabel = 'PRESIÓN DIFERENCIAL';
    specBadge1 = 'Piezoeléctrico';
    if (model.includes('BD')) specBadge1 = 'Switch ΔP HVAC';
    specBadge2 = 'Tomas Ø 6mm';
  } else if (categorySlug.includes('nivel')) {
    themeColor = '#7c3aed'; // Purple
    accentColor = '#db2777'; // Pink
    categoryLabel = 'SENSOR CAPACITIVO';
    specBadge1 = model.includes('111') ? 'Rosca M18' : 'Rosca M30';
    specBadge2 = '90-250 VAC (2 Hilos)';
  } else if (categorySlug.includes('termostatos-industriales') || categorySlug.includes('control-e-indicacion')) {
    themeColor = '#b91c1c'; // Industrial Crimson Red
    accentColor = '#1e293b'; // Slate Dark
    categoryLabel = model.includes('711') || model.includes('713') || model.includes('715') || model.includes('719') || model.includes('751') ? 'CONTROLADOR DE PANEL 48x48' : 'CONTROLADOR DE PARED';
    specBadge1 = 'Salida Relé 5A/10A';
    specBadge2 = 'Display LCD/LED';
  } else if (categorySlug.includes('comunicacion-inalambrica') || categorySlug.includes('unidades-monitoreo') || categorySlug.includes('sensores-ambientales')) {
    themeColor = '#0f766e'; // Dark Cyan
    accentColor = '#ea580c'; // Bright Orange
    categoryLabel = 'SISTEMA OR-TAK / WIRELESS';
    specBadge1 = model.includes('WM') ? 'Wi-Fi 802.11' : (model.includes('MM') ? 'Gateway GSM/4G' : '433 MHz RF');
    specBadge2 = 'Plataforma Cloud';
  } else if (categorySlug.includes('accesorios')) {
    themeColor = '#475569'; // Slate Metal
    accentColor = '#0284c7';
    categoryLabel = 'ACCESORIO DE MONTAJE';
    specBadge1 = model.includes('321') || model.includes('322') || model.includes('323') || model.includes('311') ? 'Acero Inox AISI 316' : 'ABS / Policarbonato';
    specBadge2 = 'Grado Industrial IP67';
  } else {
    themeColor = '#1e40af';
    accentColor = '#059669';
    categoryLabel = 'SENSOR DE TEMPERATURA';
    specBadge1 = 'Pt100 / NTC10K';
    specBadge2 = 'IP65 / IP67';
  }

  let deviceGraphic = '';
  if (model.includes('711') || model.includes('713') || model.includes('715') || model.includes('719') || model.includes('751')) {
    deviceGraphic = `
      <rect x="190" y="160" width="220" height="220" rx="12" fill="#1e293b" stroke="#475569" stroke-width="6"/>
      <rect x="210" y="180" width="180" height="180" rx="6" fill="#0f172a"/>
      <rect x="225" y="195" width="150" height="65" rx="4" fill="#022c22" stroke="#059669" stroke-width="2"/>
      <text x="300" y="242" font-family="'Courier New', monospace" font-size="38" font-weight="bold" fill="#22c55e" text-anchor="middle">24.5°C</text>
      <rect x="225" y="270" width="150" height="40" rx="4" fill="#1e1b4b"/>
      <text x="300" y="297" font-family="'Courier New', monospace" font-size="24" font-weight="bold" fill="#818cf8" text-anchor="middle">SP: 25.0</text>
      <circle cx="245" cy="335" r="10" fill="#ef4444"/>
      <circle cx="280" cy="335" r="10" fill="#f59e0b"/>
      <circle cx="315" cy="335" r="10" fill="#3b82f6"/>
      <circle cx="355" cy="335" r="10" fill="#10b981"/>
    `;
  } else if (model.includes('KS') || model.includes('AS') || model.includes('ES') || model.includes('CS') || model.includes('OS') || model.includes('SS') || model.includes('BS')) {
    deviceGraphic = `
      <rect x="220" y="140" width="160" height="260" rx="24" fill="#334155" stroke="#1e293b" stroke-width="6"/>
      <rect x="240" y="170" width="120" height="90" rx="8" fill="#0f172a" stroke="#475569" stroke-width="2"/>
      <text x="300" y="210" font-family="'Courier New', monospace" font-size="28" font-weight="bold" fill="#38bdf8" text-anchor="middle">450</text>
      <text x="300" y="240" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">PPM CO₂</text>
      <circle cx="300" cy="290" r="16" fill="#e11d48"/>
      <circle cx="260" cy="330" r="12" fill="#475569"/>
      <circle cx="340" cy="330" r="12" fill="#475569"/>
      <rect x="285" y="100" width="30" height="40" rx="4" fill="#64748b"/>
      <line x1="280" y1="120" x2="320" y2="120" stroke="#94a3b8" stroke-width="3"/>
    `;
  } else if (model.includes('YS-111') || model.includes('YS-112')) {
    deviceGraphic = `
      <rect x="130" y="230" width="340" height="60" rx="6" fill="#94a3b8" stroke="#475569" stroke-width="4"/>
      <line x1="180" y1="230" x2="180" y2="290" stroke="#475569" stroke-width="3"/>
      <line x1="220" y1="230" x2="220" y2="290" stroke="#475569" stroke-width="3"/>
      <line x1="260" y1="230" x2="260" y2="290" stroke="#475569" stroke-width="3"/>
      <line x1="300" y1="230" x2="300" y2="290" stroke="#475569" stroke-width="3"/>
      <line x1="340" y1="230" x2="340" y2="290" stroke="#475569" stroke-width="3"/>
      <path d="M 130 230 A 30 30 0 0 0 130 290 Z" fill="#f59e0b"/>
      <rect x="470" y="250" width="80" height="20" rx="6" fill="#1e293b"/>
      <circle cx="440" cy="260" r="8" fill="#ef4444"/>
    `;
  } else {
    deviceGraphic = `
      <rect x="200" y="150" width="200" height="230" rx="16" fill="#ffffff" stroke="${themeColor}" stroke-width="6"/>
      <rect x="220" y="175" width="160" height="80" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
      <rect x="235" y="190" width="130" height="50" rx="4" fill="#0f172a"/>
      <text x="300" y="222" font-family="'Courier New', monospace" font-size="22" font-weight="bold" fill="#38bdf8" text-anchor="middle">${model}</text>
      <rect x="250" y="280" width="100" height="30" rx="4" fill="${themeColor}"/>
      <text x="300" y="300" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">EMS</text>
      <rect x="280" y="380" width="40" height="30" fill="#64748b"/>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${themeColor}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.12"/>
    </filter>
  </defs>

  <rect width="600" height="600" fill="url(#bgGrad)"/>
  <path d="M 0 100 H 600 M 0 200 H 600 M 0 300 H 600 M 0 400 H 600 M 0 500 H 600" stroke="#e2e8f0" stroke-width="1"/>
  <path d="M 100 0 V 600 M 200 0 V 600 M 300 0 V 600 M 400 0 V 600 M 500 0 V 600" stroke="#e2e8f0" stroke-width="1"/>

  <rect x="30" y="30" width="540" height="60" rx="8" fill="url(#headerGrad)"/>
  <text x="50" y="68" font-family="'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="900" fill="#ffffff" letter-spacing="1">EMS KONTROL</text>
  <rect x="230" y="48" width="8" height="24" fill="${accentColor}"/>
  <text x="250" y="65" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#cbd5e1">${categoryLabel}</text>
  
  <rect x="430" y="44" width="125" height="32" rx="16" fill="${accentColor}"/>
  <text x="492" y="65" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">${model}</text>

  <g filter="url(#shadow)">
    ${deviceGraphic}
  </g>

  <rect x="30" y="480" width="540" height="90" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <text x="50" y="512" font-family="'Segoe UI', Roboto, sans-serif" font-size="17" font-weight="bold" fill="#1e293b">${product.title.substring(0, 52)}...</text>

  <rect x="50" y="528" width="150" height="26" rx="13" fill="#e2e8f0"/>
  <text x="125" y="545" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">⚡ ${specBadge1}</text>

  <rect x="210" y="528" width="150" height="26" rx="13" fill="#e2e8f0"/>
  <text x="285" y="545" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#334155" text-anchor="middle">🛡️ ${specBadge2}</text>

  <rect x="370" y="528" width="180" height="26" rx="13" fill="#dcfce7"/>
  <text x="460" y="545" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#15803d" text-anchor="middle">✓ Distribuidor Autorizado</text>
</svg>`;
}

let updatedCount = 0;

products.forEach(product => {
  if (product.handle.startsWith('ems-')) {
    // Determine target SVG path from product.images[0]
    let origImg = product.images?.[0] || `/cn-media/products/ems/${product.handle}.jpg`;
    // Change extension to .svg
    let svgImg = origImg.replace(/\.(jpg|jpeg|png)$/i, '.svg');

    const fileName = path.basename(svgImg);
    const svgFullPath = path.join(EMS_MEDIA_DIR, fileName);

    // Generate SVG content
    const svgContent = generateProductSvg(product);
    fs.writeFileSync(svgFullPath, svgContent, 'utf8');

    // Update product image in products.json
    product.images = [svgImg];
    product.image = svgImg;
    updatedCount++;
  }
});

fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf8');
console.log(`Updated ${updatedCount} EMS products with exact SVG image paths!`);
