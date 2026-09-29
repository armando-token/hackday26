#!/usr/bin/env python3
"""
Script: generate-quote-pdf.py
Descripción: Generador de Cotizaciones Técnicas Preliminares en formato PDF con ReportLab
para la plataforma Controlnautas B2B Industrial (Ambiente de Demostración y Simulación).

Requisitos implementados:
  1. Lectura de JSON de cotización desde archivo o stdin:
     quote_id, opaque_public_id, status, sku, model, title, quantity, currency,
     unit_price, subtotal, availability, observed_at, expires_at, reason, items, etc.
  2. Generación del PDF en la ruta especificada (o por defecto en storage/quotes/<opaque_id>.pdf).
  3. Marcas de agua y avisos destacados obligatorios:
     - Destacado prominente: "PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN"
     - Running header/footer: "SIMULACIÓN — NO VÁLIDA COMO OFERTA COMERCIAL"
     - Branding: "Controlnautas B2B Industrial — Simulación de Cotización Preliminar"
  4. Estructura del documento:
     - Cabecera con Quote ID, Fechas (UTC + Local Perú), Expiración (24h).
     - Ficha técnica de ítems: SKU, Modelo, Título, Cantidad.
     - Si status == 'priced': Tabla con P. Unitario, Subtotal,
       Nota de impuestos ('Impuestos: No incluidos / por confirmar'),
       Nota de envío ('Envío: Por coordinar').
     - Si status == 'manual_review': Alerta 'EN REVISIÓN MANUAL — SIN IMPORTE COMERCIAL DISPONIBLE'
       con explicación de causa (sin precios cero ficticios).
     - Instantánea de disponibilidad con timestamp exacto de observación.
     - Descargo oficial: 'Documento generado automáticamente para evaluación técnica. Sujeto a confirmación de un representante humano.'
"""

import os
import sys
import json
import argparse
import datetime
from zoneinfo import ZoneInfo
from typing import Dict, Any, List, Tuple

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY


class QuoteNumberedCanvas(canvas.Canvas):
    """
    Canvas de doble pasada para calcular el número total de páginas y estampar
    cabecera, pie de página y marca de agua de simulación en todas las páginas.
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

        # ---------------------------------------------------------
        # 1. MARCA DE AGUA DIAGONAL DE FONDO
        # ---------------------------------------------------------
        self.saveState()
        self.translate(306, 396)
        self.rotate(32)
        # Color rojo atenuado semi-transparente
        self.setFillColor(colors.Color(0.85, 0.15, 0.15, alpha=0.07))
        self.setFont('Helvetica-Bold', 30)
        self.drawCentredString(0, 36, "PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN")
        self.setFont('Helvetica-Bold', 24)
        self.drawCentredString(0, -6, "SIMULACIÓN — NO VÁLIDA COMO OFERTA COMERCIAL")
        self.restoreState()

        # ---------------------------------------------------------
        # 2. RUNNING HEADER (CABECERA SUPERIOR)
        # ---------------------------------------------------------
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#DC2626'))
        self.drawString(36, 764, "SIMULACIÓN — NO VÁLIDA COMO OFERTA COMERCIAL")

        quote_ref = getattr(self, '_doc_quote_id', 'COTIZACIÓN PRELIMINAR')
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#475569'))
        self.drawRightString(576, 764, f"REF: {quote_ref}")

        # Línea divisoria de cabecera
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.6)
        self.line(36, 757, 576, 757)

        # ---------------------------------------------------------
        # 3. RUNNING FOOTER (PIE DE PÁGINA)
        # ---------------------------------------------------------
        # Línea divisoria de pie
        self.line(36, 46, 576, 46)

        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#DC2626'))
        self.drawString(36, 34, "SIMULACIÓN — NO VÁLIDA COMO OFERTA COMERCIAL")

        self.setFont('Helvetica', 7)
        self.setFillColor(colors.HexColor('#64748B'))
        self.drawCentredString(306, 34, "Controlnautas B2B Industrial — Simulación de Cotización Preliminar")

        page_str = f"Página {self._pageNumber} de {page_count}"
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#334155'))
        self.drawRightString(576, 34, page_str)

        self.restoreState()


def make_canvas(quote_ref_str: str):
    """Fábrica de clases Canvas con contexto de la cotización."""
    class CustomCanvas(QuoteNumberedCanvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._doc_quote_id = quote_ref_str
    return CustomCanvas


def parse_datetime(val: Any) -> datetime.datetime:
    """Parsea representaciones diversas de fecha a datetime con zona horaria UTC."""
    if not val:
        return datetime.datetime.now(datetime.timezone.utc)
    if isinstance(val, (int, float)):
        ts = val / 1000.0 if val > 1e11 else float(val)
        return datetime.datetime.fromtimestamp(ts, tz=datetime.timezone.utc)
    if isinstance(val, str):
        v = val.strip().replace('Z', '+00:00')
        try:
            dt = datetime.datetime.fromisoformat(v)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=datetime.timezone.utc)
            return dt
        except Exception:
            for fmt in ('%Y-%m-%d %H:%M:%S', '%Y-%m-%d', '%d/%m/%Y %H:%M:%S'):
                try:
                    dt = datetime.datetime.strptime(val.strip(), fmt)
                    return dt.replace(tzinfo=datetime.timezone.utc)
                except Exception:
                    pass
    return datetime.datetime.now(datetime.timezone.utc)


def format_datetime_dual(dt: datetime.datetime) -> Tuple[str, str]:
    """Genera strings formateados duales: UTC y Local Perú (America/Lima UTC-5)."""
    utc_dt = dt.astimezone(datetime.timezone.utc)
    try:
        local_dt = dt.astimezone(ZoneInfo('America/Lima'))
    except Exception:
        local_dt = dt.astimezone(datetime.timezone(datetime.timedelta(hours=-5)))
    return (
        utc_dt.strftime('%Y-%m-%d %H:%M:%S UTC'),
        local_dt.strftime('%Y-%m-%d %H:%M:%S PET (UTC-5)')
    )


def format_currency(val: Any, currency: str = "PEN") -> str:
    """Formatea valores monetarios numéricos o cadenas de forma estandarizada."""
    if val is None or val == "":
        return "N/D"
    curr = str(currency).upper()
    sym = "S/." if curr == "PEN" else ("$" if curr == "USD" else ("€" if curr == "EUR" else curr))
    try:
        fval = float(val)
        return f"{sym} {fval:,.2f} {curr}"
    except (ValueError, TypeError):
        return f"{sym} {val} {curr}"


def create_styles() -> Dict[str, ParagraphStyle]:
    """Genera la paleta de estilos tipográficos estandarizados."""
    base = getSampleStyleSheet()

    return {
        'brand_title': ParagraphStyle(
            'BrandTitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=12, leading=15,
            textColor=colors.HexColor('#0F2942')
        ),
        'brand_sub': ParagraphStyle(
            'BrandSub', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=8.5, leading=11,
            textColor=colors.HexColor('#1E3A8A')
        ),
        'brand_meta': ParagraphStyle(
            'BrandMeta', parent=base['Normal'],
            fontName='Helvetica', fontSize=7, leading=9.5,
            textColor=colors.HexColor('#64748B')
        ),
        'banner_title': ParagraphStyle(
            'BannerTitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=9, leading=11,
            textColor=colors.HexColor('#991B1B'), alignment=TA_CENTER
        ),
        'banner_body': ParagraphStyle(
            'BannerBody', parent=base['Normal'],
            fontName='Helvetica', fontSize=6.8, leading=8.5,
            textColor=colors.HexColor('#7F1D1D'), alignment=TA_CENTER
        ),
        'badge_text': ParagraphStyle(
            'BadgeText', parent=base['Normal'],
            fontName='Helvetica', fontSize=7.5, leading=9.5,
            alignment=TA_CENTER
        ),
        'sec_heading': ParagraphStyle(
            'SecHeading', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=8.5, leading=11,
            textColor=colors.HexColor('#0F2942'),
            spaceBefore=3, spaceAfter=2
        ),
        'meta_label': ParagraphStyle(
            'MetaLabel', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7, leading=8.8,
            textColor=colors.HexColor('#0F2942')
        ),
        'meta_val': ParagraphStyle(
            'MetaVal', parent=base['Normal'],
            fontName='Helvetica', fontSize=7, leading=8.8,
            textColor=colors.HexColor('#1E293B')
        ),
        'th': ParagraphStyle(
            'TableHead', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7, leading=8.8,
            textColor=colors.white
        ),
        'th_center': ParagraphStyle(
            'TableHeadCenter', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7, leading=8.8,
            textColor=colors.white, alignment=TA_CENTER
        ),
        'th_right': ParagraphStyle(
            'TableHeadRight', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7, leading=8.8,
            textColor=colors.white, alignment=TA_RIGHT
        ),
        'td_sku': ParagraphStyle(
            'TdSKU', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=6.8, leading=8.5,
            textColor=colors.HexColor('#0F2942')
        ),
        'td_model': ParagraphStyle(
            'TdModel', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=6.8, leading=8.5,
            textColor=colors.HexColor('#1E3A8A')
        ),
        'td_desc': ParagraphStyle(
            'TdDesc', parent=base['Normal'],
            fontName='Helvetica', fontSize=6.8, leading=8.5,
            textColor=colors.HexColor('#1E293B')
        ),
        'td_center': ParagraphStyle(
            'TdCenter', parent=base['Normal'],
            fontName='Helvetica', fontSize=6.8, leading=8.5,
            textColor=colors.HexColor('#1E293B'), alignment=TA_CENTER
        ),
        'td_right': ParagraphStyle(
            'TdRight', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=6.8, leading=8.5,
            textColor=colors.HexColor('#0F2942'), alignment=TA_RIGHT
        ),
        'review_alert_title': ParagraphStyle(
            'ReviewAlertTitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=9, leading=11,
            textColor=colors.HexColor('#991B1B'), alignment=TA_CENTER
        ),
        'review_alert_body': ParagraphStyle(
            'ReviewAlertBody', parent=base['Normal'],
            fontName='Helvetica', fontSize=7.2, leading=9.5,
            textColor=colors.HexColor('#7F1D1D')
        ),
        'disclaimer_title': ParagraphStyle(
            'DisclaimerTitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7.5, leading=9.5,
            textColor=colors.HexColor('#0F2942'), alignment=TA_CENTER
        ),
        'disclaimer_body': ParagraphStyle(
            'DisclaimerBody', parent=base['Normal'],
            fontName='Helvetica', fontSize=6.5, leading=8.2,
            textColor=colors.HexColor('#334155')
        ),
        'note_text': ParagraphStyle(
            'NoteText', parent=base['Normal'],
            fontName='Helvetica', fontSize=6.8, leading=8.5,
            textColor=colors.HexColor('#475569')
        ),
        'note_bold': ParagraphStyle(
            'NoteBold', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=7, leading=8.8,
            textColor=colors.HexColor('#1E293B')
        ),
    }


def build_top_watermark_banner(styles: Dict[str, ParagraphStyle]) -> Table:
    """Construye el banner visual obligatorio destacado de producto ficticio."""
    banner_data = [
        [Paragraph("★ PRODUCTO FICTICIO — DATOS DE DEMOSTRACIÓN ★", styles['banner_title'])],
        [Paragraph(
            "AVISO OBLIGATORIO DE DEMOSTRACIÓN: Esta cotización y todos los datos técnicos, precios, modelos y disponibilidad "
            "que contiene han sido generados sintéticamente en ambiente de simulación y benchmarking técnico. "
            "NO constituye una oferta comercial vinculante, ni presupuesto mercantil exigible, ni reserva de inventario.",
            styles['banner_body']
        )]
    ]
    t = Table(banner_data, colWidths=[540])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FEE2E2')),
        ('BOX', (0, 0), (-1, -1), 1.2, colors.HexColor('#DC2626')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t


def build_branding_header(styles: Dict[str, ParagraphStyle], quote_data: Dict[str, Any]) -> Table:
    """Construye la cabecera institucional de Controlnautas B2B Industrial con badge de estado."""
    status = str(quote_data.get('status', 'priced')).strip().lower()
    is_priced = (status == 'priced')

    left_content = [
        Paragraph("<b>Controlnautas B2B Industrial — Simulación de Cotización Preliminar</b>", styles['brand_title']),
        Spacer(1, 1.5),
        Paragraph("División de Soluciones Industriales, Automatización e Instrumentación", styles['brand_sub']),
        Spacer(1, 1),
        Paragraph("Portal B2B: <u>https://data.controlnautas.com</u> &nbsp;|&nbsp; RUC: 20601234567 &nbsp;|&nbsp; Cotizaciones Técnicas", styles['brand_meta']),
    ]

    if is_priced:
        badge_bg = colors.HexColor('#ECFDF5')
        badge_box = colors.HexColor('#059669')
        badge_html = (
            "<font color='#065F46'><b>ESTADO: COTIZACIÓN PRELIMINAR</b></font><br/>"
            "<font color='#047857' size='6.5'>Precios preliminares calculados</font>"
        )
    else:
        badge_bg = colors.HexColor('#FEF2F2')
        badge_box = colors.HexColor('#DC2626')
        badge_html = (
            "<font color='#991B1B'><b>ESTADO: EN REVISIÓN MANUAL</b></font><br/>"
            "<font color='#B91C1C' size='6.5'>Sin importe comercial preliminar</font>"
        )

    badge_table = Table([[Paragraph(badge_html, styles['badge_text'])]], colWidths=[195])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), badge_bg),
        ('BOX', (0, 0), (-1, -1), 1, badge_box),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))

    header_table = Table([[left_content, badge_table]], colWidths=[340, 200])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    return header_table


def build_metadata_table(
    styles: Dict[str, ParagraphStyle],
    quote_data: Dict[str, Any],
    dt_observed: datetime.datetime,
    dt_expires: datetime.datetime
) -> Table:
    """Construye la matriz de metadatos temporales y de identificación de la cotización."""
    obs_utc, obs_loc = format_datetime_dual(dt_observed)
    exp_utc, exp_loc = format_datetime_dual(dt_expires)

    quote_id = quote_data.get('quote_id') or quote_data.get('id') or 'COT-DEMO-000000'
    opaque_id = quote_data.get('opaque_public_id') or quote_id

    data = [
        [
            Paragraph("<b>ID Cotización:</b>", styles['meta_label']),
            Paragraph(f"<code>{quote_id}</code>", styles['meta_val']),
            Paragraph("<b>Emisión (UTC):</b>", styles['meta_label']),
            Paragraph(obs_utc, styles['meta_val']),
        ],
        [
            Paragraph("<b>ID Público Seguro:</b>", styles['meta_label']),
            Paragraph(f"<code>{opaque_id}</code>", styles['meta_val']),
            Paragraph("<b>Emisión (Local Perú):</b>", styles['meta_label']),
            Paragraph(obs_loc, styles['meta_val']),
        ],
        [
            Paragraph("<b>Vigencia de Cotización:</b>", styles['meta_label']),
            Paragraph("24 horas continuas", styles['meta_val']),
            Paragraph("<b>Expiración Estimada:</b>", styles['meta_label']),
            Paragraph(f"{exp_utc} &nbsp;/&nbsp; {exp_loc}", styles['meta_val']),
        ]
    ]

    t = Table(data, colWidths=[105, 165, 105, 165])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.6, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return t


def extract_items(quote_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Extrae la lista normalizada de ítems a cotizar a partir del JSON."""
    raw_items = quote_data.get('items')
    if isinstance(raw_items, list) and len(raw_items) > 0:
        items = []
        for it in raw_items:
            if isinstance(it, dict):
                items.append(it)
        if items:
            return items

    # Si no hay lista 'items', construir a partir de las propiedades raíz
    single_item = {
        'sku': quote_data.get('sku', 'N/D'),
        'model': quote_data.get('model', 'N/D'),
        'title': quote_data.get('title') or quote_data.get('name') or 'Ítem Técnico Industrial',
        'quantity': quote_data.get('quantity', 1),
        'currency': quote_data.get('currency', 'PEN'),
        'unit_price': quote_data.get('unit_price'),
        'subtotal': quote_data.get('subtotal'),
    }
    return [single_item]


def build_priced_section(
    styles: Dict[str, ParagraphStyle],
    quote_data: Dict[str, Any],
    items: List[Dict[str, Any]],
    currency: str
) -> List[Any]:
    """Construye la sección de ítems con tabla de precios, subtotal y notas de flete e impuestos."""
    flowables = []

    # Columnas: SKU(110), Modelo(85), Descripción(175), Cant(35), P.Unit(65), Subtotal(70) = 540
    table_data = [
        [
            Paragraph("SKU", styles['th']),
            Paragraph("Modelo", styles['th']),
            Paragraph("Descripción Técnica / Título", styles['th']),
            Paragraph("Cant.", styles['th_center']),
            Paragraph("P. Unitario", styles['th_right']),
            Paragraph("Subtotal", styles['th_right']),
        ]
    ]

    total_subtotal = 0.0

    for it in items:
        sku = str(it.get('sku', 'N/D'))
        model = str(it.get('model', 'N/D'))
        title = str(it.get('title') or it.get('name') or 'N/D')
        qty = it.get('quantity', 1)
        try:
            qty_num = int(qty)
        except (ValueError, TypeError):
            try:
                qty_num = float(qty)
            except Exception:
                qty_num = 1

        u_price = it.get('unit_price')
        sub = it.get('subtotal')

        if sub is None and u_price is not None:
            try:
                sub = float(u_price) * float(qty_num)
            except Exception:
                sub = 0.0

        if sub is not None:
            try:
                total_subtotal += float(sub)
            except Exception:
                pass

        table_data.append([
            Paragraph(sku, styles['td_sku']),
            Paragraph(model, styles['td_model']),
            Paragraph(title, styles['td_desc']),
            Paragraph(str(qty), styles['td_center']),
            Paragraph(format_currency(u_price, currency), styles['td_right']),
            Paragraph(format_currency(sub, currency), styles['td_right']),
        ])

    items_table = Table(table_data, colWidths=[110, 85, 175, 35, 65, 70])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    flowables.append(items_table)
    flowables.append(Spacer(1, 4))

    # Bloque de notas comerciales (Impuestos, Envío) y Resumen de Totales
    # Anchos: Columna Izquierda 315 pt, Columna Derecha 225 pt = 540 pt
    left_notes = [
        Paragraph("<b>Impuestos: No incluidos / por confirmar</b>", styles['note_bold']),
        Spacer(1, 1.5),
        Paragraph("<b>Envío: Por coordinar</b> (Almacén Central Lima o Despacho a Planta)", styles['note_bold']),
        Spacer(1, 1.5),
        Paragraph("Condición comercial preliminar: Sujeto a validación crediticia y disponibilidad logística.", styles['note_text']),
    ]

    total_display = quote_data.get('subtotal')
    if total_display is not None:
        try:
            final_subtotal_amt = float(total_display)
        except Exception:
            final_subtotal_amt = total_subtotal
    else:
        final_subtotal_amt = total_subtotal

    totals_matrix = [
        [
            Paragraph("<b>Subtotal Neto Estimado:</b>", styles['meta_label']),
            Paragraph(format_currency(final_subtotal_amt, currency), styles['td_right']),
        ],
        [
            Paragraph("<b>Impuestos (IGV 18% ref.):</b>", styles['meta_label']),
            Paragraph("<font color='#64748B' size='6.5'>No incluidos / Por confirmar</font>", styles['td_right']),
        ],
        [
            Paragraph(f"<b>Total Preliminar ({currency.upper()}):</b>", styles['note_bold']),
            Paragraph(f"<b>{format_currency(final_subtotal_amt, currency)}</b>", styles['td_right']),
        ]
    ]

    totals_table = Table(totals_matrix, colWidths=[120, 105])
    totals_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 0.6, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    summary_block = Table([[left_notes, totals_table]], colWidths=[315, 225])
    summary_block.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))

    flowables.append(summary_block)
    return flowables


def build_manual_review_section(
    styles: Dict[str, ParagraphStyle],
    quote_data: Dict[str, Any],
    items: List[Dict[str, Any]]
) -> List[Any]:
    """
    Construye la sección de ítems en estado 'manual_review'.
    NO muestra precios cero ficticios ni columnas de valor monetario no verificado.
    Muestra de forma prominente la alerta y el motivo de revisión técnica.
    """
    flowables = []

    # Tabla de ítems técnicos sin columnas monetarias
    # Columnas: SKU(120), Modelo(90), Descripción(225), Cant(45), Estado(60) = 540
    table_data = [
        [
            Paragraph("SKU", styles['th']),
            Paragraph("Modelo", styles['th']),
            Paragraph("Descripción Técnica / Título", styles['th']),
            Paragraph("Cant.", styles['th_center']),
            Paragraph("Estado Comercial", styles['th_center']),
        ]
    ]

    for it in items:
        sku = str(it.get('sku', 'N/D'))
        model = str(it.get('model', 'N/D'))
        title = str(it.get('title') or it.get('name') or 'N/D')
        qty = str(it.get('quantity', 1))

        table_data.append([
            Paragraph(sku, styles['td_sku']),
            Paragraph(model, styles['td_model']),
            Paragraph(title, styles['td_desc']),
            Paragraph(qty, styles['td_center']),
            Paragraph("<font color='#DC2626'><b>En Revisión</b></font>", styles['td_center']),
        ])

    items_table = Table(table_data, colWidths=[120, 90, 225, 45, 60])
    items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E3A8A')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    flowables.append(items_table)
    flowables.append(Spacer(1, 5))

    # Razón de la revisión manual
    reason = (
        quote_data.get('reason')
        or quote_data.get('manual_review_reason')
        or quote_data.get('review_reason')
        or quote_data.get('notes')
        or "El volumen solicitado o la configuración de ingeniería de este producto requiere validación de stock y asignación de margen comercial por el departamento de ingeniería."
    )

    # ALERTA DESTACADA: 'EN REVISIÓN MANUAL — SIN IMPORTE COMERCIAL DISPONIBLE'
    alert_content = [
        [Paragraph("EN REVISIÓN MANUAL — SIN IMPORTE COMERCIAL DISPONIBLE", styles['review_alert_title'])],
        [Spacer(1, 2)],
        [Paragraph(f"<b>Causa / Justificación Técnica:</b> {reason}", styles['review_alert_body'])],
        [Spacer(1, 2)],
        [Paragraph(
            "<b>Política de Integridad Comercial:</b> Para evitar discrepancias presupuestarias o cotizaciones desactualizadas, "
            "Controlnautas B2B Industrial <b>NO emite precios cero ficticios ($0.00 / S/ 0.00)</b> en requerimientos pendientes. "
            "Un asesor técnico comercial asignado revisará la disponibilidad de fábrica, embalaje industrial y condiciones de entrega "
            "para remitirle la propuesta formal personalizada.",
            styles['review_alert_body']
        )],
    ]

    alert_table = Table(alert_content, colWidths=[540])
    alert_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FEF2F2')),
        ('BOX', (0, 0), (-1, -1), 1.2, colors.HexColor('#DC2626')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))

    flowables.append(alert_table)
    return flowables


def build_availability_section(
    styles: Dict[str, ParagraphStyle],
    quote_data: Dict[str, Any],
    dt_observed: datetime.datetime
) -> Table:
    """Construye el bloque de instantánea de disponibilidad con timestamp exacto."""
    obs_utc, obs_loc = format_datetime_dual(dt_observed)
    raw_avail = quote_data.get('availability')

    if isinstance(raw_avail, dict):
        status_txt = raw_avail.get('status', 'Consultar')
        qty_txt = f" ({raw_avail.get('quantity')} unidades)" if 'quantity' in raw_avail else ""
        avail_str = f"{status_txt}{qty_txt}"
    elif raw_avail:
        avail_str = str(raw_avail)
    else:
        avail_str = "Disponible en Almacén Central Lima (Sujeto a confirmación física de stock)"

    data = [
        [
            Paragraph("<b>Estado de Disponibilidad:</b>", styles['meta_label']),
            Paragraph(avail_str, styles['meta_val']),
        ],
        [
            Paragraph("<b>Timestamp de Observación:</b>", styles['meta_label']),
            Paragraph(f"<b>{obs_utc}</b> &nbsp;|&nbsp; <b>{obs_loc}</b>", styles['meta_val']),
        ],
        [
            Paragraph("<b>Condición de Trazabilidad:</b>", styles['meta_label']),
            Paragraph(
                "La disponibilidad reportada corresponde a la instantánea exacta del inventario al momento de emitirse esta simulación. "
                "No garantiza reserva de producto hasta la formalización de la Orden de Compra.",
                styles['note_text']
            ),
        ]
    ]

    t = Table(data, colWidths=[140, 400])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.6, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return t


def build_disclaimer_section(
    styles: Dict[str, ParagraphStyle],
    currency: str
) -> Table:
    """Construye el bloque de descargo oficial y términos comerciales preliminares."""
    data = [
        [
            Paragraph(
                "<b>Documento generado automáticamente para evaluación técnica. Sujeto a confirmación de un representante humano.</b>",
                styles['disclaimer_title']
            )
        ],
        [Spacer(1, 2)],
        [
            Paragraph(
                "• <b>Vigencia Técnica:</b> Esta simulación de cotización preliminar tiene una validez estricta de 24 horas continuas a partir de su emisión.<br/>"
                "• <b>Carácter no Vinculante:</b> Este documento no constituye una oferta comercial en firme, contrato ni promesa unilateral de venta.<br/>"
                "• <b>Confirmación Humana Obligatoria:</b> Precios, plazos de entrega y disponibilidad física final deben ser refrendados por un asesor de Controlnautas B2B Industrial.<br/>"
                f"• <b>Impuestos y Logística:</b> Los importes calculados en {currency.upper()} no incluyen IGV (18%) ni fletes o seguros de transporte, a liquidarse en la oferta definitiva.",
                styles['disclaimer_body']
            )
        ]
    ]

    t = Table(data, colWidths=[540])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#94A3B8')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 5),
        ('RIGHTPADDING', (0, 0), (-1, -1), 5),
    ]))
    return t


def generate_quote_pdf(quote_data: Dict[str, Any], output_path: str) -> str:
    """
    Ensambla el documento PDF de cotización cumpliendo todos los requisitos de diseño y conformidad.
    """
    abs_output = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(abs_output), exist_ok=True)

    # Identificadores y estado
    quote_id = quote_data.get('quote_id') or quote_data.get('id') or 'COT-DEMO-000000'
    opaque_id = quote_data.get('opaque_public_id') or quote_id
    status = str(quote_data.get('status', 'priced')).strip().lower()
    currency = str(quote_data.get('currency', 'PEN')).upper()

    # Fechas
    dt_observed = parse_datetime(quote_data.get('observed_at') or quote_data.get('created_at'))
    raw_expires = quote_data.get('expires_at')
    if raw_expires:
        dt_expires = parse_datetime(raw_expires)
    else:
        dt_expires = dt_observed + datetime.timedelta(hours=24)

    # Contexto para el canvas
    doc_canvas_factory = make_canvas(f"{quote_id} | {opaque_id}")

    # Configuración de página: carta (letter: 612x792 pt), márgenes 36 pt (ancho útil 540 pt)
    doc = SimpleDocTemplate(
        abs_output,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46
    )

    styles = create_styles()
    story = []

    # 1. Banner superior destacado de simulación / producto ficticio
    story.append(build_top_watermark_banner(styles))
    story.append(Spacer(1, 6))

    # 2. Cabecera institucional de Controlnautas
    story.append(build_branding_header(styles, quote_data))
    story.append(Spacer(1, 6))

    # 3. Metadatos de la cotización (ID, UTC + Local, Expiración 24h)
    story.append(build_metadata_table(styles, quote_data, dt_observed, dt_expires))
    story.append(Spacer(1, 6))

    # 4. Sección técnica de ítems
    story.append(Paragraph("1. Detalle Técnico de Ítems Cotizados", styles['sec_heading']))
    story.append(Spacer(1, 2))

    items = extract_items(quote_data)
    if status == 'priced':
        story.extend(build_priced_section(styles, quote_data, items, currency))
    else:
        story.extend(build_manual_review_section(styles, quote_data, items))

    story.append(Spacer(1, 6))

    # 5. Sección de disponibilidad con timestamp exacto
    story.append(Paragraph("2. Instantánea de Disponibilidad e Inventario", styles['sec_heading']))
    story.append(Spacer(1, 2))
    story.append(build_availability_section(styles, quote_data, dt_observed))
    story.append(Spacer(1, 6))

    # 6. Descargo oficial y condiciones técnicas
    story.append(Paragraph("3. Descargo Oficial y Términos de la Simulación", styles['sec_heading']))
    story.append(Spacer(1, 2))
    story.append(build_disclaimer_section(styles, currency))

    # Construir documento PDF
    doc.build(story, canvasmaker=doc_canvas_factory)

    return abs_output


def run_worker():
    """
    Modo worker persistente de alta velocidad (line-delimited JSON).
    Permite generar PDFs en ~60ms reutilizando las bibliotecas ReportLab ya compiladas en memoria.
    """
    sys.stdout.write("READY\n")
    sys.stdout.flush()
    for raw_line in sys.stdin:
        line = raw_line.strip()
        if not line:
            continue
        if line == "PING":
            sys.stdout.write("PONG\n")
            sys.stdout.flush()
            continue
        try:
            req = json.loads(line)
            quote_data = req.get("data")
            output_target = req.get("output")
            if not quote_data or not isinstance(quote_data, dict):
                raise ValueError("Se requiere 'data' como diccionario JSON")
            if not output_target:
                opaque_id = quote_data.get("opaque_public_id") or quote_data.get("quote_id") or "cotizacion_simulada"
                output_target = f"/home/ubuntu/hackday26/storage/quotes/{opaque_id}.pdf"
            generated_path = generate_quote_pdf(quote_data, output_target)
            file_size = os.path.getsize(generated_path)
            res = json.dumps({"ok": True, "path": generated_path, "size": file_size})
            sys.stdout.write(res + "\n")
            sys.stdout.flush()
        except Exception as e:
            res = json.dumps({"ok": False, "error": str(e)})
            sys.stdout.write(res + "\n")
            sys.stdout.flush()


def main():
    parser = argparse.ArgumentParser(
        description="Generador de Cotizaciones Técnicas Preliminares PDF (ReportLab) — Controlnautas B2B Industrial"
    )
    parser.add_argument(
        "--worker", action="store_true",
        help="Ejecuta en modo worker persistente (line-delimited JSON via stdin/stdout)"
    )
    parser.add_argument(
        "input_pos", nargs="?", default=None,
        help="Ruta al archivo JSON de cotización (o '-' para stdin)"
    )
    parser.add_argument(
        "output_pos", nargs="?", default=None,
        help="Ruta al archivo PDF de destino"
    )
    parser.add_argument(
        "-i", "--input", dest="input_flag", default=None,
        help="Ruta al archivo JSON de cotización (o '-' para stdin)"
    )
    parser.add_argument(
        "-o", "--output", dest="output_flag", default=None,
        help="Ruta al archivo PDF de destino"
    )

    args = parser.parse_args()

    if args.worker:
        run_worker()
        return

    # Resolver entrada
    input_target = args.input_flag or args.input_pos

    if not input_target or input_target == "-":
        if sys.stdin.isatty() and not input_target:
            parser.print_help()
            sys.exit(1)
        raw_json = sys.stdin.read()
    else:
        if not os.path.exists(input_target):
            sys.stderr.write(f"Error: Archivo de entrada no encontrado: {input_target}\n")
            sys.exit(1)
        with open(input_target, "r", encoding="utf-8") as f:
            raw_json = f.read()

    try:
        quote_data = json.loads(raw_json)
    except json.JSONDecodeError as e:
        sys.stderr.write(f"Error: JSON inválido recibido: {e}\n")
        sys.exit(1)

    if not isinstance(quote_data, dict):
        sys.stderr.write("Error: El payload JSON debe ser un objeto/diccionario.\n")
        sys.exit(1)

    # Resolver salida
    output_target = args.output_flag or args.output_pos
    if not output_target:
        opaque_id = quote_data.get("opaque_public_id") or quote_data.get("quote_id") or "cotizacion_simulada"
        output_target = f"/home/ubuntu/hackday26/storage/quotes/{opaque_id}.pdf"

    try:
        generated_path = generate_quote_pdf(quote_data, output_target)
        file_size = os.path.getsize(generated_path)
        print(f"Cotización PDF generada exitosamente: {generated_path} ({file_size} bytes)")
    except Exception as e:
        sys.stderr.write(f"Error generando el PDF: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()

