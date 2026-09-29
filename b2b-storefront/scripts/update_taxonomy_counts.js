const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/products.json');
const COUNTS_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/taxonomy-counts.json');

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));

const l1Counts = {};
const l2Counts = {};

for (const p of products) {
  const l1 = p.categoryPath?.[0];
  const l2 = p.categorySlug;

  if (l1) {
    l1Counts[l1] = (l1Counts[l1] || 0) + 1;
  }
  if (l2) {
    l2Counts[l2] = (l2Counts[l2] || 0) + 1;
  }
}

const counts = {
  root: products.length,
  l1: l1Counts,
  l2: l2Counts
};

fs.writeFileSync(COUNTS_PATH, JSON.stringify(counts, null, 2) + '\n', 'utf8');
console.log('✅ taxonomy-counts.json actualizado con éxito:', counts.root, 'productos');
