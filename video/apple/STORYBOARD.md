# Family Table: 2-minute launch film (Apple-keynote style)

Source: the team Canva deck `DAHY7Vfs02I`, pages before the appendix: cover, executive summary, market, customer discovery, persona and journey, family experience, advisor workbench, secret sauce, business thesis, impact, roadmap.

**Format:**
- 1920×1080, 30 fps, exactly 120.0 s
- music only, no narration; the story is told in big kinetic type plus app footage

**Look:**
- near-black PNC navy `#050B1E` with a soft orange glow
- Barlow 800 headlines with tight tracking
- the app floats in device frames
- camera push-ins and pull-outs on the exact part of the screen that matters

**Music:**
- original, synthesized, 96 BPM (one bar is 2.5 s), so every cut lands on a bar line
- sub "boom" hits on the reveals, a riser into the title, a groove under the features, a quiet break for governance, a final swell

| # | Time (s) | Scene | On screen | Music |
|---|---|---|---|---|
| 1 | 0–7.5 | Hook | **$124T** counts up: "in U.S. wealth changes hands by 2048." | Heartbeat pulse; boom at 2.5 |
| 2 | 7.5–15 | Stakes | **55%** "of heirs won't keep their parents' advisor." | Pulse continues |
| 3 | 15–22.5 | Turn | "A business sale doesn't just move money." Then "It moves a family." | Pad opens |
| 4 | 22.5–30 | Discovery | "We listened to five families." Three insights: Letting go is personal. Roles get unclear. Knowledge leaves with the founder. | Riser |
| 5 | 30–35 | Title | **Family Table** mark scales in: "Crafting the family future, today." | BOOM |
| 6 | 35–40 | Two sides | Margaret and Alex portraits: "One sale. Two sides." | Groove starts |
| 7 | 40–45 | Three steps | ALIGN, ALLOCATE, ACTIVATE, one word per beat group | Hit on each |
| 8 | 45–57.5 | Align | Phone: Claire's private check-in. Push in on the AI themes, then the "Share with Alex" switch. "Speak in private. You choose what Alex sees." | Groove |
| 9 | 57.5–70 | Allocate | Phone: vote, then decide. Push in on "1 of 12": "See your number. Vote privately. Twelve plans, one decision." | Groove |
| 10 | 70–80 | Activate | Phone: Ask Alex. Push in on "Reviewed and sent by Alex": "Ask a person, not a bot." | Groove |
| 11 | 80–92.5 | Advisor | Desktop AI brief starts tight on **1.00** and pulls out to the whole workbench; then the inbox "Approve and send". "AI prepares the analysis. The advisor makes the call." | Groove peaks |
| 12 | 92.5–100 | Governance | "Nothing reaches the family until the advisor approves it." | Break, pad only |
| 13 | 100–107.5 | Secret sauce | Isometric stack drops in layer by layer: "Three proprietary assets. One consented stack." | Build |
| 14 | 107.5–115 | Business | "$499B in client assets." "Pilot: 10 families, 3 advisors, 90 days." | Swell |
| 15 | 115–120 | Close | Mark plus "Family Table. Crafting the family future, today." Team and CMU. | Final hit, decay |

**Files (in `video/apple/`):**
- `capture.js`: high-res app screens plus element boxes for the zoom targets
- `film.html`: every scene, one GSAP timeline, `window.seek(t)`
- `music.py`: synced score, with booms on the cue times
- `render.js`: preview stills, or 3600 frames to ffmpeg, then the music mux
- Output: `video/family_table_film.mp4`

Facts come only from the deck: $124T, 55%, $499B, five interviews, the pilot of 10 families and 3 advisors. The Wilson family and the app data are fictional.
