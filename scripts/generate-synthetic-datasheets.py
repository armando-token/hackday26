#!/usr/bin/env python3
"""
Script: generate-synthetic-datasheets.py
Description: Synthetic Datasheet PDF Generator for mandatory demo SKUs (Hack Day 2026):
  1. CN-DEMO-PLC-DIN-420-MR1 (Model: CN-DIN-PLC-A1)
  2. CN-DEMO-PID-PT100-RS1   (Model: CN-PID-T1)
  3. CN-DEMO-PT100-3W-A1     (Model: CN-RTD-P1)

Destinations:
  - /home/ubuntu/hackday26/docs/datasheets/
  - /home/ubuntu/hackday26/b2b-backend/apps/backend/static/demo/datasheets/

Requirements Met:
  1. Header/footer running marks:
     - Header: 'SIMULATION — TECHNICAL DEMONSTRATION ENVIRONMENT'
     - Footer: 'SIMULATION | FICTITIOUS PRODUCT — DEMONSTRATION DATA | HACK DAY 2026'
  2. Prominent banner:
     - 'FICTITIOUS PRODUCT — DEMONSTRATION DATA'
     - Subtitle: 'SIMULATION — NOT A VALID COMMERCIAL OFFER'
  3. Numbered section titles (must remain numbered 1 to 6 for formal citation stability):
     - Section 1: Identification and Model Overview
     - Section 2: Physical Mounting and Mechanical Form Factor
     - Section 3: Electrical Power Supply & Operational Tolerances
     - Section 4: Analog & Discrete I/O Interfaces and Sensors
     - Section 5: Communications, Fieldbus and Protocol Specifications
     - Section 6: Engineering Constraints and Design Contraindications
  4. English technical fact text for all 3 SKUs:
     - CN-DEMO-PLC-DIN-420-MR1 (DIN rail 35mm, 24 VDC, 2x AI 4-20mA, Modbus RTU slave)
     - CN-DEMO-PID-PT100-RS1 (PID controller, 1/16 DIN panel mount, Pt100 input, 4-20mA control out, Modbus RTU slave)
     - CN-DEMO-PT100-3W-A1 (Pt100 Class A 3-wire RTD, 1/2 NPT probe, AISI 316L, no transmitter, no Modbus)
  5. SHA-256 integrity calculation and reporting.
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
    Two-pass Canvas to dynamically compute total page count and stamp
    standardized English headers and footers with mandatory simulation marks across all pages.
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
        
        # --- HEADER ---
        # Mandatory red SIMULATION running mark
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#DC2626'))
        self.drawString(36, 762, "SIMULATION — TECHNICAL DEMONSTRATION ENVIRONMENT")
        
        # Document identifier on the right
        sku_model = getattr(self, '_doc_sku_model', 'DEMO PRODUCT')
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#475569'))
        self.drawRightString(576, 762, sku_model)
        
        # Header divider line
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.6)
        self.line(36, 755, 576, 755)
        
        # --- FOOTER ---
        # Footer divider line
        self.line(36, 44, 576, 44)
        
        # Mandatory SIMULATION footer mark
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#DC2626'))
        self.drawString(36, 32, "SIMULATION | FICTITIOUS PRODUCT — DEMONSTRATION DATA | HACK DAY 2026")
        
        # Page numbering
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#334155'))
        self.drawRightString(576, 32, page_str)
        
        self.restoreState()


def make_canvas(sku_model_str: str):
    """Canvas class factory with SKU and Model context."""
    class CustomCanvas(NumberedCanvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._doc_sku_model = sku_model_str
    return CustomCanvas


def calculate_sha256(filepath: str) -> str:
    """Calculates SHA-256 hash of a binary file."""
    sha = hashlib.sha256()
    with open(filepath, 'rb') as f:
        while chunk := f.read(65536):
            sha.update(chunk)
    return sha.hexdigest()


def create_styles():
    """Generates standardized typographic styles."""
    base = getSampleStyleSheet()
    
    return {
        'doc_title': ParagraphStyle(
            'DocTitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=12.5, leading=15,
            textColor=colors.HexColor('#0F172A')
        ),
        'doc_subtitle': ParagraphStyle(
            'DocSubtitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=8.5, leading=11,
            textColor=colors.HexColor('#1E3A8A')
        ),
        'banner_title': ParagraphStyle(
            'BannerTitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=9.5, leading=11.5,
            textColor=colors.HexColor('#991B1B'), alignment=TA_CENTER
        ),
        'banner_subtitle': ParagraphStyle(
            'BannerSubtitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7.8, leading=9.8,
            textColor=colors.HexColor('#B91C1C'), alignment=TA_CENTER
        ),
        'banner_text': ParagraphStyle(
            'BannerText', parent=base['Normal'],
            fontName='Helvetica', fontSize=6.8, leading=8.6,
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
            spaceBefore=3, spaceAfter=2
        ),
        'body': ParagraphStyle(
            'Body', parent=base['Normal'],
            fontName='Helvetica', fontSize=7.1, leading=9.0,
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
            fontName='Helvetica-Bold', fontSize=6.9, leading=8.6,
            textColor=colors.HexColor('#0F2942')
        ),
        'td_val': ParagraphStyle(
            'TableCellVal', parent=base['Normal'],
            fontName='Helvetica', fontSize=6.9, leading=8.6,
            textColor=colors.HexColor('#1E293B')
        ),
        'warn_head': ParagraphStyle(
            'WarnHead', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7.0, leading=8.8,
            textColor=colors.HexColor('#991B1B')
        ),
        'warn_body': ParagraphStyle(
            'WarnBody', parent=base['Normal'],
            fontName='Helvetica', fontSize=6.7, leading=8.4,
            textColor=colors.HexColor('#7F1D1D')
        ),
    }


def build_banner(styles):
    """Builds the mandatory prominent fictitious product disclaimer banner."""
    banner_data = [
        [Paragraph("FICTITIOUS PRODUCT — DEMONSTRATION DATA", styles['banner_title'])],
        [Paragraph("SIMULATION — NOT A VALID COMMERCIAL OFFER", styles['banner_subtitle'])],
        [Paragraph(
            "MANDATORY COMPLIANCE NOTICE: This equipment and its technical specifications have been "
            "synthetically generated exclusively for technical demonstration, functional testing, "
            "and engineering benchmarking (Hack Day 2026). It does not represent an active physical commercial product or valid commercial offer.",
            styles['banner_text']
        )]
    ]
    t = Table(banner_data, colWidths=[540])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FEE2E2')),
        ('BOX', (0,0), (-1,-1), 1.2, colors.HexColor('#EF4444')),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    return t


def build_meta_table(styles, sku: str, model: str, category: str, rev: str = "Rev 1.0 (Demonstration)"):
    """Builds standardized metadata table card."""
    data = [
        [
            Paragraph("<b>SKU:</b>", styles['meta_label']),
            Paragraph(sku, styles['meta_val']),
            Paragraph("<b>Model:</b>", styles['meta_label']),
            Paragraph(model, styles['meta_val'])
        ],
        [
            Paragraph("<b>Category:</b>", styles['meta_label']),
            Paragraph(category, styles['meta_val']),
            Paragraph("<b>Manufacturer / Rev:</b>", styles['meta_label']),
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
    """Builds a standard two-column technical specification table."""
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
    """Builds a three-column technical table for I/O channel breakdown."""
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
    """Builds highlighted Section 6 table with prominent red design alerts."""
    table_data = [
        [Paragraph("Critical Constraint / Contraindication", styles['th']), Paragraph("Technical Rationale and Design Exclusion Rule", styles['th'])]
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
# SPECIFIC DEFINITIONS FOR MANDATORY DEMO SKUS
# ==============================================================================

def generate_sku1_elements(styles) -> List[Any]:
    """
    SKU 1: CN-DEMO-PLC-DIN-420-MR1
    Model: CN-DIN-PLC-A1
    Mandatory technical facts:
      - DIN rail 35mm
      - 24 VDC
      - 2x AI 4-20mA
      - RS-485 Modbus RTU slave
    Counter-examples / non-claims:
      - No Modbus TCP
      - No analog output
    """
    story = []
    
    # Banner and Title
    story.append(build_banner(styles))
    story.append(Spacer(1, 3))
    story.append(Paragraph("TECHNICAL SPECIFICATION DATASHEET", styles['doc_title']))
    story.append(Paragraph("Compact DIN Rail Programmable Logic Controller with 4–20 mA Analog Inputs and Modbus RTU Slave", styles['doc_subtitle']))
    story.append(Spacer(1, 3))
    
    # Metadata Card
    story.append(build_meta_table(
        styles,
        sku="CN-DEMO-PLC-DIN-420-MR1",
        model="CN-DIN-PLC-A1",
        category="Industrial Automation & Control / Compact PLCs"
    ))
    story.append(Spacer(1, 3))
    
    # Section 1: Identification and Model Overview
    story.append(Paragraph("Section 1: Identification and Model Overview", styles['sec_head']))
    story.append(Paragraph(
        "The industrial micro-PLC model <b>CN-DIN-PLC-A1</b> (SKU code: <b>CN-DEMO-PLC-DIN-420-MR1</b>) "
        "is a compact acquisition and logic control station for electrical distribution enclosures. It integrates embedded processing "
        "for digitizing standard analog current loops and remote supervisory telemetry over serial industrial buses.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Identification Parameter", "Catalog Specification"],
        ["SKU Code", "CN-DEMO-PLC-DIN-420-MR1"],
        ["Model Designation", "CN-DIN-PLC-A1"],
        ["Product Family", "DIN-Logic Series Compact (Demonstration Environment)"],
        ["Control Architecture", "Decentralized logic acquisition unit with real-time clock and non-volatile EEPROM memory"],
        ["Application Scope", "Thermal process monitoring, fluid pumping automation, and serial bus telemetry"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 2: Physical Mounting and Mechanical Form Factor
    story.append(Paragraph("Section 2: Physical Mounting and Mechanical Form Factor", styles['sec_head']))
    story.append(Paragraph(
        "Modular industrial device engineered for direct snap-on mounting on standard interior distribution rails.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Mechanical Parameter", "Nominal Specification and Mounting Attributes"],
        ["Mounting Type", "35 mm symmetrical DIN rail mounting in accordance with IEC / EN 60715 (compatible with TH35-7.5 and TH35-15 profiles)"],
        ["Retention Mechanism", "Rear spring-loaded locking catch with release latch operated via flat-head screwdriver"],
        ["Overall Dimensions", "90 mm (Height) × 70 mm (Width, exact 4 standard DIN modules) × 58 mm (Depth)"],
        ["Net Weight / Protection", "210 g / IP20 ingress protection rating per IEC 60529 (for protected control panel interiors only)"],
        ["Thermal Clearance", "25 mm clear ventilation spacing above and below the unit relative to cable ducts or adjacent modules"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 3: Electrical Power Supply & Operational Tolerances
    story.append(Paragraph("Section 3: Electrical Power Supply & Operational Tolerances", styles['sec_head']))
    story.append(Paragraph(
        "Direct current power circuitry optimized for industrial switched-mode power supplies with galvanic isolation.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Electrical Parameter", "Operational Requirement and Tolerance Range"],
        ["Nominal Supply Voltage", "24 VDC (regulated direct current)"],
        ["Operating Voltage Range", "18.0 VDC to 30.0 VDC continuous (ripple tolerance Vpp < 5%)"],
        ["Power Consumption", "4.5 W maximum (with active serial communications and polarized input loops)"],
        ["Power Terminal Block", "Pluggable screw terminal connector, permissible conductor cross-section: 0.5 to 2.5 mm² (AWG 20–14)"],
        ["Circuit Protection", "Series diode reverse-polarity protection, self-resetting PTC thermal fuse, and 1500 VAC dielectric isolation"]
    ]))
    
    # Page break to Page 2
    story.append(PageBreak())
    
    # Section 4: Analog & Discrete I/O Interfaces and Sensors
    story.append(Paragraph("Section 4: Analog & Discrete I/O Interfaces and Sensors", styles['sec_head']))
    story.append(Paragraph(
        "Field signal configuration. Equipped with two standard analog current loops and deliberately lacking modulating analog outputs.",
        styles['body']
    ))
    story.append(build_three_col_table(styles, [
        ["Channel Type", "Provision", "Technical Specification & Signal Characteristics"],
        ["Analog Inputs", "2 channels (AI1, AI2)", "Passive 4–20 mA current loop; internal 250 Ω precision shunt; 12-bit ADC resolution (4096 counts); overall accuracy ±0.2% full scale; configurable digital software filtering"],
        ["Analog Outputs", "0 channels (NONE)", "<b>NO ANALOG OUTPUTS AVAILABLE.</b> The unit lacks DAC circuitry and provides no 4–20 mA or 0–10 V output drivers"],
        ["Discrete Inputs", "4 channels (DI1–DI4)", "24 VDC optically isolated discrete inputs (sink / PNP type), 5 mA nominal burden per channel at 24 V"],
        ["Discrete Outputs", "4 channels (DO1–DO4)", "Electromechanical dry relay contacts SPST-NO (250 VAC / 30 VDC, 2 A maximum resistive load)"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 5: Communications, Fieldbus and Protocol Specifications
    story.append(Paragraph("Section 5: Communications, Fieldbus and Protocol Specifications", styles['sec_head']))
    story.append(Paragraph(
        "Industrial serial communication port for supervisory telemetry and hierarchical automation network integration.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Network Parameter", "Supported Configuration and Protocol Details"],
        ["Physical Bus Interface", "1 × RS-485 half-duplex (2-wire: terminals A/D+, B/D-, and isolated GND), with jumper-selectable 120 Ω bus termination"],
        ["Industrial Protocol", "Modbus RTU in SLAVE (Server) mode. Configurable slave node address: 1 to 247"],
        ["Baud Rate Options", "Selectable via software registers or DIP switches: 9600, 19200, 38400, 57600, and 115200 bps (default: 19200 bps)"],
        ["Serial Frame Format", "8 data bits, selectable parity (Even, Odd, None), 1 or 2 stop bits (factory default: 8-E-1)"],
        ["Supported Modbus Functions", "Supported function codes: 01 (Read Coils), 02 (Read Discrete Inputs), 03 (Read Holding Regs), 04 (Read Input Regs: AI1/AI2)"],
        ["Modbus TCP / Ethernet", "<b>NOT SUPPORTED.</b> The device lacks an Ethernet controller, RJ-45 physical port, and onboard TCP/IP stack"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 6: Engineering Constraints and Design Contraindications
    story.append(Paragraph("Section 6: Engineering Constraints and Design Contraindications", styles['sec_head']))
    story.append(Paragraph(
        "Mandatory technical exclusion criteria and design constraints for system engineering and integration:",
        styles['body']
    ))
    story.append(build_contraindications_table(styles, [
        [
            "CRITICAL CONTRAINDICATION 1:<br/>DO NOT CLAIM OR DESIGN MODBUS TCP",
            "The CN-DIN-PLC-A1 <b>does NOT possess an Ethernet interface and does NOT support Modbus TCP</b>. "
            "Under no circumstances should direct IP network connectivity to Ethernet SCADA networks be assumed. "
            "Any integration into TCP/IP packet networks strictly requires an external RS-485 to Modbus TCP gateway or converter."
        ],
        [
            "CRITICAL CONTRAINDICATION 2:<br/>NO ANALOG OUTPUT AVAILABLE",
            "This equipment <b>possesses NO analog control output (neither 4–20 mA nor 0–10 V)</b>. "
            "It is strictly contraindicated to specify this SKU for direct modulating control of variable frequency drives (VFDs), "
            "electropneumatic valve positioners, or continuous actuators without adding external expansion modules."
        ],
        [
            "CRITICAL CONTRAINDICATION 3:<br/>SLAVE-ONLY OPERATION",
            "The onboard RS-485 transceiver operates strictly as a <b>Modbus RTU slave</b>. It has no capability to initiate master polling queries "
            "or act as a network client to query other peripheral devices."
        ],
        [
            "POWER SUPPLY RESTRICTION:<br/>PASSIVE 4–20 mA INPUTS",
            "Terminals AI1 and AI2 are passive current receivers (internal 250 Ω shunt) and do NOT inject excitation voltage. "
            "Connected external 2-wire transmitters must be powered from an external loop power supply (24 VDC)."
        ]
    ]))
    
    return story


def generate_sku2_elements(styles) -> List[Any]:
    """
    SKU 2: CN-DEMO-PID-PT100-RS1
    Model: CN-PID-T1
    Mandatory technical facts:
      - 1/16 DIN panel mount (48x48 mm)
      - Pt100 3-wire input
      - Digital PID with auto-tuning
      - 4–20 mA control output
      - Modbus RTU RS-485 slave
    Counter-examples / non-claims:
      - Panel Mount ≠ DIN Rail
      - Output ≠ Input (No 4–20 mA input)
    """
    story = []
    
    # Banner and Title
    story.append(build_banner(styles))
    story.append(Spacer(1, 3))
    story.append(Paragraph("TECHNICAL SPECIFICATION DATASHEET", styles['doc_title']))
    story.append(Paragraph("1/16 DIN Panel-Mount Digital PID Temperature Controller with Pt100 Input and 4–20 mA Control Output", styles['doc_subtitle']))
    story.append(Spacer(1, 3))
    
    # Metadata Card
    story.append(build_meta_table(
        styles,
        sku="CN-DEMO-PID-PT100-RS1",
        model="CN-PID-T1",
        category="Instrumentation & Process Control / PID Controllers"
    ))
    story.append(Spacer(1, 3))
    
    # Section 1: Identification and Model Overview
    story.append(Paragraph("Section 1: Identification and Model Overview", styles['sec_head']))
    story.append(Paragraph(
        "The microprocessor-based industrial controller model <b>CN-PID-T1</b> (SKU code: <b>CN-DEMO-PID-PT100-RS1</b>) "
        "is a dedicated front-panel instrument for closed-loop thermal regulation. It incorporates an advanced adaptive Auto-Tuning "
        "algorithm and a continuous proportional 4–20 mA current output for modulating actuators.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Identification Parameter", "Catalog Specification"],
        ["SKU Code", "CN-DEMO-PID-PT100-RS1"],
        ["Model Designation", "CN-PID-T1"],
        ["Instrument Type", "Microprocessor-Based Digital PID Temperature Controller"],
        ["Control Algorithm", "Advanced PID with adaptive Auto-Tuning, manual override, and selectable ON/OFF mode"],
        ["Typical Application", "High-precision temperature regulation in industrial ovens, extruders, chemical reactors, and autoclaves"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 2: Physical Mounting and Mechanical Form Factor
    story.append(Paragraph("Section 2: Physical Mounting and Mechanical Form Factor", styles['sec_head']))
    story.append(Paragraph(
        "Mechanical housing engineered exclusively for flush mounting through instrument panels or enclosure doors.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Mechanical Parameter", "Nominal Specification and Mounting Attributes"],
        ["Mounting Type", "<b>Exclusive front-panel flush mounting (Panel Mount / Control Panel Door)</b>"],
        ["Standard Form Factor", "1/16 DIN international dimensional standard (48 mm × 48 mm front bezel)"],
        ["Panel Cutout Dimensions", "45.0 mm (+0.5/-0) × 45.0 mm (+0.5/-0); accommodates panel plate thickness from 1.0 to 8.0 mm"],
        ["Securing Mechanism", "Rear detachable plastic mounting bracket collar with dual front-tightening tension screws"],
        ["Dimensions & Sealing", "48 × 48 × 95 mm (depth behind panel: 86 mm) / IP65 front bezel sealing with included synthetic gasket"],
        ["Structural Restriction", "<b>NOT SUITABLE FOR DIN RAIL MOUNTING.</b> The unit has no base clips or mounting adapter for 35 mm DIN rails"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 3: Electrical Power Supply & Operational Tolerances
    story.append(Paragraph("Section 3: Electrical Power Supply & Operational Tolerances", styles['sec_head']))
    story.append(Paragraph(
        "Internal universal switched-mode power supply with EMI filtering designed for harsh industrial electromagnetic environments.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Electrical Parameter", "Operational Requirement and Tolerance Range"],
        ["Nominal Supply Voltage", "100–240 VAC (50/60 Hz) universal AC line voltage"],
        ["Operating Voltage Tolerance", "85 VAC to 264 VAC steady-state without functional degradation"],
        ["Power Consumption", "6.5 VA maximum at 240 VAC with 4–20 mA current loop under 100% full load"],
        ["Dielectric Isolation", "2000 VAC (50/60 Hz) for 1 minute between power line terminals and low-voltage signal terminals"],
        ["Rear Terminal Connections", "12-point rear screw barrier terminal block with M3 screws and insulating phase partitions"]
    ]))
    
    # Page break to Page 2
    story.append(PageBreak())
    
    # Section 4: Analog & Discrete I/O Interfaces and Sensors
    story.append(Paragraph("Section 4: Analog & Discrete I/O Interfaces and Sensors", styles['sec_head']))
    story.append(Paragraph(
        "Critical transducer interface configuration. The process variable input accepts exclusively 3-wire Pt100 RTDs, while the 4–20 mA interface functions strictly as a control OUTPUT.",
        styles['body']
    ))
    story.append(build_three_col_table(styles, [
        ["Channel / Signal", "Direction & Signal Type", "Detailed Technical Specification"],
        ["Temperature Sensor Input", "SINGLE INPUT (Process Variable PV)", "3-wire Pt100 RTD input (IEC 60751); automatic lead-wire resistance compensation up to 20 Ω/wire; range: -200.0 °C to +600.0 °C; resolution: 0.1 °C; 16-bit ADC; accuracy: ±0.2% of span"],
        ["Current Input 4–20 mA", "NONE (0 mA Inputs)", "<b>THE INSTRUMENT HAS NO 4–20 mA INPUT.</b> Output ≠ Input. Does not accept analog current signals from external pressure or flow transmitters"],
        ["Analog Control Output", "ACTIVE OUTPUT (Manipulated Var. MV)", "<b>4–20 mA OUTPUT</b>: Proportional active current output for modulating PID control; 14-bit DAC; max loop load 500 Ω; internally powered active loop; analog update cycle 200 ms"],
        ["Auxiliary Alarm Output", "Discrete Output (Relay)", "1 × SPST electromechanical relay output (250 VAC / 3 A resistive), user-configurable for high/low temperature process alarms"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 5: Communications, Fieldbus and Protocol Specifications
    story.append(Paragraph("Section 5: Communications, Fieldbus and Protocol Specifications", styles['sec_head']))
    story.append(Paragraph(
        "Serial fieldbus connectivity for distributed supervisory control in plant SCADA networks.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Fieldbus Parameter", "Supported Configuration and Protocol Details"],
        ["Physical Serial Port", "1 × RS-485 half-duplex on rear terminals (TRX+, TRX-, and isolated SG), with 1000 V galvanic isolation"],
        ["Industrial Protocol", "Modbus RTU over RS-485 in SLAVE mode. Slave node address configurable from front keypad between 1 and 247"],
        ["Transmission Baud Rates", "4800, 9600, 19200, and 38400 bps selectable via front configuration menu (default: 9600 bps, 8-N-1)"],
        ["Monitored Registers", "Holding Registers (PV: Process Value, SP: Setpoint, MV: Control Output %, Kp, Ti, Td, Alarm status)"],
        ["Ethernet Support", "No native Ethernet interface; connection to Modbus TCP networks requires an external serial-to-Ethernet gateway"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 6: Engineering Constraints and Design Contraindications
    story.append(Paragraph("Section 6: Engineering Constraints and Design Contraindications", styles['sec_head']))
    story.append(Paragraph(
        "Technical incompatibility criteria and mandatory engineering design rules:",
        styles['body']
    ))
    story.append(build_contraindications_table(styles, [
        [
            "CRITICAL CONTRAINDICATION 1:<br/>PANEL != DIN (Panel Mount ≠ DIN Rail)",
            "The CN-PID-T1 is engineered <b>strictly for panel mounting (Panel != DIN / Panel distinct from DIN)</b>. "
            "It is strictly contraindicated to specify or attempt mounting this device on a 35 mm DIN rail. "
            "It possesses no DIN rail mounting clips or certified enclosure chassis."
        ],
        [
            "CRITICAL CONTRAINDICATION 2:<br/>OUTPUT != INPUT (4–20 mA Output ≠ Input)",
            "The 4–20 mA terminal on this instrument is strictly a <b>4–20 mA OUTPUT</b> for proportional control (MV). "
            "<b>Output != Input (Output is not a 4–20 mA input): This instrument DOES NOT have a 4–20 mA input</b>. Its sole process variable (PV) "
            "measurement input is a 3-wire Pt100 RTD input. Connecting 4–20 mA transmitter loops to input or output terminals will cause damage or operational failure."
        ],
        [
            "LOOP WIRING CAUTION:<br/>ACTIVE OUTPUT (DO NOT POWER)",
            "The 4–20 mA analog output supplies its own internal excitation voltage (active source). "
            "Do NOT connect external DC power supplies in series with this loop; external voltage injection will burn out the onboard D/A converter stage."
        ],
        [
            "SENSOR REQUIREMENT:<br/>3-WIRE Pt100 RTD ONLY",
            "Requires a 3-wire Pt100 RTD sensor. Do not connect thermocouples (Type J/K) or uncompensated 2-wire RTD sensors where certified accuracy is required."
        ]
    ]))
    
    return story


def generate_sku3_elements(styles) -> List[Any]:
    """
    SKU 3: CN-DEMO-PT100-3W-A1
    Model: CN-RTD-P1
    Mandatory technical facts:
      - Pt100 Class A 3-wire RTD
      - 1/2 NPT probe
      - AISI 316L stainless steel
      - No transmitter
      - No Modbus
    Counter-examples / non-claims:
      - No 4–20 mA on its own
      - No Modbus on its own
    """
    story = []
    
    # Banner and Title
    story.append(build_banner(styles))
    story.append(Spacer(1, 3))
    story.append(Paragraph("TECHNICAL SPECIFICATION DATASHEET", styles['doc_title']))
    story.append(Paragraph("Industrial Passive 3-Wire Pt100 RTD Temperature Immersion Probe in AISI 316L Stainless Steel", styles['doc_subtitle']))
    story.append(Spacer(1, 3))
    
    # Metadata Card
    story.append(build_meta_table(
        styles,
        sku="CN-DEMO-PT100-3W-A1",
        model="CN-RTD-P1",
        category="Primary Temperature Sensors / Resistance Temperature Detectors (RTD)"
    ))
    story.append(Spacer(1, 3))
    
    # Section 1: Identification and Model Overview
    story.append(Paragraph("Section 1: Identification and Model Overview", styles['sec_head']))
    story.append(Paragraph(
        "The primary temperature sensor model <b>CN-RTD-P1</b> (SKU code: <b>CN-DEMO-PT100-3W-A1</b>) "
        "is a passive 3-wire Pt100 RTD immersion probe with a platinum wire-wound sensing element for immersion in thermal fluids and industrial processes. "
        "It strictly conforms to international resistance-versus-temperature characteristics under IEC 60751.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Identification Parameter", "Catalog Specification"],
        ["SKU Code", "CN-DEMO-PT100-3W-A1"],
        ["Model Designation", "CN-RTD-P1"],
        ["Device Classification", "Immersion probe / passive 3-wire Pt100 RTD (NO integrated transmitter, NO digital interface)"],
        ["Operating Principle", "Pure platinum resistance thermometry with temperature-dependent electrical resistance variation"],
        ["Engineering Applications", "Direct temperature measurement in process piping, heat exchangers, fluid tanks, and thermowells"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 2: Physical Mounting and Mechanical Form Factor
    story.append(Paragraph("Section 2: Physical Mounting and Mechanical Form Factor", styles['sec_head']))
    story.append(Paragraph(
        "Corrosion-resistant mechanical construction engineered for leak-tight immersion in pressurized liquid or gaseous media.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Mechanical Parameter", "Nominal Specification and Mounting Attributes"],
        ["Mounting & Process Connection", "<b>Direct threaded process mounting via fixed 1/2\" NPT male fitting</b>"],
        ["Sheath Material", "Austenitic stainless steel grade AISI 316L (1.4404) sheath of high chemical purity"],
        ["Probe Dimensions", "Outer diameter: 6.0 mm | Usable immersion length in process: 150 mm"],
        ["Static Pressure Rating", "Permissible hydrostatic operating pressure up to 40 bar at 20 °C (25 bar at 200 °C)"],
        ["Lead Cable & Extension", "2.0-meter flexible shielded cable with oil- and heat-resistant silicone/Teflon jacket"],
        ["Connection Terminations", "3 flexible stranded conductors with tinned copper ferrules: 2 red (common return) and 1 white"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 3: Electrical Power Supply & Operational Tolerances
    story.append(Paragraph("Section 3: Electrical Power Supply & Operational Tolerances", styles['sec_head']))
    story.append(Paragraph(
        "Excitation specifications for receiving instruments. Purely passive sensing device with no autonomous power consumption.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Electrical Parameter", "Passive Sensor Operating Conditions"],
        ["Internal Power Supply", "<b>NO INTERNAL POWER SUPPLY (0 VDC / 0 VAC).</b> Purely passive 3-wire Pt100 component"],
        ["Nominal Excitation Current", "0.1 mA to 1.0 mA DC constant current (supplied externally by measurement bridge or PLC/PID input)"],
        ["Maximum Safe Current", "2.0 mA DC (strict thermal threshold to prevent measurement error caused by Joule self-heating)"],
        ["Dielectric Insulation Resistance", "Insulation resistance > 100 MΩ at 500 VDC between internal conductors and metallic sheath"],
        ["Permissible Voltage Input", "<b>DIRECT VOLTAGE PROHIBITED.</b> Applying direct voltage will instantly destroy the platinum sensor element"]
    ]))
    
    # Page break to Page 2
    story.append(PageBreak())
    
    # Section 4: Analog & Discrete I/O Interfaces and Sensors
    story.append(Paragraph("Section 4: Analog & Discrete I/O Interfaces and Sensors", styles['sec_head']))
    story.append(Paragraph(
        "Platinum resistance characteristics and metrological calibration tolerances.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Metrological Parameter", "RTD Sensor Specification"],
        ["Sensing Element", "Pure platinum wire-wound / thin-film Pt100 element compliant with DIN EN 60751"],
        ["Base Resistance at 0 °C", "R0 = 100.00 Ω nominal at 0.00 °C (temperature coefficient alpha α = 0.003850 Ω/Ω/°C)"],
        ["Metrological Accuracy Class", "<b>Class A according to IEC 60751</b>: Tolerance ±(0.15 + 0.002·|t|) °C (e.g., ±0.15 °C at 0 °C, ±0.35 °C at 100 °C)"],
        ["Operating Temperature Range", "-50.0 °C to +350.0 °C continuous operating temperature on the AISI 316L sheath"],
        ["Wiring Configuration", "<b>Passive 3-wire Pt100</b> with dual common lead wires for line-resistance compensation"],
        ["Integrated Electronic Transmitter", "<b>NO INTEGRATED TRANSMITTER (0 transmitters).</b> Does not include signal conditioning electronics"],
        ["Electrical Output Signal", "Pure passive ohmic resistance varying with temperature. <b>No 4–20 mA on its own.</b>"]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 5: Communications, Fieldbus and Protocol Specifications
    story.append(Paragraph("Section 5: Communications, Fieldbus and Protocol Specifications", styles['sec_head']))
    story.append(Paragraph(
        "Pure electromechanical transducer characteristics and digital integration requirements.",
        styles['body']
    ))
    story.append(build_spec_table(styles, [
        ["Fieldbus Parameter", "Compatibility Status & Connectivity Specification"],
        ["Digital Serial Interface", "<b>NO DIGITAL INTERFACE (0 interfaces).</b> The probe contains no microprocessor, UART, IC, or serial port"],
        ["Modbus RTU / TCP Support", "<b>NOT APPLICABLE / NO MODBUS ON ITS OWN.</b> Has no digital bus communication capability"],
        ["HART / Fieldbus Support", "Not supported natively (passive transducer without digital modulation)"],
        ["Digital Integration Requirement", "To read this probe on a Modbus network or PLC, it must be wired directly to a dedicated RTD input module (such as the CN-PID-T1) or connected to an external head-mount/DIN-rail RTD transmitter converting to Modbus / 4–20 mA."]
    ]))
    story.append(Spacer(1, 3))
    
    # Section 6: Engineering Constraints and Design Contraindications
    story.append(Paragraph("Section 6: Engineering Constraints and Design Contraindications", styles['sec_head']))
    story.append(Paragraph(
        "Essential technical exclusion criteria for engineering and instrumentation designs:",
        styles['body']
    ))
    story.append(build_contraindications_table(styles, [
        [
            "CRITICAL CONTRAINDICATION 1:<br/>NO 4–20 mA ON ITS OWN",
            "Model CN-RTD-P1 is a passive resistive probe <b>WITHOUT AN INTEGRATED TRANSMITTER</b>. "
            "Under no circumstances does it generate a signal on its own: <b>No 4–20 mA on its own</b>, nor does it output standard voltage. "
            "It is strictly prohibited to connect this probe directly to 4–20 mA analog inputs of a PLC (such as the CN-DIN-PLC-A1) "
            "without an intermediate RTD temperature transmitter or signal conditioner."
        ],
        [
            "CRITICAL CONTRAINDICATION 2:<br/>NO MODBUS ON ITS OWN / NO DIGITAL INTERFACE",
            "This sensor has <b>NO DIGITAL INTERFACE and NO MODBUS ON ITS OWN</b>. "
            "It cannot be polled, addressed, or connected to RS-485 twisted pairs. Attempting to connect it directly to a Modbus network will result in total system failure."
        ],
        [
            "DESTRUCTION HAZARD:<br/>DIRECT VOLTAGE PROHIBITED",
            "Never apply mains voltage (230 VAC, 115 VAC) or DC power sources (24 VDC, 12 VDC) to the probe leads. "
            "Current exceeding a few milliamperes will instantly vaporize the 100 Ω platinum filament, permanently destroying the sensor."
        ],
        [
            "WIRING RULE:<br/>OBSERVE 3-WIRE COLOR CODING",
            "Always connect the two identically colored wires (red) to the compensation terminals of the reader to cancel out measurement error caused by cable run length."
        ]
    ]))
    
    return story


# ==============================================================================
# MAIN EXECUTION AND VERIFICATION PIPELINE
# ==============================================================================

def main():
    print("=" * 70)
    print("SYNTHETIC DATASHEET GENERATOR — REPORTLAB (PROFESSIONAL ENGLISH)")
    print("=" * 70)
    
    # Destination directories
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
            "desc": "DIN rail 35mm, 24 VDC, 2x AI 4-20mA, Modbus RTU slave"
        },
        {
            "sku": "CN-DEMO-PID-PT100-RS1",
            "modelo": "CN-PID-T1",
            "filename": "CN-DEMO-PID-PT100-RS1.pdf",
            "generator": generate_sku2_elements,
            "desc": "PID controller, 1/16 DIN panel mount, Pt100 input, 4-20mA control out, Modbus RTU slave"
        },
        {
            "sku": "CN-DEMO-PT100-3W-A1",
            "modelo": "CN-RTD-P1",
            "filename": "CN-DEMO-PT100-3W-A1.pdf",
            "generator": generate_sku3_elements,
            "desc": "Pt100 Class A 3-wire RTD, 1/2 NPT probe, AISI 316L, no transmitter, no Modbus"
        },
    ]
    
    results = []
    
    for cfg in datasheet_configs:
        sku = cfg["sku"]
        modelo = cfg["modelo"]
        filename = cfg["filename"]
        doc_path = os.path.join(dir_docs, filename)
        backend_path = os.path.join(dir_backend, filename)
        
        print(f"\n[+] Generating: {sku} ({modelo}) -> {filename}")
        
        # Standard Letter document template with 36 pt left/right margins and 44 pt top/bottom margins
        doc = SimpleDocTemplate(
            doc_path,
            pagesize=letter,
            leftMargin=36,
            rightMargin=36,
            topMargin=44,
            bottomMargin=44
        )
        
        # Generate Platypus story elements
        elements = cfg["generator"](styles)
        
        # Canvas maker with SKU/Model identification running mark
        canvas_maker = make_canvas(f"SKU: {sku}   |   Model: {modelo}")
        
        # Build PDF
        doc.build(elements, canvasmaker=canvas_maker)
        
        pages_count = getattr(doc, 'page', None)
        print(f"    ✔ PDF successfully compiled. Total Pages: {pages_count}")
        
        # Replicate identical file to backend static directory
        shutil.copy2(doc_path, backend_path)
        
        # Checksums
        hash_doc = calculate_sha256(doc_path)
        hash_backend = calculate_sha256(backend_path)
        
        if hash_doc != hash_backend:
            raise RuntimeError(f"Integrity error: Checksums differ for {filename}")
        
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
        
        print(f"    ✔ Synced to backend static: {backend_path}")
        print(f"    ✔ SHA-256: {hash_doc}")
        print(f"    ✔ File size: {file_size} bytes")

    print("\n" + "=" * 70)
    print("SUMMARY OF GENERATED DATASHEETS AND SHA-256 CHECKSUMS")
    print("=" * 70)
    for res in results:
        print(f"SKU:        {res['sku']}")
        print(f"Model:      {res['modelo']}")
        print(f"File:       {res['filename']}")
        print(f"Pages:      {res['pages']}")
        print(f"Size:       {res['size_bytes']} bytes")
        print(f"SHA-256:    {res['sha256']}")
        print(f"Docs Path:  {res['path_docs']}")
        print(f"Backend:    {res['path_backend']}")
        print(f"Fact Profile: {res['desc']}")
        print("-" * 70)
    
    print("\n[OK] All 3 synthetic datasheets generated and verified in full professional English.")


if __name__ == "__main__":
    main()
