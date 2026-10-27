# Family Table (CSL 2026): current context and what next

Updated 2026-10-26, late ET (round 2 rework). This file is overwritten, not appended.

## Current deliverable
- **Deadline:** Wed Oct 28, 11:59 PM ET. Submit a deck PDF (8–10 slides) plus a 2-min video.
- **Rizaldy's scope:** prototype, video, Secret Sauce slide. In round 2 Rizaldy asked for:
  - a Succession case study and personas
  - a mobile-first prototype in plain words, with more visuals and an adaptive UI
  - simulated Claude/OpenAI AI features
  - reworked Pages with a clear architecture
- **Live site:** https://rzrizaldy.github.io/pnc_csl_2026/ (repo `rzrizaldy/pnc_csl_2026`, public; Pages serves `main` root).
  - `index.html`: overview, problem stats, phone iframe, 4-step journey, AI, sauce, value and hypotheses
  - `case.html`: six Succession patterns, the Hale personas, sources
  - `architecture.html`: 6-layer stack, privacy boundary, request flow, JSON contract, AI component table, pilot plan
  - `site.css`: shared styles for the three pages
- **Prototype** (`prototype/`, hash routes). Round 3 redesign (Rizaldy asked for it): there is no plain/detailed toggle, the copy is professional product writing, and the look borrows Robinhood/Uber patterns (one big number, a trip progress track, a single "Ask about the sale" bar, list rows, bottom sheets) on PNC tokens. Personalization is explained once, via the "Sorted for you" sheet.
  - Picker: `#/`
  - Advisor: `#/advisor`, `/align`, `/docs`, `/plan`
  - Members: `#/me/<walt|marisa|dale|kyle|ross|sloane>[/checkin|/options|/plan]`
  - Video cards: `#/story/{hook,cast,problem,sauce,close}`
- **Screenshots** in `prototype/shots/`:
  - 17 desktop (1920×1080) and 6 mobile (`*_m.png`, 390×844 @2x)
  - 2 Ask-sheet runs
  - Regenerate with `cd video/src && node shots.js`, using a local server on 4311 serving the repo root.
- **Slides:** Claude Slides artifact https://claude.ai/artifact/B7bV9cQnWU4FCvbQWLHYf2, refreshed to the Hale case. 7 slides: cover, case (Succession patterns table), family (two phone shots), advisor (watchlist and alignment), sauce, architecture (6 bands), privacy (backup). The source is copied to `slides/claude_deck/`. The artifact is private until shared.
- **Video:** plan and script v2 only (`video/VIDEO_PLAN.md`, `video/RECORDING_SCRIPT.md`, 226 words). Don't build the pipeline until the script is locked.

## Round 4 (Oct 26 late): devil's-advocate review and motion
- **Another agent's revision is preserved, not merged.** It made 4 commits despite a review-only brief. Rizaldy judged the result worse, so it lives on branch `agent-b-revision`. `main` was restored to commit `2420b22`, then re-fixed.
- **Rizaldy's review:** `docs/DEVILS_ADVOCATE_REVIEW.md`. It keeps the valid findings and reverses the over-corrections. Interview template: `docs/DISCOVERY_WORKSHEET.md` (from agent B).
- **Privacy model in the prototype:**
  - nothing is shared by default
  - each member can opt out of the anonymous family summary (`state.optOut`, Sloane's check-in)
  - the summary needs at least 3 contributors (`MIN_GROUP`)
  - no per-person dots, and unshared answers show only "private"
  - all user text goes through `esc()`
- **Do not reintroduce:**
  - per-person stance dots
  - themes on private answers in the advisor view
  - `shared: ["q2"]` as a default
  - "ranking model" claims for the card order
  - the 37% Julius Baer stat
- **Motion:**
  - View Transitions on route change
  - `.anim` entrance choreography (rise, grow, pop, chart wipe) and count-up/tween via `tween()`
  - only on arrival (`render(true)`); in-page updates glide instead
  - off under prefers-reduced-motion
  - `shots.js` emulates reduced motion so stills show final states; `video/src/motion_check.js` captures frames and checks privacy and escaping
- **Pages** is back to branch deploy (legacy, `main` /). Agent B's Actions workflow was removed.

## Conventions
- **Design system:** PNC Private Bank. Tokens are at the top of `prototype/styles.css` and `site.css`:
  - navy `#10214D` / `#1A2B5C`, orange `#EF6A00` (`#B84F00` for small text)
  - data viz `#6F9A4B` `#424B5A` `#6593C9` `#6D4AA0`
  - Barlow font, 4px radius
  - 5 banner types: ok / attn / req / rec / info
- **CSS gotcha:** the app bar class is `.appbar`. `.bar` is the progress-bar style. Don't reuse it.
- **Person colours:** Walt `#10214D`, Marisa `#8C929B`, Dale `#6593C9`, Kyle `#6F9A4B`, Ross `#E39A2E`, Sloane `#6D4AA0`.
- **Numbers** (`prototype/data.js`):
  - offer $48.0M; earnout $8.0M, contingent; debt $3.5M; fees $1.5M; tax $8.0M → net $27.0M
  - buckets: live on $9.0M, give $12.0M, invest $6.0M
- **Split formula:** rollover equity Kyle $1.5M, Ross $0.5M. Gift = (12 + w·2)/4 − w·equity, so the gifts always sum to $12.0M.
- **Gaps:** (max − min)/4. Fairness is 1.00, sell-now 0.75. The claims are Kyle, Ross and Sloane.
- **Privacy rule in the UI:** the advisor sees anonymous dots and gap sizes, never stances by name. Names appear only for shared answers. Default shared is Sloane's q2.
- **AI is simulated.** Answers are in `SEED.ask`, per viewer, with Claude and GPT variants. Live tags come from regex rules in `RULES` in `app.js`. Everything is labelled "Simulated".

## Decisions and why
- Succession is used as commentary/case study (Rizaldy's request). The Hales are fictional mid-market stand-ins, not the Roy characters. Episode facts were checked via web search; the sources are listed on `case.html`.
- Stats used: Cerulli 13% (2019), Julius Baer 37% informal (2024), PNC 75% regret, 50% involuntary, 80–90% net worth. Don't add uncited numbers.
- No real PNC logo. The mark is our own family-table icon. "Student concept" disclaimers stay on every page.

## Do not touch
- `data.js` figures are internally consistent. Change them only as a set.
- The team's Canva deck `DAHY7Vfs02I`: don't edit without asking.

## Environment gotchas
- ffmpeg has no drawtext or subtitles filter; render captions in-page.
- Playwright headless shell is `~/Library/Caches/ms-playwright/chromium_headless_shell-1234`, using `playwright-core` in `video/src/node_modules` (gitignored).
- The browser pane can't drive `file://`; serve with `python3 -m http.server 4311` from the repo root.

## Verification completed
- `node shots.js`: 17 desktop + 6 mobile routes + 2 Ask runs, zero console or page errors. Desktop and mobile shots were reviewed visually, including the Ask sheet with trace, answer and card.
- Site pages rendered at 1440 and 390 widths: no errors, no horizontal overflow.

## Next steps
1. Team reads `case.html` and agrees on Succession (TEAM_NOTES §0).
2. Canva persona and journey slides to the Hale case and the 4 steps (Nindy and Adit). The Claude slides are already refreshed.
3. Lock script v2 → build the video pipeline (VIDEO_PLAN §5) → TTS draft → Nindy records.
4. Interviews remain the biggest scoring gap (TEAM_NOTES §4).
