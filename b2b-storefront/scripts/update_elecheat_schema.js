const fs = require('fs');
const pathModule = require('path');

const schemaPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const schema = require(schemaPath);

schema['pared-conveccion'] = ["Tipo / Montaje", "Potencia", "Tensión", "Caudal de Aire", "Termostato / Control"];
schema['portatiles'] = ["Potencia", "Tensión / Fase", "Caudal", "Conexión", "Termostato / Control", "Ductable"];
schema['unit-heaters'] = ["Potencia", "Tensión / Fase", "Caudal de Aire", "Montaje", "Control / Termostato", "Construcción / Entorno"];
schema['zocalo'] = ["Potencia", "Tensión", "Longitud", "Termostato", "Tipo", "Acabado"];
schema['radiante-infrarrojo'] = ["Potencia", "Tensión", "Instalación", "Tipo de Infrarrojo", "Protección", "Control"];
schema['ducto-mau-plenum'] = ["Tipo", "Potencia", "Tensión / Fase", "Caudal", "Control / Modulación", "Instalación"];
schema['antiexplosion'] = ["Potencia", "Tensión / Fase", "Clasificación de Área", "T-Code", "Caudal", "Construcción / Protección"];
schema['cartuchos'] = ["Tipo / Serie", "Diámetro", "Longitud", "Potencia", "Tensión", "Densidad de Potencia", "T° Máx."];
schema['bandas'] = ["Tipo", "Diámetro Interior", "Ancho", "Potencia", "Tensión", "Densidad de Potencia", "T° Máx."];
schema['strips'] = ["Tipo", "Dimensiones", "Potencia", "Tensión", "Densidad de Potencia", "T° Máx.", "Montaje / Terminación"];
schema['calentadores-tambor'] = ["Capacidad de Tambor", "Dimensiones", "Potencia", "Tensión", "Rango de Temperatura", "Control / Termostato"];
schema['calentadores-flexibles'] = ["Dimensiones", "Potencia", "Tensión", "Densidad de Potencia", "T° Máx.", "Montaje"];
schema['inmersion'] = ["Tipo", "Potencia", "Tensión / Fase", "Conexión", "Fluido / Aplicación", "Densidad de Potencia", "Material de Vaina", "Longitud Inmersión"];
schema['sistemas-llave-en-mano'] = ["Sistema", "Potencia", "Tensión / Fase", "Medio / Proceso", "Temperatura", "Caudal / Capacidad", "Control", "Gabinete"];
schema['termostatos-linea'] = ["Tipo", "Tensión", "Capacidad de Carga", "Rango de Temperatura", "Programación / Conectividad", "Sensor"];
schema['controles-anticongelamiento'] = ["Tipo de Sensor", "Rango de Temperatura", "Tensión", "Capacidad", "Salida / Contacto", "Protección"];

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Updated leaf-spec-schema.json for Calefacción Eléctrica successfully!');
