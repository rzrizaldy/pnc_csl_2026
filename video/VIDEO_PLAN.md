# Family Table · 2-minute video plan

**Status:** plan only. Nothing is rendered yet. The build steps in §5 start once the team agrees on the script.

## 1. What the judges need

From the prompt: a 2:00 elevator pitch to the committee. It should *hook, give the core value, hit the strategy high points, and walk through a brief demo*. It should not read the slides.

**Delivery:** MP4 (1920×1080, H.264 + AAC), or a Drive link set to "Anyone with the link can view". Due Wed Oct 28, 11:59 PM ET, together with the deck PDF.

**Scoring:**
- Pitch & storytelling is 20%, shared with the deck.
- The demo also carries Product & dual UX, which is 25%.

## 2. Format: Loom-style

- The prototype fills the screen. All scenes are real prototype screens, rendered from code, so they are pixel-sharp.
- Nindy's face sits in a **round bubble at the bottom right** (about 300 px, white ring). It shows during the demo scenes and hides on the full-bleed story cards.
- A **cursor** moves and clicks for each real action: Start conversation, Share with Alex, Approve brief, Approve plan.
- **Captions** at the bottom centre, in the prototype's Barlow font. Many judges watch on mute.
- **Music:** a quiet, original background bed, generated in code so there are no licence issues. It ducks under the voice.

## 3. Storyboard and script v2: the Succession case (226 words, about 1:50)

| # | Screen (prototype route) | On-screen action | Narration (Nindy) |
|---|---|---|---|
| 1 | `story/hook` | — | In Succession, Logan Roy sells his company and loses his family. Secret promises. A forgotten clause. A note in a safe. Real families do the same. |
| 2 | `story/problem` | stats build in | When a family business sells, the money usually leaves the bank with the kids. Only thirteen percent of adult children use their parents' advisor. |
| 3 | `story/cast` | Hale ↔ Roy cast | Meet the Hales: a forty-eight-million-dollar freight company, with the same family. |
| 4 | `advisor` | gauge, then cursor → **Call Walt** | PNC already banks the business. Payments to deal advisers flag a likely sale a year ahead, so Alex, the advisor, calls before anything is signed. |
| 5 | `me/sloane/checkin` | tags pop as text appears; cursor → **Share with Alex** on answer 1 | Each family member has their say, privately. As Sloane types, AI picks out the themes. She decides what Alex can read. |
| 6 | `advisor/align` | collision shows one named seat; cursor → **Approve brief** | Alex sees the gaps, not the words. Three people expect to lead. AI drafts the brief; Alex approves it. |
| 7 | `advisor/docs` | cursor → **Send to family attorney**, then **Share counsel's summary** | Document AI finds the clause nobody remembered: one that may let any one child block the sale. |
| 8 | `me/dale` → Ask sheet | switch between people; Ask "When would I actually get money?" (tool trace, answer, card) | And every screen adapts. Dale just wants to know when he gets paid, so that comes first. He asks in plain words, and Claude or GPT answers, inside PNC's guardrails. |
| 9 | `me/dale/options` → `me/walt/plan` | drag slider 0 → 100; cursor → **I agree in principle** | The family compares fair splits, agrees a plan, and signs it. No more notes in the safe. |
| 10 | `story/sauce` | three layers | Why only PNC? It sees the sale coming. It hears what families won't say out loud. And it meets the heirs before the money moves. |
| 11 | `story/close` | end card, team names | Family Table. Keep the proceeds. Meet the next generation. Help a family stay a family. |

**Hard cap is 2:00.** If the take runs long, cut line 3 first, then line 7. Lines 4–6 and 8 stay.

**Mobile moment:** scene 8 is rendered at phone size (390×844), centred on the navy pattern, so judges see that the family side works on a phone.

**Facts spoken, all cited on screen:**
- "Thirteen percent" is from Cerulli 2019, via InvestmentNews.
- The plot points are paraphrased from the episodes listed on `case.html`.
- No other statistics are spoken.

## 4. What Nindy records

One take with webcam and mic, reading `RECORDING_SCRIPT.md` (v2) with **two-second pauses** between the 11 lines. It takes about 5 minutes including a retake.

## 5. Build plan (after script sign-off; adapted from Vitamin Bob, `~/CodeFolder/hack4nation_health_worldbank/video/src`)

| Step | File | What it does | Reused from Vitamin Bob |
|---|---|---|---|
| 1 | `src/narration.json` | The 11 lines: id, text, route, actions | `narration.json` format |
| 2 | `src/tts.py` | Draft voice with macOS `say` (Samantha), so the team can review the cut before Nindy records | new |
| 3 | `src/render.js` | Playwright drives the prototype at 1920×1080. It moves a cursor, clicks, scrolls and draws captions in-page. It captures only the frames that change and holds the rest (ffmpeg concat), then mixes each line at its scene start | `render.js` (Playwright → ffmpeg pipe, `adelay` mix) |
| 4 | `src/ingest.py` | Takes Nindy's take and does the following, then calls render: | `ingest.py` (loudnorm −16 LUFS, `silencedetect` split, `--cuts` override, sidechain ducking) |
| | | • Loudness-normalises it. | |
| | | • Splits it on the pauses into 11 lines, failing loudly if the count is off. | |
| | | • Re-times the scenes to her pace. | |
| | | • Cuts matching face clips and holds each one's last frame to fill its scene. | |
| | | • Masks the face into a circle (`geq` alpha). | |
| | | • Overlays the bubble on scenes 3–9. | |
| 5 | `src/make_music.py` | Original music bed. Slowed to ~92 BPM and made softer for a private-bank tone | `make_music.py` |

**Local ffmpeg has no subtitle or drawtext filter.** Captions are therefore drawn by the page during capture, which is also why they match the UI font.

**Outputs:**
- `video/family_table_draft_tts.mp4` (robot voice, for review)
- `video/family_table_final.mp4` + `.srt`

**Checks before upload:**
- `ffprobe` duration ≤ 120.0 s, 1920×1080, AAC.
- Watch it end to end with sound and on mute.
- The bubble never covers a button being clicked.
- Captions match the voice.

## 6. Schedule (ET)

| When | What | Who |
|---|---|---|
| Mon night | Team reads this plan and the script; edits wording in `RECORDING_SCRIPT.md` | All |
| Tue 12:00 | Script locked | Adit (narrative owner) |
| Tue 12:00–16:00 | Build steps 1–3 and 5, render the TTS draft | Rz |
| Tue 18:00 | Nindy records (5 min) and drops the file in the team folder | Nindy |
| Tue 18:00–22:00 | Ingest, final render, review round | Rz + team |
| Wed by 12:00 | Upload to Drive, set "Anyone with the link can view", paste the link in the submission | Rz (needs OK to share) |

## 7. Decisions still open

- [ ] Product name on the end card ("Family Table" is a working name)
- [ ] Team OK with leading on Succession (the deck persona slide still shows the Wilson family; switch to the Hales?)
- [ ] Do we show team faces at the end, or just names?
- [ ] English accent and pace: Nindy's natural pace is fine; the pipeline adapts
