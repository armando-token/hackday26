const fs = require('fs');
const pathModule = require('path');

const schemaPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const schema = require(schemaPath);

schema['gateways'] = [
  "Interfaz de Campo",
  "Uplink / Red",
  "Protocolos",
  "Redundancia / Seguridad",
  "Alimentación"
];

schema['interfaces-industriales'] = [
  "Conversión",
  "Rol / Modo",
  "Puertos / Canales",
  "Alimentación",
  "Aislamiento / Protección"
];

schema['comunicacion-inalambrica'] = [
  "Tecnología / Frecuencia",
  "Interfaz hacia Red",
  "Alcance",
  "Dispositivos / Topología",
  "Alimentación",
  "Protección"
];

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Updated leaf-spec-schema.json for Comunicación Industrial e IoT successfully!');
