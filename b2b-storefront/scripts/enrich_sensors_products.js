const fs = require('fs');
const pathModule = require('path');

const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
let products = require(jsonPath);

let count = 0;

products.forEach(p => {
  const isSensor = p.categoryPath?.[0] === 'sensores-transmisores' || p.categorySlug === 'temperatura-termopar-rtd' || p.categorySlug === 'transmisores-temperatura' || p.categorySlug === 'humedad-temperatura' || p.categorySlug === 'presion-proceso' || p.categorySlug === 'nivel' || p.categorySlug === 'gases-co2' || p.categorySlug === 'accesorios-sensores';
  if (!isSensor) return;

  const slug = p.categorySlug;
  const specs = p.specs || {};
  const title = p.title || '';

  if (slug === 'temperatura-termopar-rtd') {
    const elem = title.includes('Pt100') ? 'RTD Pt100 3 Hilos (Clase A ISO)' :
                 title.includes('K') ? 'Termopar Tipo K (Chromel-Alumel)' :
                 title.includes('J') ? 'Termopar Tipo J (Hierro-Constantán)' :
                 title.includes('T') ? 'Termopar Tipo T (Cobre-Constantán)' : 'RTD Pt100 / Termopar Ind';

    p.specs = {
      ...specs,
      'Tipo de Elemento': elem,
      'Rango de Temperatura': specs['Rango de Temperatura'] || specs['Rango'] || '-50°C a +400°C (-58°F a +752°F)',
      'Vaina / Material': specs['Vaina / Material'] || specs['Material de Vaina'] || 'Acero Inoxidable SS316 (Diámetro 6mm)',
      'Conexión a Proceso': specs['Conexión a Proceso'] || specs['Conexión'] || 'Rosca 1/2 pulg NPT Macho / Sonda Lisa',
      'Salida / Cabeza': specs['Salida / Cabeza'] || specs['Terminación'] || 'Cabeza KNS de Cobre Libre de Aluminio IP65 / Cable 2m Teflon'
    };
    count++;
  } else if (slug === 'transmisores-temperatura') {
    const mount = title.includes('DIN') || title.includes('TxRail') ? 'Montaje Riel DIN 35mm (TxRail / PTT04R)' : 'Montaje en Cabezal de Sensor B-Head (TxBlock / TxMini)';

    p.specs = {
      ...specs,
      'Tipo de Montaje': mount,
      'Entrada de Sensor': specs['Entrada de Sensor'] || specs['Entrada Analógica'] || 'Universal Configurable (TC J,K,T,N,R,S,B + RTD Pt100/Pt1000 + mV)',
      'Salida / Protocolo': title.includes('HART') ? '4-20 mA Loop-Powered con Protocolo HART v7' : title.includes('RS485') ? 'RS-485 Modbus RTU / Salida 4-20 mA' : '4-20 mA Linealizado Loop-Powered (2 Hilos)',
      Alimentación: '12 a 35 VCC (Loop-Powered)',
      'Aislamiento / Precisión': 'Aislamiento Galvánico 1.5 kV / Precisión 0.1% F.S.'
    };
    count++;
  } else if (slug === 'humedad-temperatura') {
    const mountH = title.includes('WM') || title.includes('Pared') ? 'Montaje en Pared Exterior (WM IP65)' :
                   title.includes('DM') || title.includes('Ducto') ? 'Montaje en Ducto HVAC (DM con Sonda S.S.)' : 'Montaje en Pared / Ducto HVAC';

    p.specs = {
      ...specs,
      'Tipo de Montaje': mountH,
      'Rango de Medición': '0 a 100% RH / -40°C a +100°C',
      'Salida / Protocolo': title.includes('Modbus') ? '2x 4-20mA / 0-10V + RS485 Modbus RTU' : '2x 4-20 mA (Temperatura + Humedad Relativa)',
      Precisión: '±1.8% RH / ±0.2°C (Calibración Traceable NIST)',
      Alimentación: '12 a 30 VCC (24 VDC Nominal)'
    };
    count++;
  } else if (slug === 'presion-proceso') {
    p.specs = {
      ...specs,
      'Rango de Presión': specs['Rango de Presión'] || specs['Rango'] || '0 a 350 bar (0 a 5000 psi) / 0 a 10 bar',
      'Tipo de Presión': 'Presión Relativa Manométrica (Gauge / Melt Pressure)',
      'Salida / Protocolo': '4-20 mA (2 hilos) / 3.33 mV/V Célula Strain Gauge',
      'Conexión a Proceso': 'Rosca 1/2-20 UNF Macho Flex / 1/4 pulg NPT',
      'T° Máx. Maza': '400°C (752°F) en Punta de Membrana Rígida/Flexible'
    };
    count++;
  } else if (slug === 'nivel') {
    const tech = title.includes('WL') || title.includes('sumergible') ? 'Sonda Hidrostática Piezoresistiva Sumergible' : 'Ultrasonido Continuo sin Contacto';

    p.specs = {
      ...specs,
      'Tecnología de Medición': tech,
      'Rango de Medición': specs['Rango de Medición'] || specs['Rango'] || '0 a 10 metros de columna de agua (0-10m H₂O)',
      'Salida / Protocolo': '4-20 mA Loop-Powered (2 hilos) / Modbus RTU',
      'Material Sumergible / Carcasa': 'Cuerpo Acero Inoxidable SS316L / Cable PUR / Carcasa IP68',
      Alimentación: '12 a 30 VCC'
    };
    count++;
  } else if (slug === 'gases-co2') {
    p.specs = {
      ...specs,
      'Gas Detectado': 'Dióxido de Carbono (CO₂) y Calidad de Aire',
      'Rango de Medición': '0 a 2000 ppm / 0 a 5000 ppm CO₂',
      'Sensor / Tecnología': 'Sensor Infrarrojo No Dispersivo NDIR Autocalibrable',
      'Salida / Protocolo': 'Salida Analógica 4-20mA / 0-10V + Modbus RTU',
      Alimentación: '24 VCC / VCA'
    };
    count++;
  } else if (slug === 'accesorios-sensores') {
    const accType = title.includes('Termopozo') || title.includes('Thermowell') ? 'Termopozo Mecanizado de Barra (Bar-Stock Thermowell)' :
                    title.includes('Bridas') || title.includes('Flange') ? 'Brida Inoxidable de Montaje Sanitario / Industrial' :
                    title.includes('TxIsoLoop') ? 'Aislador de Lazo de Corriente 4-20 mA Galvánico' : 'Cable de Extensión Armado para Sensores';

    p.specs = {
      ...specs,
      'Tipo de Accesorio': accType,
      'Material / Construcción': 'Acero Inoxidable AISI 316L (SS316L)',
      'Conexión a Proceso / Entrada': 'Rosca 1/2 pulg NPT Hembra x 3/4 pulg NPT Macho / Borne DIN',
      Compatibilidad: 'Sensores de Temperatura RTD Pt100 / Termopares J,K / Lazos 4-20mA',
      'Rango / Grado': 'Presión Máxima 250 bar (3600 psi) / Aislamiento 1.5 kV RMS'
    };
    count++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Enriched and normalized', count, 'products in Sensores y Transmisores');
