const fs = require('fs');
const pathModule = require('path');

const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
const products = require(jsonPath);

let count = 0;

products.forEach(p => {
  const isComms = p.categoryPath?.[0] === 'comunicacion-industrial' || p.categorySlug === 'gateways' || p.categorySlug === 'comunicacion-inalambrica' || p.categorySlug === 'interfaces-industriales';
  if (!isComms) return;

  const title = p.title || '';
  const specs = p.specs || {};

  // 1. Reassign subcategories
  if (title.includes('USB-i485') || title.includes('DigiGate Profibus') || title.includes('IO Link Master')) {
    p.categorySlug = 'interfaces-industriales';
    p.categoryPath = ['comunicacion-industrial', 'interfaces-industriales'];
  } else if (title.includes('AirGate Modbus') || title.includes('LoRa Gateway Kit')) {
    p.categorySlug = 'comunicacion-inalambrica';
    p.categoryPath = ['comunicacion-industrial', 'comunicacion-inalambrica'];
  } else {
    p.categorySlug = 'gateways';
    p.categoryPath = ['comunicacion-industrial', 'gateways'];
  }

  const slug = p.categorySlug;

  // 2. Normalize Canonical Specs
  if (slug === 'gateways') {
    if (title.includes('AirGate 4G Lite')) {
      p.specs = {
        ...specs,
        'Interfaz de Campo': '1x RS-485, 1x RS-232, 1x Ethernet 10/100',
        'Uplink / Red': '4G LTE / 3G / 2G Celular (Soporte Dual SIM)',
        Protocolos: 'MQTT, Modbus RTU/TCP, TCP/UDP, HTTP, FTP',
        'Redundancia / Seguridad': 'Dual SIM Failover, OpenVPN, Firewall, Anti-DoS',
        'Alimentación': 'Rango de 9 a 36 VCC'
      };
    } else {
      // DigiRail-IoT or other IoT Gateway
      p.specs = {
        ...specs,
        'Interfaz de Campo': 'RS-485 (Modbus RTU) + 2 Entradas Analógicas + 6 Digitales',
        'Uplink / Red': 'Wi-Fi (802.11 b/g/n) y Ethernet (10/100 Mbps)',
        Protocolos: 'MQTT, Modbus TCP, Modbus RTU',
        'Redundancia / Seguridad': 'Búfer Interno de Datos (50k registros) / Encriptación TLS',
        'Alimentación': 'Rango amplio de 10 a 36 VCC'
      };
    }
    count++;
  } else if (slug === 'interfaces-industriales') {
    if (title.includes('USB-i485')) {
      p.specs = {
        ...specs,
        Conversión: 'USB ↔ RS-485 / RS-422 (Semidúplex / Dúplex)',
        'Rol / Modo': 'Conversión Transparente (Baudrate 300 bps a 250 kbps)',
        'Puertos / Canales': '1x USB Mini-B, 1x RS485/422 (Conector Borne 16 AWG)',
        'Alimentación': 'Alimentado por Bus USB (5 VDC)',
        'Aislamiento / Protección': 'Aislamiento Galvánico 1500 V RMS / Protección ESD'
      };
    } else if (title.includes('DigiGate Profibus')) {
      p.specs = {
        ...specs,
        Conversión: 'Modbus RTU ↔ PROFIBUS DP',
        'Rol / Modo': 'Modbus RTU Master (hasta 31 esclavos) / PROFIBUS DP Slave',
        'Puertos / Canales': '1x PROFIBUS DP (hasta 12 Mbps), 1x RS485 (hasta 115.2 kbps)',
        'Alimentación': 'Rango de 10 a 35 VCC',
        'Aislamiento / Protección': 'Aislamiento Galvánico 1000 VCA entre Profibus y Modbus'
      };
    } else {
      // Horner IO-Link Master
      p.specs = {
        ...specs,
        Conversión: 'IO-Link ↔ Modbus RTU (IIoT Bridge)',
        'Rol / Modo': 'IO-Link Master (COM1/COM2/COM3) / Modbus RTU Slave',
        'Puertos / Canales': '2 o 4 Puertos IO-Link M12 Hembra + 1 Puerto Host Modbus M12 Macho',
        'Alimentación': 'Rango de 18 a 30 VDC',
        'Aislamiento / Protección': 'Sobremoldeado Estanco de Grado Industrial IP65 / IP67 / IP68'
      };
    }
    count++;
  } else if (slug === 'comunicacion-inalambrica') {
    if (title.includes('AirGate Modbus')) {
      p.specs = {
        ...specs,
        'Tecnología / Frecuencia': 'IEEE 802.15.4 (Banda ISM 2.4 GHz)',
        'Interfaz hacia Red': 'Puerto RS-485 (Modbus RTU) + USB Mini-B',
        Alcance: 'Hasta 1000 metros (Línea de vista directa)',
        'Dispositivos / Topología': 'Punto a Punto, Estrella y Árbol (Master / Slave / Multimaster)',
        'Alimentación': 'Rango de 10 a 35 VCC (o Alimentado vía USB)',
        Protección: 'Carcasa NEMA 1 / Montaje en Riel DIN 35mm IP20'
      };
    } else {
      // Tzone RD07 LoRa Gateway Kit
      p.specs = {
        ...specs,
        'Tecnología / Frecuencia': 'LoRa (Frecuencias 433 / 470 / 868 / 915 MHz)',
        'Interfaz hacia Red': 'Puerto Ethernet LAN (10/100) + Wi-Fi + 4G LTE',
        Alcance: 'Hasta 5 km (Línea de vista en campo abierto)',
        'Dispositivos / Topología': 'Soporta hasta 100 Tags / Sensores Inalámbricos Tzone',
        'Alimentación': '10 a 36 VDC / Adaptador de Pared 12 VDC',
        Protección: 'Gabinete Exterior A Prueba de Agua Grado IP54'
      };
    }
    count++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Reassigned and enriched', count, 'products in Comunicación Industrial e IoT');
