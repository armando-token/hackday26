const fs = require('fs');
const pathModule = require('path');

const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
const products = require(jsonPath);

let count = 0;

products.forEach(p => {
  if (p.title.includes('UDG-4999') || p.title.includes('USG-4000')) {
    p.categorySlug = 'controles-deshielo';
    p.categoryPath = ['trazado-termico', 'controles-deshielo'];
    
    p.specs = {
      ...p.specs,
      Aplicación: 'Control de Suelo Radiante y Expansión de Relés Esclavos',
      Alimentación: 'Voltaje Dual (120V / 240V CA)',
      'Capacidad de Salida': '15 Amperios @ 120, 208, 240 Voltios',
      'Circuitos / Zonas': '1 Zona + Expansión Esclava (USG-4000)',
      'Sensores Soportados': 'Sensor de Piso Incluido (GFCI Clase A Integral)'
    };
    count++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Moved', count, 'thermostats from suelo-radiante to controles-deshielo');
