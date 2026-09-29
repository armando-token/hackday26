#!/usr/bin/env python3
"""
Script: generate-synthetic-datasheets.py
Descripción: Generador de Datasheets sintéticos en PDF para los SKUs obligatorios de la Fase 1:
  1. CN-DEMO-PLC-DIN-420-MR1 (Modelo: CN-DIN-PLC-A1)
  2. CN-DEMO-PID-PT100-RS1   (Modelo: CN-PID-T1)
  3. CN-DEMO-PT100-3W-A1     (Modelo: CN-RTD-P1)

Destinos:
  - /home/ubuntu/hackday26/docs/datasheets/
  - /home/ubuntu/hackday26/b2b-backend/apps/backend/static/demo/datasheets/

Requisitos cumplidos:
  - Visible de forma destacada: "PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN"
  - Cabecera y pie de cada página con "SIMULACIÓN"
  - Secciones numeradas estables para citación:
      Sección 1: Identificación y Modelo
      Sección 2: Montaje Físico
      Sección 3: Alimentación Eléctrica
      Sección 4: Entradas / Salidas Analógicas y Sensores
      Sección 5: Comunicaciones y Protocolos
      Sección 6: Restricciones y Contraindicaciones de Diseño
  - Hechos técnicos obligatorios y contraindicaciones explícitas de diseño
  - Cálculo y reporte de checksums SHA-256
"""

import os
import sys
import shutil
import hashlib
from typing import List, Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY


class NumberedCanvas(canvas.Canvas):
    """
    Canvas de doble pasada para calcular el número total de páginas y estampar
    cabecera y pie con marcas de 'SIMULACIÓN' en todas las páginas.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count: int):
        self.saveState()
        
        # --- CABECERA ---
        # Marca roja obligatoria de SIMULACIÓN
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#DC2626'))
        self.drawString(36, 762, "SIMULACIÓN — AMBIENTE DE DEMOSTRACIÓN TÉCNICA")
        
        # Identificador del documento a la derecha
        sku_model = getattr(self, '_doc_sku_model', 'DEMO PRODUCT')
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#475569'))
        self.drawRightString(576, 762, sku_model)
        
        # Línea divisoria de cabecera
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.6)
        self.line(36, 755, 576, 755)
        
        # --- PIE DE PÁGINA ---
        # Línea divisoria de pie
        self.line(36, 44, 576, 44)
        
        # Marca roja obligatoria de SIMULACIÓN en pie
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#DC2626'))
        self.drawString(36, 32, "SIMULACIÓN")
        
        # Texto complementario en pie
        self.setFont('Helvetica', 7.5)
        self.setFillColor(colors.HexColor('#64748B'))
        self.drawString(98, 32, "|   PRODUCTO FICTICIO PARA DATOS DE DEMOSTRACIÓN   |   FASE 1 BENCHMARK")
        
        # Numeración de página
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#334155'))
        self.drawRightString(576, 32, page_str)
        
        self.restoreState()


def make_canvas(sku_model_str: str):
    """Fábrica de clases Canvas con contexto de SKU y Modelo."""
    class CustomCanvas(NumberedCanvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._doc_sku_model = sku_model_str
    return CustomCanvas


def calculate_sha256(filepath: str) -> str:
    """Calcula el hash SHA-256 de un archivo binario."""
    sha = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()


def create_styles():
    """Genera la paleta de estilos tipográficos estandarizados."""
    base = getSampleStyleSheet()
    
    return {
        'doc_title': ParagraphStyle(
            'DocTitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=13, leading=16,
            textColor=colors.HexColor('#0F172A')
        ),
        'doc_subtitle': ParagraphStyle(
            'DocSubtitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=9, leading=11.5,
            textColor=colors.HexColor('#1E3A8A')
        ),
        'banner_title': ParagraphStyle(
            'BannerTitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=9.5, leading=11.5,
            textColor=colors.HexColor('#991B1B'), alignment=TA_CENTER
        ),
        'banner_text': ParagraphStyle(
            'BannerText', parent=base['Normal'],
            fontName='Helvetica', fontSize=7, leading=9,
            textColor=colors.HexColor('#7F1D1D'), alignment=TA_CENTER
        ),
        'meta_label': ParagraphStyle(
            'MetaLabel', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7.2, leading=9,
            textColor=colors.HexColor('#0F2942')
        ),
        'meta_val': ParagraphStyle(
            'MetaVal', parent=base['Normal'],
            fontName='Helvetica', fontSize=7.2, leading=9,
            textColor=colors.HexColor('#1E293B')
        ),
        'sec_head': ParagraphStyle(
            'SecHead', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=9, leading=11,
            textColor=colors.HexColor('#0F2942'),
            spaceBefore=4, spaceAfter=2
        ),
        'body': ParagraphStyle(
            'Body', parent=base['Normal'],
            fontName='Helvetica', fontSize=7.2, leading=9.2,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=1, spaceAfter=2
        ),
        'th': ParagraphStyle(
            'TableHead', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7.2, leading=9,
            textColor=colors.white
        ),
        'td_param': ParagraphStyle(
            'TableCellParam', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7, leading=8.8,
            textColor=colors.HexColor('#0F2942')
        ),
        'td_val': ParagraphStyle(
            'TableCellVal', parent=base['Normal'],
            fontName='Helvetica', fontSize=7, leading=8.8,
            textColor=colors.HexColor('#1E293B')
        ),
        'warn_head': ParagraphStyle(
            'WarnHead', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7.2, leading=9,
            textColor=colors.HexColor('#991B1B')
        ),
        'warn_body': ParagraphStyle(
            'WarnBody', parent=base['Normal'],
            fontName='Helvetica', fontSize=6.8, leading=8.5,
            textColor=colors.HexColor('#7F1D1D')
        ),
    }


def build_banner(styles):
    """Construye el banner visual obligatorio destacado de producto ficticio."""
    banner_data = [
        [Paragraph("★ PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN ★", styles['banner_title'])],
        [Paragraph(
            "AVISO OBLIGATORIO DE CONFORMIDAD: Este equipo y sus especificaciones técnicas han sido "
            "generados sintéticamente de manera exclusiva para fines de demostración, pruebas funcionales "
            "y benchmarking de ingeniería de la Fase 1. No corresponde a un componente comercial físico activo.",
            styles['banner_text']
        )]
    ]
    t = Table(banner_data, colWidths=[540])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEE2E2')),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#EF4444')),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    return t


def build_meta_table(styles, sku: str, modelo: str, categoria: str, rev: str = "1.0 (Demostración)"):
    """Construye la ficha de metadatos estandarizada."""
    data = [
        [
            Paragraph("<b>SKU:</b>", styles['meta_label']),
            Paragraph(sku, styles['meta_val']),
            Paragraph("<b>Modelo:</b>", styles['meta_label']),
            Paragraph(modelo, styles['meta_val'])
        ],
        [
            Paragraph("<b>Categoría:</b>", styles['meta_label']),
            Paragraph(categoria, styles['meta_val']),
            Paragraph("<b>Fabricante / Rev:</b>", styles['meta_label']),
            Paragraph(f"ControlNet Demo Systems | {rev}", styles['meta_val'])
        ]
    ]
    t = Table(data, colWidths=[70, 200, 95, 175])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    return t


def build_spec_table(styles, rows: List[List[str]], col_widths: List[int] = [150, 390]):
    """Construye una tabla técnica estándar de dos columnas con cabecera corporativa."""
    table_data = [
        [Paragraph(rows[0][0], styles['th']), Paragraph(rows[0][1], styles['th'])]
    ]
    for param, val in rows[1:]:
        table_data.append([
            Paragraph(param, styles['td_param']),
            Paragraph(val, styles['td_val'])
        ])
    
    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    return t


def build_three_col_table(styles, rows: List[List[str]], col_widths: List[int] = [130, 85, 325]):
    """Construye una tabla técnica de tres columnas para desglose de canales I/O."""
    table_data = [
        [Paragraph(rows[0][0], styles['th']), Paragraph(rows[0][1], styles['th']), Paragraph(rows[0][2], styles['th'])]
    ]
    for col1, col2, col3 in rows[1:]:
        table_data.append([
            Paragraph(col1, styles['td_param']),
            Paragraph(col2, styles['td_param']),
            Paragraph(col3, styles['td_val'])
        ])
    
    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E3A8A')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    return t


def build_contraindications_table(styles, rows: List[List[str]], col_widths: List[int] = [150, 390]):
    """Construye la tabla destacada de la Sección 6 con advertencias rojas de diseño."""
    table_data = [
        [Paragraph("Restricción / Contraindicación Crítica", styles['th']), Paragraph("Fundamento Técnico y Regla de Exclusión de Diseño", styles['th'])]
    ]
    for param, val in rows:
        table_data.append([
            Paragraph(param, styles['warn_head']),
            Paragraph(val, styles['warn_body'])
        ])
    
    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#991B1B')),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#FEF2F2')),
        ('GRID', (0,0), (-1,-1), 0.6, colors.HexColor('#F87171')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    return t


# ==============================================================================
# DEFINICIÓN ESPECÍFICA DE CADA SKU OBLIGATORIO
# ==============================================================================

def generate_sku1_elements(styles) -> List[Any]:
    """
    SKU 1: CN-DEMO-PLC-DIN-420-MR1
    Modelo: CN-DIN-PLC-A1
    Hechos obligatorios:
      - Montaje DIN 35 mm
      - 24 VDC
      - 2 entradas analógicas 4–20 mA
      - RS-485
      - Modbus RTU slave
    Contraejemplos / no afirmar:
      - No afirmar Modbus TCP
      - No salida analógica
    """
    story = []
    
    # Banner y Título
    story.append(build_banner(styles))
    story.append(Spacer(1, 3))
    story.append(Paragraph("HOJA DE DATOS TÉCNICOS / DATASHEET", styles['doc_title']))
    story.append(Paragraph("Controlador Lógico Programable para Riel DIN con Entradas Analógicas 4–20 mA y Modbus RTU", styles['doc_subtitle']))
    story.append(Spacer(1, 3))
    
    # Metadata Card
    story.append(build_meta_table(
        styles,
        sku="CN-DEMO-PLC-DIN-420-MR1",
        modelo="CN-DIN-PLC-A1",
        categoria="Automatización y Control / PLCs Compactos"
    ))
    story.append(Spacer(1, 4))
    
    # Sección 1: Identificación y Modelo
    story.append(Paragraph("Sección 1: Identificación y Modelo", styles['sec_head']))
    story.append(Paragraph(
        "El microcontrolador industrial modelo <b>CN-DIN-PLC-A1</b> (código SKU: <b>CN-DEMO-PLC-DIN-420-MR1</b>) "
        "es una estación compacta de adquisición y control lógico para cuadros eléctricos. Integra procesamiento embebido "
        "para la digitalización de variables analógicas de corriente estándar y enlaces de supervisión remota en buses serie.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro de Identificación", "Especificación de Catálogo"],
        ["Código SKU", "CN-DEMO-PLC-DIN-420-MR1"],
        ["Designación de Modelo", "CN-DIN-PLC-A1"],
        ["Línea de Fabricación", "Familia DIN-Logic Series Compact (Entorno Demostración)"],
        ["Arquitectura de Control", "Unidad lógica de adquisición descentralizada con reloj en tiempo real y memoria no volátil"],
        ["Ámbito de Aplicación", "Monitoreo de procesos térmicos, bombeo de fluidos y telemetría por bus serie"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 2: Montaje Físico
    story.append(Paragraph("Sección 2: Montaje Físico", styles['sec_head']))
    story.append(Paragraph(
        "Equipo modular preparado para fijación directa en chasis normalizados de distribución interior.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro Físico-Mecánico", "Valor Nominal y Características de Montaje"],
        ["Tipo de Montaje", "Montaje en carril DIN simétrico de 35 mm bajo norma internacional IEC / EN 60715 (perfiles TH35-7.5 y TH35-15)"],
        ["Mecanismo de Retención", "Fijación por clip / trinquete elástico posterior con pestillo de liberación accionado por destornillador plano"],
        ["Dimensiones Totales", "90 mm (alto) × 70 mm (ancho, ocupación exacta de 4 módulos DIN estándar) × 58 mm (profundidad)"],
        ["Masa Neta / Grado IP", "210 g / Grado de protección IP20 según IEC 60529 (diseñado exclusivamente para interior de tableros protegidos)"],
        ["Distancia Térmica Mínima", "25 mm de separación despejada por encima y por debajo respecto a canaletas u otros componentes"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 3: Alimentación Eléctrica
    story.append(Paragraph("Sección 3: Alimentación Eléctrica", styles['sec_head']))
    story.append(Paragraph(
        "Circuito de alimentación en corriente continua optimizado para fuentes conmutadas industriales con aislamiento galvánico.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro Eléctrico", "Requerimiento y Límites de Operación"],
        ["Tensión Nominal", "24 VDC (tensión continua estabilizada)"],
        ["Rango Admisible Continuo", "18.0 VDC a 30.0 VDC (con rizado residual admisible Vpp < 5%)"],
        ["Consumo de Potencia", "4.5 W máximo (con puertos de comunicación activos y bornas de entradas polarizadas)"],
        ["Bornera de Entrada", "Bloque de terminales de tornillo enchufable, sección admisible de conductor: 0.5 a 2.5 mm² (AWG 20-14)"],
        ["Protección y Aislamiento", "Protección contra inversión de polaridad por diodo en serie, fusible PTC térmico rearmable y aislamiento 1500 VAC"]
    ]))
    
    # Salto de página a la Página 2
    story.append(PageBreak())
    
    # Sección 4: Entradas / Salidas Analógicas y Sensores
    story.append(Paragraph("Sección 4: Entradas / Salidas Analógicas y Sensores", styles['sec_head']))
    story.append(Paragraph(
        "Configuración de señales de campo. Cuenta con dos lazos analógicos de corriente normalizada y carece de salidas modulantes.",
        styles['body']
    ))
    story.append(build_three_col_table(styles, [
        ["Tipo de Canal", "Dotación", "Detalle Técnico y Características de la Señal"],
        ["Entradas Analógicas", "2 canales (AI1, AI2)", "Lazo de corriente 4–20 mA pasivo; impedancia de entrada shunt de 250 Ω; resolución ADC de 12 bits (4096 cuentas); precisión global ±0.2% del fondo de escala; filtrado digital configurable"],
        ["Salidas Analógicas", "0 canales (NINGUNA)", "<b>NO DISPONE DE SALIDAS ANALÓGICAS.</b> El hardware carece de DAC y de etapas de corriente 4–20 mA o tensión 0–10 V"],
        ["Entradas Digitales", "4 canales (DI1..DI4)", "Entradas discretas optoacopladas 24 VDC (PNP / tipo sink), consumo 5 mA por canal a 24 V"],
        ["Salidas Digitales", "4 canales (DO1..DO4)", "Salidas a contacto seco por relé electromecánico SPST-NO (250 VAC / 30 VDC, 2 A máx. resistivo)"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 5: Comunicaciones y Protocolos
    story.append(Paragraph("Sección 5: Comunicaciones y Protocolos", styles['sec_head']))
    story.append(Paragraph(
        "Puerto serie industrial para comunicación y telemetría en redes de control jerárquico.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro de Red", "Configuración Soportada y Protocolo"],
        ["Interfaz Física de Bus", "1 × RS-485 semidúplex (2 hilos: bornes A/D+, B/D- y GND aislada), con resistencia terminadora de 120 Ω seleccionable"],
        ["Protocolo Industrial", "Modbus RTU en modo ESCLAVO (Slave / Servidor). Identificación de nodo configurable entre 1 y 247"],
        ["Velocidades de Baudios", "Configurable mediante software o microinterruptores: 9600, 19200, 38400, 57600 y 115200 bps (defecto: 19200 bps)"],
        ["Formato de Carácter", "8 bits de datos, paridad seleccionable (Par, Impar, Ninguna), 1 o 2 bits de parada (trama por defecto: 8-E-1)"],
        ["Funciones Modbus", "Funciones soportadas: 01 (Read Coils), 02 (Read Discrete Inputs), 03 (Read Holding Regs), 04 (Read Input Regs: AI1/AI2)"],
        ["Modbus TCP / Red Ethernet", "<b>NO SOPORTADO.</b> El equipo carece de controlador Ethernet, puerto RJ-45 o pila de protocolos TCP/IP"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 6: Restricciones y Contraindicaciones de Diseño
    story.append(Paragraph("Sección 6: Restricciones y Contraindicaciones de Diseño", styles['sec_head']))
    story.append(Paragraph(
        "Criterios de exclusión técnica de observancia obligatoria para arquitecturas e ingeniería de integración:",
        styles['body']
    ))
    story.append(build_contraindications_table(styles, [
        [
            "CONTRAINDICACIÓN 1:<br/>NO AFIRMAR NI DISEÑAR MODBUS TCP",
            "El modelo CN-DIN-PLC-A1 <b>NO cuenta con interfaz Ethernet ni soporta el protocolo Modbus TCP</b>. "
            "Bajo ninguna circunstancia debe asumirse conectividad IP directa a redes SCADA ethernetizadas. "
            "Toda integración en redes basadas en paquetes TCP/IP exige obligatoriamente un convertidor o gateway pasarela externo RS-485 a Modbus TCP."
        ],
        [
            "CONTRAINDICACIÓN 2:<br/>NO DISPONE DE SALIDA ANALÓGICA",
            "El equipo <b>NO posee ninguna salida analógica de control (ni 4–20 mA ni 0–10 V)</b>. "
            "Está terminantemente contraindicado prescribir este SKU para la modulación continua directa de variadores de velocidad, "
            "posicionadores electroneumáticos de válvulas reguladoras o actuadores analógicos sin incorporar módulos de expansión adicionales."
        ],
        [
            "CONTRAINDICACIÓN 3:<br/>OPERACIÓN ESCLAVO EXCLUSIVA",
            "El transceptor RS-485 opera únicamente como <b>esclavo Modbus RTU</b>. No dispone de capacidad para iniciar consultas de polling maestro "
            "ni actuar como cliente de red hacia otros dispositivos periféricos."
        ],
        [
            "RESTRICCIÓN DE ALIMENTACIÓN:<br/>ENTRADAS 4–20 mA PASIVAS",
            "Los bornes AI1 y AI2 son receptores pasivos (resistencia shunt interna); no inyectan tensión de excitación. "
            "Los transmisores externos conectados deben alimentarse mediante un bucle cerrado con fuente externa de 24 VDC."
        ]
    ]))
    
    return story


def generate_sku2_elements(styles) -> List[Any]:
    """
    SKU 2: CN-DEMO-PID-PT100-RS1
    Modelo: CN-PID-T1
    Hechos obligatorios:
      - Montaje panel (1/16 DIN 48x48 mm)
      - Entrada Pt100 3 hilos
      - PID digital con auto-tuning
      - SALIDA 4–20 mA
      - Modbus RTU RS-485
    Contraejemplos / no afirmar:
      - Panel ≠ DIN
      - Salida ≠ Entrada 4–20
    """
    story = []
    
    # Banner y Título
    story.append(build_banner(styles))
    story.append(Spacer(1, 3))
    story.append(Paragraph("HOJA DE DATOS TÉCNICOS / DATASHEET", styles['doc_title']))
    story.append(Paragraph("Controlador Digital de Temperatura PID para Panel con Entrada Pt100 y Salida Analógica 4–20 mA", styles['doc_subtitle']))
    story.append(Spacer(1, 3))
    
    # Metadata Card
    story.append(build_meta_table(
        styles,
        sku="CN-DEMO-PID-PT100-RS1",
        modelo="CN-PID-T1",
        categoria="Instrumentación y Control / Reguladores PID"
    ))
    story.append(Spacer(1, 4))
    
    # Sección 1: Identificación y Modelo
    story.append(Paragraph("Sección 1: Identificación y Modelo", styles['sec_head']))
    story.append(Paragraph(
        "El controlador microprocesado modelo <b>CN-PID-T1</b> (código SKU: <b>CN-DEMO-PID-PT100-RS1</b>) "
        "es un instrumento frontal especializado en regulación de lazo cerrado térmico con algoritmo de sintonización automática "
        "(Auto-Tuning) y salida de maniobra proporcional continua en corriente para actuadores modulantes.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro de Identificación", "Especificación de Catálogo"],
        ["Código SKU", "CN-DEMO-PID-PT100-RS1"],
        ["Designación de Modelo", "CN-PID-T1"],
        ["Tipo de Instrumento", "Regulador de Temperatura Digital PID Microprocesado"],
        ["Algoritmo de Control", "PID avanzado con auto-sintonía adaptativa (Auto-Tuning) y modo manual / ON-OFF seleccionable"],
        ["Aplicación Típica", "Control de temperatura de precisión en hornos industriales, extrusoras, reactores y marmitas"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 2: Montaje Físico
    story.append(Paragraph("Sección 2: Montaje Físico", styles['sec_head']))
    story.append(Paragraph(
        "Diseño mecánico concebido exclusivamente para embutir en carátula o puerta ciega de cuadros de control.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro Físico-Mecánico", "Valor Nominal y Características de Montaje"],
        ["Tipo de Montaje", "<b>Montaje exclusivo en panel frontal (Panel Mount / Cuadro de mando)</b>"],
        ["Formato Normalizado", "Estándar dimensional 1/16 DIN (marco exterior frontal de 48 mm × 48 mm)"],
        ["Medida de Recorte (Cutout)", "45.0 mm (+0.5/-0) × 45.0 mm (+0.5/-0); apto para planchas de tablero de 1 a 8 mm de espesor"],
        ["Mecanismo de Anclaje", "Brida plástica posterior desmontable tipo collarín con doble tornillo tensor de apriete frontal"],
        ["Dimensiones y Estanqueidad", "48 × 48 × 95 mm (profundidad tras panel: 86 mm) / IP65 en carátula frontal con empaquetadura de goma"],
        ["Restricción Estructural", "<b>NO APTO PARA RIEL DIN.</b> El equipo no posee base ni acople para carril DIN 35 mm"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 3: Alimentación Eléctrica
    story.append(Paragraph("Sección 3: Alimentación Eléctrica", styles['sec_head']))
    story.append(Paragraph(
        "Fuente interna conmutada de rango universal con supresión de armónicos para entornos industriales severos.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro Eléctrico", "Requerimiento y Límites de Operación"],
        ["Tensión Nominal de Operación", "100 - 240 VAC (50/60 Hz) tensión alterna universal"],
        ["Tolerancia Admisible", "85 VAC a 264 VAC en régimen permanente sin degradación funcional"],
        ["Potencia Consumida", "6.5 VA máximo a 240 VAC con lazo de salida de corriente al 100% de carga"],
        ["Aislamiento Dieléctrico", "2000 VAC (50/60 Hz) durante 1 minuto entre bornas de alimentación y terminales de señal de entrada"],
        ["Conectividad Posterior", "Regleta de 12 bornas traseras con tornillos M3 y separadores de barrera aislante"]
    ]))
    
    # Salto de página a la Página 2
    story.append(PageBreak())
    
    # Sección 4: Entradas / Salidas Analógicas y Sensores
    story.append(Paragraph("Sección 4: Entradas / Salidas Analógicas y Sensores", styles['sec_head']))
    story.append(Paragraph(
        "Configuración crítica de transductores. La variable de proceso admite exclusivamente RTD Pt100 3 hilos, mientras que la corriente 4–20 mA es exclusivamente de SALIDA.",
        styles['body']
    ))
    story.append(build_three_col_table(styles, [
        ["Canal / Señal", "Dirección y Tipo", "Especificación Técnica Detallada"],
        ["Entrada de Temperatura", "ENTRADA ÚNICA (Sensor PV)", "Entrada Pt100 3 hilos (IEC 60751); compensación automática de cables hasta 20 Ω/hilo; rango: -200.0 °C a +600.0 °C; resolución 0.1 °C; ADC 16 bits; precisión ±0.2% escala"],
        ["Entrada de Corriente 4–20 mA", "NO POSEE (0 Entradas mA)", "<b>EL EQUIPO NO DISPONE DE ENTRADA 4–20 mA.</b> Salida ≠ Entrada. No admite lectura analógica de transmisores de presión o caudal"],
        ["Salida de Control Analógica", "SALIDA ACTIVA (Mando MV)", "<b>SALIDA 4–20 mA</b> proporcional de corriente activa para control PID modulante; DAC de 14 bits; carga máx. de lazo 500 Ω; alimentación activa interna; tiempo de ciclo analógico 200 ms"],
        ["Salida de Alarma Auxiliar", "SALIDA Discreta (Relé)", "1 salida de contacto a relé electromecánico SPST (250 VAC / 3 A) configurable para alarma por alta/baja temp."]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 5: Comunicaciones y Protocolos
    story.append(Paragraph("Sección 5: Comunicaciones y Protocolos", styles['sec_head']))
    story.append(Paragraph(
        "Conectividad serie para supervisión distribuida en redes SCADA de planta.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro de Red", "Configuración Soportada y Protocolo"],
        ["Puerto Físico Serie", "1 × RS-485 semidúplex en bornes traseros (TRX+, TRX- y SG aislada), aislamiento galvánico de 1000 V"],
        ["Protocolo Industrial", "Modbus RTU RS-485 en modo ESCLAVO (Slave). Direccionamiento configurable por menú frontal entre 1 y 247"],
        ["Tasa de Transmisión", "4800, 9600, 19200 y 38400 bps seleccionables desde panel frontal (defecto: 9600 bps, 8-N-1)"],
        ["Registros Supervisados", "Holding Registers (PV: Temperatura actual, SP: Consigna, MV: Porcentaje de salida analógica, Kp, Ti, Td, Alarmas)"],
        ["Soporte de Red Ethernet", "Sin conectividad Ethernet nativa; requiere transceptor o pasarela serie externa si se conecta a bus TCP"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 6: Restricciones y Contraindicaciones de Diseño
    story.append(Paragraph("Sección 6: Restricciones y Contraindicaciones de Diseño", styles['sec_head']))
    story.append(Paragraph(
        "Criterios de incompatibilidad y advertencias mandatorias de ingeniería:",
        styles['body']
    ))
    story.append(build_contraindications_table(styles, [
        [
            "CONTRAINDICACIÓN CRÍTICA 1:<br/>PANEL != DIN (Panel distinto de DIN)",
            "El CN-PID-T1 está diseñado <b>estrictamente para montaje panel (Panel != DIN / Panel distinto de DIN)</b>. "
            "Está absolutamente contraindicado especificar o intentar fijar este equipo directamente sobre carril DIN 35 mm. "
            "No dispone de fijaciones DIN ni de perfiles homologados para fondo de armario."
        ],
        [
            "CONTRAINDICACIÓN CRÍTICA 2:<br/>SALIDA != ENTRADA 4–20 mA",
            "El terminal de 4–20 mA de este instrumento es exclusivamente una <b>SALIDA 4–20 mA</b> de control proporcional (MV). "
            "<b>Salida != Entrada (Salida != entrada 4–20): El equipo NO cuenta con entrada 4–20 mA</b>. Su única entrada de medición de variable de proceso (PV) "
            "es una entrada Pt100 3 hilos. Queda prohibido conectar lazos de transmisores de presión o flujo a los bornes de entrada o salida."
        ],
        [
            "PRECAUCIÓN DE BUCLE:<br/>SALIDA ACTIVA (NO ALIMENTAR)",
            "La salida analógica 4–20 mA suministra su propia tensión de excitación de bucle (fuente interna activa). "
            "No conecte fuentes externas de alimentación en serie con este bucle; la inyección de tensión externa provocará la quema del conversor D/A."
        ],
        [
            "REQUISITO DE SONDA:<br/>ENTRADA PT100 3 HILOS",
            "Requiere entrada Pt100 3 hilos obligatoria. No conectar termocuplas (tipo J o K) ni sondas resistivas de 2 hilos sin compensación si se requiere la máxima precisión certificada."
        ]
    ]))
    
    return story


def generate_sku3_elements(styles) -> List[Any]:
    """
    SKU 3: CN-DEMO-PT100-3W-A1
    Modelo: CN-RTD-P1
    Hechos obligatorios:
      - Pt100 3 hilos pasivo
      - Sonda de inmersión
      - SIN transmisor integrado
      - SIN interfaz digital
    Contraejemplos / no afirmar:
      - No 4–20 mA por sí solo
      - No Modbus por sí solo
    """
    story = []
    
    # Banner y Título
    story.append(build_banner(styles))
    story.append(Spacer(1, 3))
    story.append(Paragraph("HOJA DE DATOS TÉCNICOS / DATASHEET", styles['doc_title']))
    story.append(Paragraph("Sonda Industrial de Temperatura RTD Pt100 Pasiva de 3 Hilos en Acero Inoxidable", styles['doc_subtitle']))
    story.append(Spacer(1, 3))
    
    # Metadata Card
    story.append(build_meta_table(
        styles,
        sku="CN-DEMO-PT100-3W-A1",
        modelo="CN-RTD-P1",
        categoria="Sensores de Temperatura Primarios / Termorresistencias (RTD)"
    ))
    story.append(Spacer(1, 4))
    
    # Sección 1: Identificación y Modelo
    story.append(Paragraph("Sección 1: Identificación y Modelo", styles['sec_head']))
    story.append(Paragraph(
        "El sensor primario de temperatura modelo <b>CN-RTD-P1</b> (código SKU: <b>CN-DEMO-PT100-3W-A1</b>) "
        "es una sonda pasiva Pt100 3 hilos con elemento termorresistivo de platino bobinado para inserción en fluidos térmicos y procesos industriales. "
        "Cumple rigurosamente con la relación resistencia-temperatura internacional bajo norma IEC 60751.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro de Identificación", "Especificación de Catálogo"],
        ["Código SKU", "CN-DEMO-PT100-3W-A1"],
        ["Designación de Modelo", "CN-RTD-P1"],
        ["Tipo de Dispositivo", "Sonda de inmersión / Pt100 3 hilos pasivo (SIN transmisor integrado, SIN interfaz digital)"],
        ["Principio Físico", "Termorresistencia de platino puro con variación de resistencia eléctrica dependiente de la temperatura"],
        ["Aplicación de Ingeniería", "Medición directa en líneas de tubería, intercambiadores de calor, tanques y termopozos"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 2: Montaje Físico
    story.append(Paragraph("Sección 2: Montaje Físico", styles['sec_head']))
    story.append(Paragraph(
        "Fabricación mecánica en aleación anticorrosiva para inmersión estanca en medios líquidos o gaseosos presurizados.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro Mecánico y Constructivo", "Valor Nominal y Características de Montaje"],
        ["Tipo de Montaje y Fijación", "<b>Montaje roscado directo a proceso mediante racor fijo macho de 1/2 pulgada NPT</b>"],
        ["Material de la Vaina", "Sonda en vaina de acero inoxidable austenítico grado AISI 316L (1.4404) de alta pureza química"],
        ["Dimensiones de la Sonda", "Diámetro exterior: 6.0 mm | Longitud útil sumergible en proceso: 150 mm"],
        ["Límite de Presión Mecánica", "Presión hidrostática de servicio admisible hasta 40 bar a 20 °C (25 bar a 200 °C)"],
        ["Cable de Conexión y Extensión", "Manguera apantallada flexible de 2.0 metros con cubierta de teflón / silicona resistente a aceite y calor"],
        ["Terminales de Conexión", "3 conductores flexibles con punteras de cobre estañado (ferrules): 2 rojos (retorno común) y 1 blanco"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 3: Alimentación Eléctrica
    story.append(Paragraph("Sección 3: Alimentación Eléctrica", styles['sec_head']))
    story.append(Paragraph(
        "Especificaciones de excitación para equipos receptores. Dispositivo puramente pasivo sin consumo autónomo.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro Eléctrico", "Condición de Operación del Sensor Pasivo"],
        ["Alimentación Eléctrica Propia", "<b>SIN ALIMENTACIÓN PROPIA (0 VDC / 0 VAC).</b> Es un componente Pt100 3 hilos pasivo"],
        ["Corriente de Excitación Nominal", "0.1 mA a 1.0 mA DC constante (suministrada externamente por el puente de medición o PLC/PID)"],
        ["Corriente Máxima de Seguridad", "2.0 mA DC (límite térmico estricto para prevenir el error por autocalentamiento Joule)"],
        ["Rigidez Dieléctrica de Aislamiento", "Resistencia de aislamiento > 100 MΩ a 500 VDC entre los conductores internos y la vaina metálica"],
        ["Sobretensión Permitida", "<b>PROHIBIDA LA APLICACIÓN DE TENSIÓN DIRECTA.</b> Toda tensión fija quema el elemento"]
    ]))
    
    # Salto de página a la Página 2
    story.append(PageBreak())
    
    # Sección 4: Entradas / Salidas Analógicas y Sensores
    story.append(Paragraph("Sección 4: Entradas / Salidas Analógicas y Sensores", styles['sec_head']))
    story.append(Paragraph(
        "Comportamiento de la termorresistencia de platino y características metrológicas de calibración.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro Metrológico", "Especificación de Sensor RTD"],
        ["Elemento Termométrico", "Platino puro bobinado / película delgada Pt100 según norma europea DIN EN 60751"],
        ["Resistencia Base a Cero Grados", "R0 = 100.00 Ω nominal a 0.00 °C (coeficiente térmico alfa α = 0.003850 Ω/Ω/°C)"],
        ["Clase de Precisión Metrológica", "<b>Clase A según IEC 60751</b>: Tolerancia ±(0.15 + 0.002·|t|) °C (ej. ±0.15 °C a 0 °C, ±0.35 °C a 100 °C)"],
        ["Rango Térmico de Operación", "-50.0 °C a +350.0 °C de temperatura continua sobre la vaina de acero inoxidable AISI 316L"],
        ["Configuración de Cableado", "<b>Pt100 3 hilos pasivo</b> con doble hilo común para compensación de resistencia de línea"],
        ["Transmisor Electrónico Integrado", "<b>SIN TRANSMISOR INTEGRADO (0 transmisores).</b> No incluye electrónica de acondicionamiento"],
        ["Señal de Salida Eléctrica", "Resistencia óhmica pura pasiva dependiente de la temperatura. <b>No 4–20 mA por sí solo</b>"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 5: Comunicaciones y Protocolos
    story.append(Paragraph("Sección 5: Comunicaciones y Protocolos", styles['sec_head']))
    story.append(Paragraph(
        "Naturaleza puramente electromecánica del transductor y requerimientos de digitalización.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Parámetro de Comunicación", "Estado de Compatibilidad y Enlace"],
        ["Interfaz Digital Serie", "<b>SIN INTERFAZ DIGITAL (0 interfaces).</b> La sonda carece de microprocesador, UART, circuito integrado o puerto serie"],
        ["Protocolo Modbus RTU / TCP", "<b>NO APLICA / NO MODBUS POR SÍ SOLO.</b> No posee capacidad de comunicación digital por bus de datos"],
        ["Protocolo HART / Fieldbus", "No soportado de manera nativa (dispositivo sin modulación digital de señal)"],
        ["Requisito de Integración Digital", "Para leer esta sonda en un bus Modbus o PLC, se requiere cablearla a la entrada directa RTD de un regulador "
         "(como el modelo CN-PID-T1) o asociarla a un transmisor de cabezal/riel externo conversor de RTD a Modbus / 4–20 mA"]
    ]))
    story.append(Spacer(1, 4))
    
    # Sección 6: Restricciones y Contraindicaciones de Diseño
    story.append(Paragraph("Sección 6: Restricciones y Contraindicaciones de Diseño", styles['sec_head']))
    story.append(Paragraph(
        "Criterios de exclusión técnica indispensables para proyectos e instrumentación:",
        styles['body']
    ))
    story.append(build_contraindications_table(styles, [
        [
            "CONTRAINDICACIÓN CRÍTICA 1:<br/>NO 4–20 mA POR SÍ SOLO",
            "El modelo CN-RTD-P1 es una sonda resistiva pasiva <b>SIN TRANSMISOR INTEGRADO</b>. "
            "Bajo ninguna circunstancia genera señal: <b>No 4–20 mA por sí solo</b> ni emite tensión normalizada. "
            "Está terminantemente prohibido conectar directamente esta sonda a las entradas analógicas 4–20 mA de un PLC (como las de CN-DIN-PLC-A1) "
            "sin interponer previamente un transmisor o acondicionador de señal específico para RTD Pt100."
        ],
        [
            "CONTRAINDICACIÓN CRÍTICA 2:<br/>NO MODBUS POR SÍ SOLO / SIN INTERFAZ DIGITAL",
            "El sensor posee <b>SIN INTERFAZ DIGITAL y NO MODBUS POR SÍ SOLO</b>. "
            "No puede ser interrogado, direccionado ni conectado a pares trenzados RS-485. Intentar conectarlo a una red Modbus por sí solo resultará en falla total."
        ],
        [
            "PELIGRO DE DESTRUCCIÓN:<br/>PROHIBIDA LA TENSIÓN DIRECTA",
            "Jamás aplique tensión de red (220 VAC, 110 VAC) ni fuentes continuas (24 VDC, 12 VDC) a los hilos de la sonda. "
            "Una corriente superior a unos pocos miliamperios fundirá instantáneamente el filamento de platino de 100 Ω, destruyendo el sensor de forma irreversible."
        ],
        [
            "REGLA DE CONEXIÓN:<br/>RESPETAR CÓDIGO DE 3 HILOS",
            "Conectar siempre los dos hilos de igual color (rojos) a las bornas de compensación del lector para asegurar la anulación del error por longitud de cable."
        ]
    ]))
    
    return story


# ==============================================================================
# MOTOR PRINCIPAL DE GENERACIÓN Y VERIFICACIÓN
# ==============================================================================

def main():
    print("=" * 70)
    print("GENERADOR DE DATASHEETS SINTÉTICOS FASE 1 — REPORTLAB")
    print("=" * 70)
    
    # Directorios destino obligatorios
    dir_docs = "/home/ubuntu/hackday26/docs/datasheets"
    dir_backend = "/home/ubuntu/hackday26/b2b-backend/apps/backend/static/demo/datasheets"
    
    os.makedirs(dir_docs, exist_ok=True)
    os.makedirs(dir_backend, exist_ok=True)
    
    styles = create_styles()
    
    datasheet_configs = [
        {
            "sku": "CN-DEMO-PLC-DIN-420-MR1",
            "modelo": "CN-DIN-PLC-A1",
            "filename": "CN-DEMO-PLC-DIN-420-MR1.pdf",
            "generator": generate_sku1_elements,
            "desc": "PLC Carril DIN 35mm, 24VDC, 2x AI 4-20mA, RS-485 Modbus RTU Esclavo"
        },
        {
            "sku": "CN-DEMO-PID-PT100-RS1",
            "modelo": "CN-PID-T1",
            "filename": "CN-DEMO-PID-PT100-RS1.pdf",
            "generator": generate_sku2_elements,
            "desc": "Controlador PID Panel 48x48, Entrada Pt100 3-Hilos, Salida 4-20mA, Modbus RTU"
        },
        {
            "sku": "CN-DEMO-PT100-3W-A1",
            "modelo": "CN-RTD-P1",
            "filename": "CN-DEMO-PT100-3W-A1.pdf",
            "generator": generate_sku3_elements,
            "desc": "Sonda Pt100 Pasiva 3-Hilos, AISI 316L, Sin Transmisor, Sin Modbus"
        },
    ]
    
    results = []
    
    for cfg in datasheet_configs:
        sku = cfg["sku"]
        modelo = cfg["modelo"]
        filename = cfg["filename"]
        doc_path = os.path.join(dir_docs, filename)
        backend_path = os.path.join(dir_backend, filename)
        
        print(f"\n[+] Generando: {sku} ({modelo}) -> {filename}")
        
        # Document template configurado a tamaño Carta estándar y márgenes de 36 pt
        doc = SimpleDocTemplate(
            doc_path,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=44,
            bottomMargin=44
        )
        
        # Generar elementos de Platypus
        elements = cfg["generator"](styles)
        
        # Canvas maker con identificación de SKU/Modelo
        canvas_maker = make_canvas(f"SKU: {sku}   |   Modelo: {modelo}")
        
        # Compilación del PDF
        doc.build(elements, canvasmaker=canvas_maker)
        
        pages_count = getattr(doc, 'page', None)
        print(f"    ✔ PDF compilado exitosamente. Páginas: {pages_count}")
        
        # Replicar archivo idéntico a backend
        shutil.copy2(doc_path, backend_path)
        
        # Checksums
        hash_doc = calculate_sha256(doc_path)
        hash_backend = calculate_sha256(backend_path)
        
        if hash_doc != hash_backend:
            raise RuntimeError(f"Error de integridad: Checksums difieren para {filename}")
        
        file_size = os.path.getsize(doc_path)
        
        results.append({
            "sku": sku,
            "modelo": modelo,
            "filename": filename,
            "pages": pages_count,
            "size_bytes": file_size,
            "sha256": hash_doc,
            "path_docs": doc_path,
            "path_backend": backend_path,
            "desc": cfg["desc"]
        })
        
        print(f"    ✔ Copiado a backend: {backend_path}")
        print(f"    ✔ SHA-256: {hash_doc}")
        print(f"    ✔ Tamaño: {file_size} bytes")

    print("\n" + "=" * 70)
    print("RESUMEN DE GENERACIÓN Y CHECKSUMS SHA-256")
    print("=" * 70)
    for res in results:
        print(f"SKU:      {res['sku']}")
        print(f"Modelo:   {res['modelo']}")
        print(f"Archivo:  {res['filename']}")
        print(f"Páginas:  {res['pages']}")
        print(f"Tamaño:   {res['size_bytes']} bytes")
        print(f"SHA-256:  {res['sha256']}")
        print(f"Docs:     {res['path_docs']}")
        print(f"Backend:  {res['path_backend']}")
        print("-" * 70)
    
    print("\n[OK] Los 3 Datasheets sintéticos fueron generados y verificados con éxito.")


if __name__ == "__main__":
    main()
