const fs = require('fs');
const products = require('../src/lib/cn-catalog/data/products.json');

const DONE_SLUGS = new Set([
  'aislamiento-termico', 'paneles-lana-roca', 'mantas-canuelas', 'pir-poliuretano', 'espuma-elastomerica',
  'automatizacion-plc-hmi', 'plc-hmi', 'controladores-remotos', 'expansion-io',
  'registro-de-datos', 'loggers-cadena-frio', 'loggers-industriales', 'gateways'
]);

const tax = [
  {
    name: 'Aislamiento Térmico',
    slug: 'aislamiento-termico',
    subs: [
      { name: 'Paneles de Lana de Roca', slug: 'paneles-lana-roca' },
      { name: 'Espuma Elastomérica', slug: 'espuma-elastomerica' },
      { name: 'Paneles PIR / Poliuretano', slug: 'pir-poliuretano' },
      { name: 'Mantas y Cañuelas Aislantes', slug: 'mantas-canuelas' }
    ]
  },
  {
    name: 'Automatización PLC y HMI',
    slug: 'automatizacion-plc-hmi',
    subs: [
      { name: 'PLC + HMI Todo en Uno', slug: 'plc-hmi' },
      { name: 'Controladores Remotos / PLC sin Pantalla', slug: 'controladores-remotos' },
      { name: 'Expansión de E/S', slug: 'expansion-io' }
    ]
  },
  {
    name: 'Registro de Datos (Data Loggers)',
    slug: 'registro-de-datos',
    subs: [
      { name: 'Data Loggers Cadena de Frío', slug: 'loggers-cadena-frio' },
      { name: 'Data Loggers Industriales', slug: 'loggers-industriales' },
      { name: 'Gateways y Comunicación', slug: 'gateways' }
    ]
  },
  {
    name: 'Sensores y Transmisores Industriales',
    slug: 'sensores-transmisores',
    subs: [
      { name: 'Temperatura (Termopares, RTD Pt100, NTC)', slug: 'temperatura-termopar-rtd' },
      { name: 'Presión de Proceso / Melt Pressure', slug: 'presion-proceso' },
      { name: 'Transmisores Industriales (4-20mA, RS485)', slug: 'transmisores' },
      { name: 'Sensores de Nivel', slug: 'nivel' },
      { name: 'Humedad y Temperatura IoT', slug: 'humedad-temperatura' }
    ]
  },
  {
    name: 'Calefacción Eléctrica Industrial',
    slug: 'calefaccion-electrica',
    subs: [
      { name: 'Sistemas Llave en Mano', slug: 'sistemas-llave-en-mano' },
      { name: 'Termostatos de Línea / Anticongelantes', slug: 'termostatos-linea' },
      { name: 'Calefactores de Pared y Convección', slug: 'pared-conveccion' },
      { name: 'Calefactores Portátiles e Industriales', slug: 'portatiles' },
      { name: 'Calefactores para Ducto, MAU y Plenum', slug: 'ducto-mau-plenum' },
      { name: 'Calefactores Antiexplosión', slug: 'antiexplosion' },
      { name: 'Calefactores Radiantes e Infrarrojos', slug: 'radiante-infrarrojo' },
      { name: 'Calefactores de Zócalo', slug: 'zocalo' },
      { name: 'Unit Heaters Compactos', slug: 'unit-heaters-compactos' },
      { name: 'Unit Heaters Industriales', slug: 'unit-heaters-industriales' },
      { name: 'Calentadores de Cartucho', slug: 'cartuchos' },
      { name: 'Calentadores de Inmersión', slug: 'inmersion' },
      { name: 'Calentadores de Banda (Mica/Cerámica)', slug: 'bandas' },
      { name: 'Calentadores de Tira (Strips)', slug: 'strips' }
    ]
  },
  {
    name: 'Control e Indicación',
    slug: 'control-e-indicacion',
    subs: [
      { name: 'Controladores PID y Termostatos de Panel', slug: 'controladores-pid' },
      { name: 'Indicadores de Proceso', slug: 'indicadores-proceso' }
    ]
  },
  {
    name: 'Trazado Térmico (Heat Tracing)',
    slug: 'trazado-termico',
    subs: [
      { name: 'Cables Autorregulables', slug: 'cable-autorregulable' },
      { name: 'Sistemas de Deshielo de Nieve', slug: 'deshielo-nieve' },
      { name: 'Suelo Radiante Eléctrico', slug: 'suelo-radiante' },
      { name: 'Controles y Sensores de Deshielo', slug: 'controles-deshielo' }
    ]
  },
  {
    name: 'Monitoreo Ambiental y Data Center',
    slug: 'monitoreo-data-center',
    subs: [
      { name: 'Sensores Ambientales AKCP / Data Center', slug: 'sensores-ambientales' }
    ]
  },
  {
    name: 'Plataformas e I/O Remoto',
    slug: 'plataformas-io',
    subs: [
      { name: 'Plataformas de Monitoreo / Gateways Cloud', slug: 'plataformas' },
      { name: 'Relés de I/O / Módulos DigiRail', slug: 'io-relays' }
    ]
  }
];

let txt = '# 🌳 ÁRBOL DE TAXONOMÍA COMPLETO DE LA WEB\n\n```\n';

tax.forEach((l1, i) => {
  const isL1Done = DONE_SLUGS.has(l1.slug);
  const l1Tag = isL1Done ? '(Realizado)' : '(Sin realizar)';
  const isLastL1 = i === tax.length - 1;
  const l1Prefix = isLastL1 ? '└── ' : '├── ';
  const childIndent = isLastL1 ? '    ' : '│   ';

  txt += `${l1Prefix}📁 [Categoría L1] ${l1.name} (${l1.slug}) ${l1Tag}\n`;

  l1.subs.forEach((sub, j) => {
    const isSubDone = DONE_SLUGS.has(sub.slug) || isL1Done;
    const subTag = isSubDone ? '(Realizado)' : '(Sin realizar)';
    const isLastSub = j === l1.subs.length - 1;
    const subPrefix = childIndent + (isLastSub ? '└── ' : '├── ');
    const prodIndent = childIndent + (isLastSub ? '    ' : '│   ');

    const prods = products.filter(p => p.categorySlug === sub.slug);
    txt += `${subPrefix}📂 [Subcategoría L2] ${sub.name} (${sub.slug}) ${subTag} [${prods.length} productos]\n`;

    prods.forEach((p, k) => {
      const isLastProd = k === prods.length - 1;
      const prodPrefix = prodIndent + (isLastProd ? '└── ' : '├── ');
      const brand = p.brand || 'Control Nautas';
      const model = p.mfrModel || p.itemNumber || '';
      txt += `${prodPrefix}📦 [${brand}] ${p.title} (${model})\n`;
    });
  });
  txt += '│\n';
});

txt += '```\n';

fs.writeFileSync('../tree_full.md', txt);
console.log('Tree written to tree_full.md successfully!');
