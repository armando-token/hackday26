const fs = require('fs');
const pathModule = require('path');

const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
let products = require(jsonPath);

let count = 0;

products.forEach(p => {
  const isLogger = p.categoryPath?.[0] === 'registro-de-datos' || p.categorySlug === 'loggers-cadena-frio' || p.categorySlug === 'loggers-industriales';
  if (!isLogger) return;

  const slug = p.categorySlug;
  const specs = p.specs || {};
  const title = p.title || '';

  if (slug === 'loggers-cadena-frio') {
    p.specs = {
      ...specs,
      'Variables / Sensor': specs['Variable / Función'] || specs['Variables / Sensor'] || 'Temperatura · Sensor Interno NTC',
      Rango: specs['Rango'] || '-30°C a +70°C',
      Exactitud: specs['Localización'] || specs['Exactitud'] || '±0.5°C (-20°C a +40°C)',
      Capacidad: specs['Capacidad'] || '32,000 Registros (Lecturas de Memoria)',
      Intervalo: specs['Intervalo'] || '10 segundos a 24 horas (Configurable)',
      'Interfaz / Reporte': specs['Interfaz / Reporte'] || 'USB 2.0 Directo · Generación Automática de Reporte PDF/CSV'
    };
    count++;
  } else if (slug === 'loggers-industriales') {
    if (title.includes('FieldLogger')) {
      p.specs = {
        ...specs,
        Canales: '8 Canales Analógicos Universales + 8 Digitales (Entradas / Salidas)',
        'Señales Compatibles': 'Termopares (J,K,T,N,R,S,B,E), RTD Pt100, 0-10V, 4-20mA, Hz/Pulsos',
        'Resolución / Exactitud': '24 bits A/D · 1000 Muestras/s · Precisión 0.2% F.S.',
        Registro: '512k Registros Internos + Expansión SD Card (hasta 16 GB)',
        Comunicaciones: 'Ethernet 10/100, RS-485 Modbus RTU/TCP, Servidor Web, USB Host',
        'Alimentación / Autonomía': '100 a 240 VCA (o 24 VDC) · Batería de Respaldo Interna'
      };
    } else if (title.includes('LogBox-LTE')) {
      p.specs = {
        ...specs,
        Canales: '3 Entradas Analógicas Universales + 1 Entrada Digital',
        'Señales Compatibles': 'Termopares (J,K,T,N,R,S,B,E), RTD Pt100, 0-10V, 4-20mA',
        'Resolución / Exactitud': '15 bits A/D · Precisión 0.2% F.S.',
        Registro: '140,000 Registros en Memoria Interna (1s a 18h)',
        Comunicaciones: 'Celular 4G LTE / 3G / 2G (Dual SIM), MQTT, Modbus RTU, USB',
        'Alimentación / Autonomía': '10 a 30 VDC + Batería Interna de Respaldo de Litio'
      };
    } else if (title.includes('LogBox Wi-Fi')) {
      p.specs = {
        ...specs,
        Canales: '3 Entradas Analógicas Universales + 1 Entrada Digital',
        'Señales Compatibles': 'Termopares (J,K,T,N,R,S,B,E), RTD Pt100, 0-10V, 4-20mA',
        'Resolución / Exactitud': '15 bits A/D · Precisión 0.2% F.S.',
        Registro: '140,000 Registros en Memoria Interna (1s a 18h)',
        Comunicaciones: 'Wi-Fi 802.11 b/g/n, MQTT, Modbus TCP, USB Local',
        'Alimentación / Autonomía': '10 a 30 VDC + Batería Interna de Respaldo de Litio'
      };
    } else if (title.includes('LogBox-BLE')) {
      p.specs = {
        ...specs,
        Canales: '3 Entradas Analógicas Universales + 1 Entrada Digital',
        'Señales Compatibles': 'Termopares (J,K,T,N,R,S,B,E), RTD Pt100, 0-10V, 4-20mA',
        'Resolución / Exactitud': '15 bits A/D · Precisión 0.2% F.S.',
        Registro: '140,000 Registros en Memoria Interna (1s a 18h)',
        Comunicaciones: 'Bluetooth Low Energy 4.1 (App Móvil NXperience) + USB',
        'Alimentación / Autonomía': '10 a 30 VDC o Batería Interna de Respaldo de Litio'
      };
    } else if (title.includes('LogBox-DA')) {
      p.specs = {
        ...specs,
        Canales: '1 Canal Digital de Conteo/Frecuencia + 1 Canal Analógico',
        'Señales Compatibles': 'Contactos Secos, Pulsos NPN/PNP, 4-20mA, 0-10V',
        'Resolución / Exactitud': '14 bits A/D · Precisión 0.2% F.S.',
        Registro: '64,000 Registros en Memoria Interna',
        Comunicaciones: 'Interfaz Infrarroja (IR) / USB mediante Estación de Lectura',
        'Alimentación / Autonomía': 'Batería Interna de Litio 3.6V (Autonomía hasta 2 Años)'
      };
    } else {
      // LogBox-AA
      p.specs = {
        ...specs,
        Canales: '2 Canales Analógicos Independientes',
        'Señales Compatibles': 'Termopares (J,K,T,N,R,S,B,E), RTD Pt100, 0-10V, 4-20mA',
        'Resolución / Exactitud': '14 bits A/D · Precisión 0.2% F.S.',
        Registro: '64,000 Registros (1 Canal) o 32,000 Registros (2 Canales)',
        Comunicaciones: 'Interfaz Infrarroja (IR) / USB mediante Estación de Lectura',
        'Alimentación / Autonomía': 'Batería Interna de Litio 3.6V (Autonomía hasta 2 Años)'
      };
    }
    count++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Enriched and normalized', count, 'products in Registro de Datos');
