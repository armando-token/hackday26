const fs = require('fs');

const products = require('../src/lib/cn-catalog/data/products.json');

const DONE_SLUGS = new Set([
  'aislamiento-termico',
  'paneles-lana-roca',
  'mantas-canuelas',
  'pir-poliuretano',
  'espuma-elastomerica',
  'automatizacion-plc-hmi',
  'plc-hmi',
  'controladores-remotos',
  'expansion-io',
  'registro-de-datos',
  'loggers-cadena-frio',
  'loggers-industriales',
  'gateways'
]);

// Group products by categoryPath
const tree = {};

products.forEach(p => {
  const path = p.categoryPath || ['otros'];
  const l1 = path[0] || 'otros';
  const l2 = p.categorySlug || 'general';

  if (!tree[l1]) tree[l1] = {};
  if (!tree[l1][l2]) tree[l1][l2] = [];
  tree[l1][l2].push(p);
});

let output = '';

for (const [l1, subMap] of Object.entries(tree)) {
  const isL1Done = DONE_SLUGS.has(l1);
  const l1Tag = isL1Done ? '**(Realizado)**' : '**(Sin realizar)**';
  output += `\n### 📁 ${l1} ${l1Tag}\n`;

  for (const [l2, prodList] of Object.entries(subMap)) {
    const isL2Done = DONE_SLUGS.has(l2) || isL1Done;
    const l2Tag = isL2Done ? '**(Realizado)**' : '**(Sin realizar)**';
    output += `\n- 📂 **${l2}** ${l2Tag} *(${prodList.length} productos)*\n`;

    prodList.forEach(p => {
      const brand = p.brand ? `[${p.brand}]` : '[Control Nautas]';
      const model = p.mfrModel || p.itemNumber || '';
      output += `  - 📦 ${brand} **${p.title}** \`${model}\`\n`;
    });
  }
}

fs.writeFileSync('../scratch_tree.md', output);
console.log('Tree written to scratch_tree.md successfully. Total L1 categories:', Object.keys(tree).length);
