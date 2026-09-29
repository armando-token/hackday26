const fs = require('fs');
const pathModule = require('path');

const schemaPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const schema = require(schemaPath);

schema['sustratos-hidroponicos'] = [
  "Formato",
  "Etapa / Uso",
  "Dimensiones",
  "Orificio / Plug",
  "Cultivos / Sistema",
  "Presentación"
];

schema['ventiladores-alta-velocidad'] = [
  "Montaje",
  "Diámetro",
  "Caudal de Aire",
  "Tensión",
  "Velocidades / Oscilación",
  "Entorno / Protección"
];

schema['accesorios-ventilacion'] = [
  "Tipo de Accesorio",
  "Compatibilidad",
  "Tamaño / Modelo Compatible",
  "Característica Principal"
];

// Clean up old legacy keys if present
delete schema['cultivo-hidroponico'];
delete schema['ventilacion'];

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Updated leaf-spec-schema.json for Otros successfully!');
