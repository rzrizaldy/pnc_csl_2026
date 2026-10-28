# Prompt: build the Family Table 2-minute video (Vitamin Bob workflow)

Copy everything below the line into Claude Code (or any agent that can run shell commands, write files and drive a headless browser). It is self-contained. The only extra input is Nindy's narration recording when it's ready.

## Tools the agent needs

| Need | Claude Code tool | Used for |
|---|---|---|
| Read and write files | Read, Write, Edit | `narration.json`, `demo.html`, `render.js`, `ingest.py`, captions |
| Run commands | Bash | `git clone`, `npm i`, `node`, `python3`, `ffmpeg`, `ffprobe` |
| Headless browser | Bash running `playwright-core` (Chromium headless shell) | Seek each frame and screenshot it at 1920×1080, 30 fps |
| Look at images | Read on PNG/JPG | Review the preview stills before rendering the full video |
| Optional: watch the live prototype | the built-in browser (`preview_start` / `navigate`) | Check the screens being filmed |

Software on the machine:
- Node 18+
- Python 3.10+
- `ffmpeg` and `ffprobe` (Homebrew `ffmpeg` is fine; if it lacks `drawtext`/`subtitles`, captions are drawn in the page instead, which this plan already does)
- `npx playwright install chromium-headless-shell`

No API keys are needed. Everything is rendered locally from code.

---

## The prompt

You are building a 2-minute pitch video for **Family Table**, a student concept for PNC Private Bank (CSL 2026 case competition, Carnegie Mellon). Use the same workflow that produced the Vitamin Bob video: scenes are rendered deterministically from an HTML page with Playwright, the narration drives the timing, and ffmpeg assembles everything. Work in a new folder `video/` inside the repo.

### Inputs
1. **Repo:** `git clone https://github.com/rzrizaldy/pnc_csl_2026`. Read these first:
   - `PROJECT_CONTEXT.md` for the facts, numbers, personas and the "never reintroduce" list
   - `video/RECORDING_SCRIPT.md` for the 11 narration lines (v3)
   - `video/VIDEO_PLAN.md` for the storyboard
2. **Live prototype:** https://rzrizaldy.github.io/pnc_csl_2026/prototype/
   - `?reset` clears its state, and `?tour` starts the guided demo.
   - `window.FT.set({...})` sets demo state, and `location.hash = "#/route"` changes screens.
3. **Narration audio:** one take by Nindy. It's a `.mov`, `.mp4` or `.m4a`, with a pause of about 2 seconds between the 11 lines. If it isn't available yet, generate a draft with macOS `say -v Samantha` per line.

### Output
- `video/family_table_draft_tts.mp4`: the TTS draft, for team review.
- `video/family_table_final.mp4` and `video/family_table_final.srt`, with this spec:
  - 1920×1080, 30 fps, H.264 (`yuv420p`), AAC audio
  - **at most 120.0 s** long
  - loudness −16 LUFS

### Build steps

1. **`video/src/narration.json`.** List the 11 lines from `RECORDING_SCRIPT.md`. Each line has:
   - `id`
   - `text` (spoken), and `caption` (on screen, shorter if needed)
   - `scene`: the prototype route or a story card
   - `actions`: clicks to perform during the line, as CSS selectors and times in seconds
   - `dur`: filled in later from the audio

   Map the scenes like `VIDEO_PLAN.md` §3:

   | Line | Scene |
   |---|---|
   | 1 | `#/story/hook` |
   | 2 | `#/story/problem` |
   | 3 | `#/story/cast` |
   | 4 | `#/advisor` (click `[data-act="start"]`) |
   | 5 | `#/preview`, then `#/me/margaret/setup` (click `[data-act="invite"]`) |
   | 6 | `#/me/claire/checkin` (click `[data-act="toggle-share"][data-id="q1"]`) |
   | 7 | `#/advisor/align` (the AI trace plays; click `[data-act="approve"]`) |
   | 8 | `#/me/sam/options`, then `#/me/sam/decide` |
   | 9 | `#/advisor/inbox` (click `[data-act="send"]`) |
   | 10 | `#/year-one` |
   | 11 | `#/story/sauce`, then `#/story/close` |

2. **`video/src/capture.js`** (Playwright).
   - Open the prototype at 1920×1080 with `deviceScaleFactor: 1`.
   - For each scene, set the state with `FT.set` and the route, and wait for fonts and images.
   - Run the actions on a schedule. Draw a visible cursor: an absolutely positioned dot, moved with eased steps before each click.
   - Record each scene as a PNG frame sequence at 30 fps. For a static screen, capture one frame and hold it; for motion, capture every frame.
   - Phone moments (lines 6 and 8) render the page at 390×844 and composite it, centred, on the navy `#10214D` patterned background.
   - Draw captions in the page (bottom centre, Barlow 40px, white on 70% navy), not with ffmpeg.

3. **`video/src/render.js`.** Pipe frames to ffmpeg:
   `ffmpeg -f image2pipe -framerate 30 -i - -c:v libx264 -pix_fmt yuv420p -crf 18 silent.mp4`

   Then mix each narration line at its scene start with `adelay`, and add 0.35 s of lead-in before each line.

4. **`video/src/ingest.py`** (the core of the Vitamin Bob trick).
   - Convert the recording to 48 kHz mono WAV and loudness-normalise it with `loudnorm=I=-16:TP=-1.5:LRA=11`.
   - Split it on pauses with `silencedetect=noise=-35dB:d=0.9`. **It must find exactly 11 speech segments, or exit with an error.** Never guess. Accept `--cuts 12.3,25.1,…` to override the split points by hand.
   - Write each segment's length into `narration.json` as `dur`, so the scenes re-time to the speaker's pace. Then call `render.js`.
   - **Face bubble:** if the recording has video, crop the face to a circle with an alpha mask (`geq` or `alphamerge` with a circle PNG). Scale it to 300 px with a 6 px white ring and overlay it bottom-right with 48 px margins, on lines 4 to 9 only. Hide it on the full-bleed story cards.
   - **Music:** with `--music file`, loop it under the voice at −20 dB. Duck it with `sidechaincompress` while the voice plays, and fade it in and out over 1.5 s.
   - **Captions:** write `family_table_final.srt` from the segment timings and caption text.

5. **`video/src/make_music.py`** (optional). Generate an original, licence-free ambient bed at about 92 BPM in a soft private-bank tone, using numpy and wave. Write it to `music_bed.wav`.

### Workflow
1. `node render.js preview` writes one still per scene, late in each scene, to `video/src/preview/`. Open every still and check:
   - text isn't clipped
   - the cursor lands on the right button
   - the face bubble never covers a button being clicked
   - captions are readable
2. Fix any problems, then run the TTS draft (`python3 ingest.py --tts`), which uses `say` per line.
3. When Nindy's take arrives: `python3 ingest.py ~/path/to/take.mov --music music_bed.wav`.
4. Verify with `ffprobe`: duration ≤ 120.0 s, 1920×1080, 30 fps, an AAC stream. Watch the result once with sound and once muted.

### Rules
- **Use only facts in `PROJECT_CONTEXT.md`.** The only spoken statistic is "thirteen percent" (Cerulli 2019). Wilson figures are fictional, and the video says so on the end card.
- **No real PNC logo.** Use the Family Table mark from the prototype.
- **Keep it under 2:00.** If the take runs long, cut line 3 first, then the last sentence of line 8.
- **Don't edit the prototype or the slides.** Only create files under `video/`. Commit to a branch, not `main`, unless told otherwise.
- **Report back:** final duration, file paths, and anything you couldn't do.
