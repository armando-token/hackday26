const fs = require('fs');
const pathModule = require('path');

const schemaPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const schema = require(schemaPath);

schema['unidades-monitoreo'] = [
  "Puertos de Sensores / E/S",
  "Capacidad / Expansión",
  "Red y Protocolos",
  "Alarmas / Notificaciones",
  "Montaje"
];

schema['sensores-ambientales'] = [
  "Variable / Función",
  "Rango",
  "Precisión / Resolución",
  "Tipo de Medición",
  "Compatibilidad",
  "Montaje"
];

schema['deteccion-fugas'] = [
  "Tipo",
  "Cobertura / Longitud",
  "Localización",
  "Compatibilidad",
  "Entorno"
];

schema['monitoreo-energia'] = [
  "Tipo / Alcance",
  "Fase",
  "Tensión / Corriente",
  "Variables Medidas",
  "Circuitos / Capacidad",
  "Comunicación"
];

schema['monitoreo-condicion-telik'] = [
  "Variables",
  "Sensor ↔ Gateway",
  "Uplink / Protocolos",
  "Capacidad",
  "Analítica / Muestreo",
  "Autonomía / Montaje"
];

schema['monitoreo-inalambrico-climate'] = [
  "Variable / Precisión",
  "Alcance",
  "Capacidad",
  "Conectividad / Protocolos",
  "Memoria / Autonomía",
  "Cumplimiento"
];

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Updated leaf-spec-schema.json for Monitoreo Data Center successfully!');
