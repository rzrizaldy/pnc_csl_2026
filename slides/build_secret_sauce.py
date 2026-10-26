"""Secret Sauce slide as editable PowerPoint shapes, for import into Canva.

    python3 build_secret_sauce.py  ->  secret_sauce.pptx (one 16:9 slide)

Every box, label and tick is a separate shape or text box, so it stays editable after Canva import.
Colors follow the PNC Private Bank design system: grey page, navy panels, orange accent, data-viz palette.
"""
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Inches, Pt

OUT = Path(__file__).with_name("secret_sauce.pptx")

PAGE = RGBColor(0xF2, 0xF3, 0xF5)
NAVY = RGBColor(0x10, 0x21, 0x4D)
SLATE = RGBColor(0x5E, 0x64, 0x6E)
ORANGE = RGBColor(0xEF, 0x6A, 0x00)
PLUM = RGBColor(0x6D, 0x4A, 0xA0)
SAGE = RGBColor(0x6F, 0x9A, 0x4B)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
LINE = RGBColor(0xDD, 0xE0, 0xE4)
FONT = "Barlow"


def box(slide, x, y, w, h, fill, line=None, shape=MSO_SHAPE.ROUNDED_RECTANGLE, radius=0.06):
    s = slide.shapes.add_shape(shape, Inches(x), Inches(y), Inches(w), Inches(h))
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    if line is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line
        s.line.width = Pt(1)
    if shape == MSO_SHAPE.ROUNDED_RECTANGLE:
        s.adjustments[0] = radius
    s.shadow.inherit = False
    return s


def text(slide, x, y, w, h, runs, size=12, color=NAVY, bold=False, align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP):
    """runs: str, or list of paragraphs; each paragraph is a str or a list of (text, bold, color) tuples."""
    tb = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    paras = runs if isinstance(runs, list) else [runs]
    for i, para in enumerate(paras):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(3)
        parts = para if isinstance(para, list) else [(para, bold, color)]
        for t, b, c in parts:
            r = p.add_run()
            r.text = t
            r.font.name = FONT
            r.font.size = Pt(size)
            r.font.bold = b
            r.font.color.rgb = c
    return tb


def build():
    prs = Presentation()
    prs.slide_width, prs.slide_height = Inches(13.333), Inches(7.5)
    s = prs.slides.add_slide(prs.slide_layouts[6])
    bg = s.background.fill
    bg.solid()
    bg.fore_color.rgb = PAGE

    text(s, 0.6, 0.38, 9, 0.3, "THE SECRET SAUCE & CORE INNOVATION", size=11, color=ORANGE, bold=True)
    text(s, 0.6, 0.66, 12.2, 0.9, "A signal only PNC can see, and answers only a family member would give in private", size=26, bold=True)

    # ---- left: three layers ----
    layers = [
        (ORANGE, "1  Signal PNC already holds",
         "PNC banks the operating company. Payments to M&A and valuation firms, audited-financials requests and early "
         "credit-line paydowns flag a likely sale 12–18 months before close.",
         "Gradient-boosted classifier scores likelihood and shows its top reasons", "Advisor decides whether to call"),
        (PLUM, "2  Private-by-default family alignment",
         "Each family member checks in alone. A language model tags answers into six themes; a fixed formula scores "
         "where members disagree. Advisor sees the gap, never the words, unless that person shares.",
         "LLM extracts stances; divergence = spread of stances (no model)", "Each member decides what is shared"),
        (SAGE, "3  One household graph",
         "Business ↔ owners ↔ spouse ↔ heirs ↔ trusts ↔ accounts, with consent attached to every link. Heirs "
         "become PNC relationships before any assets move.",
         "Graph built from existing PNC records plus invites", "Family approves; advisor routes specialists"),
    ]
    y = 1.72
    for color, title, body, ai, human in layers:
        box(s, 0.6, y, 7.35, 1.62, WHITE, line=LINE)
        box(s, 0.6, y, 0.12, 1.62, color, shape=MSO_SHAPE.RECTANGLE)
        text(s, 0.92, y + 0.14, 6.9, 0.34, title, size=15, bold=True, color=NAVY)
        text(s, 0.92, y + 0.48, 6.9, 0.7, body, size=10.5, color=SLATE)
        text(s, 0.92, y + 1.2, 6.9, 0.36,
             [[("AI: ", True, color), (ai, False, NAVY), ("     Human: ", True, color), (human, False, NAVY)]], size=9.5)
        y += 1.76

    # ---- right: who sees what ----
    X, W = 8.25, 4.5
    box(s, X, 1.72, W, 3.46, NAVY)
    text(s, X + 0.25, 1.86, W - 0.5, 0.3, "Who sees what", size=14, bold=True, color=WHITE)
    cols = ["Member", "Family", "Advisor"]
    rows = [
        ("Raw answer text", ["✓", "—", "if shared"]),
        ("Theme stances", ["✓", "—", "—"]),
        ("Gap score per theme", ["✓", "—", "✓"]),
        ("“Has checked in”", ["✓", "✓", "✓"]),
        ("Sale-likelihood reasons", ["—", "—", "✓"]),
    ]
    cx = [X + 2.15, X + 2.95, X + 3.7]
    for c, label in zip(cx, cols):
        text(s, c - 0.4, 2.26, 0.85, 0.25, label, size=9.5, bold=True, color=RGBColor(0xC9, 0xD0, 0xD8), align=PP_ALIGN.CENTER)
    ry = 2.6
    for label, marks in rows:
        box(s, X + 0.2, ry - 0.05, W - 0.4, 0.42, RGBColor(0x1A, 0x2B, 0x5C), radius=0.2)
        text(s, X + 0.35, ry + 0.04, 1.8, 0.3, label, size=10, color=WHITE)
        for c, m in zip(cx, marks):
            col = ORANGE if m == "if shared" else (WHITE if m == "✓" else RGBColor(0x8A, 0x97, 0xA8))
            text(s, c - 0.42, ry + 0.04, 0.85, 0.3, m, size=10 if m != "if shared" else 9, bold=m != "—", color=col, align=PP_ALIGN.CENTER)
        ry += 0.5

    box(s, X, 5.32, W, 1.72, WHITE, line=LINE)
    text(s, X + 0.25, 5.44, W - 0.5, 0.3, "Why competitors struggle to copy it", size=12.5, bold=True, color=NAVY)
    text(s, X + 0.25, 5.78, W - 0.5, 1.2, [
        [("Timing. ", True, ORANGE), ("RIAs and wirehouses see the money after it moves; PNC sees the business before it sells.", False, SLATE)],
        [("Trust. ", True, PLUM), ("Honest, private answers build up per family and can't be scraped or bought.", False, SLATE)],
        [("One roof. ", True, SAGE), ("Commercial banking, Private Bank and Hawthorn IFS already sit inside PNC.", False, SLATE)],
    ], size=9.5)

    text(s, 0.6, 7.08, 12.2, 0.3,
         "Rule: fixed formulas calculate every number; language models only explain them; an advisor approves every output before a client sees it. "
         "Signal use must be validated against PNC data-sharing and consent policies.", size=8.5, color=SLATE)

    prs.save(OUT)
    print("wrote", OUT)


if __name__ == "__main__":
    build()
