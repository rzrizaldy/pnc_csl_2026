# Family Table (CSL 2026): current context and what next

Updated 2026-10-28 (film final and repo tidy). This file is overwritten, not appended. The full context is in `PROJECT_CONTEXT.md` and the map in `README.md`.

## Current deliverables
- **Deadline:** Wed Oct 28, 11:59 PM ET. Submit a deck PDF (8–10 slides) and a 2-minute video.
- **Live site:** https://rzrizaldy.github.io/pnc_csl_2026/. GitHub Pages builds from `main` root, so the site pages stay at the root.
- **Prototype:** `prototype/`, using hash routes; `?reset` and `?tour` work.
- **Core slides:** "Family Table: core slides", https://claude.ai/artifact/4i1gadSusfcxXqzgcHbiaz, source in `slides/claude_three/`.
  - 4 slides: client, advisor workbench, secret sauce, feasibility.
  - Nindy's two Activate label fixes are live and committed.
- **Film (final):** `video/src3/`, 1:59.9, 1920×1080, 60 fps, gitignored MP4s in `video/`:
  - `family_table_v6_final_v2.mp4`: Nindy's voice, a round face bubble and subtitles
  - `family_table_v6_final.mp4`: the same without subtitles, kept as a backup
  - **Script:** `video/RECORDING_SCRIPT_v6.md`. **Subtitles:** `video/family_table_v6_final_v2.srt`.

## Conventions
- **Film look:**
  - navy `#0D1C44`, orange `#EF6A00`, AI purple `#7C6CF0`, Barlow
  - one isometric projection for everything; devices stand up out of it
  - only two numbers on screen ($124T, 5 of 5)
- **Prototype and site tokens:** in `prototype/styles.css` and `site.css`. The numbers live in `prototype/data.js`; change them only as a set.
- **Versioned outputs:** a new render gets a new file name. `render.js` and `take.py` won't overwrite an existing MP4 (Rz asked for this).

## Decisions and why
- **The film follows Adit's cut** (`video/adit/`, a teammate's draft, kept local). Rz asked to keep the order and the family-and-advisor relationship.
- **Every product shot sits in a device frame, and devices hold pixel-still** (Rz's v6 notes).
- **The voice take stays uncut and the film is time-warped to it:** lips stay in sync, and each scene starts on its line.
- **The bubble sits at the bottom left** because that's the one corner the film leaves empty (occupancy measured over every frame). The side diagrams shift right to keep it clear.
- **Subtitles are small and centred on the bottom band.** Devices never go below y = 990.

## Do not touch
- **The team's Canva deck `DAHY7Vfs02I`:** don't edit it without asking.
- **`video/adit/` and any `video/recording human/` take:** these are teammates' files, local only and gitignored.
- **Don't move the site pages out of the root:** Pages URLs would break.
- **Don't move `video/src3`, `src2` or `apple` to another depth:** their scripts resolve the repo root and `prototype/` relatively.

## Environment gotchas
- **`node_modules`:** the film folders symlink to `video/src/node_modules`; run `npm install` there on a new machine.
- **ffmpeg:** this ffmpeg has no `drawtext` or `subtitles` filter, so subtitles are drawn in `stage.html`.
- **Headless browser:** Playwright's headless shell is expected at `~/Library/Caches/ms-playwright/chromium_headless_shell-1234/`.

## Verification completed
- **Final v2:** ffprobe gives 119.9 s, h264 1080p60 and AAC 48 kHz, at −16.2 LUFS. No hard cuts (scene > 0.3), no freezes (n = 0.002, d = 2.5).
- **Frames:** checked at every scene; the bubble and the subtitles cover no content.
- **Not done:** no one here has listened to the audio, and the subtitle wording hasn't been checked word by word against the take, because there's no transcription tool.

## Next steps
1. Watch `family_table_v6_final_v2.mp4` once with sound and check the subtitles against the voice.
2. Upload both finals to Drive with anyone-with-the-link access, and put the link in the submission.
3. Export the deck PDF from Canva, using the 4 core slides as the reference.
