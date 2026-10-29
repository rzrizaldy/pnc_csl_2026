# Family Table: the voice-over film (video/src2)

**Superseded by `video/src3/` (the v6 film).** This is the v4 voice-over film. A spoken voice-over drives it: 13 lines, one scene each. There's no music and no sound effects. Bold story cards carry the facts from the team's Canva deck, and footage of the live prototype shows the product. The script is in `../archive/RECORDING_SCRIPT_v5.md` (v4 is in git history).

## Outputs (all gitignored; share them by Drive)
| File | What |
|---|---|
| `video/family_table_vo_draft.mp4` | Picture with the macOS TTS draft voice, for team review |
| `video/family_table_silent.mp4` | Picture with a silent AAC 48 kHz stereo track, to rehearse or record the real voice over |
| `video/family_table_final.mp4` | Picture with Nindy's recording, after `ingest.py` |
| `video/archive/family_table_vo_cues.srt` | One cue per line, from scene start + 0.3 s to scene end − 0.3 s (committed) |

All three MP4s are 1920×1080, 60 fps, H.264 (CRF 16, BT.709) with AAC audio, and run under 120 s.

## Rebuild
Run these from `video/src2/`. You need Node 18 or later, ffmpeg, Python 3 and macOS `say`. Install `playwright-core` with `npm install`, or symlink `node_modules` to `../src/node_modules`. The renderer uses the headless shell at `~/Library/Caches/ms-playwright/chromium_headless_shell-1234/`; set `CHROME_BIN` to use another one. No server is needed, because `render.js` serves the repo itself.

```sh
python3 vo.py tts            # TTS clip per line -> each scene's dur in shots.json -> build/vo_tts.wav (-16 LUFS) -> .srt
node render.js stills        # start/middle/end stills per scene + contact sheets in video/build/stills/ (~2 min)
node render.js video         # 60 fps render (~15 min) -> family_table_silent.mp4 + family_table_vo_draft.mp4
```

**With the real recording** (one take, about 2 s between lines):
```sh
python3 ingest.py ~/Desktop/voiceover.m4a      # split -> re-time -> mix -> render family_table_final.mp4
python3 ingest.py take.m4a --cuts '0.4-5.1,7.0-12.9,...'   # if the splitter can't find exactly 13 lines
```
The splitter must find exactly as many lines as there are scenes, or it stops and prints what it heard. You can retry with `--min-gap 0.6` (shorter pauses) or `--noise-db -32` (a noisier room), or give the boundaries with `--cuts`.

**Changing the timing by hand:**
- Edit `dur` in `shots.json` and run `python3 vo.py mix` (it keeps your durs and rebuilds the track and the cues), then `node render.js video`.
- Or change `min`/`hold` and re-run `vo.py tts`. A scene lasts `max(min, speech + air + hold)`.

**Quick look at a few scenes:** `node render.js stills --only brief,allocate --extra 55.9,62.6` (the extra stills are in seconds of film time).

## How it works
| File | Role |
|---|---|
| `shots.json` | Timing and text: per scene `id`, the spoken `line`, the `tts` spelling, measured `speech`, `min`, `hold` and `dur`; global `fps`, `lead` (voice starts 0.3 s into the scene), `air`, `xfade` (0.5 s dissolves) |
| `stage.html` | The 1920×1080 stage. Two slots per kind (card, desk, phone) take turns and cross-dissolve. One builder per scene (`SCENES` in the script) says what happens: route, state, camera moves, taps, clicks and typing. Beats are keyed to words of the line (`s.w("fairness")`), so they follow the reader's pace |
| `cards.html` | The story cards (hook, stakes, what we heard, two sides, title, the five-layer stack, business, close). `show(id, t, scene)` is a pure function of time. Preview one with `cards.html?id=sauce&t=8` |
| `render.js` | Playwright plus ffmpeg. Fake clock (`page.clock`) for every timer, rAF and `Date` in the stage and the app iframes. `startViewTransition` is removed. The app's CSS animations are paused and seeked to virtual time each frame. Fonts and images are awaited after every route change or action. Captures at device scale 2, downscales with lanczos |
| `vo.py` | TTS draft (`say -v Samantha -r 175`), scene timing, the mix (each line at scene start + 0.3 s, two-pass loudnorm to −16 LUFS, 48 kHz stereo) and the `.srt` |
| `ingest.py` | Real recording in: split on silence, re-time, mix, render |

**Live footage:** it uses the real prototype in `prototype/`, driven through `window.FT` (`reset`, `set`) and real DOM clicks on `[data-act]` elements, so it always shows the current app. If a selector disappears, the render stops and names it.

| Scene | Footage | Action |
|---|---|---|
| Product | `#/` | Camera pans across the three steps |
| Align | `#/me/claire/checkin` | Types answer 1; AI themes appear; taps Share; scrolls to "What Alex sees" |
| Brief | `#/advisor/align` | Trace plays; camera on 1.00 and Margaret's quote, the gap bars, then the draft; cursor approves |
| Allocate | `#/me/sam/options` → `#/me/sam/decide` | Picks Balanced (number tweens), votes, then the tree goes from 4 plans to 1 |
| Activate | `#/me/sam/ask` → `#/advisor/inbox` | Sam asks; cursor approves and sends the AI draft |
| Governance | `#/me/sam/ask` | Shows "Reviewed and sent by Alex" |

## Checks run on the render
```sh
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,r_frame_rate,sample_rate,channels -of compact ../family_table_silent.mp4
ffmpeg -i ../family_table_silent.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null - 2>&1 | grep -c pts_time   # hard cuts: expect 0
ffmpeg -i ../family_table_silent.mp4 -vf "freezedetect=n=0.002:d=2.5" -map 0:v -f null - 2>&1 | grep freeze_start
```
