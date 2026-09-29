#!/usr/bin/env python3
"""
Script: generate-quote-pdf.py
Description: Preliminary Technical Quote PDF Generator using ReportLab
for the Controlnautas B2B Industrial platform (Simulation & Demonstration Environment).

Implemented Requirements:
  1. Watermark:
     - 'FICTITIOUS PRODUCT — DEMONSTRATION DATA'
     - 'SIMULATION — NOT A VALID COMMERCIAL OFFER'
  2. Running Header and Footer:
     - Header: 'SIMULATION — NOT A VALID COMMERCIAL OFFER'
     - Reference: 'REF: {quote_ref}'
     - Footer: 'SIMULATION — NOT A VALID COMMERCIAL OFFER'
     - Branding: 'Controlnautas B2B Industrial — Preliminary Quote Simulation'
     - Page numbering: 'Page {pageNumber} of {pageCount}'
  3. Title:
     - 'Preliminary quote — simulation'
  4. Timezones:
     - Dual timestamp: UTC and US Pacific Time ('America/Los_Angeles' / PDT UTC-7).
  5. Currency formatting:
     - Default currency must be 'USD'.
     - Currency symbol: '$' (format: '$ 890.00 USD' or '$ 890.00').
     - NEVER output 'S/.' or 'PEN'.
  6. Table headers:
     - 'SKU / Reference', 'Product Description & Model', 'Qty', 'Unit Price (USD)', 'Subtotal (USD)'
  7. Commercial terms:
     - 'Taxes: Tax excluded / to be confirmed'
     - 'Shipping: To be confirmed'
     - 'Payment Terms: Subject to commercial agreement'
     - 'Validity: 24 hours from observation timestamp'
  8. Human confirmation disclaimer:
     - 'Document generated automatically for technical evaluation. Subject to confirmation by a Controlnautas representative.'
  9. Manual review alert:
     - 'UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE'
     - Reason explanation without false zero numbers.
  10. Test running the generator with sample JSON and confirm English strings in generated PDF.
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
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT


class QuoteNumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to compute total page count and render
    header, footer, and simulation watermark across all pages.
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
        # 1. DIAGONAL BACKGROUND WATERMARK
        # ---------------------------------------------------------
        self.saveState()
        self.translate(306, 396)
        self.rotate(32)
        # Attenuated semi-transparent red
        self.setFillColor(colors.Color(0.85, 0.15, 0.15, alpha=0.07))
        self.setFont('Helvetica-Bold', 28)
        self.drawCentredString(0, 36, "FICTITIOUS PRODUCT — DEMONSTRATION DATA")
        self.setFont('Helvetica-Bold', 22)
        self.drawCentredString(0, -6, "SIMULATION — NOT A VALID COMMERCIAL OFFER")
        self.restoreState()

        # ---------------------------------------------------------
        # 2. RUNNING HEADER
        # ---------------------------------------------------------
        self.setFont('Helvetica-Bold', 8)
        self.setFillColor(colors.HexColor('#DC2626'))
        self.drawString(36, 764, "SIMULATION — NOT A VALID COMMERCIAL OFFER")

        quote_ref = getattr(self, '_doc_quote_id', 'PRELIMINARY QUOTE')
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#475569'))
        self.drawRightString(576, 764, f"REF: {quote_ref}")

        # Header divider rule
        self.setStrokeColor(colors.HexColor('#CBD5E1'))
        self.setLineWidth(0.6)
        self.line(36, 757, 576, 757)

        # ---------------------------------------------------------
        # 3. RUNNING FOOTER
        # ---------------------------------------------------------
        # Footer divider rule
        self.line(36, 46, 576, 46)

        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#DC2626'))
        self.drawString(36, 34, "SIMULATION — NOT A VALID COMMERCIAL OFFER")

        self.setFont('Helvetica', 7)
        self.setFillColor(colors.HexColor('#64748B'))
        self.drawCentredString(306, 34, "Controlnautas B2B Industrial — Preliminary Quote Simulation")

        page_str = f"Page {self._pageNumber} of {page_count}"
        self.setFont('Helvetica-Bold', 7.5)
        self.setFillColor(colors.HexColor('#334155'))
        self.drawRightString(576, 34, page_str)

        self.restoreState()


def make_canvas(quote_ref_str: str):
    """Factory for canvas class with attached quote reference context."""
    class CustomCanvas(QuoteNumberedCanvas):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, **kwargs)
            self._doc_quote_id = quote_ref_str
    return CustomCanvas


def parse_datetime(val: Any) -> datetime.datetime:
    """Parses diverse datetime representations into UTC-aware datetime."""
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
    """Generates dual formatted timestamp strings: UTC and US Pacific Time ('America/Los_Angeles' / PDT UTC-7)."""
    utc_dt = dt.astimezone(datetime.timezone.utc)
    try:
        local_dt = dt.astimezone(ZoneInfo('America/Los_Angeles'))
    except Exception:
        local_dt = dt.astimezone(datetime.timezone(datetime.timedelta(hours=-7)))

    tz_name = local_dt.strftime('%Z') or 'PDT'
    offset = local_dt.utcoffset()
    if offset is not None:
        total_minutes = int(offset.total_seconds() // 60)
        hours = total_minutes // 60
        mins = abs(total_minutes % 60)
        offset_str = f"UTC{hours:+d}" if mins == 0 else f"UTC{hours:+d}:{mins:02d}"
    else:
        offset_str = "UTC-7"

    return (
        utc_dt.strftime('%Y-%m-%d %H:%M:%S UTC'),
        local_dt.strftime(f'%Y-%m-%d %H:%M:%S {tz_name} ({offset_str})')
    )


def format_currency(val: Any, currency: str = "USD") -> str:
    """Formats monetary amounts standardized in USD. Never outputs S/. or PEN."""
    if val is None or val == "":
        return "N/A"
    curr = str(currency).strip().upper()
    if not curr or curr in ("PEN", "SOL", "SOLES"):
        curr = "USD"
    sym = "$" if curr == "USD" else ("€" if curr == "EUR" else "$")
    try:
        fval = float(val)
        return f"{sym} {fval:,.2f} USD" if curr == "USD" else f"{sym} {fval:,.2f} {curr}"
    except (ValueError, TypeError):
        return f"{sym} {val} USD" if curr == "USD" else f"{sym} {val} {curr}"


def create_styles() -> Dict[str, ParagraphStyle]:
    """Generates standardized typographical styles palette."""
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
    """Builds mandatory top visual banner for fictitious demonstration product."""
    banner_data = [
        [Paragraph("★ FICTITIOUS PRODUCT — DEMONSTRATION DATA ★", styles['banner_title'])],
        [Paragraph(
            "MANDATORY DEMONSTRATION NOTICE: This preliminary quote and all technical data, pricing, models, and availability "
            "contained herein have been synthetically generated in a simulation and benchmarking environment. "
            "It does NOT constitute a binding commercial offer, enforceable mercantile quote, or inventory reservation.",
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
    """Builds institutional header of Controlnautas B2B Industrial with status badge."""
    status = str(quote_data.get('status', 'priced')).strip().lower()
    is_priced = (status == 'priced')

    left_content = [
        Paragraph("<b>Preliminary quote — simulation</b>", styles['brand_title']),
        Spacer(1, 1.5),
        Paragraph("Controlnautas B2B Industrial — Industrial Solutions, Automation & Instrumentation", styles['brand_sub']),
        Spacer(1, 1),
        Paragraph("B2B Portal: <u>https://data.controlnautas.com</u> &nbsp;|&nbsp; Preliminary Technical Quotes", styles['brand_meta']),
    ]

    if is_priced:
        badge_bg = colors.HexColor('#ECFDF5')
        badge_box = colors.HexColor('#059669')
        badge_html = (
            "<font color='#065F46'><b>STATUS: PRELIMINARY QUOTE</b></font><br/>"
            "<font color='#047857' size='6.5'>Preliminary pricing calculated</font>"
        )
    else:
        badge_bg = colors.HexColor('#FEF2F2')
        badge_box = colors.HexColor('#DC2626')
        badge_html = (
            "<font color='#991B1B'><b>STATUS: UNDER MANUAL REVIEW</b></font><br/>"
            "<font color='#B91C1C' size='6.5'>No commercial price available</font>"
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
    """Builds metadata matrix with dual timestamps and quote identification."""
    obs_utc, obs_loc = format_datetime_dual(dt_observed)
    exp_utc, exp_loc = format_datetime_dual(dt_expires)

    quote_id = quote_data.get('quote_id') or quote_data.get('id') or 'QUOTE-DEMO-000000'
    opaque_id = quote_data.get('opaque_public_id') or quote_id

    data = [
        [
            Paragraph("<b>Quote ID:</b>", styles['meta_label']),
            Paragraph(f"<code>{quote_id}</code>", styles['meta_val']),
            Paragraph("<b>Issued (UTC):</b>", styles['meta_label']),
            Paragraph(obs_utc, styles['meta_val']),
        ],
        [
            Paragraph("<b>Secure Public ID:</b>", styles['meta_label']),
            Paragraph(f"<code>{opaque_id}</code>", styles['meta_val']),
            Paragraph("<b>Issued (US Pacific):</b>", styles['meta_label']),
            Paragraph(obs_loc, styles['meta_val']),
        ],
        [
            Paragraph("<b>Validity:</b>", styles['meta_label']),
            Paragraph("24 hours from observation timestamp", styles['meta_val']),
            Paragraph("<b>Estimated Expiration:</b>", styles['meta_label']),
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
    """Extracts normalized list of items to quote from JSON payload."""
    raw_items = quote_data.get('items')
    if isinstance(raw_items, list) and len(raw_items) > 0:
        items = []
        for it in raw_items:
            if isinstance(it, dict):
                curr = str(it.get('currency', 'USD')).upper()
                if not curr or curr in ('PEN', 'SOL', 'SOLES'):
                    curr = 'USD'
                it_copy = dict(it)
                it_copy['currency'] = curr
                items.append(it_copy)
        if items:
            return items

    curr = str(quote_data.get('currency', 'USD')).upper()
    if not curr or curr in ('PEN', 'SOL', 'SOLES'):
        curr = 'USD'

    single_item = {
        'sku': quote_data.get('sku', 'N/A'),
        'model': quote_data.get('model', 'N/A'),
        'title': quote_data.get('title') or quote_data.get('name') or 'Industrial Technical Item',
        'quantity': quote_data.get('quantity', 1),
        'currency': curr,
        'unit_price': quote_data.get('unit_price'),
        'subtotal': quote_data.get('subtotal'),
    }
    return [single_item]


def build_priced_section(
    styles: Dict[str, ParagraphStyle],
    quote_data: Dict[str, Any],
    items: List[Dict[str, Any]],
    currency: str = "USD"
) -> List[Any]:
    """Builds items section with pricing table, subtotal, and commercial notes."""
    flowables = []

    if not currency or currency.upper() in ('PEN', 'SOL', 'SOLES'):
        currency = 'USD'

    # Columns: SKU / Reference (110), Product Description & Model (250), Qty (40), Unit Price (USD) (70), Subtotal (USD) (70) = 540
    table_data = [
        [
            Paragraph("SKU / Reference", styles['th']),
            Paragraph("Product Description & Model", styles['th']),
            Paragraph("Qty", styles['th_center']),
            Paragraph("Unit Price (USD)", styles['th_right']),
            Paragraph("Subtotal (USD)", styles['th_right']),
        ]
    ]

    total_subtotal = 0.0

    for it in items:
        sku = str(it.get('sku', 'N/A'))
        model = str(it.get('model') or '')
        title = str(it.get('title') or it.get('name') or 'N/A')
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

        if model and model not in ('N/A', 'N/D', 'None'):
            desc_html = f"<b>{title}</b><br/><font color='#1E3A8A' size='6.5'>Model: {model}</font>"
        else:
            desc_html = f"<b>{title}</b>"

        table_data.append([
            Paragraph(sku, styles['td_sku']),
            Paragraph(desc_html, styles['td_desc']),
            Paragraph(str(qty), styles['td_center']),
            Paragraph(format_currency(u_price, currency), styles['td_right']),
            Paragraph(format_currency(sub, currency), styles['td_right']),
        ])

    items_table = Table(table_data, colWidths=[110, 250, 40, 70, 70])
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

    # Commercial terms block (Taxes, Shipping, Payment Terms, Validity) and Summary Totals
    # Col widths: Left Column 315 pt, Right Column 225 pt = 540 pt
    left_notes = [
        Paragraph("<b>Taxes: Tax excluded / to be confirmed</b>", styles['note_bold']),
        Spacer(1, 1.5),
        Paragraph("<b>Shipping: To be confirmed</b>", styles['note_bold']),
        Spacer(1, 1.5),
        Paragraph("<b>Payment Terms: Subject to commercial agreement</b>", styles['note_bold']),
        Spacer(1, 1.5),
        Paragraph("<b>Validity: 24 hours from observation timestamp</b>", styles['note_bold']),
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
            Paragraph("<b>Estimated Net Subtotal:</b>", styles['meta_label']),
            Paragraph(format_currency(final_subtotal_amt, currency), styles['td_right']),
        ],
        [
            Paragraph("<b>Taxes:</b>", styles['meta_label']),
            Paragraph("<font color='#64748B' size='6.5'>Tax excluded / to be confirmed</font>", styles['td_right']),
        ],
        [
            Paragraph(f"<b>Estimated Total ({currency}):</b>", styles['note_bold']),
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
    Builds items section for 'manual_review' status.
    Does NOT output false zero prices or unverified currency columns.
    Prominently displays the manual review alert and engineering explanation.
    """
    flowables = []

    # Technical items table without monetary columns
    # Columns: SKU / Reference (130), Product Description & Model (285), Qty (45), Commercial Status (80) = 540
    table_data = [
        [
            Paragraph("SKU / Reference", styles['th']),
            Paragraph("Product Description & Model", styles['th']),
            Paragraph("Qty", styles['th_center']),
            Paragraph("Commercial Status", styles['th_center']),
        ]
    ]

    for it in items:
        sku = str(it.get('sku', 'N/A'))
        model = str(it.get('model') or '')
        title = str(it.get('title') or it.get('name') or 'N/A')
        qty = str(it.get('quantity', 1))

        if model and model not in ('N/A', 'N/D', 'None'):
            desc_html = f"<b>{title}</b><br/><font color='#1E3A8A' size='6.5'>Model: {model}</font>"
        else:
            desc_html = f"<b>{title}</b>"

        table_data.append([
            Paragraph(sku, styles['td_sku']),
            Paragraph(desc_html, styles['td_desc']),
            Paragraph(qty, styles['td_center']),
            Paragraph("<font color='#DC2626'><b>Under Review</b></font>", styles['td_center']),
        ])

    items_table = Table(table_data, colWidths=[130, 285, 45, 80])
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

    reason = (
        quote_data.get('reason')
        or quote_data.get('manual_review_reason')
        or quote_data.get('review_reason')
        or quote_data.get('notes')
        or "The requested volume or technical engineering configuration requires inventory verification and margin assignment by the engineering department."
    )

    alert_content = [
        [Paragraph("UNDER MANUAL REVIEW — NO COMMERCIAL PRICE AVAILABLE", styles['review_alert_title'])],
        [Spacer(1, 2)],
        [Paragraph(f"<b>Technical Review Reason:</b> {reason}", styles['review_alert_body'])],
        [Spacer(1, 2)],
        [Paragraph(
            "<b>Commercial Integrity Policy:</b> To avoid budgetary discrepancies or unverified estimates, "
            "Controlnautas B2B Industrial <b>does not issue false zero prices or unverified placeholder amounts</b> for items pending review. "
            "An assigned technical sales representative will verify factory lead times, industrial packaging, and delivery terms "
            "to provide a formal customized quote.",
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
    """Builds availability snapshot block with exact dual timestamp."""
    obs_utc, obs_loc = format_datetime_dual(dt_observed)
    raw_avail = quote_data.get('availability')

    if isinstance(raw_avail, dict):
        status_txt = raw_avail.get('status', 'Inquire')
        qty_val = raw_avail.get('quantity') or raw_avail.get('available_quantity')
        qty_txt = f" ({qty_val} units)" if qty_val is not None else ""
        avail_str = f"{status_txt}{qty_txt}"
    elif raw_avail:
        avail_str = str(raw_avail)
    else:
        avail_str = "Available at Central Distribution Warehouse (Subject to physical stock verification)"

    data = [
        [
            Paragraph("<b>Availability Status:</b>", styles['meta_label']),
            Paragraph(avail_str, styles['meta_val']),
        ],
        [
            Paragraph("<b>Observation Timestamp:</b>", styles['meta_label']),
            Paragraph(f"<b>{obs_utc}</b> &nbsp;|&nbsp; <b>{obs_loc}</b>", styles['meta_val']),
        ],
        [
            Paragraph("<b>Traceability Policy:</b>", styles['meta_label']),
            Paragraph(
                "Reported availability represents the exact inventory snapshot at the moment this simulation was generated. "
                "It does not guarantee inventory hold or reservation until a formal Purchase Order is confirmed.",
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
    currency: str = "USD"
) -> Table:
    """Builds official disclaimer and preliminary commercial terms section."""
    if not currency or currency.upper() in ('PEN', 'SOL', 'SOLES'):
        currency = 'USD'
    data = [
        [
            Paragraph(
                "<b>Document generated automatically for technical evaluation. Subject to confirmation by a Controlnautas representative.</b>",
                styles['disclaimer_title']
            )
        ],
        [Spacer(1, 2)],
        [
            Paragraph(
                "• <b>Validity:</b> 24 hours from observation timestamp.<br/>"
                "• <b>Non-Binding Simulation:</b> This simulation does not constitute a firm commercial offer, binding contract, or unilateral commitment to sell.<br/>"
                "• <b>Human Confirmation Required:</b> Document generated automatically for technical evaluation. Subject to confirmation by a Controlnautas representative.<br/>"
                f"• <b>Commercial Terms:</b> Taxes: Tax excluded / to be confirmed. Shipping: To be confirmed. Payment Terms: Subject to commercial agreement. Stated amounts in {currency.upper()}.",
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
    Assembles preliminary technical quote PDF document meeting all design and regulatory standards.
    """
    abs_output = os.path.abspath(output_path)
    os.makedirs(os.path.dirname(abs_output), exist_ok=True)

    # Identifiers and status
    quote_id = quote_data.get('quote_id') or quote_data.get('id') or 'QUOTE-DEMO-000000'
    opaque_id = quote_data.get('opaque_public_id') or quote_id
    status = str(quote_data.get('status', 'priced')).strip().lower()
    currency = str(quote_data.get('currency', 'USD')).upper()
    if not currency or currency in ('PEN', 'SOL', 'SOLES'):
        currency = 'USD'

    # Datetimes
    dt_observed = parse_datetime(quote_data.get('observed_at') or quote_data.get('created_at'))
    raw_expires = quote_data.get('expires_at')
    if raw_expires:
        dt_expires = parse_datetime(raw_expires)
    else:
        dt_expires = dt_observed + datetime.timedelta(hours=24)

    # Canvas factory with quote reference context
    doc_canvas_factory = make_canvas(f"{quote_id} | {opaque_id}")

    # Page layout: letter (612x792 pt), margins 36 pt (printable width 540 pt)
    doc = SimpleDocTemplate(
        abs_output,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46,
        title="Preliminary quote — simulation"
    )

    styles = create_styles()
    story = []

    # 1. Top visual watermark banner
    story.append(build_top_watermark_banner(styles))
    story.append(Spacer(1, 6))

    # 2. Institutional header
    story.append(build_branding_header(styles, quote_data))
    story.append(Spacer(1, 6))

    # 3. Metadata matrix (Quote ID, Dual UTC + US Pacific, Validity 24h)
    story.append(build_metadata_table(styles, quote_data, dt_observed, dt_expires))
    story.append(Spacer(1, 6))

    # 4. Technical item details section
    story.append(Paragraph("1. Technical Item Details", styles['sec_heading']))
    story.append(Spacer(1, 2))

    items = extract_items(quote_data)
    if status == 'priced':
        story.extend(build_priced_section(styles, quote_data, items, currency))
    else:
        story.extend(build_manual_review_section(styles, quote_data, items))

    story.append(Spacer(1, 6))

    # 5. Availability snapshot section with exact timestamps
    story.append(Paragraph("2. Availability & Inventory Snapshot", styles['sec_heading']))
    story.append(Spacer(1, 2))
    story.append(build_availability_section(styles, quote_data, dt_observed))
    story.append(Spacer(1, 6))

    # 6. Official disclaimer & simulation terms
    story.append(Paragraph("3. Official Disclaimer & Simulation Terms", styles['sec_heading']))
    story.append(Spacer(1, 2))
    story.append(build_disclaimer_section(styles, currency))

    # Build PDF
    doc.build(story, canvasmaker=doc_canvas_factory)

    return abs_output


def run_worker():
    """
    Persistent high-speed worker mode (line-delimited JSON).
    Generates PDFs in ~60ms reusing ReportLab modules pre-compiled in memory.
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
                raise ValueError("JSON object expected for 'data'")
            if not output_target:
                opaque_id = quote_data.get("opaque_public_id") or quote_data.get("quote_id") or "simulated_quote"
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
        description="Preliminary Technical Quote PDF Generator (ReportLab) — Controlnautas B2B Industrial"
    )
    parser.add_argument(
        "--worker", action="store_true",
        help="Run in persistent high-speed worker mode (line-delimited JSON via stdin/stdout)"
    )
    parser.add_argument(
        "input_pos", nargs="?", default=None,
        help="Path to quote JSON file (or '-' for stdin)"
    )
    parser.add_argument(
        "output_pos", nargs="?", default=None,
        help="Path to output PDF destination"
    )
    parser.add_argument(
        "-i", "--input", dest="input_flag", default=None,
        help="Path to quote JSON file (or '-' for stdin)"
    )
    parser.add_argument(
        "-o", "--output", dest="output_flag", default=None,
        help="Path to output PDF destination"
    )

    args = parser.parse_args()

    if args.worker:
        run_worker()
        return

    # Resolve input
    input_target = args.input_flag or args.input_pos

    if not input_target or input_target == "-":
        if sys.stdin.isatty() and not input_target:
            parser.print_help()
            sys.exit(1)
        raw_json = sys.stdin.read()
    else:
        if not os.path.exists(input_target):
            sys.stderr.write(f"Error: Input file not found: {input_target}\n")
            sys.exit(1)
        with open(input_target, "r", encoding="utf-8") as f:
            raw_json = f.read()

    try:
        quote_data = json.loads(raw_json)
    except json.JSONDecodeError as e:
        sys.stderr.write(f"Error: Invalid JSON received: {e}\n")
        sys.exit(1)

    if not isinstance(quote_data, dict):
        sys.stderr.write("Error: JSON payload must be an object/dict.\n")
        sys.exit(1)

    # Resolve output
    output_target = args.output_flag or args.output_pos
    if not output_target:
        opaque_id = quote_data.get("opaque_public_id") or quote_data.get("quote_id") or "simulated_quote"
        output_target = f"/home/ubuntu/hackday26/storage/quotes/{opaque_id}.pdf"

    try:
        generated_path = generate_quote_pdf(quote_data, output_target)
        file_size = os.path.getsize(generated_path)
        print(f"Preliminary quote PDF generated successfully: {generated_path} ({file_size} bytes)")
    except Exception as e:
        sys.stderr.write(f"Error generating PDF: {e}\n")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
