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

## 3. Storyboard and script (≈250 words ≈ 1:50)

| # | Time | Screen (prototype route) | On-screen action | Narration (Nindy) |
|---|---|---|---|---|
| 1 | 0:00 | `story/hook` | — | Margaret built Wilson Transport over thirty years. Next year, she'll sell it. Her three kids don't know what that means for them. Neither does her bank. |
| 2 | 0:11 | `story/problem` | stats build in | That sale is when families split and money walks out the door. Seventy-five percent of owners profoundly regret selling, a year later. |
| 3 | 0:21 | `advisor/signals` | face bubble appears | This is Family Table: one platform for PNC Private Bank, with a portal for the family and a workbench for the advisor. |
| 4 | 0:30 | `advisor/signals` | cursor → **Start conversation** | It starts with a signal PNC already holds. Activity on Wilson's business account flags a likely sale, a year ahead. Alex, the advisor, sees why, and calls Margaret before the deal is signed. |
| 5 | 0:44 | `family/overview` | slow scroll waterfall → donut | Margaret sees what she'll really keep, after debt, fees and taxes, with the earnout set aside because it isn't guaranteed. |
| 6 | 0:53 | `family/checkin` | cursor → **Share with Alex** on answer 2 | Then each family member checks in, privately. Emma chooses which answers Alex can read. Her family never sees them. |
| 7 | 1:02 | `advisor/brief` | the shared answer unlocks; cursor → **Approve brief** | Alex sees where the family disagrees, not what they wrote. A fixed formula scores the gaps, a language model drafts the brief, and Alex approves it. |
| 8 | 1:14 | `family/options` | cursor hovers the three options | The family compares three ways to share the gift: numbers from a calculator, trade-offs in plain English. |
| 9 | 1:22 | `family/plan` | cursor → **Approve plan** | They agree on a plan, and everyone gets a next step, including the kids who don't bank with PNC yet. |
| 10 | 1:31 | `story/sauce` | three layers build in | Why only PNC? It sees the sale coming. It hears what families won't say out loud. And it maps the whole household, so heirs become clients before the money moves. |
| 11 | 1:44 | `story/close` | end card, team names | Family Table. Keep the proceeds. Meet the next generation. Help a family stay a family. |

The times are estimates at about 145 words a minute with short gaps. Nindy's real pace re-times every scene automatically (§5), so nothing needs to be timed by hand.

**Hard cap is 2:00.** If the take runs long, cut line 8 first, then line 3. The demo lines (4–7) stay.

**Facts used, all with sources on screen:**
- "Seventy-five percent profoundly regret" is from PNC Paper 2. The story card cites it.
- "A year ahead" matches the prototype's 12–18-month signal, which is a concept.
- No other statistics are spoken.

## 4. What Nindy records

One take with webcam and mic, reading `RECORDING_SCRIPT.md` with **two-second pauses** between the 11 lines. It takes about 5 minutes including a retake.

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
- [ ] Do we show team faces at the end, or just names?
- [ ] English accent and pace: Nindy's natural pace is fine; the pipeline adapts
