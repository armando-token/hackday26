const fs = require('fs');
const path = require('path');

const NOVUS_MEDIA_DIR = path.join(__dirname, '../public/cn-media/products/novus');

if (!fs.existsSync(NOVUS_MEDIA_DIR)) {
  fs.mkdirSync(NOVUS_MEDIA_DIR, { recursive: true });
}

function generateNovusSvg(item) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${item.bodyColor1}" />
      <stop offset="100%" stop-color="${item.bodyColor2}" />
    </linearGradient>
    <linearGradient id="heatSinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8" />
      <stop offset="50%" stop-color="#64748b" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0f172a" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="600" height="600" fill="url(#bgGrad)" rx="16" />
  
  <!-- Subtle Technical Grid -->
  <g opacity="0.15" stroke="#94a3b8" stroke-width="1">
    <line x1="60" y1="0" x2="60" y2="600" />
    <line x1="180" y1="0" x2="180" y2="600" />
    <line x1="300" y1="0" x2="300" y2="600" />
    <line x1="420" y1="0" x2="420" y2="600" />
    <line x1="540" y1="0" x2="540" y2="600" />
    <line x1="0" y1="60" x2="600" y2="60" />
    <line x1="0" y1="180" x2="600" y2="180" />
    <line x1="0" y1="300" x2="600" y2="300" />
    <line x1="0" y1="420" x2="600" y2="420" />
    <line x1="0" y1="540" x2="600" y2="540" />
  </g>

  <!-- Manufacturer Top Badge -->
  <rect x="50" y="45" width="130" height="32" rx="6" fill="#0284c7" />
  <text x="115" y="66" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="800" text-anchor="middle" letter-spacing="1">NOVUS</text>
  
  <rect x="190" y="45" width="160" height="32" rx="6" fill="#0f172a" />
  <text x="270" y="66" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="0.5">${item.categoryBadge}</text>

  <!-- Main Industrial Chassis -->
  <g filter="url(#shadow)">
    <!-- Heat sink fins behind if applicable -->
    ${item.hasHeatSink ? `
    <rect x="150" y="115" width="300" height="360" rx="8" fill="url(#heatSinkGrad)" />
    <line x1="165" y1="115" x2="165" y2="475" stroke="#334155" stroke-width="4" />
    <line x1="195" y1="115" x2="195" y2="475" stroke="#334155" stroke-width="4" />
    <line x1="225" y1="115" x2="225" y2="475" stroke="#334155" stroke-width="4" />
    <line x1="375" y1="115" x2="375" y2="475" stroke="#334155" stroke-width="4" />
    <line x1="405" y1="115" x2="405" y2="475" stroke="#334155" stroke-width="4" />
    <line x1="435" y1="115" x2="435" y2="475" stroke="#334155" stroke-width="4" />
    ` : ''}

    <!-- Main Enclosure Body -->
    <rect x="${item.bodyX}" y="${item.bodyY}" width="${item.bodyW}" height="${item.bodyH}" rx="12" fill="url(#bodyGrad)" stroke="#334155" stroke-width="2" />

    <!-- Terminal Screws Top (Load) -->
    <circle cx="${item.bodyX + 40}" cy="${item.bodyY + 35}" r="14" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
    <line x1="${item.bodyX + 32}" y1="${item.bodyY + 35}" x2="${item.bodyX + 48}" y2="${item.bodyY + 35}" stroke="#334155" stroke-width="3" />
    <text x="${item.bodyX + 40}" y="${item.bodyY + 62}" fill="#94a3b8" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">1 / L1</text>

    <circle cx="${item.bodyX + item.bodyW - 40}" cy="${item.bodyY + 35}" r="14" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
    <line x1="${item.bodyX + item.bodyW - 48}" y1="${item.bodyY + 35}" x2="${item.bodyX + item.bodyW - 32}" y2="${item.bodyY + 35}" stroke="#334155" stroke-width="3" />
    <text x="${item.bodyX + item.bodyW - 40}" y="${item.bodyY + 62}" fill="#94a3b8" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">2 / T1</text>

    <!-- Center Label Area -->
    <rect x="${item.bodyX + 30}" y="${item.bodyY + 80}" width="${item.bodyW - 60}" height="${item.bodyH - 160}" rx="6" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
    
    <text x="300" y="${item.bodyY + 120}" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" text-anchor="middle">${item.model}</text>
    <text x="300" y="${item.bodyY + 145}" fill="#38bdf8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle" letter-spacing="1">${item.spec1}</text>
    <text x="300" y="${item.bodyY + 168}" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" text-anchor="middle">${item.spec2}</text>
    
    <!-- LED Status Indicator -->
    <circle cx="300" cy="${item.bodyY + 195}" r="6" fill="#22c55e" />
    <circle cx="300" cy="${item.bodyY + 195}" r="10" fill="#22c55e" opacity="0.3" />
    <text x="300" y="${item.bodyY + 218}" fill="#22c55e" font-family="monospace" font-size="9" font-weight="700" text-anchor="middle">INPUT ACTIVE</text>

    <!-- Terminal Screws Bottom (Control) -->
    <circle cx="${item.bodyX + 40}" cy="${item.bodyY + item.bodyH - 35}" r="12" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
    <line x1="${item.bodyX + 33}" y1="${item.bodyY + item.bodyH - 35}" x2="${item.bodyX + 47}" y2="${item.bodyY + item.bodyH - 35}" stroke="#334155" stroke-width="2" />
    <text x="${item.bodyX + 40}" y="${item.bodyY + item.bodyH - 52}" fill="#94a3b8" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">3 / +</text>

    <circle cx="${item.bodyX + item.bodyW - 40}" cy="${item.bodyY + item.bodyH - 35}" r="12" fill="#cbd5e1" stroke="#475569" stroke-width="2" />
    <line x1="${item.bodyX + item.bodyW - 47}" y1="${item.bodyY + item.bodyH - 35}" x2="${item.bodyX + item.bodyW - 33}" y2="${item.bodyY + item.bodyH - 35}" stroke="#334155" stroke-width="2" />
    <text x="${item.bodyX + item.bodyW - 40}" y="${item.bodyY + item.bodyH - 52}" fill="#94a3b8" font-family="monospace" font-size="11" font-weight="700" text-anchor="middle">4 / -</text>
  </g>

  <!-- Bottom Specification Footer Badges -->
  <g transform="translate(50, 520)">
    <rect x="0" y="0" width="240" height="32" rx="6" fill="#1e293b" />
    <text x="120" y="20" fill="#f8fafc" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" text-anchor="middle">${item.footerBadge1}</text>

    <rect x="260" y="0" width="240" height="32" rx="6" fill="#0284c7" />
    <text x="380" y="20" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" text-anchor="middle">${item.footerBadge2}</text>
  </g>
</svg>`;
}

const ITEMS = [
  {
    fileName: 'novus-ssr-4810.svg',
    model: 'SSR-4810',
    categoryBadge: 'RELÉ ESTADO SÓLIDO',
    bodyColor1: '#1e293b',
    bodyColor2: '#0f172a',
    hasHeatSink: true,
    bodyX: 180, bodyY: 135, bodyW: 240, bodyH: 320,
    spec1: '10A RMS · 24-480 VAC',
    spec2: 'Control: 4-32 VDC · Zero Cross',
    footerBadge1: 'Aislamiento Óptico 4kV',
    footerBadge2: 'Conmutación Silenciosa 1Φ'
  },
  {
    fileName: 'novus-ssr-4825.svg',
    model: 'SSR-4825',
    categoryBadge: 'RELÉ ESTADO SÓLIDO',
    bodyColor1: '#1e293b',
    bodyColor2: '#0f172a',
    hasHeatSink: true,
    bodyX: 180, bodyY: 135, bodyW: 240, bodyH: 320,
    spec1: '25A RMS · 24-480 VAC',
    spec2: 'Control: 4-32 VDC · Zero Cross',
    footerBadge1: 'Disipación Térmica Optimizada',
    footerBadge2: 'Conmutación Silenciosa 1Φ'
  },
  {
    fileName: 'novus-ssr-4840.svg',
    model: 'SSR-4840',
    categoryBadge: 'RELÉ ESTADO SÓLIDO',
    bodyColor1: '#1e293b',
    bodyColor2: '#0f172a',
    hasHeatSink: true,
    bodyX: 180, bodyY: 135, bodyW: 240, bodyH: 320,
    spec1: '40A RMS · 24-480 VAC',
    spec2: 'Control: 4-32 VDC · Zero Cross',
    footerBadge1: 'Cargas Resistivas / Hornos',
    footerBadge2: 'Conmutación Silenciosa 1Φ'
  },
  {
    fileName: 'novus-ssr-4880.svg',
    model: 'SSR-4880',
    categoryBadge: 'RELÉ ESTADO SÓLIDO',
    bodyColor1: '#1e293b',
    bodyColor2: '#0f172a',
    hasHeatSink: true,
    bodyX: 180, bodyY: 135, bodyW: 240, bodyH: 320,
    spec1: '80A RMS · 24-480 VAC',
    spec2: 'Control: 4-32 VDC · Heavy Duty',
    footerBadge1: 'Alta Capacidad Industrial',
    footerBadge2: 'Protección RC Snubber'
  },
  {
    fileName: 'novus-ssr-3ph-40a.svg',
    model: 'SSR3-4840',
    categoryBadge: 'SSR TRIFÁSICO',
    bodyColor1: '#1e293b',
    bodyColor2: '#0f172a',
    hasHeatSink: true,
    bodyX: 160, bodyY: 130, bodyW: 280, bodyH: 330,
    spec1: '3 x 40A · 40-530 VAC',
    spec2: 'Control: 4-32 VDC · Trifásico',
    footerBadge1: 'Conmutación Simultánea 3Φ',
    footerBadge2: 'Protección Varistor Integrada'
  },
  {
    fileName: 'novus-power-controller-60a.svg',
    model: 'PCW-60A',
    categoryBadge: 'CONTROLADOR POTENCIA',
    bodyColor1: '#0f172a',
    bodyColor2: '#0284c7',
    hasHeatSink: true,
    bodyX: 160, bodyY: 130, bodyW: 280, bodyH: 330,
    spec1: '60A Tiristor SCR · 180-440 VAC',
    spec2: 'Control Analógico 4-20mA / 0-10V',
    footerBadge1: 'Ángulo de Fase / Tren de Pulso',
    footerBadge2: 'Modulación Proporcional'
  },
  {
    fileName: 'novus-power-controller-100a.svg',
    model: 'PCW-100A',
    categoryBadge: 'CONTROLADOR POTENCIA',
    bodyColor1: '#0f172a',
    bodyColor2: '#0284c7',
    hasHeatSink: true,
    bodyX: 150, bodyY: 125, bodyW: 300, bodyH: 340,
    spec1: '100A Tiristor SCR · 180-440 VAC',
    spec2: 'Control Proporcional 4-20mA / 0-10V',
    footerBadge1: 'Ventilación Forzada / Alarma',
    footerBadge2: 'Control de Hornos y Skids'
  },
  {
    fileName: 'novus-power-controller-200a.svg',
    model: 'PCW-200A',
    categoryBadge: 'CONTROLADOR POTENCIA',
    bodyColor1: '#0f172a',
    bodyColor2: '#0284c7',
    hasHeatSink: true,
    bodyX: 150, bodyY: 125, bodyW: 300, bodyH: 340,
    spec1: '200A Heavy Duty · 180-440 VAC',
    spec2: 'Control Tiristor SCR Industrial',
    footerBadge1: 'Límite de Corriente Peak',
    footerBadge2: 'Protección Térmica Activa'
  },
  {
    fileName: 'novus-interface-relay-nio-24v.svg',
    model: 'NIO 24V',
    categoryBadge: 'RELÉ DE INTERFAZ',
    bodyColor1: '#0284c7',
    bodyColor2: '#0369a1',
    hasHeatSink: false,
    bodyX: 230, bodyY: 125, bodyW: 140, bodyH: 340,
    spec1: '6A SPDT · 250VAC/30VDC',
    spec2: 'Bobina: 24 VDC · Ancho 6.2mm',
    footerBadge1: 'Aislamiento Riel DIN 35mm',
    footerBadge2: 'Desacoplamiento PLC'
  },
  {
    fileName: 'novus-interface-relay-nio-220v.svg',
    model: 'NIO 220V',
    categoryBadge: 'RELÉ DE INTERFAZ',
    bodyColor1: '#0284c7',
    bodyColor2: '#0369a1',
    hasHeatSink: false,
    bodyX: 230, bodyY: 125, bodyW: 140, bodyH: 340,
    spec1: '6A SPDT · 250VAC/30VDC',
    spec2: 'Bobina: 220 VAC · Ancho 6.2mm',
    footerBadge1: 'Aislamiento Riel DIN 35mm',
    footerBadge2: 'Desacoplamiento PLC'
  }
];

ITEMS.forEach(item => {
  const filePath = path.join(NOVUS_MEDIA_DIR, item.fileName);
  fs.writeFileSync(filePath, generateNovusSvg(item), 'utf8');
  console.log(`Generated ${item.fileName}`);
});
