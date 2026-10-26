# Family Table · CSL 2026

A student concept for PNC Private Bank, built for the 2026 CSL case competition, *Bridging Generational Trust: AI for Asset & Family Transitions*. The track is the sale or transition of a family-owned business.

Family members say privately what they want from the sale. The advisor sees where they disagree early enough to bring everyone to the table, and meets the next generation before the assets leave.

**Live:** [showcase](https://rzrizaldy.github.io/pnc_csl_2026/) · [prototype](https://rzrizaldy.github.io/pnc_csl_2026/prototype/?reset)

Team: Alen Ilmi · Rizaldy Utomo · Nindy Aditya Dewi · Aditya Mulya Pratama, Carnegie Mellon University.

## What's here

| Path | What |
|---|---|
| `index.html` | Showcase page: prototype, architecture, how each AI component works, privacy |
| `prototype/` | Clickable prototype. Static HTML/CSS/JS, no build step. Advisor workbench (`#/advisor/...`) and family portal (`#/family/...`) |
| `prototype/shots/` | 1920×1080 screenshots of every screen |
| `slides/claude_deck/` | Source of the consulting-style slides (Claude Slides format) |
| `slides/build_secret_sauce.py` | Secret Sauce slide as editable PPTX shapes, for Canva import |
| `video/` | Video plan and narration script |
| `TEAM_NOTES.md` | Team coordination: owners, deadlines, open decisions |

## Run locally

```bash
python3 -m http.server 4311
```

Then open http://localhost:4311 for the showcase, or http://localhost:4311/prototype/?reset for the prototype. `?reset` clears the demo state.

Regenerate the screenshots (needs `npm i` in `video/src` and a Playwright headless shell):

```bash
cd video/src && node shots.js http://localhost:4311/prototype/
```

## Disclaimers

This is a student concept, not a PNC product. The Wilson family, Alex Lee and all figures are fictional. Statistics on the story cards come from PNC's Business Succession Planning papers.
