# Devil's advocate: the Family Table app, before the rework

Oct 27, 2026. Written as a skeptical CSL judge and a senior product designer who get two minutes with the demo. It judges the app as it stood at commit `9ef0010`, then lists the screens the rework builds.

## The two-minute test, failed

A judge opens `prototype/` and gets a picker: "One sale. Two sides." with two tiles and four family rows. In ten seconds they don't know:
- **what Family Table does.** The headline is a slogan. Nothing says "private check-ins, AI finds the gaps, the advisor acts".
- **what the process is.** The six deck stages (Signal to Continue) appear nowhere in the app. They live only on the site.
- **where it ends.** No screen shows the payoff: the sale closed, the money placed, the heirs banking with PNC. The demo stops at "Introduce", a button.
- **what to press.** The tour button competes with six other links.

## Too dashboard-like

- **The advisor home is a CRM.** It has a watchlist sidebar of two other clients, a 12-month chart, three driver rows, four "needs attention" rows, a family-table diagram, a legend and an Ask bar. That's eleven things before the one action (Call Margaret). Robinhood shows one number and one button.
- **The family summary screen does everything at once:** four of five voices, the founder against the family, five gap rows, a footnote, an Ask bar, a brief with three items, a facilitator alert and three sealed answers. The core insight, fairness 1.00 against "the kids are on the same page", is the same size as the footnotes.
- **Margaret's home is a statement:** a waterfall with six rows, an allocation bar, three bucket rows, a trip track, an invite panel, an Ask bar and four "Up next" rows. She "won't use a dense self-service dashboard", says her own persona. We built her one.
- **The options screen has a slider, a 5% step, a trust switch, a sentence, a sticky CTA and a sidebar.** A judge won't touch the slider; they'll only notice it's fiddly.

## The AI is invisible

- The AI's work is the secret sauce (20% of the score), but it's hidden behind outcomes. Gap numbers appear already computed. The brief appears already drafted. The documents appear already read. **A judge can't tell what the AI did and what a formula did, or where a human approved.**
- The only visible trace is in the Ask sheet, which shows tool calls in monospace code and a Claude/GPT toggle. That reads as a developer demo, and the toggle invites "which model is better?", which is the wrong question.
- "Approve brief" is one navy button among many. The review queue, our main guardrail, should be the climax of the AI screen, not a sidebar control.

## Missing entirely

- **Voting.** The family "proposes" a split, but nothing shows how five people reach a view. A judge will ask "so who decides?" and the app can't answer.
- **Talking to the advisor.** The Ask sheet answers the family instantly, with AI. So the human advisor never appears on the family side, and the two-way loop the persona slide promises is missing. "AI answers your inheritance question" also scares compliance.
- **The end state after BAU**, as above.

## What a judge won't understand

- "Gap 1.00" with no scale shown next to the threshold. What's high?
- "Equity counted": counted toward what? It needs Ben's $1.5M on screen next to the option.
- Why Claire's answers are "sealed" on Alex's side when Alex is the one we're selling to. The privacy model is the moat, but the app never says why it helps Alex.
- The sale-likelihood score: "81 of what?" The reason weights are good; keep them, but make them three short lines.

## What must survive (non-negotiable)

- **The privacy model:** nothing is shared by default; the opt-out of the summary; `MIN_GROUP` 3; no names or per-person positions on aggregates; `esc()` on every typed string; check-in status visible, content not.
- **Every number,** unchanged: $48.0M to $27.0M; live on 9.0, give 12.0, invest 6.0; splits 4/4/4, 3.5/4.25/4.25, 3.0/4.5/4.5; $8.0 to $9.0M to heirs who bank elsewhere; gaps 1.00, 0.75, 0.50, 0.50, 0.25; facilitator at 0.75 or more; 81, up 11, weights 0.34/0.26/0.21; Nov 12 with Hawthorn IFS.
- **The fairness insight:** Margaret's equal-split plan and "I think the kids are on the same page", against a family whose widest gap is fairness. This is the hook. It deserves the biggest type in the app.
- **Two sides,** alternating, with Alex never given a pronoun.
- **The AI rule:** AI reads and drafts, formulas do the money, people decide.
- Claire's private check-in with live themes and share switches, which already works and demos well.

## What gets cut

- The watchlist of other clients, the waterfall on the home screen (it moves into a sheet), the slider and trust switch, the "Sorted for you" sheet on every screen, the Claude/GPT toggle, the instant AI Ask (replaced by Ask Alex), the documents tab (folded into the AI trace), and the share-counsel's-summary flow.

## The new screen list

| Route | Screen | Why |
|---|---|---|
| `#/` | **Onboarding splash.** What it does in one line, the six stages as a track, the end state as three big numbers, one button: start the demo | Answers what, how and where it ends in ten seconds |
| `#/advisor` | **Signal.** 81 out of 100 as the only big number, the line, three reasons, Call Margaret. Side: $8.0 to $9.0M heading to heirs who bank elsewhere | One number, one action, and the stakes for PNC |
| `#/me/margaret` | **Margaret's home.** $27.0M and one three-colour bar (live on, give, invest), then Invite the family | Her goal ("what we can spend, gift, invest") as one picture |
| `#/me/claire/checkin` | **Private check-in.** Unchanged mechanics, quieter layout | The privacy moat, in Claire's own words |
| `#/advisor/align` | **AI at work.** Fairness 1.00 against Margaret's quote, then a five-step trace that plays out: read check-ins, score gaps with the formula, compare with Margaret's plan, read documents (the 2012 will), draft the brief. The last step is Alex approving | Makes the AI legible, and puts the human at the end |
| `#/me/sam/options` | **Your number, then vote.** Three option cards with every child's bar, Sam's highlighted. A private vote; counts appear only after 3 votes; advisory; can be changed until Nov 12 | Answers "who decides?" without weakening privacy |
| `#/me/sam/ask` | **Ask Alex.** Sam asks; the message waits for Alex; Alex's reply comes back with the numbers; book a call; optionally share the answer with the family | The family side of the two-way loop |
| `#/advisor/inbox` | **Alex's inbox.** The AI draft with its checks (calculator numbers, no private answers, no product push), editable, then Approve and send. Call requests to confirm | The advisor side of the loop: the review queue made visible |
| `#/advisor/plan` | **Going into Nov 12.** The vote tally (counts only), the heirs, introductions, specialist tasks | Activate, for Alex |
| `#/year-one` | **One year on.** The sale closed; $27.0M placed by plan; 5 of 5 family members working with PNC; $8.5M reached Claire and Sam; the yearly check-in; Margaret's next chapter | The payoff the old demo never showed |

**The story mode** (`?tour`) runs eight steps from the splash, alternating sides: Signal, Margaret invites, Claire shares, the AI at work, Sam votes, Sam asks Alex, Alex replies, one year on. Each step has one tap. It replaces the six-step tour.

All year-one figures are fictional and derive from the existing set: the family's Balanced split (w = 0.5) gives Claire and Sam $4.25M each, so $8.5M, inside the $8.0 to $9.0M range.
