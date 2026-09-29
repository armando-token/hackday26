# PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN

> **AVISO IMPORTANTE DE CONFORMIDAD:**
> Este equipo y sus especificaciones técnicas han sido generados sintéticamente de manera exclusiva para fines de demostración, pruebas funcionales y benchmarking de ingeniería de la Fase 1. No corresponde a un componente comercial físico activo.

---

# Ficha de Especificaciones Técnicas

## Identificación del Producto
- **Código SKU:** `CN-DEMO-PT100-3W-A1`
- **Modelo:** `CN-RTD-P1`
- **Denominación Técnica:** Sonda Industrial de Temperatura RTD Pt100 Pasiva de 3 Hilos en Acero Inoxidable
- **Línea de Producto:** Familia Sensor-Pro Inox Series (Entorno Demostración)
- **Categoría:** Sensores de Temperatura Primarios / Termorresistencias (RTD)

---

## Fuente Técnica Primaria y Control Documental
- **Identificador de Fuente (`source_id`):** `SRC-CN-RTD-P1-DS-V1`
- **Revisión del Documento (`revision`):** `rev-2026.1`
- **URL Primaria del Datasheet:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **URL Alternativa / Local:** `/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf`
- **Tipo de Fuente:** Hoja de Datos Técnicos Oficial en PDF (Sintético con numeración de secciones estables)

---

## Perfil Técnico Resumido (Vocabulario Normalizado)

| Propiedad (`property`) | Valor Normalizado (`normalized_value_json`) | Valor Mostrado (`display_value`) |
| :--- | :--- | :--- |
| `sensor_element` | `{"type": "RTD", "element": "Pt100", "wires": 3, "class": "A", "standard": "IEC 60751", "r0_ohm": 100.0, "alpha": 0.00385, "min_c": -50.0, "max_c": 350.0}` | Sensor termorresistencia Pt100 Clase A, 3 hilos (-50 a +350 °C) |
| `mounting` | `{"type": "threaded probe", "thread": "1/2 NPT", "material": "AISI 316L", "diameter_mm": 6.0, "length_mm": 150}` | Sonda de inmersión roscada 1/2" NPT, vaina AISI 316L 6×150 mm |
| `supply_voltage` | `{"type": "passive", "external_power": false, "nominal_v": 0, "excitation_current_ma_min": 0.1, "excitation_current_ma_max": 1.0}` | SIN ALIMENTACIÓN PROPIA (componente Pt100 3 hilos pasivo) |
| `analog_input` | `{"direction": "input", "channels": 0, "available": false}` | 0 canales (No aplica) |
| `analog_output` | `{"direction": "output", "channels": 0, "available": false, "notes": "No 4-20 mA por sí solo ni voltaje"}` | 0 canales (Sin transmisor integrado; No 4–20 mA por sí solo) |
| `interface` | `{"type": "none", "digital_interface": false, "cable_length_m": 2.0, "cable_wires": 3}` | SIN INTERFAZ DIGITAL (0 interfaces; cable flexible 3 hilos) |
| `protocol` | `{"name": "none", "supported": false, "notes": "NO MODBUS POR SÍ SOLO"}` | Ninguno (NO MODBUS POR SÍ SOLO) |

---

## Especificaciones Detalladas con Citación Formal

### Sección 1: Identificación y Modelo
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **página:** Pág. 1
- **sección:** Sección 1: Identificación y Modelo
- **excerpt descripción:** `"El sensor primario de temperatura modelo CN-RTD-P1 (código SKU: CN-DEMO-PT100-3W-A1) es una sonda pasiva Pt100 3 hilos con elemento termorresistivo de platino bobinado para inserción en fluidos térmicos y procesos industriales. Cumple rigurosamente con la relación resistencia-temperatura internacional bajo norma IEC 60751."`
- **excerpt clasificación:** `"Sonda de inmersión / Pt100 3 hilos pasivo (SIN transmisor integrado, SIN interfaz digital)"`
- **excerpt principio físico:** `"Termorresistencia de platino puro con variación de resistencia eléctrica dependiente de la temperatura"`
- **excerpt aplicación:** `"Medición directa en líneas de tubería, intercambiadores de calor, tanques y termopozos"`

### Sección 2: Montaje Físico
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **página:** Pág. 1
- **sección:** Sección 2: Montaje Físico
- **excerpt fijación:** `"Montaje roscado directo a proceso mediante racor fijo macho de 1/2 pulgada NPT"`
- **excerpt material de vaina:** `"Sonda en vaina de acero inoxidable austenítico grado AISI 316L (1.4404) de alta pureza química"`
- **excerpt dimensiones:** `"Diámetro exterior: 6.0 mm | Longitud útil sumergible en proceso: 150 mm"`
- **excerpt presión:** `"Presión hidrostática de servicio admisible hasta 40 bar a 20 °C (25 bar a 200 °C)"`
- **excerpt cable:** `"Manguera apantallada flexible de 2.0 metros con cubierta de teflón / silicona resistente a aceite y calor"`
- **excerpt terminales:** `"3 conductores flexibles con punteras de cobre estañado (ferrules): 2 rojos (retorno común) y 1 blanco"`

### Sección 3: Alimentación Eléctrica
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **página:** Pág. 1
- **sección:** Sección 3: Alimentación Eléctrica
- **excerpt pasividad eléctrica:** `"SIN ALIMENTACIÓN PROPIA (0 VDC / 0 VAC). Es un componente Pt100 3 hilos pasivo"`
- **excerpt excitación nominal:** `"0.1 mA a 1.0 mA DC constante (suministrada externamente por el puente de medición o PLC/PID)"`
- **excerpt corriente máxima:** `"2.0 mA DC (límite térmico estricto para prevenir el error por autocalentamiento Joule)"`
- **excerpt aislamiento:** `"Resistencia de aislamiento > 100 MΩ a 500 VDC entre los conductores internos y la vaina metálica"`
- **excerpt prohibición tensión:** `"PROHIBIDA LA APLICACIÓN DE TENSIÓN DIRECTA. Toda tensión fija quema el elemento"`

### Sección 4: Entradas / Salidas Analógicas y Sensores
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **página:** Pág. 2
- **sección:** Sección 4: Entradas / Salidas Analógicas y Sensores
- **excerpt elemento sensor:** `"Platino puro bobinado / película delgada Pt100 según norma europea DIN EN 60751"`
- **excerpt resistencia base:** `"R0 = 100.00 Ω nominal a 0.00 °C (coeficiente térmico alfa α = 0.003850 Ω/Ω/°C)"`
- **excerpt precisión metrológica:** `"Clase A según IEC 60751: Tolerancia ±(0.15 + 0.002·|t|) °C (ej. ±0.15 °C a 0 °C, ±0.35 °C a 100 °C)"`
- **excerpt rango térmico continuo:** `"-50.0 °C a +350.0 °C de temperatura continua sobre la vaina de acero inoxidable AISI 316L"`
- **excerpt cableado 3 hilos:** `"Pt100 3 hilos pasivo con doble hilo común para compensación de resistencia de línea"`
- **excerpt ausencia transmisor:** `"SIN TRANSMISOR INTEGRADO (0 transmisores). No incluye electrónica de acondicionamiento"`
- **excerpt salida eléctrica:** `"Resistencia óhmica pura pasiva dependiente de la temperatura. No 4–20 mA por sí solo"`

### Sección 5: Comunicaciones y Protocolos
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **página:** Pág. 2
- **sección:** Sección 5: Comunicaciones y Protocolos
- **excerpt interfaz digital:** `"SIN INTERFAZ DIGITAL (0 interfaces). La sonda carece de microprocesador, UART, circuito integrado o puerto serie"`
- **excerpt protocolo bus:** `"NO APLICA / NO MODBUS POR SÍ SOLO. No posee capacidad de comunicación digital por bus de datos"`
- **excerpt modulación de bus:** `"No soportado de manera nativa (dispositivo sin modulación digital de señal)"`
- **excerpt integración con PLC/PID:** `"Para leer esta sonda en un bus Modbus o PLC, se requiere cablearla a la entrada directa RTD de un regulador (como el modelo CN-PID-T1) o asociarla a un transmisor de cabezal/riel externo conversor de RTD a Modbus / 4–20 mA"`

### Sección 6: Restricciones y Contraindicaciones de Diseño
- **source_id:** `SRC-CN-RTD-P1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PT100-3W-A1.pdf)
- **página:** Pág. 2
- **sección:** Sección 6: Restricciones y Contraindicaciones de Diseño
- **excerpt contraindicación 4–20 mA:** `"El modelo CN-RTD-P1 es una sonda resistiva pasiva SIN TRANSMISOR INTEGRADO. Bajo ninguna circunstancia genera señal: No 4–20 mA por sí solo ni emite tensión normalizada. Está terminantemente prohibido conectar directamente esta sonda a las entradas analógicas 4–20 mA de un PLC (como las de CN-DIN-PLC-A1) sin interponer previamente un transmisor o acondicionador de señal específico para RTD Pt100."`
- **excerpt contraindicación Modbus / digital:** `"El sensor posee SIN INTERFAZ DIGITAL y NO MODBUS POR SÍ SOLO. No puede ser interrogado, direccionado ni conectado a pares trenzados RS-485. Intentar conectarlo a una red Modbus por sí solo resultará en falla total."`
- **excerpt peligro de tensión directa:** `"Jamás aplique tensión de red (220 VAC, 110 VAC) ni fuentes continuas (24 VDC, 12 VDC) a los hilos de la sonda. Una corriente superior a unos pocos miliamperios fundirá instantáneamente el filamento de platino de 100 Ω, destruyendo el sensor de forma irreversible."`
- **excerpt conexión 3 hilos:** `"Conectar siempre los dos hilos de igual color (rojos) a las bornas de compensación del lector para asegurar la anulación del error por longitud de cable."`
