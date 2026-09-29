const fs = require('fs');
const pathModule = require('path');

const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
let products = require(jsonPath);

let count = 0;

products.forEach(p => {
  const isOtros = p.categoryPath?.[0] === 'otros' || p.categorySlug === 'cultivo-hidroponico' || p.categorySlug === 'ventilacion' || p.categorySlug === 'sustratos-hidroponicos' || p.categorySlug === 'ventiladores-alta-velocidad' || p.categorySlug === 'accesorios-ventilacion';
  if (!isOtros) return;

  const handle = p.handle || '';

  if (handle === 'cubos-hidroponicos-de-lana-de-roca') {
    p.categorySlug = 'sustratos-hidroponicos';
    p.specs = {
      Formato: 'Cubos de Lana de Roca Hidropónica (Hidrofílica Inerte)',
      'Etapa / Uso': 'Germinación, Enraizamiento y Propagación de Plántulas',
      Dimensiones: '50 x 50 x 50 mm (2 x 2 x 2 pulg) / Bloque 50mm',
      'Orificio / Plug': 'Diámetro 25mm (Compatible con Plugs Estándar)',
      'Cultivos / Sistema': 'Hidroponía (NFT, Ebb & Flow, Goteo) / Tomate, Lechuga, Berries',
      Presentación: 'Caja con 45 Cubos Estériles Libre de Patógenos'
    };
    count++;
  } else if (handle === 'ventilador-king-pfo-24') {
    p.categorySlug = 'ventiladores-alta-velocidad';
    p.specs = {
      Montaje: 'Pedestal Altura Ajustable (145 a 190 cm)',
      Diámetro: '24 pulgadas (60 cm)',
      'Caudal de Aire': '7,500 CFM / 12,740 m³/h (Alta Velocidad)',
      Tensión: '120 VCA / 60 Hz',
      'Velocidades / Oscilación': '3 Velocidades Seleccionables · Oscilación 80°',
      'Entorno / Protección': 'Uso Comercial / Exterior (Motor Enclavado IP54 Wet Location)'
    };
    count++;
  } else if (handle === 'ventilador-king-pfo-30') {
    p.categorySlug = 'ventiladores-alta-velocidad';
    p.specs = {
      Montaje: 'Pedestal Altura Ajustable (145 a 190 cm)',
      Diámetro: '30 pulgadas (75 cm)',
      'Caudal de Aire': '8,200 CFM / 13,930 m³/h (Alta Velocidad)',
      Tensión: '120 VCA / 60 Hz',
      'Velocidades / Oscilación': '3 Velocidades Seleccionables · Oscilación 80°',
      'Entorno / Protección': 'Uso Comercial / Exterior (Motor Enclavado IP54 Wet Location)'
    };
    count++;
  } else if (handle === 'kit-de-nebulizacion-pfo-mistkit') {
    p.categorySlug = 'accesorios-ventilacion';
    p.specs = {
      'Tipo de Accesorio': 'Kit de Nebulización Exterior con Boquillas',
      Compatibilidad: 'Ventiladores King PFO-24, PFO-30, WFO-24, WFO-30',
      'Tamaño / Modelo Compatible': '24 y 30 pulgadas (PFO / WFO Series)',
      'Característica Principal': 'Conexión Rápida a Manguera de Jardín con Válvula de Cierre'
    };
    count++;
  } else if (handle === 'funda-resistente-al-agua-fo-cover-24') {
    p.categorySlug = 'accesorios-ventilacion';
    p.specs = {
      'Tipo de Accesorio': 'Funda Protectora Impermeable con Cremallera',
      Compatibilidad: 'Ventiladores King PFO-24 y WFO-24 (24 pulgadas)',
      'Tamaño / Modelo Compatible': '24 pulgadas (Diámetro de Aspas 60 cm)',
      'Característica Principal': 'Poliuretano Resistente a Agua, Polvo y Rayos UV'
    };
    count++;
  } else if (handle === 'funda-resistente-al-agua-fo-cover-30') {
    p.categorySlug = 'accesorios-ventilacion';
    p.specs = {
      'Tipo de Accesorio': 'Funda Protectora Impermeable con Cremallera',
      Compatibilidad: 'Ventiladores King PFO-30 y WFO-30 (30 pulgadas)',
      'Tamaño / Modelo Compatible': '30 pulgadas (Diámetro de Aspas 75 cm)',
      'Característica Principal': 'Poliuretano Resistente a Agua, Polvo y Rayos UV'
    };
    count++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Enriched and normalized', count, 'products in Otros');
