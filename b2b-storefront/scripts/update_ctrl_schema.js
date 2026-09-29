const fs = require('fs');
const pathModule = require('path');

const schemaPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const schema = require(schemaPath);

schema['controladores-pid'] = [
  "Formato",
  "Entrada / Rango",
  "Salidas",
  "Control / Perfil",
  "Comunicación",
  "Alimentación"
];

schema['termostatos-industriales'] = [
  "Aplicación / Función",
  "Sensor / Rango",
  "Salidas",
  "Funciones Especiales",
  "Alimentación",
  "Comunicación"
];

schema['indicadores-proceso'] = [
  "Tipo / Variable",
  "Entradas",
  "Display",
  "Precisión / Muestreo",
  "Salidas / Alarmas",
  "Comunicación / Retransmisión"
];

schema['reles-ssr'] = [
  "Fase",
  "Corriente de Carga",
  "Tensión de Carga",
  "Señal de Control",
  "Conmutación",
  "Montaje / Disipador"
];

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Updated leaf-spec-schema.json for Control e Indicación successfully!');
