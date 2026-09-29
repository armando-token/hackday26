const fs = require('fs');
const pathModule = require('path');

const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
const products = require(jsonPath);

let count = 0;

products.forEach(p => {
  const isElecHeat = p.categoryPath?.[0] === 'calefaccion-electrica' || p.categorySlug?.includes('unit-heaters') || p.categorySlug === 'cartuchos' || p.categorySlug === 'bandas' || p.categorySlug === 'strips';
  if (!isElecHeat) return;

  // 1. Merge Unit Heaters
  if (p.categorySlug === 'unit-heaters-compactos' || p.categorySlug === 'unit-heaters-industriales') {
    p.categorySlug = 'unit-heaters';
    p.categoryPath = ['calefaccion-electrica', 'unit-heaters'];
  }

  const slug = p.categorySlug;
  const specs = p.specs || {};

  if (slug === 'pared-conveccion') {
    p.specs = {
      ...specs,
      'Tipo / Montaje': specs['Montaje'] || specs['Tipo de Dispositivo'] || 'Empotrado en Pared / Superficie',
      Potencia: specs['Potencia'] || '250 W – 2250 W (Pic-A-Watt)',
      Tensión: specs['Voltaje'] || specs['Tensión'] || '120 / 208 / 240 / 277 V',
      'Caudal de Aire': specs['Flujo de Aire'] || specs['Caudal'] || '75 CFM – 85 CFM',
      'Termostato / Control': specs['Termostato'] || specs['Control'] || 'Termostato Integrado / Opcional'
    };
    count++;
  } else if (slug === 'portatiles') {
    p.specs = {
      ...specs,
      Potencia: specs['Potencia'] || '5 kW – 25 kW Nominal',
      'Tensión / Fase': specs['Voltaje'] || specs['Tensión'] || '208 / 240 / 480 V (1Φ / 3Φ)',
      Caudal: specs['Flujo de Aire'] || specs['Caudal'] || '385 CFM – 1100 CFM',
      Conexión: specs['Conexión'] || 'Enchufe Industrial / Hardwire',
      'Termostato / Control': specs['Termostato'] || 'Termostato Integrado Ajustable',
      Ductable: specs['Ductable'] || 'Sí (Adaptador de Ducto Flexible)'
    };
    count++;
  } else if (slug === 'unit-heaters') {
    p.specs = {
      ...specs,
      Potencia: specs['Potencia'] || '3.3 kW – 20 kW Heavy-Duty',
      'Tensión / Fase': specs['Voltaje'] || specs['Tensión'] || '208 / 240 / 480 V (Monofásico / Trifásico)',
      'Caudal de Aire': specs['Flujo de Aire'] || specs['Caudal'] || '385 CFM – 1200 CFM',
      Montaje: specs['Montaje'] || 'Soporte Universal Pared / Techo',
      'Control / Termostato': specs['Termostato'] || specs['Control'] || 'Termostato Incorporado / Modbus BMS',
      'Construcción / Entorno': specs['Construcción'] || 'Gabinete de Acero Calibre 20 / IP55'
    };
    count++;
  } else if (slug === 'zocalo') {
    p.specs = {
      ...specs,
      Potencia: specs['Potencia'] || '500 W – 2500 W',
      Tensión: specs['Voltaje'] || specs['Tensión'] || '120 / 208 / 240 / 277 V',
      Longitud: specs['Longitud'] || '28 pulg – 100 pulg (710 mm – 2540 mm)',
      Termostato: specs['Termostato'] || 'Termostato de Polo Simple / Doble Incorporado',
      Tipo: specs['Tipo de Dispositivo'] || 'Perimetral de Zócalo / Convección Natural',
      Acabado: specs['Acabados Disponibles'] || 'Esmalte Horneado Blanco / Marfil'
    };
    count++;
  } else if (slug === 'radiante-infrarrojo') {
    p.specs = {
      ...specs,
      Potencia: specs['Potencia Total'] || specs['Potencia'] || '1500 W – 4500 W',
      Tensión: specs['Tensión'] || specs['Voltaje'] || '120 / 208 / 240 VCA',
      Instalación: specs['Instalación'] || 'Hardwired / Enchufe de Pared o Techo',
      'Tipo de Infrarrojo': specs['Lámparas'] || 'Fibra de Carbono (Onda Media Infrarroja)',
      Protección: specs['Protección'] || 'IP55 Resistente al Agua y Polvo',
      Control: specs['Control'] || 'Control Remoto RF de 3 Niveles de Potencia'
    };
    count++;
  } else if (slug === 'ducto-mau-plenum') {
    p.specs = {
      ...specs,
      Tipo: specs['Aplicación'] || 'Duct Heater / MAU / Plenum',
      Potencia: specs['Potencia'] || '3.8 kW – 240 kW',
      'Tensión / Fase': specs['Voltaje'] || specs['Tensión'] || '208 / 240 / 480 V (1Φ / 3Φ)',
      Caudal: specs['Flujo de Aire'] || specs['Caudal'] || '700 CFM – 1770 CFM (Presión Estática Alta)',
      'Control / Modulación': specs['Control'] || 'Modulación Proporcional SCR (0-10V / 4-20mA)',
      Instalación: specs['Instalación'] || 'Brida en Ducto / Plenum Rated'
    };
    count++;
  } else if (slug === 'antiexplosion') {
    p.specs = {
      ...specs,
      Potencia: specs['Potencia'] || '3 kW – 35 kW Heavy-Duty',
      'Tensión / Fase': specs['Voltaje'] || specs['Tensión'] || '208 / 240 / 480 V (3Φ)',
      'Clasificación de Área': specs['Certificaciones'] || 'Clase I Div 1&2 Gr. C,D / Clase II Div 1&2 Gr. E,F,G',
      'T-Code': specs['T-Code'] || 'T3B (200 °C Máx. Superficie)',
      Caudal: specs['Caudal'] || '500 CFM – 1500 CFM Explosión Proof Motor',
      'Construcción / Protección': specs['Gabinete'] || 'NEMA 7/9 Cobre Libres de Aluminio / IP66'
    };
    count++;
  } else if (slug === 'cartuchos') {
    p.specs = {
      ...specs,
      'Tipo / Serie': specs['Tipo de Dispositivo'] || 'Cartucho de Alta Densidad (Swaged)',
      Diámetro: specs['Diámetro'] || '1/4 pulg – 1 pulg (6.35 mm – 25.4 mm)',
      Longitud: specs['Longitud'] || '1.5 pulg – 36 pulg (38 mm – 914 mm)',
      Potencia: specs['Potencia'] || '100 W – 3000 W',
      Tensión: specs['Voltaje'] || specs['Tensión'] || '120 V / 240 V / 480 V',
      'Densidad de Potencia': specs['Densidad de Potencia'] || 'Hasta 50 W/cm² (320 W/in²)',
      'T° Máx.': specs['T° Máx.'] || '760 °C (1400 °F) en Funda SS304/Incoloy'
    };
    count++;
  } else if (slug === 'bandas') {
    p.specs = {
      ...specs,
      Tipo: specs['Tipo'] || 'Banda de Cerámica / Mica de Alta T°',
      'Diámetro Interior': specs['Diámetro Interior'] || '1 pulg – 24 pulg (25 mm – 610 mm)',
      Ancho: specs['Ancho'] || '1 pulg – 12 pulg (25 mm – 305 mm)',
      Potencia: specs['Potencia'] || '250 W – 5000 W',
      Tensión: specs['Tensión'] || specs['Voltaje'] || '120 V / 240 V / 480 V',
      'Densidad de Potencia': specs['Densidad de Potencia'] || 'Hasta 8 W/cm² (50 W/in²)',
      'T° Máx.': specs['T° Máx.'] || '760 °C (1400 °F) Cerámica / 480 °C Mica'
    };
    count++;
  } else if (slug === 'strips') {
    p.specs = {
      ...specs,
      Tipo: specs['Tipo'] || 'Tira Aleteada de Acero Inoxidable (Finned Strip)',
      Dimensiones: specs['Dimensiones'] || 'Ancho 38 mm x Largo 260 mm – 1075 mm',
      Potencia: specs['Potencia'] || '250 W – 4000 W',
      Tensión: specs['Voltaje'] || specs['Tensión'] || '120 V / 240 V / 480 V',
      'Densidad de Potencia': specs['Densidad de Potencia'] || '5 W/cm² (32 W/in²)',
      'T° Máx.': specs['T° Máx.'] || '650 °C (1200 °F) Funda Inox',
      'Montaje / Terminación': specs['Montaje'] || 'Ranuras de Montaje + Terminales de Tornillo'
    };
    count++;
  } else if (slug === 'calentadores-tambor') {
    p.specs = {
      ...specs,
      'Capacidad de Tambor': specs['Capacidad de Tambor'] || 'Tambor Estándar de 55 Galones (208 Litros)',
      Dimensiones: specs['Dimensiones'] || 'Ancho 125 mm x Largo 1740 mm',
      Potencia: specs['Potencia'] || '1200 W – 1500 W',
      Tensión: specs['Voltaje'] || specs['Tensión'] || '120 V / 240 V',
      'Rango de Temperatura': specs['Rango de Temperatura'] || '10 °C a 150 °C (50 °F a 300 °F)',
      'Control / Termostato': specs['Control / Termostato'] || 'Termostato de Dial Integrado Ajustable'
    };
    count++;
  } else if (slug === 'inmersion') {
    p.specs = {
      ...specs,
      Tipo: specs['Tipo'] || 'Calentador de Inmersión Screw-Plug / Brida',
      Potencia: specs['Potencia'] || '3 kW – 90 kW',
      'Tensión / Fase': specs['Voltaje'] || specs['Tensión'] || '240 V / 480 V (3Φ)',
      Conexión: specs['Conexión'] || 'Rosca 2 pulg NPT / Brida 3 pulg 150#',
      'Fluido / Aplicación': specs['Fluido / Aplicación'] || 'Agua Limpia, Aceite Térmico, Soluciones Químicas',
      'Densidad de Potencia': specs['Densidad de Potencia'] || '8 W/cm² (Agua) / 3 W/cm² (Aceite Pesado)',
      'Material de Vaina': specs['Material de Vaina'] || 'Cobre / Acero Inoxidable SS316 / Incoloy 800',
      'Longitud Inmersión': specs['Longitud Inmersión'] || '300 mm – 1800 mm (12 pulg – 71 pulg)'
    };
    count++;
  } else if (slug === 'sistemas-llave-en-mano') {
    p.specs = {
      ...specs,
      Sistema: specs['Sistema'] || 'Skid de Calentamiento de Proceso de Circulación',
      Potencia: specs['Potencia'] || '30 kW – 240 kW Integral',
      'Tensión / Fase': specs['Voltaje'] || specs['Tensión'] || '480 V (3-Fases, 60 Hz)',
      'Medio / Proceso': specs['Medio / Proceso'] || 'Aceite Térmico de Transferencia / Gases Industriales',
      Temperatura: specs['Temperatura'] || 'Hasta 350 °C (662 °F)',
      'Caudal / Capacidad': specs['Caudal / Capacidad'] || '50 L/min – 300 L/min Bomba de Circulación',
      Control: specs['Control'] || 'Panel de Control PID + Tiristor SCR Proporcional',
      Gabinete: specs['Gabinete'] || 'NEMA 4X Inoxidable con Enclavamiento de Seguridad'
    };
    count++;
  } else if (slug === 'termostatos-linea') {
    p.specs = {
      ...specs,
      Tipo: specs['Tipo'] || 'Termostato Programable Wi-Fi HOOT / Line Voltage',
      Tensión: specs['Voltaje'] || specs['Tensión'] || '120 / 208 / 240 VCA',
      'Capacidad de Carga': specs['Capacidad de Carga'] || '16 Amperios Resistivos (3800 W @ 240V)',
      'Rango de Temperatura': specs['Rango de Temperatura'] || '5 °C a 35 °C (41 °F a 95 °F)',
      'Programación / Conectividad': specs['Programación'] || 'Conectividad Wi-Fi / App Móvil 7 Días',
      Sensor: specs['Sensor'] || 'Sensor NTC de Ambiente Incorporado'
    };
    count++;
  } else if (slug === 'controles-anticongelamiento') {
    p.specs = {
      ...specs,
      'Tipo de Sensor': specs['Tipo de Sensor'] || 'Bulbo Remoto de Acero Inoxidable (Capilar 3m)',
      'Rango de Temperatura': specs['Rango de Temperatura'] || '-17 °C a 48 °C (0 °F a 120 °F)',
      Tensión: specs['Voltaje'] || specs['Tensión'] || '24 – 277 VCA Dual',
      Capacidad: specs['Capacidad'] || '25 Amperios a 120/240 VCA',
      'Salida / Contacto': specs['Salida / Contacto'] || 'Contacto Conmutado SPDT (Single Pole Double Throw)',
      Protección: specs['Protección'] || 'NEMA 4X Impermeable para Intemperie'
    };
    count++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Enriched and normalized', count, 'products in Calefacción Eléctrica');
