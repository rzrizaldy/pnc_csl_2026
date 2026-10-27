# CSL 2026 · Team coordination notes

> **October 26 revision:** The historical coordination notes below are preserved. Current product uses explicit sharing and owner-authorized referrals, with no private theme aggregates or predictive sale score. Use README.md, docs/DEVILS_ADVOCATE_REVIEW.md, slides/index.html and video/RECORDING_SCRIPT.md v3. The ten-slide local deck is a review draft. Canva and the prior Claude artifact have NOT been updated. Primary interviews and final video remain outstanding. Historical Wilson personas and v2 instructions below are superseded.

Team: Alen · Rizaldy (Rz) · Nindy · Adit — CMU
Deadline: **Wed Oct 28, 11:59 PM ET**. Submit (1) deck PDF, 8–10 slides; (2) 2-min video (MP4 or a link anyone can open).
Internal target: **everything final by Wed 6 PM**. That leaves 6 hours of buffer for the PDF export and uploads.

Team doc: https://docs.google.com/document/d/1VAWPSUMSgjxakFrxJdlWmbeVm6bWnnu5e9I59spExnI
Canva deck: https://www.canva.com/design/DAHY7Vfs02I (currently 24 pages; pages 14–24 are leftover template pages to delete)

---

## 0. What changed in round 2 (Rz, Oct 26 night)

The concept now runs on a **Succession case study**. Read https://rzrizaldy.github.io/pnc_csl_2026/case.html (5 minutes).

- **New case family: the Hales.** Hale Freight, a $48M offer, a mid-market version of the Roy family. Personas: Walt (Logan), Marisa (Marcia), Dale (Connor), Kyle (Kendall), Ross (Roman), Sloane (Shiv). The advisor is still Alex Lee. This replaces the Wilson family in the prototype.
- **Simpler journey:** 4 steps (Spot → Listen → Align → Act) instead of 6. Each step says what the family sees, what the advisor sees, what AI does, and who decides.
- **Six Succession failure patterns,** each checked against the PNC papers and mapped to a feature:
  - the private promise
  - the founder who won't step back
  - the forgotten clause
  - the heir who needs cash
  - death mid-deal
  - the note in the safe
- **Prototype rebuilt:**
  - mobile-first
  - plain-words / detailed toggle
  - adaptive home screens per person, with "why you see this"
  - live AI theme tagging in the check-in
  - Document AI findings
  - a split slider
  - an Ask assistant with a Claude/GPT switch (simulated)
- **Solution architecture page:** https://rzrizaldy.github.io/pnc_csl_2026/architecture.html. It shows the 6 layers, the privacy boundary, one request end to end, and the model output contract.
- **New stats** (cited):
  - only 13% of heirs keep their parents' advisor (Cerulli 2019)
  - 37% of wealth-transfer talks are informal (Julius Baer 2024)
- **Video script v2** is in `video/RECORDING_SCRIPT.md` (226 words).

**Needs the team:**
1. Agree to lead with Succession.
2. Nindy: update the persona slide (p5) from Margaret Wilson to Walt and Sloane Hale, or keep Margaret and drop the Hales. Say which.
3. Adit: the journey slides (p6–8) can collapse to the 4 steps.

## 1. Decisions we need today (Mon night)

| # | Decision | Proposal (Rz) | Who decides |
|---|---|---|---|
| D1 | Product name | Working name **"PNC Family Table"** — open to better | All |
| D2 | One-line value prop | *Turn a family's private, unspoken transition worries into consented, advisor-ready signals before the sale closes.* | All |
| D3 | Final 10-slide order | See §2 | Adit |
| D4 | Video voice + face | Nindy records narration + webcam in one take (Loom style) | Nindy |
| D5 | Interview evidence we can cite | See §4 | Adit + Alen |

## 2. Proposed 10-slide order and owners

| # | Slide (judging weight) | Owner | Status |
|---|---|---|---|
| 1 | Title & team (name, CMU, 4 names) | Nindy | template, needs name |
| 2 | Executive summary & hook | Adit | empty |
| 3 | Market opportunity & attrition risk | Alen | empty |
| 4 | Customer discovery & insights (20%) | Adit | empty, **needs interviews** |
| 5 | Dual personas (Margaret / Alex) | Nindy | ✅ done |
| 6 | Family transition journey (pick 1 of the 3 versions) | Nindy | ✅ done (p6–8) |
| 7 | AI Client & Family Experience (25%) | Nindy + Rz (prototype screenshots) | empty, Rz supplies screens Tue night |
| 8 | AI Advisor Workbench (25%) | Nindy + Rz (prototype screenshots) | empty, Rz supplies screens Tue night |
| 9 | Secret Sauce & core innovation (20%) | **Rz** | in progress |
| 10 | Business thesis & adoption hypotheses (15%) + roadmap | Alen | empty |

Roadmap can merge into slide 10 to stay within 10 slides, or it can replace slide 2 if the hook moves into the title slide.

## 3. Rizaldy's deliverables (next 36 h)

| What | Where | Status |
|---|---|---|
| Clickable prototype, 8 screens (4 advisor + 4 family), fictional Wilson family, PNC Private Bank design system | https://rzrizaldy.github.io/pnc_csl_2026/prototype/?reset | ✅ v1 live |
| Showcase page (architecture, AI components, prototype links) for GitHub Pages | https://rzrizaldy.github.io/pnc_csl_2026/ | ✅ live |
| Slides: Succession case, family app, advisor workbench, secret sauce, architecture, privacy backup (consulting style, Hale case) | Claude Slides: https://claude.ai/artifact/B7bV9cQnWU4FCvbQWLHYf2 (source in `slides/claude_deck/`) | ✅ refreshed; Rz shares the link |
| Secret Sauce slide as editable PPTX (Canva drag-and-drop import) | `slides/secret_sauce.pptx` | ✅ alternative |
| Video plan + recording script for Nindy | `video/VIDEO_PLAN.md`, `video/RECORDING_SCRIPT.md` | ✅ **please review by Tue noon** |
| Draft video (robot voice), then final with Nindy's voice and face bubble | `video/` → Drive link | Tue after script lock |
| Prototype screenshots for slides 7–8 | `prototype/shots/` | ✅ done |

**Design system:** the prototype and slides follow the PNC Private Bank design system (annaboyle-design.com/pncpb-designsystems). It uses a navy banner with the triangle pattern, orange tab underlines, Barlow as a stand-in for DIN, a green/slate/blue/purple data palette, and the five notification banner types. If the Canva deck adopts the same look, the deck will read as one product.

## 4. Customer discovery: what we still need (20% of score)

The judges want **primary** discovery: real quotes that shaped features. The PNC papers alone are secondary, and other teams have the same papers.

Minimum viable evidence by **Tue 6 PM**:
- 2 advisor/banker voices (Alen's banking network: RMs, private bankers, wealth advisors)
- 2 owner or family-member voices (family-business owners, or adult children of owners; CMU / Tepper network)
- 15-min calls are enough. Use the questions in the team doc, tab "Draft not used".

For each interview, capture **one quote + one friction + which feature it shaped**:

| Who (role, no real name) | Quote | Friction | Feature it shaped |
|---|---|---|---|
| | | | |

Features the prototype already assumes, which need a quote to back them:
1. Family members won't say their real view in front of the founder → **private check-in + consent toggles**
2. Advisors only hear the founder's side → **family map + alignment gaps**
3. Advisors learn about the sale too late → **liquidity-event signal**
4. Founders confuse headline price with what they actually net → **"what you can spend, gift, invest" view**
5. Non-active children feel unfair → **equal vs. equitable vs. trust options**

If an interview contradicts one of these, tell Rz. The prototype will change to match.

## 5. Video plan (2:00 max, Loom style)

| Time | Beat | On screen |
|---|---|---|
| 0:00–0:15 | Hook: Margaret, 30 years, sale in ~14 months; her kids don't know what it means for them | title → advisor signal |
| 0:15–0:30 | Problem (cited numbers only) | stat cards |
| 0:30–1:25 | Demo walkthrough: signal → invite → private check-in → alignment brief → options → plan | prototype |
| 1:25–1:45 | Secret sauce | diagram |
| 1:45–2:00 | Value to PNC + close | end card |

**For Nindy:** one take in QuickTime → File → New Movie Recording (webcam + mic), reading the script with 2-second pauses between lines. Rz's script will split the take on those pauses, sync the screens, add the round face bubble, captions and music. Full instructions are in `video/RECORDING_SCRIPT.md`.

## 6. Rules for everyone

- **Every number cites a source**, on the slide or in a footnote. Don't merge figures from different studies into one claim.
- **People in the prototype are fictional.** Label them "illustrative".
- **Be specific about AI:** say what model does what, and where a human approves. Avoid "AI-powered".
- AI-written text must be cited as AI-assisted; core concepts come from our synthesis.
- Don't use PNC's real logo inside the prototype UI. It is a concept, not a PNC product.

## 7. Open questions

- [ ] Target segment confirmed? (proposal: PNC commercial clients with a business worth $10–100M, in the Commercial band)
- [ ] Which journey version (p6, p7 or p8) goes in the final deck?
- [ ] Who exports the final PDF on Wednesday, and who submits?
