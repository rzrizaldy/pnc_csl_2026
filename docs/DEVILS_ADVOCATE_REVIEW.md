# Family Table: devil's-advocate review (v2)

Reviewed Oct 26, 2026. Baseline is commit `2420b22`; fixes are in the commit that adds this file.

An earlier revision by another agent is preserved on branch `agent-b-revision`. This review keeps its valid findings and reverses its over-corrections.

Scores are judgment calls, not predictions. **Verified** means checked in the files or a source. **Suspected** means inference.

## Verdict

The product is strong. The pitch is credible on product, but thin on evidence and on PNC economics.

The single biggest risk is customer discovery, worth 20% of the score. There are no interviews yet, and Succession is a hook, not a substitute. Fixed today, it's a finalist-level entry. Unfixed, a judge can stop reading at slide 3.

## Scorecard

| Criterion (weight) | Before | After today's fixes | What still moves it |
|---|---:|---:|---|
| Customer discovery (20%) | 2 | 2 | **Only interviews.** Four 15-minute calls with quotes that changed a feature (`docs/DISCOVERY_WORKSHEET.md`) |
| Product & dual UX (25%) | 7 | 8 | Record the demo; show Sloane share → Alex sees it → Sloane withdraws |
| Secret sauce (20%) | 5 | 6 | Say the signal is a hypothesis with a fallback (owner-authorized referral), and that the consented family summary is the moat |
| Pitch & story (20%) | 6 | 6 | Recorded video; one canonical deck with the Hale family everywhere |
| Business thesis (15%) | 4 | 5 | One economics line with stated assumptions (below), plus 3 pilot gates |

**Weighted:** about 4.9 before → about 5.4 after. With four real interviews, about 7.

## What the other agent got right (kept)

1. **Privacy contradiction (Verified).** The app said "private by default", but Sloane's answer 2 started shared (`prototype/app.js` state `shared: ["q2"]`). Her private themes also showed in Alex's panel. **Fixed:** nothing is shared by default, and unshared answers say only "private".
2. **Re-identification (Verified).** Per-person dots on a six-person family identify people. **Fixed:** the summary shows the range and gap only. It requires at least 3 contributors, and each member can opt out (Sloane's check-in has the switch).
3. **Escaping (Verified).** Typed text was inserted as HTML. **Fixed:** an `esc()` helper is applied wherever answers render.
4. **Legal conclusions (Verified).** The app said "any one child can block" and called the note "not a valid instruction". **Fixed:** "may", "counsel to confirm" and "share counsel's summary".
5. **Overclaimed AI (Verified).** Card ordering is rules, not a model. **Fixed:** the copy says so in the app and on the architecture page.
6. **Dead buttons (Verified).** "Edit" was removed. "Introduce" now records "Intro requested".
7. **Date (Verified).** Nov 12, 2026 is a Thursday. Fixed everywhere in the app.
8. **Unverified stat (Verified).** The 37% Julius Baer figure isn't in the linked page. It's replaced with PNC's "1 in 3 have no formal plan".
9. **Cerulli wording (Verified).** The source says 13% of *adult children use their parents' adviser*. Reworded on the site, the story card and the script.

## What it got wrong (reversed)

1. **It deleted the core insight.** "3 of 5 expect to lead" is the one moment where the product beats a spreadsheet. The answer to re-identification is consent plus a minimum group size, not deletion. Restored, with both safeguards.
2. **It removed the sale-likelihood signal from the secret sauce.** Without it, "why PNC" collapses to "we have specialists", which every private bank claims. It stays as a hypothesis, with a Phase 1 fallback: the owner authorizes the referral, or the RM flags it.
3. **It turned the pitch into a disclaimer.** "Today's AI is simulated. No external statistic is spoken." Judges score persuasion. Disclose the simulation on screen and in the deck footnote, not as the closing line.
4. **It dropped the Succession hook.** That throws away the most memorable 10 seconds. Kept, with the plot details checked.
5. **It switched Pages to a test-gated CI deploy 48 hours before the deadline.** One failing test would block the live site. Pages is back on deploying straight from `main`.
6. **It edited the deliverables, despite a review-only brief.** The work is kept on a branch, not merged.

## Five kill shots (ranked by expected point loss)

1. **No primary discovery.** Every quote is fictional. A judge asks, "Who told you this?" and there's no answer. *Fix: four interviews (worksheet ready). Even two advisor calls change the answer.*
2. **The consent model of the business signal.** Using commercial transaction data to prompt Private Bank outreach may be restricted by information barriers, GLBA and internal policy. *Fix: present Phase 1 as owner-authorized referral, and the model as a Phase 2 hypothesis pending compliance review.*
3. **"Who is Alex's client?"** Advising Walt while engaging his children is a conflict of interest. *Fix: one line in the deck: separate engagement letters per member, and Hawthorn IFS facilitates the joint meeting.*
4. **Economics hand-waving.** The $27.0M is closing cash, not retained assets. *Fix: state it as a sensitivity (below), not a forecast.*
5. **Persona mismatch across deliverables.** The Canva deck uses the Wilsons; the prototype, slides and video use the Hales. A judge who sees both loses trust. *Fix: pick the Hales everywhere.*

## The economics line to use

Assumption: a 0.8% blended wealth fee, to be validated with PNC.

| Hale family | If retained | Annual revenue |
|---|---|---|
| Walt and Marisa's closing cash | $27.0M | about $216K |
| Heirs' gifts | $9.0–10.0M | about $72–80K |

Every 10 families like the Hales is about $270M at closing. The national pool is 1,800–3,500 lower-middle-market family-business sales a year (team research doc, PitchBook/GF Data), not PNC's pipeline.

**Pilot gates:**
- at least 70% check-in completion
- the first family meeting held before the letter of intent
- at least 1 next-gen account per 3 families within 12 months

## Eight judge questions, and answers that stay confident and honest

| Question | Answer today |
|---|---|
| Who told you families need this? | PNC's own papers name family conflict as the top blocker. Our interviews with [owners/advisors] confirmed [quote]. *(Needs interviews to fill the brackets.)* |
| Why would Sloane be honest with her father's bank? | Her words stay hers. She chooses, answer by answer, and can opt out of the summary entirely. We're testing exactly this in the pilot. |
| Who is Alex's client? | Each adult member signs their own engagement letter. Joint conversations run through a Hawthorn facilitator. |
| Can PNC use business-account data like this? | Phase 1 doesn't need it: the owner authorizes the referral. The signal model is Phase 2, pending compliance review. |
| What AI actually runs? | In the prototype, rules and scripted answers. In production: an extraction model for documents and themes, fixed formulas for money, and an LLM for drafts, all behind one gateway with advisor approval. |
| Why can't JPMorgan copy it? | They can copy screens. They can't copy a consented, multi-year family record built inside an existing business-banking relationship. |
| How do you know the summary doesn't expose people? | No per-person positions, a minimum of three contributors, and opt-out per member. In families under 3 the summary doesn't appear. |
| What do you prove in 90 days? | Completion, sharing behavior, and whether advisors hold the meeting before the LOI. Retention takes 12 months. |

## Fixes applied in this commit

- **Prototype:**
  - nothing shared by default
  - a consented anonymous summary with opt-out
  - a minimum of 3 contributors
  - no per-person dots
  - unshared answers show only "private"
  - user text escaped
  - legal wording softened
  - Thursday, Nov 12
  - honest ordering copy
  - working "Introduce"
- **Site:**
  - 37% stat removed
  - Cerulli reworded
  - $27M framing corrected
  - ordering described as rules
  - privacy boundary updated
- **Script:** Cerulli line and clause line corrected.

## Left for the team (cannot be done by an agent)

1. Four interviews, with permission to quote (`docs/DISCOVERY_WORKSHEET.md`).
2. Make the Canva deck use the Hale family and the 4-step journey.
3. Record the video (`video/RECORDING_SCRIPT.md`).
4. Ask Alen to sanity-check the 0.8% fee and the engagement-letter answer with a banker.

## Round 2: design devil's advocate (template tells and ease)

**What made it look AI-generated (Verified, all removed):**
- **One-sided accent stripes, 20 instances:** colored top bars on cards, left bars on quotes, personas, tables and callouts, and top bars on slide cards. These are replaced with full tinted blocks, icons, avatars, or nothing at all.
- **Tracked-out uppercase eyebrows** on every slide and site section. These are now sentence case. The PNC nav keeps its uppercase tabs, because that comes from the real design system.
- **"A · B · C" strings, 76 instances.** These are rewritten as sentences.
- **"1 ·" numbering on items that aren't a sequence** (slide callouts, secret-sauce pillars, architecture layers). Removed. The 4-step journey keeps its numbers because it is a sequence.
- **Boxed stat cards and tag pills with stripes.** Stats are now big numbers with no box, and tags are plain tinted pills.
- **The "CLAUDE · GPT" badge on the ask bar.** Removed. The model switch lives only inside the Ask sheet.

**What made it hard to judge in two minutes (fixed):**
- **No obvious path.** A judge landed on a list of seven people. Now there is one primary action, "Take the 2-minute tour", plus three suggested starting people and the rest of the family below.
- **The guided tour.** It walks 5 steps:
  1. Alex sees the signal.
  2. Sloane shares in private.
  3. Alex sees the gap.
  4. The clause goes to counsel.
  5. Dale sees his number.

  Each step pulses the exact control to tap and ticks off when it's done. The site's main button deep-links into it (`prototype/?tour`).
