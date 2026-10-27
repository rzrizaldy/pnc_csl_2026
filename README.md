# Family Table · CSL 2026

A student concept for PNC Private Bank, built for the 2026 CSL case competition, *Bridging Generational Trust: AI for Asset & Family Transitions*. The track is the sale or transition of a family-owned business.

Built around a case study of HBO's *Succession*: six ways the Roy family's succession failed, each checked against PNC's own research and turned into a feature. The fictional Hale family (one member per Roy archetype) runs through a mobile-first prototype with adaptive screens and simulated Claude/GPT features.

**Live:** [overview](https://rzrizaldy.github.io/pnc_csl_2026/) · [the Succession case](https://rzrizaldy.github.io/pnc_csl_2026/case.html) · [architecture](https://rzrizaldy.github.io/pnc_csl_2026/architecture.html) · [prototype](https://rzrizaldy.github.io/pnc_csl_2026/prototype/?reset)

Team: Alen Ilmi · Rizaldy Utomo · Nindy Aditya Dewi · Aditya Mulya Pratama, Carnegie Mellon University.

## What's here

| Path | What |
|---|---|
| `index.html` | Overview: problem, 4-step journey, AI, why only PNC, value and hypotheses |
| `case.html` | Succession case study: six failure patterns and the Hale family personas, with sources |
| `architecture.html` | Solution architecture: 6-layer stack, privacy boundary, request flow, model output contract, AI components, pilot |
| `prototype/` | Mobile-first prototype. Static HTML/CSS/JS, no build step. Pick a person at `#/`; advisor at `#/advisor/...`, family members at `#/me/<id>/...` |
| `prototype/shots/` | Desktop (1920×1080) and mobile (`*_m.png`) screenshots |
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

This is a student concept, not a PNC product. The Hale family, Alex Lee and all figures are fictional. Succession is an HBO series, referenced for commentary. AI responses in the prototype are simulated.
