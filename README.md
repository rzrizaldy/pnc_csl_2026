# Family Table · CSL 2026

A student concept for PNC Private Bank, built for the 2026 CSL case competition, *Bridging Generational Trust: AI for Asset & Family Transitions*. The track is the sale or transition of a family-owned business.

Built on the team's two personas: **Margaret Wilson**, a founder selling her family transportation business, and **Alex Lee**, her PNC advisor. The prototype shows one sale from both sides: a private, guided app for the family, and a workbench that gives the advisor the whole family's view a year before closing. Adaptive screens and simulated Claude/GPT features throughout.

**Live:** [overview](https://rzrizaldy.github.io/pnc_csl_2026/) · [the Wilson case](https://rzrizaldy.github.io/pnc_csl_2026/case.html) · [architecture](https://rzrizaldy.github.io/pnc_csl_2026/architecture.html) · [prototype](https://rzrizaldy.github.io/pnc_csl_2026/prototype/?reset)

Team: Alen Ilmi · Rizaldy Utomo · Nindy Aditya Dewi · Aditya Mulya Pratama, Carnegie Mellon University.

## What's here

| Path | What |
|---|---|
| `index.html` | Overview: problem, the two personas side by side, the two-lane journey, AI, why only PNC, value and hypotheses |
| `case.html` | The Wilson case: personas and five moments where a family sale goes wrong, with sources |
| `architecture.html` | Solution architecture: 6-layer stack, privacy boundary, service blueprint, request flow, model output contract, AI components, pilot |
| `prototype/` | Mobile-first prototype. Static HTML/CSS/JS, no build step. Pick a side at `#/`, or take the tour at `?tour`; advisor at `#/advisor/...`, family members at `#/me/<id>/...` |
| `prototype/deck.html` | The ten deck slides as animated 1920×1080 screens for the video. `#1`…`#10` pick a slide, arrow keys move, `?auto` plays through, `?clean` hides the progress bar |
| `prototype/shots/` | Desktop (1920×1080) and mobile (`*_m.png`) screenshots |
| `slides/claude_deck/` | Source of the consulting-style slides (Claude Slides format) |
| `slides/build_secret_sauce.py` | Secret Sauce slide as editable PPTX shapes, for Canva import |
| `video/` | Video plan and narration script |
| `TEAM_NOTES.md` | Team coordination: owners, deadlines, open decisions |
| `docs/TWO_WAY_JOURNEY.md` | Reassessment: each persona goal mapped to a screen, and the two-lane journey |

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

This is a student concept, not a PNC product. The Wilson family, Alex Lee and all figures are fictional. AI responses in the prototype are simulated.
