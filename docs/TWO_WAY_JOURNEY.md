# Family Table: two-way reassessment and journey

Oct 27, 2026. This replaces the Succession framing. The product is now built on the team's two personas (Canva deck, persona slide): **Margaret Wilson**, the founder, and **Alex Lee**, her PNC advisor.

## Reassessment: what was wrong with the last version

| Problem | Why it hurt | Fix |
|---|---|---|
| The story needed a TV show to make sense | Judges who haven't seen Succession got a cast list, not a problem. Six people with "Inspired by" lines read as fan fiction. | No Succession anywhere in the app or the site. One family, plain roles, and the hook is Margaret's situation. |
| Personas didn't match the team deck | The deck says Margaret Wilson and Alex Lee; the prototype said Walt Hale. A judge who sees both stops trusting both. | The Wilsons everywhere: app, site, slides, script. |
| The core insight was "3 of 5 expect to lead" | Leadership fights are drama. After a sale to an outside buyer, nobody leads the company. The real question in the persona is **what's fair to active and non-active children**. | The core insight is now fairness: Margaret's draft plan assumes an equal split; her family's answers span the full scale. |
| The journey was told from the middle out | "Spot, listen, align, act" said what the system does, not what each person gets. The persona slide is about what each side needs. | Every screen and every tour step is tied to one persona goal or one friction. The tour alternates sides. |
| Six family members | Too many names for a 2-minute video. | Five: Margaret, Tom, Ben, Claire, Sam. Only three carry the story (Margaret, Claire, Sam). |

## The two personas, goal by goal

### Margaret Wilson, founder (the family side)
Existing PNC commercial client. Sale expected in 12 to 18 months. Most of her wealth is in the business.

| What she needs | What gets in the way | What Family Table does | Where in the prototype |
|---|---|---|---|
| A clear view of what the family can spend, gift and invest | Deal advice and family guidance happen separately | One number first: $27.0M at closing, split into live on, give and invest | `#/me/margaret` |
| A distribution plan that feels fair to active and non-active children | The family avoids direct conversations | Private check-ins, a split slider everyone can see, and a facilitated meeting | `#/me/claire/checkin`, `#/me/sam/options` |
| Purpose and family connection after the sale | She won't use a dense self-service dashboard | One next step at a time, starting with her next chapter | `#/me/margaret/plan` |

### Alex Lee, PNC Relationship Manager and Private Business Strategist (the advisor side)
Coordinates specialists across business banking, wealth management, trust and family advisory.

| What Alex needs | What gets in the way | What Family Table does | Where in the prototype |
|---|---|---|---|
| Engage the family before the sale closes | Alex hears about the sale only when the owner says so | A sale-likelihood signal from the business accounts, 12 to 18 months ahead | `#/advisor` |
| Understand the whole family, not just the founder | Alex often hears only the founder's side, and concerns go undocumented | An anonymous family summary: four voices instead of one, gaps not words | `#/advisor/align` |
| Bring in human facilitation when it's needed | Tension surfaces after decisions are already made | A gap of 0.75 or more recommends a Hawthorn IFS facilitator; the brief is drafted for Alex to approve | `#/advisor/align` |
| Retain the proceeds and build next-gen relationships | PNC capabilities sit across business units | Specialist routing in one plan; introductions to the two children who bank elsewhere | `#/advisor/docs`, `#/advisor/plan` |

## The journey: one sale, two lanes

Stages match the team deck (Signal, Join, Align, Allocate, Activate, Continue). Each stage has a handoff: something one side does that changes what the other side sees.

| Stage | Margaret and family | Handoff | Alex |
|---|---|---|---|
| Signal | Nothing yet. The sale is still private. | Alex calls Margaret | Sale likelihood rises to 81 on business-account activity |
| Join | Margaret invites the family; each person gets a private check-in | The family's check-in status reaches Alex | Sees who has answered, never what they said |
| Align | Claire writes what she's never said; she chooses to share one answer | Themes from four people, and one shared answer, reach Alex | Sees the fairness gap against Margaret's equal-split plan; approves the brief; facilitator booked |
| Allocate | Each child sees their own number under each split | The family's preferred option goes to the Nov 12 meeting | Brings the options to the meeting; numbers come from the calculator |
| Activate | One next step each; documents routed | Specialist tasks, and intros the family agreed to | Routes the will to an estate attorney; introduces PNC to Claire and Sam |
| Continue | Margaret starts her next chapter; the plan and log stay current | Check-ins repeat yearly | Keeps the relationship with all five, not one |

## The tour, alternating sides

1. **Advisor:** the signal. Call Margaret.
2. **Family:** Margaret invites her family.
3. **Family:** Claire shares one private answer.
4. **Advisor:** Alex sees four voices instead of one, and approves the brief.
5. **Family:** Sam sees his number move as the split changes.
6. **Advisor:** Alex introduces PNC to Claire before the gift arrives.

## What stays the same
- **Privacy model:** nothing is shared by default. Members can opt out of the summary. The summary needs at least 3 contributors, shows no per-person positions, and escapes all text.
- **AI split:** language models read and explain, fixed formulas do the money, people decide.
- **Secret sauce:** the signal, private-by-default answers, the household graph.
- **Pilot gates and economics** in `DEVILS_ADVOCATE_REVIEW.md`. The Wilson numbers: $27.0M at closing, and $8.0 to $9.0M reaching the two heirs who bank elsewhere.
