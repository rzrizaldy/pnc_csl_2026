// Seed data for the prototype. The Hale family is fictional: a mid-market family business whose members
// are modelled on the family archetypes in HBO's Succession. Every firm, person and figure is illustrative.
window.SEED = {
  business: {
    name: "Hale Freight",
    city: "Pittsburgh",
    founded: 1986,
    staff: 260,
    relationship: "PNC business client since 2004",
    buyer: "NorthPeak Logistics",
  },

  // Order = seats around the family table, clockwise from the top.
  people: [
    { id: "walt", name: "Walt Hale", short: "Walt", age: 78, role: "Founder and CEO", inBiz: true, gen: 1,
      archetype: "Logan Roy", pattern: "Won't name a successor. Has made promises in private.",
      status: "checked", pnc: "Business + Private Bank", color: "#10214D" },
    { id: "marisa", name: "Marisa Hale", short: "Marisa", age: 63, role: "Walt's wife", inBiz: false, gen: 1,
      archetype: "Marcia Roy", pattern: "Second marriage. Not an owner, but her future depends on the plan.",
      status: "invited", pnc: "Joint with Walt", color: "#8C929B" },
    { id: "dale", name: "Dale Hale", short: "Dale", age: 54, role: "Eldest son, runs a ranch, not in the business", inBiz: false, gen: 2,
      archetype: "Connor Roy", pattern: "Outside the business. Mostly needs to know when the cash arrives.",
      status: "checked", pnc: "None, banks elsewhere", color: "#6593C9" },
    { id: "kyle", name: "Kyle Hale", short: "Kyle", age: 47, role: "COO, 22 years in the business", inBiz: true, gen: 2,
      archetype: "Kendall Roy", pattern: "Has believed for years that he is next in line.",
      status: "checked", pnc: "Business banking", color: "#6F9A4B" },
    { id: "ross", name: "Ross Hale", short: "Ross", age: 42, role: "Head of sales", inBiz: true, gen: 2,
      archetype: "Roman Roy", pattern: "Talented, not yet ready, wants a title.",
      status: "checked", pnc: "None, banks elsewhere", color: "#E39A2E" },
    { id: "sloane", name: "Sloane Hale", short: "Sloane", age: 40, role: "Policy consultant in DC, not in the business", inBiz: false, gen: 2,
      archetype: "Shiv Roy", pattern: "Walt told her privately she would lead one day.",
      status: "checked", pnc: "None, banks elsewhere", color: "#6D4AA0" },
  ],

  signal: {
    score: 81, band: "High", horizon: "12–18 months", change: 11,
    // monthly sale-likelihood, oldest first (last value = today)
    history: [18, 19, 22, 21, 26, 31, 35, 44, 52, 58, 70, 81],
    reasons: [
      { text: "Two payments to an M&A adviser and a valuation firm", weight: 0.34 },
      { text: "Credit team asked for three years of audited financials", weight: 0.26 },
      { text: "$2.5M credit line paid down 14 months early", weight: 0.21 },
    ],
    others: [
      { client: "Okafor Precision", score: 44, band: "Watch", note: "Buy-sell agreement review", change: 6, history: [30, 31, 33, 32, 35, 36, 38, 37, 40, 41, 38, 44] },
      { client: "Reyes Dental Group", score: 21, band: "Low", note: "Key-person policy renewed", change: -3, history: [25, 26, 24, 25, 23, 24, 22, 23, 24, 22, 24, 21] },
    ],
  },

  // Deterministic proceeds (illustrative; a PNC tax specialist confirms real figures).
  deal: { offer: 48.0, earnout: 8.0, debt: 3.5, fees: 1.5, tax: 8.0,
    buckets: [
      { id: "spend", label: "Live on", detail: "Walt and Marisa, 30 years, with a cushion", value: 9.0, color: "#6F9A4B" },
      { id: "gift", label: "Give to the kids", detail: "Split four ways; see Options", value: 12.0, color: "#6D4AA0" },
      { id: "invest", label: "Invest and give back", detail: "Long-term portfolio and a family foundation", value: 6.0, color: "#6593C9" },
    ],
    // equity the active children keep with the buyer, used by the options slider
    rollover: { kyle: 1.5, ross: 0.5 },
    timeline: [
      { id: "loi", label: "Letter of intent", when: "Oct", done: true },
      { id: "diligence", label: "Buyer checks the books", when: "Nov–Jan", now: true },
      { id: "close", label: "Closing, cash arrives", when: "Mar" },
      { id: "earnout", label: "Earnout, if targets are met", when: "Years 1–3" },
    ],
  },

  // Stances on a −2..+2 scale, extracted from private check-ins (5 of 6 done; Marisa not yet).
  themes: [
    { id: "fair", label: "Equal shares for every child", short: "Equal shares", s: { walt: 0, dale: 2, kyle: -2, ross: -1, sloane: 1 } },
    { id: "sell", label: "Sell now rather than wait", short: "Sell now", s: { walt: 2, dale: 2, kyle: -1, ross: 0, sloane: 1 } },
    { id: "cash", label: "Cash soon matters most", short: "Cash soon", s: { walt: 1, dale: 2, kyle: 0, ross: 0, sloane: 1 } },
    { id: "name", label: "Keep the Hale name alive", short: "Keep the name", s: { walt: 2, dale: 0, kyle: 2, ross: 1, sloane: 1 } },
    { id: "after", label: "Walt's life after the sale is planned", short: "Walt's next chapter", s: { walt: -1, dale: -1, kyle: -1, ross: -2, sloane: -1 } },
  ],
  // The "secret promise" pattern: people who expect the top job.
  claims: ["kyle", "ross", "sloane"],

  checkin: {
    sloane: [
      { id: "q1", theme: "lead", q: "Who do you think should lead after the sale, and why?",
        a: "Dad told me two years ago, just the two of us, that I'd be the one to run things eventually. I don't think Kyle knows that." },
      { id: "q2", theme: "fair", q: "What would feel fair when the money is split?",
        a: "Equal shares. Kyle and Ross already get salaries and stock from the buyer. Dale and I get nothing unless it's in the split." },
      { id: "q3", theme: "after", q: "What do you hope Dad's life looks like a year after the sale?",
        a: "Honestly, I'm scared he'll have nothing to do and start a new fight. He needs a project." },
    ],
  },

  docs: [
    { id: "divorce", name: "Walt & Carol divorce agreement, 1998", type: "PDF", pages: 42,
      finding: "Clause 7.2: a sale of Hale Holdings needs written consent from all four children.",
      impact: "If confirmed, any one child may be able to block the sale.", risk: "High", action: "Send to family attorney", done: "With the family attorney", conf: 0.93 },
    { id: "note", name: "Handwritten note found in Walt's desk", type: "Scan", pages: 1,
      finding: "Names Kyle as successor. Undated and unsigned; one line may underline or cross out the name.",
      impact: "Probably not enforceable on its own, but family members may treat it as one. Counsel to advise.", risk: "High", action: "Ask counsel to review", done: "With counsel", conf: 0.71 },
    { id: "buysell", name: "Shareholder buy-sell agreement, 2011", type: "PDF", pages: 18,
      finding: "Valuation formula last updated in 2011, at 4× earnings.",
      impact: "The buyer's offer implies about 7×. Expect questions on price.", risk: "Medium", action: "Send to valuation specialist", done: "With the valuation specialist", conf: 0.88 },
  ],

  tasks: [
    { who: "Hawthorn IFS facilitator", what: "Family meeting: who leads, and what is fair", due: "Nov 12", status: "Booked" },
    { who: "Family attorney", what: "Confirm clause 7.2 consent needed from all four children", due: "Nov 8", status: "In progress" },
    { who: "Trust specialist", what: "Model the staged family trust", due: "Nov 19", status: "Requested" },
    { who: "Wealth advisor", what: "Accounts for Dale, Ross and Sloane for gifted assets", due: "Dec 3", status: "Waiting on consent" },
  ],

  ledger: [
    { t: "Oct 14", who: "Signal model", what: "Sale likelihood 81 for Hale Freight. Sent to Alex for review." },
    { t: "Oct 15", who: "Alex Lee", what: "Reviewed the signal. Called Walt." },
    { t: "Oct 20", who: "Walt Hale", what: "Invited his family. Chose private check-ins." },
    { t: "Oct 24", who: "Document AI", what: "Found clause 7.2 and the undated note. Sent to Alex." },
    { t: "Oct 25", who: "Alex Lee", what: "Approved the alignment brief. Booked Hawthorn IFS." },
  ],

  contingency: "If Walt cannot continue before closing, Kyle leads day to day for 90 days and the family council decides within 30 days. Signed by Walt, dated, kept by PNC.",

  // Adaptive UI: what each person sees first, and why. Cards are ranked per person.
  focus: {
    walt: { cards: ["proceeds", "nextchapter", "table", "timeline", "options"], why: "You're the owner, so the money and your next chapter come first." },
    marisa: { cards: ["proceeds", "timeline", "checkin", "table"], why: "You haven't checked in yet, and your future depends on the split." },
    dale: { cards: ["mine", "timeline", "options", "checkin"], why: "You told us cash timing matters most to you." },
    kyle: { cards: ["role", "meeting", "options", "table"], why: "You told us your role after the sale matters most." },
    ross: { cards: ["role", "options", "meeting", "timeline"], why: "You told us you want a clear title after the sale." },
    sloane: { cards: ["meeting", "mine", "options", "checkin"], why: "You raised who leads, so the family meeting comes first." },
  },

  // Demo assistant answers. Both models return the same structured card; only the wording differs.
  ask: {
    walt: [
      { q: "How much will Marisa and I keep?", card: "proceeds", tools: [["Read the latest letter of intent", "deal.terms(loi_v3)"], ["Ran the proceeds calculator", "calc.proceeds(offer=48.0)"]],
        a: { claude: "About $27.0M lands at closing, after debt, fees and estimated taxes. The $8.0M earnout is paid later and only if targets are met, so it isn't included.", gpt: "$27.0M at closing after debt, fees and estimated tax. The $8.0M earnout is contingent and excluded." } },
      { q: "What happens if I can't continue before closing?", card: "contingency", tools: [["Checked the decision log", "ledger.lookup('contingency')"]],
        a: { claude: "Your signed contingency plan applies: Kyle leads day to day for 90 days, and the family council decides within 30. Alex can help you update it.", gpt: "The signed plan applies: Kyle leads day to day for 90 days; the family council decides within 30 days." } },
    ],
    marisa: [
      { q: "What happens to me if Walt dies?", card: "contingency", tools: [["Checked the decision log", "ledger.lookup('contingency')"], ["Searched estate documents", "docs.search('spouse')"]],
        a: { claude: "The business has a signed contingency plan. Your personal position depends on Walt's estate plan, which predates your current agreements. Alex has scheduled an estate review.", gpt: "The business is covered by a signed plan. Your own position depends on Walt's estate plan, which needs review; Alex has scheduled one." } },
    ],
    dale: [
      { q: "When will I receive my share?", card: "mine", tools: [["Read the deal timeline", "deal.timeline()"], ["Ran the gift calculator", "calc.gift_options(child='dale')"]],
        a: { claude: "At closing, expected in March. Your share is $3.0M with an equal split, and up to $3.5M if your brothers' buyer equity is counted. The earnout isn't part of the family gift.", gpt: "Expected at closing in March: $3.0M with an equal split, up to $3.5M if Kyle and Ross's buyer equity is counted." } },
      { q: "Can Dad sell without our consent?", card: "clause", tools: [["Searched family documents", "docs.search('consent AND sale')"], ["Checked advice policy", "policy.check(legal_advice=false)"]],
        a: { claude: "Possibly not. A 1998 agreement appears to require written consent from all four children for a sale. The family attorney is confirming this before anyone relies on it.", gpt: "A 1998 agreement appears to require consent from all four children. The family attorney is confirming." } },
    ],
    kyle: [
      { q: "What's my role after the sale?", card: "role", tools: [["Read the letter of intent", "deal.terms(loi_v3, section='management')"]],
        a: { claude: "The letter of intent proposes a two-year COO contract and $1.5M of equity in NorthPeak; the buyer decides operating roles. Family leadership is on the agenda for Thursday, November 12.", gpt: "The LOI proposes a 2-year COO contract plus $1.5M of rollover equity. Family leadership is on the Nov 12 agenda." } },
      { q: "Can Dad sell without our consent?", card: "clause", tools: [["Searched family documents", "docs.search('consent AND sale')"], ["Checked advice policy", "policy.check(legal_advice=false)"]],
        a: { claude: "Possibly not. A 1998 agreement appears to require written consent from all four children for a sale. The family attorney is confirming.", gpt: "A 1998 agreement may require consent from all four children. The family attorney is confirming." } },
    ],
    ross: [
      { q: "Does the offer include a role for me?", card: "role", tools: [["Read the letter of intent", "deal.terms(loi_v3, section='management')"]],
        a: { claude: "Not yet. The letter keeps the sales team for 12 months but doesn't name your role. Raise it with Alex before the letter is signed.", gpt: "No role is named for you yet; the sales team is retained for 12 months. Raise it with Alex before signing." } },
    ],
    sloane: [
      { q: "Who decides who leads?", card: "meeting", tools: [["Checked the family calendar", "calendar.next('family_meeting')"], ["Checked brief status", "brief.status()"]],
        a: { claude: "The family discusses it together at the Thursday, November 12 meeting with a Hawthorn facilitator; the buyer decides roles inside NorthPeak. Your private answers stay private.", gpt: "It's on the agenda for the facilitated family meeting on Nov 12. Your answers remain private." } },
      { q: "Can Dad sell without our consent?", card: "clause", tools: [["Searched family documents", "docs.search('consent AND sale')"], ["Checked advice policy", "policy.check(legal_advice=false)"]],
        a: { claude: "Possibly not. A 1998 agreement appears to require written consent from all four children for a sale. The family attorney is confirming.", gpt: "A 1998 agreement may require consent from all four children. The family attorney is checking." } },
    ],
    alex: [
      { q: "Prepare me for the family meeting", card: "prep", tools: [["Summarized gaps", "brief.gaps()"], ["Counted leadership claims", "claims.count()"], ["Pulled high-risk findings", "docs.findings(risk='High')"]],
        a: { claude: "Cover three items, in order: counsel's view on the consent clause, leadership, then fairness. Present the leadership overlap as a pattern, not a person, and keep individual answers private.", gpt: "Agenda: consent clause, leadership, fairness. Frame the leadership overlap as a pattern; keep individual answers private." } },
      { q: "Which heirs are at risk?", card: "heirs", tools: [["Queried the household graph", "graph.heirs(pnc=false)"]],
        a: { claude: "Dale, Ross and Sloane bank elsewhere. Together they could receive $9.0M to $10.0M at closing. Sloane is the most engaged; start there.", gpt: "Three heirs have no PNC relationship and could receive $9.0M–$10.0M combined. Start with Sloane." } },
    ],
  },
};
