const fs = require('fs');
const pathModule = require('path');

const schemaPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const schema = require(schemaPath);

schema['cable-autorregulable'] = [
  "Potencia @ Ref.",
  "Tensión",
  "T° Máx. Mantenimiento",
  "T° Máx. Exposición",
  "Área / Cubierta"
];

schema['techos-canalones'] = [
  "Tipo",
  "Tensión",
  "Potencia Lineal",
  "Longitud",
  "Conexión / Enchufe",
  "Kit / Accesorios"
];

schema['deshielo-nieve'] = [
  "Formato",
  "Tensión",
  "Área Calefaccionada",
  "Potencia Específica",
  "Potencia Total",
  "Dimensión"
];

schema['suelo-radiante'] = [
  "Formato",
  "Área Calefaccionada",
  "Tensión",
  "Potencia Específica",
  "Potencia Total",
  "Piso Compatible"
];

schema['controles-deshielo'] = [
  "Aplicación",
  "Alimentación",
  "Capacidad de Salida",
  "Circuitos / Zonas",
  "Sensores Soportados"
];

schema['accesorios-trazado'] = [
  "Tipo de Accesorio",
  "Compatibilidad",
  "Incluye"
];

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Updated leaf-spec-schema.json for Heat Tracing successfully!');
