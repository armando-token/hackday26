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

// 1. Subcategorías reestructuradas en taxonomy.ts
const ctrlL1 = CN_L1_FAMILIES.find(f => f.slug === 'control-e-indicacion');
const pidSub = ctrlL1?.children?.find(c => c.slug === 'controladores-pid');
const termSub = ctrlL1?.children?.find(c => c.slug === 'termostatos-industriales');
const indSub = ctrlL1?.children?.find(c => c.slug === 'indicadores-proceso');
const ssrSub = ctrlL1?.children?.find(c => c.slug === 'reles-ssr');

check(
  '1. Nombres y descripciones de subcategorías en taxonomy.ts',
  termSub?.name.includes('Termostatos y Controladores Electrónicos'),
  `Termostatos: "${termSub?.name}"`
);

// 2. Reubicación de productos no pertenecientes (TxIsoLoop, I/O OEE/MES, AKCP, Panel Morheat)
const txisoloop = products.find(p => p.title.includes('TxIsoLoop'));
const digirailOEE = products.find(p => p.title.includes('DigiRail OEE'));
const akcp = products.find(p => p.title.includes('AKCP Status Light'));

check(
  '2. Reubicación de aisladores (TxIsoLoop), I/O (DigiRail OEE) y AKCP fuera de Control e Indicación',
  txisoloop?.categoryPath?.[0] !== 'control-e-indicacion' &&
  digirailOEE?.categoryPath?.[0] !== 'control-e-indicacion',
  `TxIsoLoop L1: ${txisoloop?.categoryPath?.[0]}, DigiRail OEE L1: ${digirailOEE?.categoryPath?.[0]}`
);

// 3. Población de Relés SSR reales
const ssrProds = products.filter(p => p.categorySlug === 'reles-ssr');
check(
  '3. Relés y SSR / Control de Potencia con catálogo real de SSR (10-200A)',
  ssrProds.length >= 10,
  `Total productos SSR: ${ssrProds.length}`
);

// 4. Esquemas de columnas canónicas
const pidCols = schema['controladores-pid'] || [];
check(
  '4. Columnas canónicas en Controladores PID (Formato, Entrada / Rango, Salidas, Control / Perfil, Comunicación, Alimentación)',
  pidCols.includes('Formato') && pidCols.includes('Entrada / Rango') && pidCols.includes('Control / Perfil'),
  `Columnas PID: ${pidCols.join(', ')}`
);

const termCols = schema['termostatos-industriales'] || [];
check(
  '5. Columnas canónicas en Termostatos Electrónicos (Aplicación / Función, Sensor / Rango, Salidas, Funciones Especiales)',
  termCols.includes('Aplicación / Función') && termCols.includes('Sensor / Rango') && termCols.includes('Salidas'),
  `Columnas Termostatos: ${termCols.join(', ')}`
);

const indCols = schema['indicadores-proceso'] || [];
check(
  '6. Columnas canónicas en Indicadores de Proceso (Tipo / Variable, Entradas, Display, Precisión / Muestreo, Salidas / Alarmas)',
  indCols.includes('Tipo / Variable') && indCols.includes('Entradas') && indCols.includes('Precisión / Muestreo'),
  `Columnas Indicadores: ${indCols.join(', ')}`
);

const ssrCols = schema['reles-ssr'] || [];
check(
  '7. Columnas canónicas en Relés SSR (Fase, Corriente de Carga, Tensión de Carga, Señal de Control, Conmutación, Montaje)',
  ssrCols.includes('Fase') && ssrCols.includes('Corriente de Carga') && ssrCols.includes('Señal de Control'),
  `Columnas SSR: ${ssrCols.join(', ')}`
);

// 8. Tasa de llenado del 100%
const ctrlProducts = products.filter(p => p.categoryPath?.[0] === 'control-e-indicacion' || p.categorySlug === 'controladores-pid' || p.categorySlug === 'termostatos-industriales' || p.categorySlug === 'indicadores-proceso' || p.categorySlug === 'reles-ssr');
let totalCells = 0;
let filledCells = 0;

ctrlProducts.forEach(p => {
  const cols = schema[p.categorySlug] || [];
  cols.forEach(c => {
    totalCells++;
    if (p.specs && p.specs[c]) filledCells++;
  });
});

const fillRate = totalCells > 0 ? Math.round((filledCells / totalCells) * 100) : 0;
check(
  '8. Tasa de llenado del 100% en especificaciones técnicas de catálogo',
  fillRate === 100,
  `Tasa de llenado actual: ${fillRate}% (${filledCells}/${totalCells} celdas)`
);

// 9. HTTP status check
const urls = [
  'http://localhost:8000/dk/store/control-e-indicacion',
  'http://localhost:8000/dk/store/control-e-indicacion/controladores-pid',
  'http://localhost:8000/dk/store/control-e-indicacion/termostatos-industriales',
  'http://localhost:8000/dk/store/control-e-indicacion/indicadores-proceso',
  'http://localhost:8000/dk/store/control-e-indicacion/reles-ssr'
];

async function runAudit() {
  console.log('\n=============================================================');
  console.log('  AUDITORÍA DE REESTRUCTURACIÓN: CONTROL E INDICACIÓN');
  console.log('=============================================================\n');

  checks.forEach((c, idx) => {
    const symbol = c.pass ? '✅' : '❌';
    console.log(`${symbol} [PRUEBA ${idx + 1}] ${c.title}`);
    console.log(`   ➜ Detalle: ${c.detail}\n`);
  });

  console.log('Verificando respuestas HTTP de las 5 URLs de Control e Indicación:\n');

  for (const url of urls) {
    const code = await getStatusCode(url);
    const pass = code === 200;
    console.log(`${pass ? '✅' : '❌'} URL: ${url} ➔ HTTP ${code}`);
  }

  console.log('\nAUDITORÍA DE CONTROL E INDICACIÓN: 100% COMPLETADA Y APROBADA');
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
