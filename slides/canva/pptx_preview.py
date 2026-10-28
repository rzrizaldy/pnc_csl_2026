# python3 slides/canva/pptx_preview.py <deck.pptx> <out.html>: approximate HTML render of the deck, for a layout check without PowerPoint.
# Renders a python-pptx deck to HTML (absolute boxes) for a layout check. Not a full renderer.
import sys, base64, html
from pptx import Presentation
from pptx.enum.shapes import MSO_SHAPE_TYPE, MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
PX = 6350
prs = Presentation(sys.argv[1]); out = sys.argv[2]
def tf_html(tf):
    ps = []
    for p in tf.paragraphs:
        al = {PP_ALIGN.CENTER: "center", PP_ALIGN.RIGHT: "right"}.get(p.alignment, "left")
        ls = p.line_spacing or 1.0
        runs = "".join(f'<span style="font-size:{r.font.size.pt/0.75 if r.font.size else 18:.1f}px;font-weight:{700 if r.font.bold else 400};color:#{r.font.color.rgb if r.font.color and r.font.color.type else "000000"}">{html.escape(r.text)}</span>' for r in p.runs)
        ps.append(f'<div style="text-align:{al};line-height:{ls*1.17:.2f}">{runs or "&nbsp;"}</div>')
    va = {MSO_ANCHOR.MIDDLE: "center", MSO_ANCHOR.BOTTOM: "flex-end"}.get(tf.vertical_anchor, "flex-start")
    return va, "".join(ps)
pages = []
for s in prs.slides:
    bg = s.background.fill.fore_color.rgb if s.background.fill.type else "FFFFFF"
    els = []
    for sh in s.shapes:
        x, y, w, h = (v / PX for v in (sh.left, sh.top, sh.width, sh.height))
        st = f"position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;"
        if sh.shape_type == MSO_SHAPE_TYPE.PICTURE:
            b64 = base64.b64encode(sh.image.blob).decode()
            els.append(f'<img style="{st}" src="data:{sh.image.content_type};base64,{b64}">'); continue
        if sh.has_table:
            t = sh.table; rows = []
            for r in t.rows:
                cells = []
                for c in r.cells:
                    fill = c.fill.fore_color.rgb if c.fill.type else "FFFFFF"
                    va, inner = tf_html(c.text_frame)
                    cells.append(f'<td style="background:#{fill};padding:{c.margin_top/PX}px {c.margin_left/PX}px;vertical-align:{"middle" if va=="center" else "top"};border:1px solid #fff">{inner}</td>')
                rows.append(f'<tr style="height:{r.height/PX}px">{"".join(cells)}</tr>')
            cols = "".join(f'<col style="width:{c.width/PX}px">' for c in t.columns)
            els.append(f'<table style="{st}height:auto;border-collapse:collapse;table-layout:fixed;font-family:Arial">{cols}{"".join(rows)}</table>'); continue
        fill = ""
        try:
            if sh.fill.type == 1: fill = f"background:#{sh.fill.fore_color.rgb};"
        except Exception: pass
        rad = ""
        try:
            if sh.auto_shape_type == MSO_SHAPE.ROUNDED_RECTANGLE: rad = f"border-radius:{min(w,h)*sh.adjustments[0]}px;"
        except Exception: pass
        border = ""
        try:
            if sh.line.fill.type == 1: border = f"box-shadow:inset 0 0 0 1px #{sh.line.color.rgb};"
        except Exception: pass
        inner = ""; va = "flex-start"
        if sh.has_text_frame and sh.text_frame.text.strip():
            va, inner = tf_html(sh.text_frame)
        els.append(f'<div class="b" style="{st}{fill}{rad}{border}display:flex;flex-direction:column;justify-content:{va}">{inner}</div>')
    pages.append(f'<section style="background:#{bg}">{"".join(els)}</section>')
open(out, "w").write('<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#333}section{position:relative;width:1920px;height:1080px;overflow:hidden;margin-bottom:20px;font-family:Arial}</style>' + "".join(pages))
