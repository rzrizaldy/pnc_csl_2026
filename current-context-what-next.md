# Family Table (CSL 2026): current context and what next

Updated 2026-10-27 (round 5: two-sided rework). This file is overwritten, not appended.

## Current deliverable
- **Deadline:** Wed Oct 28, 11:59 PM ET. Submit a deck PDF (8–10 slides) and a 2-minute video.
- **Rizaldy's scope:** prototype, video, Secret Sauce slide.
- **Live site:** https://rzrizaldy.github.io/pnc_csl_2026/ (public repo `rzrizaldy/pnc_csl_2026`; Pages builds from `main` root, legacy build).
  - `index.html`: problem stats, then "Two sides of one sale" (Margaret light card, Alex dark card, goal → screen), the two-lane journey (6 stages), phone iframe, AI, why PNC, value
  - `case.html`: the Wilsons, and five moments where a sale goes wrong (PNC-sourced)
  - `architecture.html`: the stack, a service blueprint table, Sam's request end to end, JSON contract, AI table, pilot
- **Prototype** (`prototype/`, hash routes):
  - picker `#/` (two side tiles plus the family)
  - advisor `#/advisor[/align|/docs|/plan]`
  - members `#/me/<margaret|tom|ben|claire|sam>[/checkin|/options|/plan]`
  - video cards `#/story/{hook,cast,problem,sauce,close}`
  - `?tour` runs the 6-step tour, alternating Advisor and Family sides; `?reset` clears state
- **Slides:** Claude Slides artifact https://claude.ai/artifact/B7bV9cQnWU4FCvbQWLHYf2 (private until shared). 9 slides: cover, sides, journey, blueprint, family, advisor, sauce, architecture, privacy. Its source is copied to `slides/claude_deck/`.
- **Video:** plan and script v3 only (`video/VIDEO_PLAN.md`, `video/RECORDING_SCRIPT.md`). Nothing is rendered yet.

## Decisions and why
- **Personas = the team's Canva persona slide** (Rizaldy, Oct 27: "based on this two way persona… strip off verbose succession"). Margaret Wilson is the founder and Alex Lee the advisor. The Hales and all Succession references were removed from the app, site, slides and script. Don't reintroduce them.
- **Core insight is fairness:**
  - Margaret's own plan (`SEED.ownerPlan`) is an equal split, and she believes "the kids are on the same page".
  - The anonymous summary's widest gap is "equal shares", at 1.00.
  - The old "3 of 5 expect to lead" is gone, because after a sale to an outside buyer nobody leads the company.
- **Every screen maps to one persona goal or friction.** The mapping is in `docs/TWO_WAY_JOURNEY.md`.
- **Journey stages match the team deck:** Signal, Join, Align, Allocate, Activate, Continue.
- **Pronouns:** Margaret is "she" (the team slide says so). Alex is never given a pronoun; write "Alex". Ben, Sam and Tom ("his") and Claire ("her") are fictional characters we defined.

## Conventions
- **Design system:** PNC Private Bank tokens in `prototype/styles.css` and `site.css`:
  - navy `#10214D`/`#1A2B5C`, orange `#EF6A00` (`#B84F00` for text)
  - data viz `#6F9A4B` `#424B5A` `#6593C9` `#6D4AA0`
  - Barlow font
- **Avoid these AI-template tells:**
  - no one-sided stripes
  - no tracked uppercase labels (the site nav is the PNC exception)
  - no "A · B · C" meta strings
  - no numbering on things that aren't a sequence
- **Person colours:** Margaret `#10214D`, Tom `#8C929B`, Ben `#6F9A4B`, Claire `#6D4AA0`, Sam `#6593C9`.
- **Numbers** (`prototype/data.js`; change them only as a set):
  - offer $48.0M, earnout $8.0M, debt $3.5M, fees $1.5M, tax $8.0M → net $27.0M
  - buckets: live on $9.0M, give $12.0M, invest $6.0M
- **Split formula:** Ben keeps $1.5M of buyer equity. Gift = (12 + 1.5w)/3, with Ben's share reduced by 1.5w. So the split is 4/4/4 equal and 3.0/4.5/4.5 equity counted. The heirs who bank elsewhere (Claire, Sam) get $8.0–9.0M.
- **Gaps:** fair 1.00, sell 0.75, cash 0.50, name 0.50, after 0.25. If Claire opts out, fair drops to 0.75 and the summary shows 3 people.
- **Privacy:**
  - nothing is shared by default
  - Claire can opt out of the summary
  - `MIN_GROUP` = 3
  - no per-person positions
  - `esc()` on all user text
  - the voices row shows check-in status only, which the privacy table allows
- **Storage key:** `family-table-v6`. State adds `invited` (Margaret's invite) and `chapter` (her next-chapter picks).

## Do not touch
- The team's Canva deck `DAHY7Vfs02I`: don't edit without asking.
- Branch `agent-b-revision` preserves another agent's rejected revision. Don't merge it.

## Environment gotchas
- **Servers:** `python3 -m http.server 4311` from the repo root (the scripts assume it).
- **Playwright:** `playwright-core` lives in `video/src/node_modules`; the headless shell is `~/Library/Caches/ms-playwright/chromium_headless_shell-1234`.
- **Slide images** are artifact assets (`/_blob/<id>`). `video/src/slides_check.js` maps the ids to local shots. After re-uploading, update its `BLOBS` map.
- **Slide crops:** regenerate with `node video/src/slide_crops.js`, after `node video/src/shots.js`.

## Verification completed (Oct 27)
See the final QA run in the commit that adds this file. The scripts:
- `node video/src/qa.js http://localhost:4311/` covers links, errors, overflow at 5 widths, clipped text, dead buttons, alt text, the 6-step tour and every Ask on both models.
- `node video/src/motion_check.js` covers privacy opt-out (gap 1.00 from 4 people → 0.75 from 3) and XSS blocked.
- `node video/src/slides_check.js <artifact root> <out>` showed all 9 slides inside the 920px line.

## Next steps
1. Team reads `docs/TWO_WAY_JOURNEY.md` and script v3.
2. Adit: Canva journey slides can take the two-lane or blueprint version.
3. Lock script v3, build the video pipeline (VIDEO_PLAN §5), then Nindy records.
4. Interviews are still the biggest scoring gap (TEAM_NOTES §4).
