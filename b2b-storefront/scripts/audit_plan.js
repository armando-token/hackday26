const fs = require('fs');
const pathModule = require('path');

const products = require('../src/lib/cn-catalog/data/products.json');
const { CN_L1_FAMILIES } = require('../src/lib/cn-catalog/taxonomy.ts');

const checks = [];

function check(title, condition, detail) {
  checks.push({ title, pass: Boolean(condition), detail });
}

// 1. Cubos Hidropónicos
const cubos = products.find(p => p.title.includes('Hidropónicos'));
check('1. Cubos Hidropónicos fuera de Aislamiento Térmico', cubos && cubos.categorySlug === 'cultivo-hidroponico', `Slug actual: ${cubos?.categorySlug}`);

// 2. Paneles Sinopan en Paneles Sándwich
const sinopan = products.filter(p => p.title.toLowerCase().includes('sinopan') || p.brand === 'Sinopan');
const allSandwich = sinopan.every(p => p.categorySlug === 'paneles-sandwich');
check('2. Paneles Sinopan reunidos en Paneles Sándwich Aislantes', allSandwich, `${sinopan.length} paneles Sinopan asignados a paneles-sandwich`);

// 3. Gateways en Comunicación Industrial e IoT
const gatewaysL1 = CN_L1_FAMILIES.find(f => f.slug === 'comunicacion-industrial');
check('3. Nueva categoría L1 Comunicación Industrial e IoT creada', Boolean(gatewaysL1), `Categoría L1: ${gatewaysL1?.name}`);

const usb485 = products.find(p => p.title.includes('USB-i485'));
check('3b. Gateways como USB-i485 fuera de Registro de Datos', usb485 && usb485.categoryPath[0] === 'comunicacion-industrial', `L1 path: ${usb485?.categoryPath[0]}`);

// 4. Eliminación de "Transmisores Industriales (4-20mA, RS485)" como L2 genérico
const sensoresL1 = CN_L1_FAMILIES.find(f => f.slug === 'sensores-transmisores');
const hasGenericTransmisores = sensoresL1?.children?.some(c => c.slug === 'transmisores');
check('4. Eliminación de Transmisores Industriales como L2 genérico', !hasGenericTransmisores, `Subcategorías L2 en Sensores: ${sensoresL1?.children?.map(c => c.slug).join(', ')}`);

// 5. Reubicación PTT04R, WL420, Thermal Map, Climate-Air
const ptt = products.find(p => p.title.includes('PTT04R'));
check('5a. PTT04R en Transmisores de Temperatura', ptt && ptt.categorySlug === 'transmisores-temperatura', `Slug: ${ptt?.categorySlug}`);

const wl420 = products.find(p => p.title.includes('WL420'));
check('5b. WL420 en Sensores de Nivel', wl420 && wl420.categorySlug === 'nivel', `Slug: ${wl420?.categorySlug}`);

const thermalMap = products.find(p => p.title.includes('Thermal Map'));
check('5c. AKCP Thermal Map en Monitoreo Ambiental / Data Center', thermalMap && thermalMap.categoryPath[0] === 'monitoreo-data-center', `L1 Path: ${thermalMap?.categoryPath[0]}`);

const climateAir = products.find(p => p.title.includes('Climate-Air Plus'));
check('5d. Climate-Air Plus en Monitoreo Inalámbrico', climateAir && climateAir.categorySlug === 'monitoreo-inalambrico', `Slug: ${climateAir?.categorySlug}`);

// 6. Termostatos N321, N322, N323 en Termostatos Electrónicos
const n323 = products.find(p => p.title.includes('N323'));
check('6. N323 en Termostatos Electrónicos y Refrigeración', n323 && n323.categorySlug === 'termostatos-industriales', `Slug: ${n323?.categorySlug}`);

// 7. PYROBOX y PYROCON en Heat Tracing
const pyrobox = products.find(p => p.title.includes('PYROBOX'));
check('7. PYROBOX en Controles y Sensores de Heat Tracing', pyrobox && pyrobox.categoryPath[0] === 'trazado-termico', `L1 Path: ${pyrobox?.categoryPath[0]}`);

// 8. Calentador de Tambor en Calentadores de Tambor y Flexibles
const tambor = products.find(p => p.title.includes('Tambor de Goma de Silicona'));
check('8. Calentador de Tambor separado de Tiras', tambor && tambor.categorySlug === 'calentadores-tambor', `Slug: ${tambor?.categorySlug}`);

// 9. L1 Plataformas e I/O Remoto eliminado
const hasPlataformasL1 = CN_L1_FAMILIES.some(f => f.slug === 'plataformas-io');
check('9. Eliminación de L1 Plataformas e I/O Remoto', !hasPlataformasL1, 'Categoría L1 eliminada del menú principal');

// 10. Telik Geter en Monitoreo de Condición
const telik = products.find(p => p.title.includes('Telik Geter'));
check('10. Telik Geter en Monitoreo de Condición', telik && telik.categorySlug === 'monitoreo-condicion', `Slug: ${telik?.categorySlug}`);

console.log('\n=============================================');
console.log('       INFORME DE AUDITORÍA DEL PLAN        ');
console.log('=============================================\n');

let passedCount = 0;
checks.forEach((c, idx) => {
  const symbol = c.pass ? '✅' : '❌';
  if (c.pass) passedCount++;
  console.log(`${symbol} [PRUEBA ${idx + 1}] ${c.title}`);
  console.log(`   ➜ Detalle: ${c.detail}\n`);
});

console.log(`PUNTUACIÓN AUDITORÍA: ${passedCount} / ${checks.length} (${Math.round(passedCount / checks.length * 100)}% Cumplimiento)`);
