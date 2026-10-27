# Family Table · CSL 2026

A student concept for PNC Private Bank: a family workspace and advisor workbench for the sale of a business. The fictional Hale family illustrates explicit sharing, advisor preparation, reviewed document questions and deterministic gift options.

**[Live overview](https://rzrizaldy.github.io/pnc_csl_2026/)** · **[60-second demo](https://rzrizaldy.github.io/pnc_csl_2026/prototype/?reset#/me/sloane/checkin)** · **[10-slide review deck](https://rzrizaldy.github.io/pnc_csl_2026/slides/)**

## Walkthrough

1. Open Sloane's check-in. Every answer starts unshared.
2. Share answer 2; use “Switch to Alex’s view.” Only that answer appears.
3. Approve the preparation brief. Return to Sloane and withdraw sharing; approval clears.
4. Switch to Dale's Options. Compare Equal and Equity counted; the gift remains $12M.

Run `python3 -m http.server 4311`, then open `http://localhost:4311`. No app build required. `?reset` intentionally clears demo state on load; omit it when navigating between people.

## Verification and deployment

`npm ci`, `npx playwright install chromium`, `npm run check`, `npm test`.
Tests cover every persona route at desktop and 390px, sharing/withdrawal, editing/re-sharing, HTML escaping, all split weights and document review gating. GitHub Actions runs checks on PRs and main, then deploys an allowlisted static site on main. A failed validation job blocks deployment. This workflow does not enforce branch protection.

## Deliverables and sources

- `docs/DEVILS_ADVOCATE_REVIEW.md`: baseline scorecard, four perspectives, kill shots, Q&A, errors and 24-hour priorities.
- `slides/index.html`, `slides/deck.css`, `slides/claude_deck/`: editable ten-slide review draft; `slides/family-table-review.pdf` is its export.
- `video/RECORDING_SCRIPT.md`, `video/VIDEO_PLAN.md`: revised narration and storyboard. Final video is not recorded.
- `architecture.html`: proposed production boundary and pilot controls.
- `case.html`: optional Succession inspiration, with limits and corrected plot framing.
- `current-context-what-next.md`: authoritative handoff.

The team Canva deck and prior Claude artifact are unchanged. `slides/secret_sauce.pptx` and its old Python builder are legacy alternatives, not the current pitch.

## Evidence and data boundary

No documented primary interviews yet. All people, firms and figures are fictional. No authentication, bank connection, secure vault or live AI. All seed data is publicly downloadable; local storage is not private across demo personas. Use fictional text only. Keyword tags, fixed ordering and calculators are implemented; AI answers/document findings are scripted examples. Proposed controls are not a claim of production readiness or compliance approval.

Team: Alen Ilmi · Rizaldy Utomo · Nindy Aditya Dewi · Aditya Mulya Pratama, Carnegie Mellon University. Core concept belongs to the team; this revision is AI-assisted. Student concept, not a PNC product.
