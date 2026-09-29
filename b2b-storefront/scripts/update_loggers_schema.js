const fs = require('fs');
const pathModule = require('path');

const schemaPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const schema = require(schemaPath);

schema['loggers-cadena-frio'] = [
  "Variables / Sensor",
  "Rango",
  "Exactitud",
  "Capacidad",
  "Intervalo",
  "Interfaz / Reporte"
];

schema['loggers-industriales'] = [
  "Canales",
  "Señales Compatibles",
  "Resolución / Exactitud",
  "Registro",
  "Comunicaciones",
  "Alimentación / Autonomía"
];

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Updated leaf-spec-schema.json for Registro de Datos successfully!');
