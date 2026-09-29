const fs = require('fs');
const pathModule = require('path');

const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
let products = require(jsonPath);

let count = 0;

products.forEach(p => {
  const isDC = p.categoryPath?.[0] === 'monitoreo-data-center' || p.categorySlug === 'sensores-ambientales' || p.categorySlug === 'unidades-monitoreo' || p.categorySlug === 'deteccion-fugas' || p.categorySlug === 'monitoreo-energia' || p.categorySlug === 'monitoreo-condicion-telik' || p.categorySlug === 'monitoreo-inalambrico-climate';
  if (!isDC) return;

  const title = p.title || '';
  const specs = p.specs || {};

  // 1. Categorización Canónica
  if (title.includes('Telik Geter')) {
    p.categorySlug = 'monitoreo-condicion-telik';
    p.categoryPath = ['monitoreo-data-center', 'monitoreo-condicion-telik'];
  } else if (title.includes('Climate Air') || title.includes('Climate-Air')) {
    p.categorySlug = 'monitoreo-inalambrico-climate';
    p.categoryPath = ['monitoreo-data-center', 'monitoreo-inalambrico-climate'];
  } else if (title.includes('sensorProbe') || title.includes('securityProbe') || title.includes('Wireless Tunnel Server') || title.includes('E-Sensor8') || title.includes('E-Opto16')) {
    p.categorySlug = 'unidades-monitoreo';
    p.categoryPath = ['monitoreo-data-center', 'unidades-monitoreo'];
  } else if (title.includes('Water') || title.includes('Fuel') || title.includes('Tank Depth') || title.includes('Fugas')) {
    p.categorySlug = 'deteccion-fugas';
    p.categoryPath = ['monitoreo-data-center', 'deteccion-fugas'];
  } else if (title.includes('Power') || title.includes('In-Line Power') || title.includes('Battery Terminal') || title.includes('AC Sensor Controlled Relay')) {
    p.categorySlug = 'monitoreo-energia';
    p.categoryPath = ['monitoreo-data-center', 'monitoreo-energia'];
  } else {
    p.categorySlug = 'sensores-ambientales';
    p.categoryPath = ['monitoreo-data-center', 'sensores-ambientales'];
  }

  const slug = p.categorySlug;

  // 2. Normalización de Especificaciones
  if (slug === 'unidades-monitoreo') {
    p.specs = {
      ...specs,
      'Puertos de Sensores / E/S': specs['Modelos y Capacidad'] || specs['Canales'] || '4 a 16 Puertos de Sensores RJ-45 + E/S Contacto Seco',
      'Capacidad / Expansión': title.includes('5ESV') ? 'Hasta 500 Sensores mediante Módulos de Expansión' : 'Hasta 60 Sensores Inteligentes / Nodos Inalámbricos',
      'Red y Protocolos': 'Ethernet 10/100, SNMP v1/v2c/v3, Modbus RTU/TCP, HTTPS, MQTT',
      'Alarmas / Notificaciones': 'Email, Trampas SNMP, Alertas Audiovisuales, SMS vía Módem',
      Montaje: title.includes('1U') || title.includes('Rack') ? 'Montaje en Rack 1U 19 pulg' : 'Montaje en Rack 0U / Riel DIN / Pared'
    };
    count++;
  } else if (slug === 'sensores-ambientales') {
    const varFunc = title.includes('Thermal Map') ? 'Mapa Térmico de Rack (3 Puntos T/HR)' :
                    title.includes('Cabinet Analysis') ? 'Análisis de Gabinete (Temp + HR + Presión Diferencial)' :
                    title.includes('Airflow') ? 'Detección de Flujo de Aire (ON/OFF Presencia)' :
                    title.includes('Air Velocity') ? 'Medición de Velocidad de Aire' :
                    title.includes('Calidad del Aire') ? 'Calidad de Aire (PM2.5, PM10, VOC, NOx, CO2)' :
                    title.includes('Ultra Cold') ? 'Temperatura Ultra Fría Criogénica PT100' : 'Temperatura y Humedad Ambiental';

    p.specs = {
      ...specs,
      'Variable / Función': varFunc,
      Rango: title.includes('Ultra Cold') ? '-200°C a +150°C' : title.includes('Thermocouple') ? '-200°C a +900°C' : '-40°C a +75°C / 0-100% RH',
      'Precisión / Resolución': '±0.3°C / ±2% RH (Calibración NIST Traceable)',
      'Tipo de Medición': title.includes('Airflow') ? 'Detección Digital ON/OFF' : 'Medición Continua Cuantitativa',
      Compatibilidad: 'Unidades AKCP sensorProbe+ y securityProbe (Conector RJ-45)',
      Montaje: title.includes('Rack') || title.includes('Cabinet') ? 'Montaje en Gabinete TI / Rack 19 pulg' : 'Montaje en Pared / Superficie'
    };
    count++;
  } else if (slug === 'deteccion-fugas') {
    const typeFuga = title.includes('Locate') ? 'Cable Sensor de Fuga con Localización de Distancia' :
                     title.includes('Fuel') || title.includes('Combustible') ? 'Cable Sensor de Fuga de Combustible e Hidrocarburos' :
                     title.includes('Spot') ? 'Detector Puntual de Agua Destilada / Condensado' : 'Cable Sensor de Fuga de Agua Continuo';

    p.specs = {
      ...specs,
      Tipo: typeFuga,
      'Cobertura / Longitud': title.includes('Spot') ? 'Puntual (Cabezal Encapsulado Epoxi)' : 'Cable Sensor de 3m a 30m (Extensible)',
      Localización: title.includes('Locate') ? 'Precisión de Localización en Metros sobre la Cuerda' : 'Detección Zona Wet/Dry',
      Compatibilidad: 'Unidades AKCP sensorProbe+ / securityProbe via RJ-45',
      Entorno: 'Resistente a Corrosión / Grado Sumergible IP68'
    };
    count++;
  } else if (slug === 'monitoreo-energia') {
    const powerAlcance = title.includes('ILPM') ? 'Medidor de Energía en Línea para PDU de Rack' :
                         title.includes('powerProbeX') ? 'Monitoreo de Paneles y Tableros Eléctricos Multi-Circuito' : 'Sensor de Monitoreo Eléctrico y Salud de Batería';

    p.specs = {
      ...specs,
      'Tipo / Alcance': powerAlcance,
      Fase: title.includes('Trifásico') || title.includes('32A') ? 'Monofásico / Trifásico (1Φ / 3Φ)' : 'Monofásico (1Φ)',
      'Tensión / Corriente': title.includes('32A') ? '100 - 250 VCA / 32 Amperios' : '100 - 250 VCA / 16 Amperios',
      'Variables Medidas': 'Voltaje, Corriente RMS, Potencia Activa (kW), Energía (kWh), Factor de Potencia (PF)',
      'Circuitos / Capacidad': title.includes('powerProbeX') ? 'Hasta 48 Circuitos Monofásicos / 16 Trifásicos' : '1 Circuito de Carga de Rack',
      Comunicación: 'Integración SNMP a sensorProbe+ / Modbus RS485 para Cálculos PUE'
    };
    count++;
  } else if (slug === 'monitoreo-condicion-telik') {
    p.specs = {
      ...specs,
      Sistema: 'Solución Novus Telik Geter de Mantenimiento Predictivo',
      Variables: 'Vibración Triaxial (Aceleración cruda/RMS, Velocidad VRMS) y Temperatura de Contacto',
      'Sensor ↔ Gateway': 'Enlace Inalámbrico Bluetooth Low Energy (BLE 5.0)',
      'Uplink / Protocolos': 'Ethernet 10/100 + Wi-Fi 2.4 GHz (Opción 4G vía módem USB externo) · MQTT / REST / Modbus',
      Capacidad: 'Hasta 250 Sensores Inalámbricos Telik BLE por Gateway AirGate Geter',
      'Analítica / Muestreo': 'Análisis Espectral FFT Integrado en Plataforma Cloud / Local',
      'Autonomía / Montaje': 'Batería de Larga Duración en Sensor / Montaje Magnético Industrial en Motor'
    };
    count++;
  } else if (slug === 'monitoreo-inalambrico-climate') {
    p.specs = {
      ...specs,
      Sistema: 'Sistema Novus Climate Air+ (Sensor RHT Air+ + Gateway AirGate Air+)',
      'Variable / Precisión': 'Temperatura y Humedad Relativa (Precisión ±0.2 °C / ±1.9 %RH)',
      Alcance: 'Hasta 3000 metros (3 km) en Línea de Vista en Campo Abierto (Tecnología LoRa 868/915 MHz)',
      Capacidad: 'Hasta 32 Sensores RHT Air+ Inalámbricos por Gateway AirGate Air+',
      'Conectividad / Protocolos': 'LoRa ➔ Ethernet / Wi-Fi · MQTT, Modbus-TCP, NTP',
      'Memoria / Autonomía': 'Memoria Interna Local en Sensor · Autonomía de Batería hasta 2 Años',
      Cumplimiento: 'Diseñado para Cumplimiento Auditado FDA 21 CFR Part 11 y Buenas Prácticas de Almacenamiento GxP'
    };
    count++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Enriched and normalized', count, 'products in Monitoreo Data Center');
