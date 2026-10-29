# CSL 2026 · Team coordination notes

Team: Alen · Rizaldy (Rz) · Nindy · Adit — CMU
Deadline: **Wed Oct 28, 11:59 PM ET**. Submit (1) deck PDF, 8–10 slides; (2) 2-min video (MP4 or a link anyone can open).
Internal target: **everything final by Wed 6 PM**. That leaves 6 hours of buffer for the PDF export and uploads.

Team doc: https://docs.google.com/document/d/1VAWPSUMSgjxakFrxJdlWmbeVm6bWnnu5e9I59spExnI
Canva deck: https://www.canva.com/design/DAHY7Vfs02I (currently 24 pages; pages 14–24 are leftover template pages to delete)

---

## 0. What changed (Rz, Oct 27): back to Margaret and Alex

The prototype, site, slides and script now use **our own personas from the Canva deck**: Margaret Wilson (founder) and Alex Lee (PNC advisor). The Succession framing and the Hale family are gone. Read `docs/TWO_WAY_JOURNEY.md` (5 minutes).

- **The family:** Margaret (63, founder of Wilson Transport, $48M offer), Tom (husband), Ben (COO, stays with the buyer), Claire and Sam (not in the business, bank elsewhere).
- **The core insight is fairness, not leadership.** Margaret tells Alex "the kids are on the same page" and plans an equal split. The family's private answers show fairness is the widest gap.
- **Two sides, every screen:** each of Margaret's three goals and Alex's three goals maps to a prototype screen (overview page, "Two sides of one sale").
- **Journey uses the deck's 6 stages:** Signal, Join, Align, Allocate, Activate, Continue, in two lanes with the handoff between them.
- **The tour alternates sides** in 6 steps: Alex calls, Margaret invites, Claire shares, Alex approves, Sam compares, Alex introduces PNC.
- **Slides (Claude Slides, 9):** cover, two sides, journey, service blueprint, family app, advisor workbench, secret sauce, architecture, privacy.
- **Video script v3** is in `video/archive/RECORDING_SCRIPT_v5.md`, about 240 words.

**Needs the team:**
1. Nindy: the persona slide (p5) already matches. Keep it.
2. Adit: the journey slides (p6–8) can use the two-lane version or the service blueprint.
3. Everyone: read script v3 before Nindy records.

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
| Slides: two sides, journey, service blueprint, family app, advisor workbench, secret sauce, architecture, privacy backup (consulting style, Wilson case) | Claude Slides: https://claude.ai/artifact/B7bV9cQnWU4FCvbQWLHYf2 (source in `slides/claude_deck/`) | ✅ refreshed; Rz shares the link |
| Secret Sauce slide as editable PPTX (Canva drag-and-drop import) | `slides/secret_sauce/secret_sauce.pptx` | ✅ alternative |
| Video plan + recording script for Nindy | `video/archive/VIDEO_PLAN.md`, `video/archive/RECORDING_SCRIPT_v5.md` | ✅ **please review by Tue noon** |
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

**For Nindy:** one take in QuickTime → File → New Movie Recording (webcam + mic), reading the script with 2-second pauses between lines. Rz's script will split the take on those pauses, sync the screens, add the round face bubble, captions and music. Full instructions are in `video/archive/RECORDING_SCRIPT_v5.md`.

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
