# Family Table (CSL 2026): current context and what next

Updated 2026-10-27 (round 6: app rework). This file is overwritten, not appended. The full context is `PROJECT_CONTEXT.md`.

## Current deliverable
- **Deadline:** Wed Oct 28, 11:59 PM ET. Submit a deck PDF (8–10 slides) and a 2-minute video.
- **Rizaldy's scope:** prototype, video, Secret Sauce slide.
- **Live site:** https://rzrizaldy.github.io/pnc_csl_2026/ (public repo `rzrizaldy/pnc_csl_2026`; Pages builds from `main` root, legacy build).
  - `index.html`: problem stats, "Two sides of one sale", the two-lane journey, phone iframe (Sam's vote, `#/me/sam/options`), AI, why PNC, value
  - `case.html`: the Wilsons, and five moments where a sale goes wrong
  - `architecture.html`: the stack, the service blueprint, Sam's request end to end, JSON contract, AI table, pilot
- **Prototype** (`prototype/`, hash routes), rebuilt in round 6 (reasons in `docs/DEVILS_ADVOCATE_APP_REWORK.md`):
  - splash `#/`: what it does, the six stages, three end-state numbers, one button that starts the demo
  - advisor: Signal `#/advisor`, AI brief `#/advisor/align` (a trace that plays, then Alex approves; `/docs` is an alias), Inbox `#/advisor/inbox`, Plan `#/advisor/plan`
  - members `#/me/<margaret|tom|ben|claire|sam>` with `/checkin`, `/options` (vote), `/ask` (Ask Alex), `/plan`
  - one year on `#/year-one`; video cards `#/story/{hook,cast,problem,sauce,close}`
  - `?tour` resets and opens the splash; the demo is 8 steps alternating sides. `?reset` clears state.
- **Slides:** Claude Slides artifact https://claude.ai/artifact/B7bV9cQnWU4FCvbQWLHYf2 (private until shared), source in `slides/claude_deck/`. Its screenshots still show the round-5 app: `slide_advisor_*.png` were not regenerated, and the artifact's image assets are untouched.
- **Video:** plan and script v3 only (`video/VIDEO_PLAN.md`, `video/RECORDING_SCRIPT.md`). The script still describes the round-5 screens; it needs a pass for the new demo order.

## Decisions and why
- **Round 6 (Rizaldy, Oct 27):** "rework totally the family table app": a splash showing what it does, the process and the end state; big numbers and visuals; a demo with a hook instead of a complicated dashboard.
  - The hook is Margaret's "I think the kids are on the same page" against fairness at 1.00. It's the biggest type on the AI screen.
  - The AI is shown working (a step trace), and every AI step ends at a human: Alex approves the brief and sends each reply.
  - **Voting** is private and advisory: counts only, shown once 3 have voted, no names, changeable until Nov 12. The family decides at the facilitated meeting.
  - **Ask Alex** replaces the instant AI assistant, so the human advisor appears on the family side. The Claude/GPT toggle is gone.
  - **One year on** is the payoff. Its figures are fictional and derived: the Balanced split (w = 0.5) gives Claire and Sam $4.25M each, so $8.5M; 5 of 5 work with PNC, up from 3; about $216K a year at the illustrative 0.8%.
- **Personas = the team's Canva persona slide.** Margaret Wilson is the founder and Alex Lee the advisor. No Succession or Hale references anywhere.
- **Core insight is fairness:** Margaret's plan is an equal split; the family's widest gap is "equal shares" at 1.00.
- **Pronouns:** Margaret is "she". Alex is never given a pronoun; write "Alex".

## Conventions
- **Design system:** PNC Private Bank tokens in `prototype/styles.css` and `site.css`: navy `#10214D`/`#1A2B5C`, orange `#EF6A00` (`#B84F00` for small text), data viz `#6F9A4B` `#424B5A` `#6593C9` `#6D4AA0`, Barlow.
- **Avoid AI-template tells:** no one-sided stripes, no tracked uppercase labels (the site nav is the exception), no "A · B · C" strings, no numbering on non-sequences, no per-person stance dots.
- **Numbers** (`prototype/data.js`; change only as a set): offer $48.0M → $27.0M at closing; live on 9.0, give 12.0, invest 6.0; splits 4/4/4, 3.5/4.25/4.25, 3.0/4.5/4.5; heirs who bank elsewhere $8.0–9.0M; gaps 1.00, 0.75, 0.50, 0.50, 0.25.
- **Privacy:** nothing shared by default; Claire can opt out of the summary (fair drops to 0.75 from 3 people); `MIN_GROUP` = 3 for the summary and the vote tally; no per-person positions or names on aggregates; `esc()` on every typed string (check-in answers, questions, Alex's edited replies); replies are shared with the family only if the member switches it on.
- **Storage key:** `family-table-v8`. Debug: `FT.reset()`, `FT.state()`, `FT.set(patch)`, `FT.step(i)`.

## Do not touch
- The team's Canva deck `DAHY7Vfs02I`: don't edit without asking.
- Branch `agent-b-revision` preserves another agent's rejected revision. Don't merge it.

## Environment gotchas
- **Server:** `python3 -m http.server 4320` from the repo root; the scripts default to 4320 and take a base URL.
- **Playwright:** `playwright-core` lives in `video/src/node_modules` (gitignored; in a worktree, symlink it from the main checkout and don't commit the link). The headless shell is `~/Library/Caches/ms-playwright/chromium_headless_shell-1234`.
- **Slide images** are artifact assets (`/_blob/<id>`); `video/src/slides_check.js` maps the ids to local shots.

## Verification completed (Oct 27, round 6)
- `node video/src/qa.js http://localhost:4320/`: 0 console errors, overflow, clipped text, dead buttons or missing alt on 32 routes at 5 widths; the 10-step demo completes from the splash; the ask-Alex loop sends 9 replies and every member sees them. Known false positives: two font preconnect hints, the 32px switches.
- `node video/src/motion_check.js`: the trace plays to all six steps; the option tween runs; the tally is hidden at 2 votes and shows counts only at 3; the opt-out moves the summary from 1.00 (4 people) to 0.75 (3); markup typed into a check-in, a question or a reply is never injected.
- `node video/src/shots.js http://localhost:4320/prototype/` regenerated `prototype/shots/`.

## Next steps
1. Rizaldy reviews the new demo and merges the worktree branch.
2. Script v3 follows the 10-step demo; lock it before recording.
3. If the slides should show the new app, regenerate the crops (`video/src/slide_crops.js`) and re-upload them to the artifact.
4. Interviews are still the biggest scoring gap (TEAM_NOTES §4).
