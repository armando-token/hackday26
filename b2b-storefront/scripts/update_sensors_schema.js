const fs = require('fs');
const pathModule = require('path');

const schemaPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const schema = require(schemaPath);

schema['temperatura-termopar-rtd'] = [
  "Tipo de Elemento",
  "Rango de Temperatura",
  "Vaina / Material",
  "Conexión a Proceso",
  "Salida / Cabeza"
];

schema['transmisores-temperatura'] = [
  "Tipo de Montaje",
  "Entrada de Sensor",
  "Salida / Protocolo",
  "Alimentación",
  "Aislamiento / Precisión"
];

schema['humedad-temperatura'] = [
  "Tipo de Montaje",
  "Rango de Medición",
  "Salida / Protocolo",
  "Precisión",
  "Alimentación"
];

schema['presion-proceso'] = [
  "Rango de Presión",
  "Tipo de Presión",
  "Salida / Protocolo",
  "Conexión a Proceso",
  "T° Máx. Maza"
];

schema['nivel'] = [
  "Tecnología de Medición",
  "Rango de Medición",
  "Salida / Protocolo",
  "Material Sumergible / Carcasa",
  "Alimentación"
];

schema['gases-co2'] = [
  "Gas Detectado",
  "Rango de Medición",
  "Sensor / Tecnología",
  "Salida / Protocolo",
  "Alimentación"
];

schema['accesorios-sensores'] = [
  "Tipo de Accesorio",
  "Material / Construcción",
  "Conexión a Proceso / Entrada",
  "Compatibilidad",
  "Rango / Grado"
];

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Updated leaf-spec-schema.json for Sensores y Transmisores successfully!');
