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
- A **cursor** moves and clicks for each real action: Call Margaret, Invite the family, Share with Alex, Approve brief, Equity counted, Introduce.
- **Captions** at the bottom centre, in the prototype's Barlow font. Many judges watch on mute.
- **Music:** a quiet, original background bed, generated in code so there are no licence issues. It ducks under the voice.

## 3. Storyboard and script v3: two sides of one sale (about 240 words, about 1:55)

The demo follows the guided tour, which alternates the family side and the advisor side. Each family-side scene is rendered at phone size (390×844) on the navy pattern; each advisor-side scene at desktop size.

| # | Screen (prototype route) | Side | On-screen action | Narration (Nindy) |
|---|---|---|---|---|
| 1 | `story/hook` | — | — | Margaret Wilson is selling the trucking company she built over thirty-five years. Her family has never talked about what's fair. |
| 2 | `story/problem` | — | stats build in | Most families don't, until the money arrives. By then the advisor has heard from one person, and only thirteen percent of adult children keep their parents' advisor. |
| 3 | `story/cast` | — | Margaret, Alex, then the family | Family Table helps both sides of the sale: Margaret's family, and Alex, her PNC advisor. |
| 4 | `advisor` | Advisor | chart draws; cursor → **Call Margaret** | PNC already banks the business. Payments to deal advisers flag a likely sale a year ahead, so Alex calls Margaret before anything is signed. |
| 5 | `me/margaret` | Family | cursor → **Invite the family**; voices appear | Margaret invites her family. Each of them answers in private. She sees who has answered, never what they said. |
| 6 | `me/claire/checkin` | Family | tags pop as text appears; cursor → **Share** on answer 1 | Claire writes what she's never told her mother: equal is the only fair split. She decides whether Alex can read it. |
| 7 | `advisor/align` | Advisor | 4 of 5 voices; founder's view against the family's; cursor → **Approve brief** | Alex now hears four voices, not one. Margaret's plan assumes the kids agree. The family's widest gap is fairness. AI drafts the brief, a facilitator is booked, and Alex approves it. |
| 8 | `me/sam` → `me/sam/options` → Ask | Family | **Equity counted**; shares move; Ask "When will I receive my share?" | Sam just wants his number. So that comes first, and every share moves together as the family compares splits. Claude or GPT explains, inside PNC's guardrails. |
| 9 | `advisor/docs` → `advisor/plan` | Advisor | **Send to estate attorney**, then **Introduce** Claire | Old documents go to the right specialist, and Alex meets Claire and Sam before eight million dollars reaches them. |
| 10 | `story/sauce` | — | three layers | Why only PNC? It sees the sale coming. It hears what families won't say out loud. And it meets the heirs before the money moves. |
| 11 | `story/close` | — | end card, team names | Family Table. A plan the family trusts. An advisor who hears everyone. Proceeds that stay. |

**Hard cap is 2:00.** If the take runs long, cut line 3 first, then the second sentence of line 8. Lines 4 to 7 stay.

**Facts spoken, all cited on screen:**
- "Thirteen percent" is from Cerulli 2019, via InvestmentNews.
- "Eight million dollars" is the prototype's fictional figure ($8.0M to $9.0M for Claire and Sam).
- No other statistics are spoken.

## 4. What Nindy records

One take with webcam and mic, reading `RECORDING_SCRIPT.md` (v3) with **two-second pauses** between the 11 lines. It takes about 5 minutes including a retake.

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
| | | • Overlays the bubble on scenes 4–9. | |
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
- [x] Personas: the Wilsons everywhere, matching the team deck (Succession framing dropped, Oct 27)
- [ ] Do we show team faces at the end, or just names?
- [ ] English accent and pace: Nindy's natural pace is fine; the pipeline adapts
