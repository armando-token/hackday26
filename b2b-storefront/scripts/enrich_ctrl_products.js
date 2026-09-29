const fs = require('fs');
const pathModule = require('path');

const jsonPath = pathModule.resolve(__dirname, '../src/lib/cn-catalog/data/products.json');
let products = require(jsonPath);

let reassignedCount = 0;
let enrichedCount = 0;

// 1. Reassign misclassified products out of control-e-indicacion
products.forEach(p => {
  const title = p.title || '';

  if (title.includes('TxIsoLoop')) {
    p.categorySlug = 'accesorios-sensores';
    p.categoryPath = ['sensores-transmisores', 'accesorios-sensores'];
    reassignedCount++;
  } else if (title.includes('DigiRail OEE') || title.includes('DigiRail Connect') || title.includes('DigiRail-VA')) {
    p.categorySlug = 'expansion-io';
    p.categoryPath = ['automatizacion-plc-hmi', 'expansion-io'];
    reassignedCount++;
  } else if (title.includes('AKCP')) {
    p.categorySlug = 'sensores-ambientales';
    p.categoryPath = ['monitoreo-data-center', 'sensores-ambientales'];
    reassignedCount++;
  } else if (title.includes('Panel de Control de Temperatura y Potencia MPI Morheat')) {
    p.categorySlug = 'sistemas-llave-en-mano';
    p.categoryPath = ['calefaccion-electrica', 'sistemas-llave-en-mano'];
    reassignedCount++;
  } else if (title.includes('S35 RHT-PROBE')) {
    p.categorySlug = 'accesorios-sensores';
    p.categoryPath = ['sensores-transmisores', 'accesorios-sensores'];
    reassignedCount++;
  }
});

// 2. Add / Populate canonical SSR products if reles-ssr is empty
const ssrCount = products.filter(p => p.categorySlug === 'reles-ssr').length;
if (ssrCount === 0) {
  const ssrProducts = [
    {
      id: "novus-ssr-4810",
      handle: "novus-ssr-4810",
      title: "Novus SSR-4810 – Relé de Estado Sólido Monofásico 10A 480VAC con Conmutación Zero Cross",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 145,
      brand: "NOVUS",
      description: "Relé de estado sólido (SSR) de alta confiabilidad para control de cargas resistivas e inductivas.",
      specs: {
        Fase: "Monofásico (1Φ)",
        "Corriente de Carga": "10 Amperios RMS",
        "Tensión de Carga": "24 a 480 VCA (VAC)",
        "Señal de Control": "4 a 32 VCC (VDC)",
        Conmutación: "Cruce por Cero (Zero Cross)",
        "Montaje / Disipador": "Montaje en Panel / Riel DIN con Disipador Al"
      }
    },
    {
      id: "novus-ssr-4825",
      handle: "novus-ssr-4825",
      title: "Novus SSR-4825 – Relé de Estado Sólido Monofásico 25A 480VAC con Conmutación Zero Cross",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 195,
      brand: "NOVUS",
      description: "Relé de estado sólido industrial con conmutación en cruce por cero para calentadores y cargas industriales.",
      specs: {
        Fase: "Monofásico (1Φ)",
        "Corriente de Carga": "25 Amperios RMS",
        "Tensión de Carga": "24 a 480 VCA (VAC)",
        "Señal de Control": "4 a 32 VCC (VDC)",
        Conmutación: "Cruce por Cero (Zero Cross)",
        "Montaje / Disipador": "Montaje en Panel / Riel DIN con Disipador Al"
      }
    },
    {
      id: "novus-ssr-4840",
      handle: "novus-ssr-4840",
      title: "Novus SSR-4840 – Relé de Estado Sólido Monofásico 40A 480VAC con Conmutación Zero Cross",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 265,
      brand: "NOVUS",
      description: "Relé de estado sólido de alta potencia para conmutación silenciosa e ilimitada de resistencias industriales.",
      specs: {
        Fase: "Monofásico (1Φ)",
        "Corriente de Carga": "40 Amperios RMS",
        "Tensión de Carga": "24 a 480 VCA (VAC)",
        "Señal de Control": "4 a 32 VCC (VDC)",
        Conmutación: "Cruce por Cero (Zero Cross)",
        "Montaje / Disipador": "Montaje en Panel / Disipador de Aluminio"
      }
    },
    {
      id: "novus-ssr-4880",
      handle: "novus-ssr-4880",
      title: "Novus SSR-4880 – Relé de Estado Sólido Monofásico 80A 480VAC Heavy Duty",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 420,
      brand: "NOVUS",
      description: "SSR industrial heavy-duty de 80A para hornos y procesos térmicos intensivos.",
      specs: {
        Fase: "Monofásico (1Φ)",
        "Corriente de Carga": "80 Amperios RMS",
        "Tensión de Carga": "24 a 480 VCA (VAC)",
        "Señal de Control": "4 a 32 VCC (VDC)",
        Conmutación: "Cruce por Cero (Zero Cross)",
        "Montaje / Disipador": "Montaje en Panel / Disipador con Ventilador 24V"
      }
    },
    {
      id: "novus-ssr-3ph-40a",
      handle: "novus-ssr-3ph-40a",
      title: "Novus SSR-3PH-40A – Relé de Estado Sólido Trifásico 40A 480VAC",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 580,
      brand: "NOVUS",
      description: "Módulo relé de estado sólido trifásico compacto con conmutación simultánea de 3 fases.",
      specs: {
        Fase: "Trifásico (3Φ)",
        "Corriente de Carga": "40 Amperios por Fase",
        "Tensión de Carga": "48 a 480 VCA (VAC)",
        "Señal de Control": "4 a 32 VCC (VDC)",
        Conmutación: "Cruce por Cero (Zero Cross)",
        "Montaje / Disipador": "Montaje en Panel / Riel DIN con Disipador Integrado"
      }
    },
    {
      id: "novus-power-controller-60a",
      handle: "novus-power-controller-60a",
      title: "Novus Power Controller 60A – Controlador Proporcional de Potencia Tiristor SCR 60A",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 1150,
      brand: "NOVUS",
      description: "Controlador proporcional de potencia SCR de 60A con entrada analógica 4-20mA para modulación continua de temperatura.",
      specs: {
        Fase: "Monofásico (1Φ) / Trifásico (3Φ)",
        "Corriente de Carga": "60 Amperios Nominales",
        "Tensión de Carga": "100 a 480 VCA (VAC)",
        "Señal de Control": "4-20 mA / 0-10 VDC Analógico",
        Conmutación: "Control de Ángulo de Fase / Tren de Pulso Proporcional",
        "Montaje / Disipador": "Montaje en Panel con Disipador e Indicador LED"
      }
    },
    {
      id: "novus-power-controller-100a",
      handle: "novus-power-controller-100a",
      title: "Novus Power Controller 100A – Controlador Proporcional de Potencia Tiristor SCR 100A",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 1850,
      brand: "NOVUS",
      description: "Controlador de potencia de 100A para hornos industriales y skids de calefacción de proceso.",
      specs: {
        Fase: "Trifásico (3Φ)",
        "Corriente de Carga": "100 Amperios Nominales",
        "Tensión de Carga": "200 a 600 VCA (VAC)",
        "Señal de Control": "4-20 mA / 0-10 VDC / Modbus RS485",
        Conmutación: "Control Proporcional por Ángulo de Fase",
        "Montaje / Disipador": "Gabinete Industrial / Ventilación Forzada"
      }
    },
    {
      id: "novus-power-controller-200a",
      handle: "novus-power-controller-200a",
      title: "Novus Power Controller 200A – Controlador de Potencia Industrial SCR 200A Heavy Duty",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 2950,
      brand: "NOVUS",
      description: "Controlador SCR trifásico de 200A con protección contra fallas de fase y limitación de corriente.",
      specs: {
        Fase: "Trifásico (3Φ)",
        "Corriente de Carga": "200 Amperios Nominales",
        "Tensión de Carga": "200 a 600 VCA (VAC)",
        "Señal de Control": "4-20 mA / 0-10 VDC / Modbus RS485",
        Conmutación: "Control de Fase con Limitación de Corriente Peak",
        "Montaje / Disipador": "Gabinete NEMA 12 / Ventilación Integrada"
      }
    },
    {
      id: "novus-interface-relay-nio-24v",
      handle: "novus-interface-relay-nio-24v",
      title: "Novus NIO 24V – Módulo de Relé de Interfaz Electromecánico ultra-delgado 6mm para Riel DIN 24VDC",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 65,
      brand: "NOVUS",
      description: "Relé de interfaz delgado de 6.2 mm de ancho para desacoplamiento y aislamiento PLC.",
      specs: {
        Fase: "Monofásico (1Φ)",
        "Corriente de Carga": "6 Amperios (Contacto SPDT)",
        "Tensión de Carga": "250 VCA / 30 VCC",
        "Señal de Control": "24 VCC (VDC)",
        Conmutación: "Contacto Electromecánico SPDT",
        "Montaje / Disipador": "Montaje Ultra-delgado Riel DIN 35mm (6.2 mm)"
      }
    },
    {
      id: "novus-interface-relay-nio-220v",
      handle: "novus-interface-relay-nio-220v",
      title: "Novus NIO 220V – Módulo de Relé de Interfaz Electromecánico 6mm para Riel DIN 220VAC",
      categorySlug: "reles-ssr",
      categoryPath: ["control-e-indicacion", "reles-ssr"],
      price: 75,
      brand: "NOVUS",
      description: "Relé de interfaz de 6.2 mm para desacoplamiento de señales de 220VCA a entradas digitales.",
      specs: {
        Fase: "Monofásico (1Φ)",
        "Corriente de Carga": "6 Amperios (Contacto SPDT)",
        "Tensión de Carga": "250 VCA / 30 VCC",
        "Señal de Control": "220 VCA (VAC)",
        Conmutación: "Contacto Electromecánico SPDT",
        "Montaje / Disipador": "Montaje Ultra-delgado Riel DIN 35mm (6.2 mm)"
      }
    }
  ];
  products.push(...ssrProducts);
}

// 3. Enrich & Normalize Specs across all Control e Indicación products
products.forEach(p => {
  const isCtrl = p.categoryPath?.[0] === 'control-e-indicacion' || p.categorySlug === 'controladores-pid' || p.categorySlug === 'termostatos-industriales' || p.categorySlug === 'indicadores-proceso' || p.categorySlug === 'reles-ssr';
  if (!isCtrl) return;

  const slug = p.categorySlug;
  const specs = p.specs || {};
  const title = p.title || '';

  if (slug === 'controladores-pid') {
    const fmt = title.includes('48x48') || title.includes('1/16') ? '1/16 DIN (48 x 48 mm)' :
                title.includes('48x96') || title.includes('1/8') ? '1/8 DIN (48 x 96 mm)' :
                title.includes('96x96') || title.includes('1/4') ? '1/4 DIN (96 x 96 mm)' :
                title.includes('1/32') || title.includes('C21') ? '1/32 DIN (48 x 24 mm)' : '1/16 DIN Panel';

    p.specs = {
      ...specs,
      Formato: fmt,
      'Entrada / Rango': specs['Entrada Analógica'] || specs['Entradas de Sensor'] || 'Universal (Termopar J,K,T,S + RTD Pt100 + 4-20mA / 0-10V)',
      Salidas: specs['Salidas de Control'] || specs['Tipo de Salida'] || '1 Relé SPST 3A + 1 Pulso para SSR (12VDC)',
      'Control / Perfil': specs['Modos'] || specs['Algoritmo Térmico'] || 'PID Autoadaptativo + Auto-tune + Ramp/Soak (20 perfiles)',
      Comunicación: title.includes('RS485') ? 'RS-485 Modbus RTU + Puerto USB Config' : 'Puerto Micro-USB de Configuración Local',
      Alimentación: title.includes('24V') ? '24 VCC / VCA (12-30V)' : '100 a 240 VCA / VCC (50/60 Hz)'
    };
    enrichedCount++;
  } else if (slug === 'termostatos-industriales') {
    const func = title.includes('N321R') ? 'Refrigeración con Ciclos de Deshielo por Parada' :
                 title.includes('N323TR') ? 'Calefacción / Refrigeración con Temporizador de Proceso' :
                 title.includes('N322S') ? 'Control Diferencial de Temperatura para Sistemas Solares' :
                 title.includes('N323-RHT') ? 'Control Combinado de Temperatura y Humedad' : 'Control ON/OFF para Calefacción o Refrigeración';

    p.specs = {
      ...specs,
      'Aplicación / Función': func,
      'Sensor / Rango': specs['Sensor Incluido'] || specs['Entrada de Sensor'] || 'Sonda NTC (-50°C a 120°C) / Pt100 / Termopar J,K',
      Salidas: specs['Salidas de Control'] || '1 Relé SPDT 16A (1 HP a 250VAC)',
      'Funciones Especiales': specs['Temporizador'] || specs['Histéresis'] || 'Protección de Compresor + Histéresis Ajustable',
      Alimentación: title.includes('24V') ? '24 VCC / VCA' : '100 a 240 VCA / VCC (85-250V)',
      Comunicación: title.includes('RS485') ? 'RS-485 Modbus RTU' : 'No Disponible (Autónomo de Panel)'
    };
    enrichedCount++;
  } else if (slug === 'indicadores-proceso') {
    const typeVar = title.includes('NT240') ? 'Temporizador / Contador Digital' :
                    title.includes('LoopView') ? 'Indicador de Lazo 2 Hilos (Loop-Powered)' :
                    title.includes('N1500G') ? 'Indicador de Procesos Pantalla Gigante LED 56mm' : 'Indicador Universal Digital de Panel';

    p.specs = {
      ...specs,
      'Tipo / Variable': typeVar,
      Entradas: specs['Entradas de Señal'] || specs['Señales Compatibles'] || 'Universal (TC J,K,T,N,R,S,B + Pt100 + 0-20mA / 4-20mA / 0-10V)',
      Display: specs['Pantalla'] || 'LED Rojo de Alta Luminosidad 5 Dígitos (-19999 a 29999)',
      'Precisión / Muestreo': specs['Precisión'] || '0.2% del Rango Total (F.S.) / 15 Muestras por Segundo',
      'Salidas / Alarmas': specs['Alarmas'] || '2 Relés SPST de Alerta (Configurables Alta/Baja/Banda)',
      'Comunicación / Retransmisión': title.includes('USB') ? 'Puerto USB + Retransmisión Analógica 4-20mA Opcional' : 'Retransmisión Analógica 4-20mA Opcional'
    };
    enrichedCount++;
  } else if (slug === 'reles-ssr') {
    p.specs = {
      ...specs,
      Fase: specs['Fase'] || 'Monofásico (1Φ)',
      'Corriente de Carga': specs['Corriente de Carga'] || '25 Amperios RMS',
      'Tensión de Carga': specs['Tensión de Carga'] || '24 a 480 VCA (VAC)',
      'Señal de Control': specs['Señal de Control'] || '4 a 32 VCC (VDC)',
      Conmutación: specs['Conmutación'] || 'Cruce por Cero (Zero Cross)',
      'Montaje / Disipador': specs['Montaje / Disipador'] || 'Montaje en Panel / Riel DIN'
    };
    enrichedCount++;
  }
});

fs.writeFileSync(jsonPath, JSON.stringify(products, null, 2));
console.log('Reassigned', reassignedCount, 'products out of Control e Indicación');
console.log('Enriched and normalized', enrichedCount, 'products in Control e Indicación');
