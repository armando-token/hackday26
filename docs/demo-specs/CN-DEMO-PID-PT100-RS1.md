# PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN

> **AVISO IMPORTANTE DE CONFORMIDAD:**
> Este equipo y sus especificaciones técnicas han sido generados sintéticamente de manera exclusiva para fines de demostración, pruebas funcionales y benchmarking de ingeniería de la Fase 1. No corresponde a un componente comercial físico activo.

---

# Ficha de Especificaciones Técnicas

## Identificación del Producto
- **Código SKU:** `CN-DEMO-PID-PT100-RS1`
- **Modelo:** `CN-PID-T1`
- **Denominación Técnica:** Controlador Digital de Temperatura PID para Panel con Entrada Pt100 y Salida Analógica 4–20 mA
- **Línea de Producto:** Familia PID-Thermo Series (Entorno Demostración)
- **Categoría:** Instrumentación y Control / Reguladores PID

---

## Fuente Técnica Primaria y Control Documental
- **Identificador de Fuente (`source_id`):** `SRC-CN-PID-T1-DS-V1`
- **Revisión del Documento (`revision`):** `rev-2026.1`
- **URL Primaria del Datasheet:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **URL Alternativa / Local:** `/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf`
- **Tipo de Fuente:** Hoja de Datos Técnicos Oficial en PDF (Sintético con numeración de secciones estables)

---

## Perfil Técnico Resumido (Vocabulario Normalizado)

| Propiedad (`property`) | Valor Normalizado (`normalized_value_json`) | Valor Mostrado (`display_value`) |
| :--- | :--- | :--- |
| `mounting` | `{"type": "panel mount", "standard": "1/16 DIN", "cutout_mm": "45x45", "front_bezel_mm": "48x48"}` | Montaje en panel frontal 1/16 DIN (48×48 mm) |
| `supply_voltage` | `{"type": "AC", "nominal": "100-240 VAC", "unit": "VAC", "frequency_hz": "50/60", "min": 85, "max": 264}` | 100 - 240 VAC universal (85 a 264 VAC) |
| `sensor_element` | `{"type": "RTD", "element": "Pt100", "wires": 3, "standard": "IEC 60751", "min_c": -200.0, "max_c": 600.0}` | Entrada Pt100 3 hilos |
| `analog_input` | `{"direction": "input", "channels": 0, "available": false}` | 0 canales (Sin entrada de corriente 4–20 mA) |
| `analog_output` | `{"direction": "output", "channels": 1, "signal": "current", "min": 4, "max": 20, "unit": "mA", "active_loop": true, "max_load_ohm": 500}` | SALIDA 4–20 mA activa para control proporcional modulante |
| `control_function` | `{"type": "PID", "features": ["auto-tuning", "manual_mode", "on-off"], "cycle_time_ms": 200}` | PID avanzado con auto-sintonía adaptativa (Auto-Tuning) |
| `protocol` | `{"name": "Modbus RTU", "role": "slave", "interface": "RS-485", "baudrates": [4800, 9600, 19200, 38400]}` | Modbus RTU RS-485 en modo ESCLAVO |
| `interface` | `{"type": "serial", "physical_layer": "RS-485", "duplex": "half-duplex", "isolation_v": 1000}` | RS-485 semidúplex aislado |

---

## Especificaciones Detalladas con Citación Formal

### Sección 1: Identificación y Modelo
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **página:** Pág. 1
- **sección:** Sección 1: Identificación y Modelo
- **excerpt descripción:** `"El controlador microprocesado modelo CN-PID-T1 (código SKU: CN-DEMO-PID-PT100-RS1) es un instrumento frontal especializado en regulación de lazo cerrado térmico con algoritmo de sintonización automática (Auto-Tuning) y salida de maniobra proporcional continua en corriente para actuadores modulantes."`
- **excerpt clasificación:** `"Regulador de Temperatura Digital PID Microprocesado"`
- **excerpt algoritmo:** `"PID avanzado con auto-sintonía adaptativa (Auto-Tuning) y modo manual / ON-OFF seleccionable"`
- **excerpt aplicación:** `"Control de temperatura de precisión en hornos industriales, extrusoras, reactores y marmitas"`

### Sección 2: Montaje Físico
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **página:** Pág. 1
- **sección:** Sección 2: Montaje Físico
- **excerpt tipo montaje:** `"Montaje exclusivo en panel frontal (Panel Mount / Cuadro de mando)"`
- **excerpt estándar modular:** `"Estándar dimensional 1/16 DIN (marco exterior frontal de 48 mm × 48 mm)"`
- **excerpt calado en panel:** `"45.0 mm (+0.5/-0) × 45.0 mm (+0.5/-0); apto para planchas de tablero de 1 a 8 mm de espesor"`
- **excerpt sujeción:** `"Brida plástica posterior desmontable tipo collarín con doble tornillo tensor de apriete frontal"`
- **excerpt dimensiones y grado:** `"48 × 48 × 95 mm (profundidad tras panel: 86 mm) / IP65 en carátula frontal con empaquetadura de goma"`
- **excerpt restricción riel DIN:** `"NO APTO PARA RIEL DIN. El equipo no posee base ni acople para carril DIN 35 mm"`

### Sección 3: Alimentación Eléctrica
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **página:** Pág. 1
- **sección:** Sección 3: Alimentación Eléctrica
- **excerpt tensión nominal:** `"100 - 240 VAC (50/60 Hz) tensión alterna universal"`
- **excerpt rango continuo admisible:** `"85 VAC a 264 VAC en régimen permanente sin degradación funcional"`
- **excerpt consumo de potencia:** `"6.5 VA máximo a 240 VAC con lazo de salida de corriente al 100% de carga"`
- **excerpt aislamiento:** `"2000 VAC (50/60 Hz) durante 1 minuto entre bornas de alimentación y terminales de señal de entrada"`
- **excerpt bornera trasera:** `"Regleta de 12 bornas traseras con tornillos M3 y separadores de barrera aislante"`

### Sección 4: Entradas / Salidas Analógicas y Sensores
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **página:** Pág. 2
- **sección:** Sección 4: Entradas / Salidas Analógicas y Sensores
- **excerpt entrada Pt100 (sensor PV):** `"Entrada Pt100 3 hilos (IEC 60751); compensación automática de cables hasta 20 Ω/hilo; rango: -200.0 °C a +600.0 °C; resolución 0.1 °C; ADC 16 bits; precisión ±0.2% escala"`
- **excerpt ausencia de entrada 4–20 mA:** `"EL EQUIPO NO DISPONE DE ENTRADA 4–20 mA. Salida ≠ Entrada. No admite lectura analógica de transmisores de presión o caudal"`
- **excerpt salida analógica de control:** `"SALIDA 4–20 mA proporcional de corriente activa para control PID modulante; DAC de 14 bits; carga máx. de lazo 500 Ω; alimentación activa interna; tiempo de ciclo analógico 200 ms"`
- **excerpt alarma discreta:** `"1 salida de contacto a relé electromecánico SPST (250 VAC / 3 A) configurable para alarma por alta/baja temp."`

### Sección 5: Comunicaciones y Protocolos
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **página:** Pág. 2
- **sección:** Sección 5: Comunicaciones y Protocolos
- **excerpt puerto serie:** `"1 × RS-485 semidúplex en bornes traseros (TRX+, TRX- y SG aislada), aislamiento galvánico de 1000 V"`
- **excerpt protocolo:** `"Modbus RTU RS-485 en modo ESCLAVO (Slave). Direccionamiento configurable por menú frontal entre 1 y 247"`
- **excerpt tasa de transmisión:** `"4800, 9600, 19200 y 38400 bps seleccionables desde panel frontal (defecto: 9600 bps, 8-N-1)"`
- **excerpt registros supervisados:** `"Holding Registers (PV: Temperatura actual, SP: Consigna, MV: Porcentaje de salida analógica, Kp, Ti, Td, Alarmas)"`
- **excerpt red Ethernet:** `"Sin conectividad Ethernet nativa; requiere transceptor o pasarela serie externa si se conecta a bus TCP"`

### Sección 6: Restricciones y Contraindicaciones de Diseño
- **source_id:** `SRC-CN-PID-T1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PID-PT100-RS1.pdf)
- **página:** Pág. 2
- **sección:** Sección 6: Restricciones y Contraindicaciones de Diseño
- **excerpt contraindicación montaje (Panel != DIN):** `"El CN-PID-T1 está diseñado estrictamente para montaje panel (Panel != DIN / Panel distinto de DIN). Está absolutamente contraindicado especificar o intentar fijar este equipo directamente sobre carril DIN 35 mm. No dispone de fijaciones DIN ni de perfiles homologados para fondo de armario."`
- **excerpt contraindicación 4–20 mA (Salida != Entrada):** `"El terminal de 4–20 mA de este instrumento es exclusivamente una SALIDA 4–20 mA de control proporcional (MV). Salida != Entrada (Salida != entrada 4–20): El equipo NO cuenta con entrada 4–20 mA. Su única entrada de medición de variable de proceso (PV) es una entrada Pt100 3 hilos. Queda prohibido conectar lazos de transmisores de presión o flujo a los bornes de entrada o salida."`
- **excerpt precaución de bucle activo:** `"La salida analógica 4–20 mA suministra su propia tensión de excitación de bucle (fuente interna activa). No conecte fuentes externas de alimentación en serie con este bucle; la inyección de tensión externa provocará la quema del conversor D/A."`
- **excerpt requisito de sonda:** `"Requiere entrada Pt100 3 hilos obligatoria. No conectar termocuplas (tipo J o K) ni sondas resistivas de 2 hilos sin compensación si se requiere la máxima precisión certificada."`
