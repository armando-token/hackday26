const fs = require('fs');
const pathModule = require('path');

const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
const products = require(jsonPath);

let enrichedCount = 0;

products.forEach(p => {
  const slug = p.categorySlug || '';
  const specs = p.specs || {};

  if (slug === 'cable-autorregulable') {
    const pRef = specs['Potencia de Salida'] || specs['Potencias Disponibles'] || '10, 16, 26 o 33 W/m @ 10°C (3, 5, 8, 10 W/ft)';
    const volt = specs['Voltajes de Alimentación'] || specs['Voltaje'] || '208 - 277 VCA / 110 - 120 VCA';
    const tMant = specs['Temperatura Máx. de Mantenimiento'] || specs['Temperatura Máxima de Mantenimiento Continuo'] || '65 °C (150 °F)';
    const tExp = specs['Temperatura Máx. de Exposición'] || specs['Temperatura de Exposición Intermitente'] || '85 °C (185 °F)';
    const env = specs['Clasificación de Ubicación'] || specs['Material de la Cubierta Exterior'] || 'Áreas Peligrosas / Cubierta PTFE/TPE';

    p.specs = {
      ...specs,
      'Potencia @ Ref.': pRef,
      'Tensión': volt,
      'T° Máx. Mantenimiento': tMant,
      'T° Máx. Exposición': tExp,
      'Área / Cubierta': env,
      Aplicación: specs['Aplicación'] || 'Protección de Tuberías y Mantenimiento Térmico de Proceso'
    };
    enrichedCount++;
  } else if (slug === 'techos-canalones') {
    const type = specs['Tipo de Producto'] || 'Autorregulable Preensamblado';
    const volt = specs['Voltaje'] || specs['Voltajes de Alimentación'] || '120V / 240V VCA';
    const pLin = specs['Potencia Lineal'] || specs['Potencia de Salida'] || '8 W/ft @ 0°C (26 W/m)';
    const len = specs['Longitud del Cable'] || specs['Longitudes Disponibles'] || '15 m / 30 m / Rollo';
    const conn = specs['Tipo de Conexión'] || 'Enchufe NEMA 3-pin con indicador luminoso';
    const kit = specs['Accesorios Incluidos'] || 'Incluye clips de techo y espaciadores de canalón';

    p.specs = {
      ...specs,
      Tipo: type,
      'Tensión': volt,
      'Potencia Lineal': pLin,
      Longitud: len,
      'Conexión / Enchufe': conn,
      'Kit / Accesorios': kit,
      Aplicación: specs['Aplicación'] || 'Deshielo de Techos, Canaletas y Bajantes'
    };
    enrichedCount++;
  } else if (slug === 'deshielo-nieve') {
    const fmt = specs['Formato del Sistema'] || specs['Formato'] || 'Manta Preensamblada (Corte y Giro)';
    const volt = specs['Voltaje'] || specs['Voltajes de Alimentación'] || '240 VCA / 480 VCA';
    const area = specs['Área Calefaccionada'] || specs['Área Cubierta'] || '2.3 m² (25 ft²) @ 4" espaciado';
    const pSpec = specs['Potencia de Salida Superficial'] || '≈538 W/m² (50 W/ft²)';
    const pTot = specs['Potencia Total'] || specs['Potencia de Salida'] || '1200 W Total';
    const dim = specs['Longitud del Cable'] || 'Manta 0.6m x 3.8m / Cable 30.5m';

    p.specs = {
      ...specs,
      Formato: fmt,
      'Tensión': volt,
      'Área Calefaccionada': area,
      'Potencia Específica': pSpec,
      'Potencia Total': pTot,
      Dimensión: dim,
      Aplicación: specs['Aplicación'] || 'Deshielo de Pavimentos, Rampas, Aceras y Concreto'
    };
    enrichedCount++;
  } else if (slug === 'suelo-radiante') {
    const fmt = specs['Formato del Sistema'] || specs['Formato'] || 'Manta Radiante Autoadhesiva';
    const area = specs['Área Calefaccionada'] || specs['Área Cubierta'] || '9.3 m² (100 ft²)';
    const volt = specs['Voltaje'] || 'Voltaje Dual 120V / 240V';
    const pSpec = specs['Potencia de Salida Superficial'] || '12 W/ft² (129 W/m²)';
    const pTot = specs['Potencia Total'] || '1200 W Total';
    const floor = specs['Piso Compatible'] || 'Cerámica, Piedra, Porcelanato y Madera';

    p.specs = {
      ...specs,
      Formato: fmt,
      'Área Calefaccionada': area,
      'Tensión': volt,
      'Potencia Específica': pSpec,
      'Potencia Total': pTot,
      'Piso Compatible': floor,
      Aplicación: specs['Aplicación'] || 'Calefacción de Piso Radiante para Confort Interior'
    };
    enrichedCount++;
  } else if (slug === 'controles-deshielo') {
    const app = specs['Aplicación'] || specs['Uso Recomendado'] || 'Control de Sistemas de Deshielo de Nieve y Tuberías';
    const pwr = specs['Alimentación'] || specs['Voltaje de Operación'] || '100 - 277 VCA / Monofásico o Trifásico';
    const outCap = specs['Contactores'] || specs['Carga Máxima'] || 'Hasta 4 zonas (30A cada una a 240V CA)';
    const zones = specs['Zonas de Activación'] || specs['Zonas'] || 'Hasta 4 Zonas Secuenciadas';
    const sensors = specs['Capacidad de Sensores'] || specs['Sensor Incluido'] || 'Suelo, Canalón y Aéreo (PYROULS)';

    p.specs = {
      ...specs,
      Aplicación: app,
      Alimentación: pwr,
      'Capacidad de Salida': outCap,
      'Circuitos / Zonas': zones,
      'Sensores Soportados': sensors
    };
    enrichedCount++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Enriched', enrichedCount, 'Heat Tracing products in products.json');
