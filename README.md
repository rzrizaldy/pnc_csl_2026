# Family Table · CSL 2026

A student concept for PNC Private Bank, built for the 2026 CSL case competition *Bridging Generational Trust: AI for Asset & Family Transitions*, on the track for the sale of a family-owned business.

Family Table is a consent-based AI layer that sits between a family and their PNC advisor. It takes them through three steps: **Align**, **Allocate** and **Activate**. The story follows the team's two personas, and the prototype shows one sale from both sides:
- **Margaret Wilson** is selling the transport company she built. The family side is a private, guided app.
- **Alex Lee** is her PNC advisor. Alex's side is a workbench that shows the whole family a year before closing.

**Live:** [overview](https://rzrizaldy.github.io/pnc_csl_2026/) · [the Wilson case](https://rzrizaldy.github.io/pnc_csl_2026/case.html) · [architecture](https://rzrizaldy.github.io/pnc_csl_2026/architecture.html) · [who at PNC](https://rzrizaldy.github.io/pnc_csl_2026/pnc-teams.html) · [prototype](https://rzrizaldy.github.io/pnc_csl_2026/prototype/?reset)

**Team:** Alen Ilmi, Rizaldy Utomo, Nindy Aditya Dewi and Aditya Mulya Pratama, Carnegie Mellon University.

## Repository map

```
.
├── index.html, case.html, architecture.html, pnc-teams.html, site.css   showcase site (GitHub Pages, served from the root)
├── prototype/            the clickable prototype: static HTML/CSS/JS, no build step
│   ├── faces/            AI-generated portraits of the fictional people
│   └── shots/            desktop and mobile screenshots
├── slides/
│   ├── claude_three/     4 core slides (client, advisor workbench, secret sauce, feasibility), Claude Slides source
│   ├── claude_deck/      the earlier 12-slide Claude Slides deck
│   ├── canva/            the 3 core slides as editable PPTX in the team Canva look
│   └── secret_sauce/     the first Secret Sauce slide (PPTX shapes)
├── video/
│   ├── src3/             the final 2-minute film (v6): stage, renderer, voice take pipeline
│   ├── src/              shared tools: screenshots, QA and slide-render checks (holds node_modules)
│   ├── src2/, apple/     earlier films (v4 voice-over, music-only), superseded
│   ├── archive/          earlier plans, scripts and cue files
│   ├── RECORDING_SCRIPT_v6.md    the voice-over script and how to record it
│   └── family_table_v6_cues.srt, family_table_v6_final_v2.srt   cues and the final subtitles
├── docs/                 two-way journey, discovery worksheet, devil's-advocate reviews, team notes
├── prompts/              reusable prompts (devil's-advocate review, video pipeline)
├── PROJECT_CONTEXT.md    full project context for anyone picking the work up
└── current-context-what-next.md   short current state and next steps
```

## Run the site and prototype

```bash
python3 -m http.server 4311
```

Then open http://localhost:4311 for the site, or http://localhost:4311/prototype/?reset for the prototype.
- `?reset` clears the demo state, and `?tour` starts the guided demo.
- Advisor screens are under `#/advisor/...` and family members under `#/me/<margaret|tom|ben|claire|sam>/...`.

## Build the film

The final film is built in `video/src3/`. Its timing and script lines live in `shots.json`, and its story is in `STORYBOARD.md`. Rendering is deterministic: Playwright steps the live prototype under a fake clock, and ffmpeg encodes 1920×1080 at 60 fps.

**Requirements:**
- Node 18+ and Python 3 with Pillow
- ffmpeg
- `npm install` in `video/src`, whose `node_modules` the other film folders link to
- a Playwright headless shell

```bash
cd video/src3
node render.js stills --every 2                                         # contact sheets in video/build3/stills
node render.js video                                                    # silent picture -> video/family_table_v6_silent.mp4
python3 take.py plan "<voice take>"                                     # find the 12 line starts, write take.json
python3 take.py subs "<voice take>"                                     # subtitle cues timed to the voice
node render.js video --take take.json --subs take_subs.json --pic picture_take_subs.mp4
python3 take.py mux "<voice take>" --pic picture_take_subs.mp4 --name family_table_v6_final_v2.mp4
```

`take.py` keeps the recording uncut, so lips stay in sync. It warps the film so each scene starts on its line, places the speaker's face as a round bubble at the bottom left, and levels the voice to −16 LUFS.

The finished MP4s aren't committed (`*.mp4` is gitignored); share them through Drive.
- `family_table_v6_final_v2.mp4`: the voice, the face bubble and subtitles
- `family_table_v6_final.mp4`: the same without subtitles

## Disclaimers

This is a student concept, not a PNC product. The Wilson family, Alex Lee and all figures are fictional, and their portraits are AI-generated. AI responses in the prototype are simulated.
