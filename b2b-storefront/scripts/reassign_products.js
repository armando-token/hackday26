const fs = require('fs');

const pathModule = require('path');
const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
const products = require(jsonPath);

let count = 0;

products.forEach(p => {
  const title = p.title || '';
  const slug = p.categorySlug || '';
  const id = p.id || p.handle || '';

  // 1. Cubos Hidropónicos
  if (title.includes('Hidropónicos') || title.includes('Agricultura sin Suelo')) {
    p.categorySlug = 'cultivo-hidroponico';
    p.categoryPath = ['otros', 'cultivo-hidroponico'];
    count++;
  }
  // 2. Paneles Sinopan Sándwich
  else if (title.includes('Sinopan') || title.includes('Panel Decorativo PU') || title.includes('SC‑PU') || title.includes('SCR‑PU') || title.includes('SC‑Pc') || title.includes('SC-PW')) {
    p.categorySlug = 'paneles-sandwich';
    p.categoryPath = ['aislamiento-termico', 'paneles-sandwich'];
    count++;
  }
  // 3. Simulador Universal
  else if (title.includes('Simulador Universal')) {
    p.categorySlug = 'accesorios-entrenamiento';
    p.categoryPath = ['automatizacion-plc-hmi', 'accesorios-entrenamiento'];
    count++;
  }
  // 4. DigiRail NXProg
  else if (title.includes('DigiRail NXProg')) {
    p.categorySlug = 'controladores-remotos';
    p.categoryPath = ['automatizacion-plc-hmi', 'controladores-remotos'];
    count++;
  }
  // 5. Gateways
  else if (title.includes('USB-i485') || title.includes('DigiRail-IoT') || title.includes('AirGate 4G') || title.includes('DigiGate Profibus') || title.includes('AirGate Modbus') || title.includes('RD07') || title.includes('IO Link Master')) {
    p.categorySlug = 'gateways';
    p.categoryPath = ['comunicacion-industrial', 'gateways'];
    count++;
  }
  // 6. Telik Geter
  else if (title.includes('Telik Geter')) {
    p.categorySlug = 'monitoreo-condicion';
    p.categoryPath = ['monitoreo-data-center', 'monitoreo-condicion'];
    count++;
  }
  // 7. Climate-Air Plus
  else if (title.includes('Climate-Air Plus')) {
    p.categorySlug = 'monitoreo-inalambrico';
    p.categoryPath = ['monitoreo-data-center', 'monitoreo-inalambrico'];
    count++;
  }
  // 8. AKCP Thermal Map
  else if (title.includes('Thermal Map')) {
    p.categorySlug = 'sensores-ambientales';
    p.categoryPath = ['monitoreo-data-center', 'sensores-ambientales'];
    count++;
  }
  // 9. PTT04R
  else if (title.includes('PTT04R')) {
    p.categorySlug = 'transmisores-temperatura';
    p.categoryPath = ['sensores-transmisores', 'transmisores-temperatura'];
    count++;
  }
  // 10. WL320 / WL420 / TL400
  else if (title.includes('WL320') || title.includes('WL420') || title.includes('TL400')) {
    p.categorySlug = 'nivel';
    p.categoryPath = ['sensores-transmisores', 'nivel'];
    count++;
  }
  // 11. Tzone CT01
  else if (title.includes('TZ-CT01')) {
    p.categorySlug = 'gases-co2';
    p.categoryPath = ['sensores-transmisores', 'gases-co2'];
    count++;
  }
  // 12. Termopozos, Bridas, Cables de Sensores y Ruptura
  else if (title.includes('Termopozos') || title.includes('Brida Novus SS310') || title.includes('Cables y Conectores') || title.includes('Discos de Ruptura')) {
    p.categorySlug = 'accesorios-sensores';
    p.categoryPath = ['sensores-transmisores', 'accesorios-sensores'];
    count++;
  }
  // 13. Termostatos Antihielo
  else if (title.includes('TRF115') || title.includes('TF115') || title.includes('TH109')) {
    p.categorySlug = 'controles-anticongelamiento';
    p.categoryPath = ['calefaccion-electrica', 'controles-anticongelamiento'];
    count++;
  }
  // 14. Calentador de Tambor de Silicona
  else if (title.includes('Tambor de Goma de Silicona')) {
    p.categorySlug = 'calentadores-tambor';
    p.categoryPath = ['calefaccion-electrica', 'calentadores-tambor'];
    count++;
  }
  // 15. Termostatos Electrónicos N321, N322, N323, N321R, N323TR
  else if (title.includes('N321') || title.includes('N322') || title.includes('N323')) {
    p.categorySlug = 'termostatos-industriales';
    p.categoryPath = ['control-e-indicacion', 'termostatos-industriales'];
    count++;
  }
  // 16. PYROBOX / PYROCON / GF PRO
  else if (title.includes('PYROBOX') || title.includes('PYROCON') || title.includes('GF PRO')) {
    p.categorySlug = 'controles-deshielo';
    p.categoryPath = ['trazado-termico', 'controles-deshielo'];
    count++;
  }
  // 17. Relés SSR y Aisladores
  else if (title.includes('TxIsoLoop') || (slug === 'transmisores' && (title.includes('SSR') || title.includes('Relé')))) {
    p.categorySlug = 'reles-ssr';
    p.categoryPath = ['control-e-indicacion', 'reles-ssr'];
    count++;
  }
  // 18. Other Transmisores → Transmisores de Temperatura o Humedad
  else if (slug === 'transmisores') {
    if (title.includes('Humedad') || title.includes('RHT') || title.includes('THT')) {
      p.categorySlug = 'humedad-temperatura';
      p.categoryPath = ['sensores-transmisores', 'humedad-temperatura'];
      count++;
    } else {
      p.categorySlug = 'transmisores-temperatura';
      p.categoryPath = ['sensores-transmisores', 'transmisores-temperatura'];
      count++;
    }
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Reassigned', count, 'products in products.json');
