# Family Table: current state and next actions

Updated October 26, 2026 (ET). Supersedes the former round-2/round-3 handoff.

## Objective and deliverable
CSL 2026 family-business sale concept. Due October 28, 11:59 PM ET: 8–10-slide PDF and two-minute video. This revision implements the requested adversarial review and product/pitch improvements, with GitHub CI/CD.

## Latest implementation
- Public showcase leads with the Hale family decision; Succession is optional background, not discovery evidence.
- Prototype starts with nothing shared. Alex sees only selected answers, no private themes/gap scores/leadership counts. Editing or withdrawal clears approval; an editing withdrawal is logged. Typed text is escaped.
- Owner-authorized referral replaces an unsupported predictive sale score. Document routing is not family-release authorization. Fixed ordering and scripted assistant are labeled honestly.
- Deterministic money is unchanged: $48M offer − $8M contingent earnout − $3.5M debt − $1.5M fees − $8M tax = $27M. $12M gifts are inside the $27M. Dale/Ross/Sloane total $9–10M. $2M buyer equity assumed separate from Walt's offer; tax/capitalization need real review.
- Ten-slide review draft: slides/index.html, deck.css, claude_deck fragments and family-table-review.pdf. Source screenshots refreshed. Canva and prior Claude artifact unchanged; old PPTX/builder are legacy.
- Video v3 script and storyboard revised; no final recording or video rendered.
- docs/DEVILS_ADVOCATE_REVIEW.md has scorecard, four perspectives, kill shots, Q&A, factual corrections and priorities. docs/DISCOVERY_WORKSHEET.md provides non-leading interview prompts and empty evidence table.
- GitHub workflow validates syntax, runs desktop/mobile regression tests, exports PDF and deploys only allowlisted public files after success. PRs test; main deploys. It does not configure branch protection.

## Verification completed locally
- Twelve browser tests passed: all 29 persona routes at 1440px and 390px; explicit sharing, withdrawal and approval invalidation; re-sharing after edits and markup escaping; all 101 gift weights; document routing gate; showcase/deck rendering.
- Existing capture tool regenerated 17 desktop, 6 mobile and 2 Ask screenshots, no console/page errors.
- Native browser verified answer 2 sharing and Alex receiving exactly that answer; mobile check-in inspected at 390×844.
- PDF has exactly ten pages with extractable text; every slide screenshot reviewed as a contact sheet and export found no container overflow.
- Initial parallel local test run hit socket failures on the reused Python server. Single-worker run passed; configuration uses one worker for stability.
- GitHub validate + deploy succeeded on revision f8515d3: https://github.com/rzrizaldy/pnc_csl_2026/actions/runs/40433987174. Initial run failed on ubuntu-latest (26.04); pinning ubuntu-24.04 resolved browser support. Final copy-only follow-up also runs the full workflow. Live acceptance is checked in the closing response.

## Constraints and remaining gaps
Fictional, public, static demonstration; no authentication, secure storage, PNC integration, real models or legal clearance. No primary interview evidence has been fabricated. Budget/fee assumptions and pilot thresholds are proposals. Preserve the team's core concept and disclose AI-assisted revision. Do not edit Canva without specific authorization. Do not use old screenshots, v2 script or older artifact as the latest deck.

## Exact next actions
1. Use the live overview and 60-second walkthrough in README. Latest GitHub validate/deploy must be green before taking submission screenshots.
2. Team conducts two owner/heir and two advisor interviews, fills discovery worksheet with actual permissioned evidence, and revises slide 3 accordingly.
3. Team validates assumed pilot costs, engagement/conflict approach and eligible referral pipeline.
4. Narrative owner approves v3; Nindy records; Rz assembles/captions and verifies ≤120s actual video.
5. Team checks final ten-slide PDF and video, resolves Canva divergence and submits. No competition submission has been made.
