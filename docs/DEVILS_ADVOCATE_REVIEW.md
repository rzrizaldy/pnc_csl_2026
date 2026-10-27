# Family Table: adversarial review and executed revision

Reviewed October 26, 2026. Baseline: Git commit `2420b22`, before this revision. File:line references below refer to that commit, so they remain reproducible with `git show 2420b22:<path>`. “Verified” means the artifact or source was checked; “Suspected” means an inference, including all judging scores. The attached review-only prompt supplied the evaluation criteria; the user's subsequent request explicitly authorized implementation.

## Verdict

**Suspected:** The original entry is unlikely to be a reliable finals contender because its customer-discovery evidence is missing, despite a useful dual-sided prototype. **Verified:** TEAM_NOTES.md §4 explicitly requests interviews, while the product and script make stronger trust and retention claims than that evidence supports. **Suspected:** The biggest risk is that judges see fictional family tensions presented as validated customer insight; product polish cannot close that gap.

## Scorecard, before revision

| Criterion | Likely /10 | Evidence at baseline | Highest-value change |
|---|---:|---|---|
| Customer discovery · 20% | 2 | Verified: TEAM_NOTES.md §4 is a recruitment plan, not completed interviews; slides/claude_deck/slides/case.html maps fiction to features | Two owner/heir and two advisor interviews, with actual permissioned quotes and a decision changed by evidence |
| Product and dual UX · 25% | 6 | Verified: prototype/app.js:140–231 has separate personas and check-ins, but line 12 pre-shares q2 and lines 296–315 disclose private-derived patterns | Demonstrate explicit share → advisor preview → withdrawal, with no unshared themes |
| Secret sauce · 20% | 4 | Verified: slides/claude_deck/slides/sauce.html claims a signal only PNC holds; no model training or competitor evidence exists in implementation | Position coordinated delivery as an advantage to test, with realistic competitors and a baseline |
| Pitch and story · 20% | 5 | Verified: video/RECORDING_SCRIPT.md opens on TV; seven slides in deck.json; no recorded video in repository | Lead on the Hale decision, show actual interaction, provide ten-slide review draft |
| Business and adoption · 15% | 4 | Verified: index.html says $27M is kept at PNC; no costs; completion used as evidence of honest answers | Separate closing cash from incremental AUM, add assumed budget and measurable pilot gates |

All scores are **Suspected**, not judge predictions. Weighted illustrative baseline: **4.30/10**. No revised score is claimed without primary evidence or a real panel.

## Four perspectives: steelman, then challenge

### 1. CSL judge

**Steelman:** The fictional case connects family and advisor screens to concrete transition decisions.

- **Verified:** The seven HTML slides are a contribution to a team deck, not the required final 8–10-slide submission (deck.json; TEAM_NOTES.md §2). The new ten-slide review deck solves the local count, but Canva and final submission remain separate.
- **Verified:** Neither fictional check-in quotes nor PNC papers establish primary discovery (data.js:81–91; TEAM_NOTES.md §4). Record role, date, permission, verbatim quote, observed friction and feature changed. Do not retroactively attribute existing features to interviews.
- **Suspected:** The show-first hook consumes attention that could prove the product in the first minute. The new script starts with the Hale offer and a share/preview interaction.
- **Verified:** AI execution was overstated: keyword regex rules perform live tagging (app.js:196–205); answers are canned (data.js `ask`); home ordering is fixed (app.js:165–172). The revised surfaces distinguish implemented rules from proposed models.

### 2. PNC executive

**Steelman:** A coordinated handoff could help an established business relationship become a voluntary family relationship.

- **Verified:** $48 − $8 − $3.5 − $1.5 − $8 = $27M, and the $12M gift is inside it (data.js `deal`; app.js:30–36). The original $9–10M for Dale, Ross and Sloane is correct: at full weighting their gifts are 3.5 + 3 + 3.5 = 10. Do not add gifts to the $27M when sizing assets.
- **Suspected:** Buyer equity may double-count transaction value unless its ownership and relationship to the $48M are specified. The revised illustration expressly assumes $2M separate from Walt's offer. Gift tax, basis, transaction structure and liquidity must be reviewed before real use.
- **Verified:** No PNC-qualified annual sale count or cost model is supplied locally. The review brief mentions 1,800–3,500 US sales, but a national figure is not PNC's addressable pipeline. The externally linked team document was not independently inspected in this run.
- **Suspected:** A gradient-boosted model is premature. Labels need exit dates, negatives, pre-event features and leakage controls; counts and coverage are unknown. Start with consented referrals, then compare a model with that baseline if permitted data exists.
- **Verified:** The new pilot's $150k and 0.50% gross-fee assumptions imply $30M incremental fee-bearing AUM just to cover that one-time spend before costs. This is arithmetic, not a profitability forecast. Cost of servicing, ongoing run costs, fee mix, ramp time and acquisition effort remain unknown.

### 3. Compliance / legal reviewer

**Steelman:** Explicit permissions and a human review queue could reduce inappropriate disclosure and reliance.

- **Verified:** q2 was shared by default, and advisor-visible private tags contradicted the privacy promise (app.js:12, 315). The revised flow starts empty, suppresses all unshared content and invalidates approvals on edits or withdrawal.
- **Suspected:** Even anonymous dots identify people in a six-person family; a leadership count can reveal a private promise. The revised flow removes those advisor aggregates rather than promising anonymity.
- **Verified:** A static file containing every persona and answer is not a secure member vault. Current Pages remains a fictional demonstration. Backend authorization, encryption, separate identities, restricted audit and deletion/retention policy are proposed requirements.
- **Verified:** “Any one child can block” and “not a valid instruction” were legal conclusions in data.js `docs`; trust protection was categorical in app.js:248. Revised findings require counsel review, and routing no longer exposes a “notify children” button.
- **Suspected:** Serving Walt while recruiting his children creates conflicts requiring scoped engagements and independent advice. Consent to discuss a family issue is not consent to prospect for accounts.
- **Verified:** [Regulation P scope](https://www.consumerfinance.gov/rules-policy/regulations/1016/1/) and [§1016.10](https://www.consumerfinance.gov/rules-policy/regulations/1016/10/) concern covered consumer information and nonaffiliated disclosure. They do not alone decide every commercial or affiliate-data use. Counsel must classify entity, data, purpose, recipient, contractual limits and applicable law; no legal clearance is claimed.
- **Suspected:** IP exposure depends on context and presentation. Text commentary without stills or actor likenesses reduces reliance on entertainment assets, but is not a legal safe harbor. The show is now optional background.

### 4. UX researcher perspective

**Steelman:** Different roles need different answers, and a clear gift calculator can make a difficult meeting tangible.

- **Verified:** The prototype provided working split controls and scripted assistant interactions, but non-Sloane “Edit” and advisor “Introduce” controls had no action handler (app.js:215, 330, 444–462). Revised read-only states no longer look actionable.
- **Suspected:** An heir may refuse to confide in the founder's bank regardless of controls. Offer a private call, a separate advisor or independent counsel. Test comprehension and willingness separately; ≥70% completion cannot prove honesty.
- **Suspected:** A temporary workspace accessible by a secure link may fit an infrequent event better than a standalone app-install habit. The revised pilot remains a web experience; channel preference is an interview question.
- **Verified:** Existing reordering is fixed by persona, not learned behavior. Calling it a ranking model added complexity without evidence (app.js:165–172, 381). It is now labeled role-based ordering.
- **Verified:** Typed text was inserted into HTML without escaping in check-in previews (app.js:223, 230, 315). The revision escapes user text and tests a markup payload. This matters even in a public fictional demo.

## Five kill shots, ranked by expected scoring impact

1. **Verified evidence gap / Suspected high impact:** no documented primary interviews. Product changes cannot manufacture discovery.
2. **Verified contradiction / Suspected high impact:** “private by default” while q2 is shared and private themes surface to the advisor.
3. **Verified unsupported claim / Suspected high impact:** prediction score and “only PNC” advantage without permitted training data, evaluations or competitor analysis.
4. **Verified financial framing error / Suspected medium-high impact:** $27M available cash presented as retained assets; no economics or attribution baseline.
5. **Verified delivery gap / Suspected medium-high impact:** partial deck and unrecorded video, with TV framing ahead of an actual user action.

## Eight hardest questions, and honest answers

| Question | Best honest answer now | What makes it stronger |
|---|---|---|
| Who told you they need this? | No primary evidence is documented; PNC research and fictional personas motivated hypotheses. | Four real, permissioned interviews and a documented design change. |
| Why would Sloane trust her father's bank? | We do not know. She can withhold every answer and seek a separate conversation. | Observed comprehension, private refusal reasons and independent-counsel alternative testing. |
| Who is Alex's client? | Walt in this example; invitation does not create joint representation. | Approved engagement and conflict protocol for each participant. |
| What AI actually runs? | No live model. Rules tag text; formulas calculate; canned examples illustrate proposed retrieval and drafting. | Permissioned expert test set, source-grounding evaluation and reviewed model deployment. |
| Can PNC use treasury transactions for this? | Not assumed. Pilot begins with owner-authorized referrals. | Entity/data/purpose review and policy approval before any broader use. |
| Why can't another bank copy it? | It can copy the interface. The proposed advantage is consistent delivery across existing relationships and specialists. | Comparative adoption and outcome evidence, not an exclusivity assertion. |
| How much money does PNC make? | Unknown. $27M is example cash, not AUM; $9–10M heir gifts are a subset. | Incremental assets, actual fee mix, service cost, net revenue and a comparison group. |
| What will you prove in 90 days? | Feasibility, sharing comprehension and preparation time; not asset-retention causality. | Preregistered definitions, denominators, baseline times, stop conditions and 12-month follow-up. |

## Factual and consistency corrections

1. **Verified:** Logan dies before the sale closes; the old spoken hook obscured that sequence. [TIME](https://time.com/6270134/succession-logan-death-power-rankings/). Replaced TV opening with the Hale offer.
2. **Verified:** The divorce-agreement plot concerns the siblings' voting bloc and renegotiation, not each child independently vetoing a sale. [All the Bells Say](https://en.wikipedia.org/wiki/All_the_Bells_Say). Hale clause remains explicitly fictional and legally unconfirmed.
3. **Verified:** The linked [Julius Baer article](https://www.juliusbaer.com/en/insights/wealth-insights/succession/how-to-succeed-for-generations/) does not substantiate the displayed 37% claim. Removed pending the actual survey table. This does not establish that the statistic itself is false.
4. **Verified:** [PNC's paper](https://www.pnc.com/content/dam/pnc-com/pdf/personal/private-bank/business-succession-planning_begin-at-the-end.pdf) reports the 75% regret and 50% involuntary-exit figures, citing other sources. They are not outcomes of Family Table or a PNC retention study. Revised pitch uses the paper for planning context without these headline statistics.
5. **Verified:** Historical Cerulli reporting refers to adult children's advisor choice, not a measured business-sale retention rate. Primary survey methodology was not verified; removed from the pitch rather than turning it into a predictive churn claim.
6. **Verified:** $27M closing cash and $9–10M outside-bank heir gifts reconcile. Preserve them. Our interim $10.5M correction was wrong and was rejected by the new calculation test.
7. **Verified:** November 12, 2026 is Thursday, not Tuesday (app.js repeated “Tue, Nov 12”). Corrected.
8. **Verified:** “3 of 5” was hardcoded from fictional private answers, not validated research or a live extraction. Removed from advisor UI, deck and narration.
9. **Verified:** Seven local slides were not a complete 8–10-slide deck. New ten-slide review draft supplied; live Canva, Claude artifact and the older PPTX remain unchanged and should not be mistaken for the revised version.
10. **Verified:** Agreeing “in principle” is not a legal signature, and the current app has no signing service. Revised script does not claim signing. Seeded contingency text is a fictional scenario, not a real executed document.

## Next 24 hours: maximum ten actions

| Priority | Action | Impact | Effort | Owner | State |
|---|---|---|---|---|---|
| 1 | Fix sharing defaults, private theme leakage, invalidation and HTML injection | H | 2h | Product | Implemented; automated and browser checks |
| 2 | Remove unsupported prediction/exclusivity and retained-AUM claims | H | 1h | Data/AI | Implemented across active surfaces |
| 3 | Conduct two owner/heir and two advisor interviews; capture actual quote-to-change evidence | H | 3h | Research | Team action; never fabricated |
| 4 | Reconcile money and distinguish deterministic rules from model proposals | H | 1h | Data/AI | Implemented; tests cover every split weight |
| 5 | Tighten 60-second route and legal review handoff | H | 1h | Product | Implemented |
| 6 | Replace partial slides with ten-slide review draft and explicit evidence gap | H | 2h | Pitch | Local source/PDF; Canva untouched |
| 7 | Rehearse and record revised 2-minute product walkthrough | H | 2h | Pitch | Script/storyboard revised; recording outstanding |
| 8 | Validate pilot cost and eligible pipeline with banker; do not use national TAM as PNC volume | M | 1h | Research | Assumptions labeled; validation outstanding |
| 9 | Validate and deploy through GitHub checks | M | 1h | Product | See current-context-what-next.md for final run receipt |
| 10 | Recheck final deck and recording against rubric; choose one canonical submission set | H | 1h | Pitch | Team after interviews and recording |

## Revision plan and boundary

Executed sequence: preserve baseline in Git → review claims → repair sharing and advice boundaries → revise public story and ten-slide deck → write regression checks → validate desktop/mobile → deploy via gated GitHub Actions. Core concept remains the team's Family Table; revisions are AI-assisted and require team ownership. New generated imagery was unnecessary for a product walkthrough. No interview, real model, PNC integration, submission, external team message or Canva edit is implied.
