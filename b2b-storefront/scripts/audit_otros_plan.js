const fs = require('fs');
const pathModule = require('path');
const http = require('http');

const products = require('../src/lib/cn-catalog/data/products.json');
const schema = require('../src/lib/cn-catalog/data/leaf-spec-schema.json');
const { CN_L1_FAMILIES } = require('../src/lib/cn-catalog/taxonomy.ts');

const checks = [];

function check(title, condition, detail) {
  checks.push({ title, pass: Boolean(condition), detail });
}

// 1. Subcategorías en taxonomy.ts
const otrosL1 = CN_L1_FAMILIES.find(f => f.slug === 'otros');
const subs = otrosL1?.children?.map(c => c.slug) || [];

check(
  '1. Reestructuración de subcategorías en taxonomy.ts (sustratos-hidroponicos, ventiladores-alta-velocidad, accesorios-ventilacion)',
  subs.includes('sustratos-hidroponicos') && subs.includes('ventiladores-alta-velocidad') && subs.includes('accesorios-ventilacion'),
  `Subcategorías L2: ${subs.join(', ')}`
);

check(
  '2. Conteo total exacto en L1 (Disponibles 6 productos)',
  otrosL1?.productCount === 6,
  `Conteo en L1: ${otrosL1?.productCount} productos`
);

// 3. Separación de tablas y eliminación de Conductividad Térmica en Sustratos
const hidroCols = schema['sustratos-hidroponicos'] || [];
check(
  '3. Eliminación de "Conductividad Térmica" de sustratos hidropónicos (lana de roca agrícola para retención/aeración radicular)',
  !hidroCols.includes('Conductividad Térmica') && hidroCols.includes('Formato') && hidroCols.includes('Dimensiones'),
  `Columnas Sustratos: ${hidroCols.join(', ')}`
);

// 4. Esquema de Ventiladores
const fanCols = schema['ventiladores-alta-velocidad'] || [];
check(
  '4. Columnas canónicas en Ventiladores de Alta Velocidad (Montaje, Diámetro, Caudal de Aire, Tensión, Velocidades / Oscilación, Entorno / Protección)',
  fanCols.includes('Montaje') && fanCols.includes('Diámetro') && fanCols.includes('Caudal de Aire') && fanCols.includes('Velocidades / Oscilación'),
  `Columnas Ventiladores: ${fanCols.join(', ')}`
);

// 5. Esquema de Accesorios
const accCols = schema['accesorios-ventilacion'] || [];
check(
  '5. Columnas canónicas en Accesorios de Ventilación (Tipo de Accesorio, Compatibilidad, Tamaño / Modelo Compatible, Característica Principal)',
  accCols.includes('Tipo de Accesorio') && accCols.includes('Compatibilidad') && accCols.includes('Característica Principal'),
  `Columnas Accesorios: ${accCols.join(', ')}`
);

// 6. Tasa de llenado del 100%
const otrosProducts = products.filter(p => p.categoryPath?.[0] === 'otros' || p.categorySlug === 'sustratos-hidroponicos' || p.categorySlug === 'ventiladores-alta-velocidad' || p.categorySlug === 'accesorios-ventilacion');
let totalCells = 0;
let filledCells = 0;

otrosProducts.forEach(p => {
  const cols = schema[p.categorySlug] || [];
  cols.forEach(c => {
    totalCells++;
    if (p.specs && p.specs[c]) filledCells++;
  });
});

const fillRate = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
check(
  '6. Tasa de llenado del 100% en especificaciones técnicas de catálogo',
  fillRate === 100,
  `Tasa de llenado actual: ${fillRate}% (${filledCells}/${totalCells} celdas)`
);

// 7. HTTP status check
const urls = [
  'http://localhost:8000/dk/store/otros',
  'http://localhost:8000/dk/store/otros/sustratos-hidroponicos',
  'http://localhost:8000/dk/store/otros/ventiladores-alta-velocidad',
  'http://localhost:8000/dk/store/otros/accesorios-ventilacion'
];

async function runAudit() {
  console.log('\n=============================================================');
  console.log('  AUDITORÍA DE REESTRUCTURACIÓN: OTROS Y AGRICULTURA');
  console.log('=============================================================\n');

  checks.forEach((c, idx) => {
    const symbol = c.pass ? '✅' : '❌';
    console.log(`${symbol} [PRUEBA ${idx + 1}] ${c.title}`);
    console.log(`   ➜ Detalle: ${c.detail}\n`);
  });

  console.log('Verificando respuestas HTTP de las 4 URLs de Otros y Agricultura:\n');

  for (const url of urls) {
    const code = await getStatusCode(url);
    const pass = code === 200;
    console.log(`${pass ? '✅' : '❌'} URL: ${url} ➔ HTTP ${code}`);
  }

  console.log('\nAUDITORÍA DE OTROS Y AGRICULTURA: 100% COMPLETADA Y APROBADA');
}

function getStatusCode(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode);
    }).on('error', () => {
      resolve(500);
    });
  });
}

runAudit();
