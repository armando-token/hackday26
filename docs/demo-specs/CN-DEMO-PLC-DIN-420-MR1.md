# PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN

> **AVISO IMPORTANTE DE CONFORMIDAD:**
> Este equipo y sus especificaciones técnicas han sido generados sintéticamente de manera exclusiva para fines de demostración, pruebas funcionales y benchmarking de ingeniería de la Fase 1. No corresponde a un componente comercial físico activo.

---

# Ficha de Especificaciones Técnicas

## Identificación del Producto
- **Código SKU:** `CN-DEMO-PLC-DIN-420-MR1`
- **Modelo:** `CN-DIN-PLC-A1`
- **Denominación Técnica:** Controlador Lógico Programable para Riel DIN con Entradas Analógicas 4–20 mA y Modbus RTU
- **Línea de Producto:** Familia DIN-Logic Series Compact (Entorno Demostración)
- **Categoría:** Automatización y Control / PLCs Compactos

---

## Fuente Técnica Primaria y Control Documental
- **Identificador de Fuente (`source_id`):** `SRC-CN-DIN-PLC-A1-DS-V1`
- **Revisión del Documento (`revision`):** `rev-2026.1`
- **URL Primaria del Datasheet:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **URL Alternativa / Local:** `/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf`
- **Tipo de Fuente:** Hoja de Datos Técnicos Oficial en PDF (Sintético con numeración de secciones estables)

---

## Perfil Técnico Resumido (Vocabulario Normalizado)

| Propiedad (`property`) | Valor Normalizado (`normalized_value_json`) | Valor Mostrado (`display_value`) |
| :--- | :--- | :--- |
| `mounting` | `{"type": "DIN rail", "standard": "IEC/EN 60715", "size_mm": 35}` | Montaje en carril DIN 35 mm |
| `supply_voltage` | `{"type": "DC", "nominal": 24, "unit": "VDC", "min": 18.0, "max": 30.0}` | 24 VDC (18.0 a 30.0 VDC) |
| `analog_input` | `{"direction": "input", "channels": 2, "signal": "current", "min": 4, "max": 20, "unit": "mA", "resolution_bits": 12}` | 2 entradas analógicas 4–20 mA (12 bits) |
| `analog_output` | `{"direction": "output", "channels": 0, "available": false}` | 0 canales (Sin salidas analógicas) |
| `protocol` | `{"name": "Modbus RTU", "role": "slave", "baudrates": [9600, 19200, 38400, 57600, 115200]}` | Modbus RTU esclavo |
| `interface` | `{"type": "serial", "physical_layer": "RS-485", "duplex": "half-duplex", "isolation_v": 1000}` | RS-485 semidúplex aislado |
| `control_function` | `{"type": "PLC", "digital_inputs": 4, "digital_outputs": 4}` | PLC compacto con 4 DI y 4 DO |

---

## Especificaciones Detalladas con Citación Formal

### Sección 1: Identificación y Modelo
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **página:** Pág. 1
- **sección:** Sección 1: Identificación y Modelo
- **excerpt:** `"El microcontrolador industrial modelo CN-DIN-PLC-A1 (código SKU: CN-DEMO-PLC-DIN-420-MR1) es una estación compacta de adquisición y control lógico para cuadros eléctricos. Integra procesamiento embebido para la digitalización de variables analógicas de corriente estándar y enlaces de supervisión remota en buses serie."`
- **excerpt complementario:** `"Unidad lógica de adquisición descentralizada con reloj en tiempo real y memoria no volátil"`

### Sección 2: Montaje Físico
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **página:** Pág. 1
- **sección:** Sección 2: Montaje Físico
- **excerpt:** `"Montaje en carril DIN simétrico de 35 mm bajo norma internacional IEC / EN 60715 (perfiles TH35-7.5 y TH35-15)"`
- **excerpt dimensional:** `"90 mm (alto) × 70 mm (ancho, ocupación exacta de 4 módulos DIN estándar) × 58 mm (profundidad)"`
- **excerpt protección mecánica:** `"210 g / Grado de protección IP20 según IEC 60529 (diseñado exclusivamente para interior de tableros protegidos)"`
- **excerpt térmico:** `"25 mm de separación despejada por encima y por debajo respecto a canaletas u otros componentes"`

### Sección 3: Alimentación Eléctrica
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **página:** Pág. 1
- **sección:** Sección 3: Alimentación Eléctrica
- **excerpt:** `"24 VDC (tensión continua estabilizada)"`
- **excerpt rango operativo:** `"18.0 VDC a 30.0 VDC (con rizado residual admisible Vpp < 5%)"`
- **excerpt potencia y protección:** `"4.5 W máximo (con puertos de comunicación activos y bornas de entradas polarizadas)"` | `"Protección contra inversión de polaridad por diodo en serie, fusible PTC térmico rearmable y aislamiento 1500 VAC"`

### Sección 4: Entradas / Salidas Analógicas y Sensores
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **página:** Pág. 2
- **sección:** Sección 4: Entradas / Salidas Analógicas y Sensores
- **excerpt entrada analógica:** `"2 canales (AI1, AI2)"` | `"Lazo de corriente 4–20 mA pasivo; impedancia de entrada shunt de 250 Ω; resolución ADC de 12 bits (4096 cuentas); precisión global ±0.2% del fondo de escala; filtrado digital configurable"`
- **excerpt salida analógica (ausencia total):** `"0 canales (NINGUNA)"` | `"NO DISPONE DE SALIDAS ANALÓGICAS. El hardware carece de DAC y de etapas de corriente 4–20 mA o tensión 0–10 V"`
- **excerpt entradas digitales:** `"Entradas discretas optoacopladas 24 VDC (PNP / tipo sink), consumo 5 mA por canal a 24 V"`
- **excerpt salidas digitales:** `"Salidas a contacto seco por relé electromecánico SPST-NO (250 VAC / 30 VDC, 2 A máx. resistivo)"`

### Sección 5: Comunicaciones y Protocolos
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **página:** Pág. 2
- **sección:** Sección 5: Comunicaciones y Protocolos
- **excerpt puerto serie:** `"1 × RS-485 semidúplex (2 hilos: bornes A/D+, B/D- y GND aislada), con resistencia terminadora de 120 Ω seleccionable"`
- **excerpt protocolo y modo:** `"Modbus RTU en modo ESCLAVO (Slave / Servidor). Identificación de nodo configurable entre 1 y 247"`
- **excerpt velocidad de bus:** `"Configurable mediante software o microinterruptores: 9600, 19200, 38400, 57600 y 115200 bps (defecto: 19200 bps)"`
- **excerpt formato de trama:** `"8 bits de datos, paridad seleccionable (Par, Impar, Ninguna), 1 o 2 bits de parada (trama por defecto: 8-E-1)"`
- **excerpt Ethernet / TCP (no soportado):** `"NO SOPORTADO. El equipo carece de controlador Ethernet, puerto RJ-45 o pila de protocolos TCP/IP"`

### Sección 6: Restricciones y Contraindicaciones de Diseño
- **source_id:** `SRC-CN-DIN-PLC-A1-DS-V1`
- **revision:** `rev-2026.1`
- **URL:** [https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf](https://controlnautas.com/demo/datasheets/CN-DEMO-PLC-DIN-420-MR1.pdf)
- **página:** Pág. 2
- **sección:** Sección 6: Restricciones y Contraindicaciones de Diseño
- **excerpt contraindicación Modbus TCP:** `"El modelo CN-DIN-PLC-A1 NO cuenta con interfaz Ethernet ni soporta el protocolo Modbus TCP. Bajo ninguna circunstancia debe asumirse conectividad IP directa a redes SCADA ethernetizadas. Toda integración en redes basadas en paquetes TCP/IP exige obligatoriamente un convertidor o gateway pasarela externo RS-485 a Modbus TCP."`
- **excerpt contraindicación salida analógica:** `"El equipo NO posee ninguna salida analógica de control (ni 4–20 mA ni 0–10 V). Está terminantemente contraindicado prescribir este SKU para la modulación continua directa de variadores de velocidad, posicionadores electroneumáticos de válvulas reguladoras o actuadores analógicos sin incorporar módulos de expansión adicionales."`
- **excerpt contraindicación maestro:** `"El transceptor RS-485 opera únicamente como esclavo Modbus RTU. No dispone de capacidad para iniciar consultas de polling maestro ni actuar como cliente de red hacia otros dispositivos periféricos."`
- **excerpt restricción bucle pasivo:** `"Los bornes AI1 y AI2 son receptores pasivos (resistencia shunt interna); no inyectan tensión de excitación. Los transmisores externos conectados deben alimentarse mediante un bucle cerrado con fuente externa de 24 VDC."`
