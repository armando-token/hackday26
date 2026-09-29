const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/products.json');
const TAXONOMY_PATH = path.join(__dirname, '../src/lib/cn-catalog/taxonomy.ts');
const SCHEMA_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const COUNTS_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/taxonomy-counts.json');

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
const leafSchema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));

const emsProducts = products.filter(p => p.handle.startsWith('ems-'));
console.log(`Auditing ${emsProducts.length} EMS products for 100% spec completeness...`);

let totalErrors = 0;

emsProducts.forEach(p => {
  const schema = leafSchema[p.categorySlug];
  if (!schema) {
    console.error(`ERROR: No leaf spec schema found for category slug "${p.categorySlug}" (product: ${p.handle})`);
    totalErrors++;
    return;
  }

  schema.forEach(col => {
    const val = p.specs ? p.specs[col] : undefined;
    if (val === undefined || val === null || val === '') {
      console.error(`ERROR: Product "${p.handle}" in category "${p.categorySlug}" is missing spec column "${col}"`);
      totalErrors++;
    }
  });
});

console.log(`EMS Spec audit completed. Total errors: ${totalErrors}`);

// Update L1 and Root product counts in taxonomy.ts to match sum of L2 children
let taxonomyContent = fs.readFileSync(TAXONOMY_PATH, 'utf8');

const l1Slugs = [
  "aislamiento-termico",
  "automatizacion-plc-hmi",
  "registro-de-datos",
  "comunicacion-industrial",
  "sensores-transmisores",
  "calefaccion-electrica",
  "trazado-termico",
  "control-e-indicacion",
  "monitoreo-data-center",
  "otros"
];

let rootTotal = products.length;
const l1Counts = {};
const l2Counts = {};

products.forEach(p => {
  const l1 = p.categoryPath[0];
  const l2 = p.categorySlug;
  l1Counts[l1] = (l1Counts[l1] || 0) + 1;
  l2Counts[l2] = (l2Counts[l2] || 0) + 1;
});

l1Slugs.forEach(l1Slug => {
  const count = l1Counts[l1Slug] || 0;
  const regex = new RegExp(`(\\{[^\\}]*slug:\\s*"${l1Slug}"[^\\}]*productCount:\\s*)(\\d+)`, 'g');
  taxonomyContent = taxonomyContent.replace(regex, `$1${count}`);
});

taxonomyContent = taxonomyContent.replace(/(export const CN_ROOT: CnCategoryNode = \{[\s\S]*?productCount:\s*)(\d+)/, `$1${rootTotal}`);

fs.writeFileSync(TAXONOMY_PATH, taxonomyContent, 'utf8');

// Write taxonomy-counts.json
const taxonomyCountsData = {
  root: rootTotal,
  l1: l1Counts,
  l2: l2Counts
};
fs.writeFileSync(COUNTS_PATH, JSON.stringify(taxonomyCountsData, null, 2), 'utf8');
console.log(`Updated taxonomy-counts.json with root: ${rootTotal}`);

if (totalErrors === 0) {
  console.log(`SUCCESS! All ${emsProducts.length} EMS products passed 100% spec completeness audit!`);
} else {
  console.error(`Audit Failed with ${totalErrors} errors.`);
  process.exit(1);
}
