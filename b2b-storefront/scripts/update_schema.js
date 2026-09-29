const fs = require('fs');
const pathModule = require('path');

const schemaPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/leaf-spec-schema.json');
const schema = require(schemaPath);

schema['paneles-sandwich'] = ['Espesor', 'Núcleo Aislante', 'Conductividad Térmica', 'Reacción al Fuego', 'Revestimiento', 'Aplicación'];
schema['accesorios-entrenamiento'] = ['Tipo de Dispositivo', 'Compatibilidad', 'Alimentación'];
schema['comunicacion-inalambrica'] = ['Tecnología Inalámbrica', 'Alcance', 'Protocolo', 'Grado de Protección'];
schema['interfaces-industriales'] = ['Conector de Red', 'Protocolo', 'Grado de Protección'];
schema['transmisores-temperatura'] = ['Entrada de Sensor', 'Salida de Señal', 'Precisión', 'Alimentación', 'Montaje'];
schema['gases-co2'] = ['Sensor NDIR', 'Rango', 'Salida de Señal', 'Pantalla'];
schema['accesorios-sensores'] = ['Material', 'Rosca / Conexión', 'Presión Máxima', 'Compatibilidad'];
schema['controles-anticongelamiento'] = ['Voltaje', 'Sensor Remoto', 'Rango de Temperatura', 'Grado de Protección'];
schema['calentadores-tambor'] = ['Capacidad de Tambor', 'Potencia', 'Voltaje', 'Termostato'];
schema['termostatos-industriales'] = ['Entradas de Sensor', 'Salidas de Control', 'Comunicación', 'Montaje'];
schema['reles-ssr'] = ['Corriente de Carga', 'Voltaje de Control', 'Voltaje de Salida', 'Montaje'];
schema['deshielo-techos'] = ['Tensión', 'Potencia por Metro', 'Certificaciones', 'Aplicación'];
schema['deshielo-pavimentos'] = ['Área Cubierta', 'Potencia Total', 'Tensión', 'Grado de Protección'];
schema['deteccion-fugas'] = ['Tipo de Detección', 'Conectividad', 'Respuesta', 'Alimentación'];
schema['monitoreo-energia'] = ['Variables Medidas', 'Comunicación', 'Aislamiento', 'Montaje'];
schema['monitoreo-condicion'] = ['Sensores Integrados', 'Conectividad Celular', 'Plataforma', 'Alimentación'];
schema['monitoreo-inalambrico'] = ['Red Inalámbrica', 'Rango', 'Autonomía', 'Almacenamiento'];
schema['cultivo-hidroponico'] = ['Tipo de Sustrato', 'Formato', 'Retención de Agua', 'Aplicación'];

fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
console.log('Updated leaf-spec-schema.json successfully with new categories');
