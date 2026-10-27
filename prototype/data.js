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
    { id: "dale", name: "Dale Hale", short: "Dale", age: 54, role: "Eldest · ranch owner, not in the business", inBiz: false, gen: 2,
      archetype: "Connor Roy", pattern: "Outside the business. Mostly needs to know when the cash arrives.",
      status: "checked", pnc: "None · banks elsewhere", color: "#6593C9" },
    { id: "kyle", name: "Kyle Hale", short: "Kyle", age: 47, role: "COO · in the business 22 years", inBiz: true, gen: 2,
      archetype: "Kendall Roy", pattern: "Has believed for years that he is next in line.",
      status: "checked", pnc: "Business banking", color: "#6F9A4B" },
    { id: "ross", name: "Ross Hale", short: "Ross", age: 42, role: "Head of sales", inBiz: true, gen: 2,
      archetype: "Roman Roy", pattern: "Talented, not yet ready, wants a title.",
      status: "checked", pnc: "None · banks elsewhere", color: "#E39A2E" },
    { id: "sloane", name: "Sloane Hale", short: "Sloane", age: 40, role: "Policy consultant in DC, not in the business", inBiz: false, gen: 2,
      archetype: "Shiv Roy", pattern: "Walt told her privately she would lead one day.",
      status: "checked", pnc: "None · banks elsewhere", color: "#6D4AA0" },
  ],

  signal: {
    score: 81, band: "High", horizon: "12–18 months",
    reasons: [
      { text: "Two payments to an M&A adviser and a valuation firm", weight: 0.34 },
      { text: "Credit team asked for three years of audited financials", weight: 0.26 },
      { text: "$2.5M credit line paid down 14 months early", weight: 0.21 },
    ],
    others: [
      { client: "Okafor Precision", score: 44, band: "Watch", note: "Buy-sell agreement review" },
      { client: "Reyes Dental Group", score: 21, band: "Low", note: "Key-person policy renewed" },
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
      { id: "close", label: "Closing · cash lands", when: "Mar" },
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
      impact: "Any one child can block the sale.", risk: "High", action: "Family attorney to confirm", conf: 0.93 },
    { id: "note", name: "Handwritten note found in Walt's desk", type: "Scan", pages: 1,
      finding: "Names Kyle as successor. Undated and unsigned; one line may underline or cross out the name.",
      impact: "Not a valid instruction, but family members may treat it as one.", risk: "High", action: "Replace with a dated, signed decision", conf: 0.71 },
    { id: "buysell", name: "Shareholder buy-sell agreement, 2011", type: "PDF", pages: 18,
      finding: "Valuation formula last updated in 2011, at 4× earnings.",
      impact: "The buyer's offer implies about 7×. Expect questions on price.", risk: "Medium", action: "Valuation specialist review", conf: 0.88 },
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

  // Mock AI answers. Both models return the same structured card; only the voice differs.
  ask: {
    walt: [
      { q: "How much do Marisa and I keep?", card: "proceeds", tools: ["calc.proceeds(offer=48.0)", "deal.terms(loi_v3)"],
        a: { claude: "After debt, fees and estimated taxes, about $27.0M lands at closing. The $8.0M earnout comes later and only if targets are met, so I've kept it out.", gpt: "Roughly $27.0M at closing after debt, fees and tax. The $8.0M earnout isn't guaranteed, so it's shown separately." } },
      { q: "What happens if I get sick before closing?", card: "contingency", tools: ["ledger.lookup('contingency')"],
        a: { claude: "You've already signed a plan for that: Kyle runs day to day for 90 days and the family council decides within 30. Alex can walk you through changing it.", gpt: "There's a signed plan: Kyle leads day to day for 90 days and the family council decides within 30 days. You can update it with Alex." } },
    ],
    dale: [
      { q: "When would I actually get money?", card: "mine", tools: ["deal.timeline()", "calc.gift_options(child='dale')"],
        a: { claude: "If the sale closes in March, your share of the family gift could arrive then: $3.0M if split equally, up to $3.5M if the equity your brothers keep is counted. Nothing from the earnout goes to you.", gpt: "Expected at closing in March: $3.0M with an equal split, up to $3.5M if Kyle and Ross's buyer equity is counted. The earnout isn't part of your share." } },
      { q: "Can Dad sell without us?", card: "clause", tools: ["docs.search('consent AND sale')", "policy.check(legal_advice=false)"],
        a: { claude: "Possibly not. A 1998 agreement says a sale needs written consent from all four children. That's a legal question, so Alex has asked the family attorney to confirm before anyone relies on it.", gpt: "A 1998 agreement appears to require consent from all four children for a sale. This needs a lawyer's confirmation; Alex has asked the family attorney." } },
    ],
    kyle: [
      { q: "Will I still run operations after the sale?", card: "role", tools: ["deal.terms(loi_v3, section='management')"],
        a: { claude: "The buyer's letter offers you a two-year COO contract and $1.5M of equity in the combined company. Whether you lead the family side is on the agenda for November 12.", gpt: "The letter of intent proposes a 2-year COO role for you plus $1.5M rollover equity. Family leadership is on the Nov 12 agenda." } },
      { q: "Can Dad sell without us?", card: "clause", tools: ["docs.search('consent AND sale')", "policy.check(legal_advice=false)"],
        a: { claude: "Possibly not. A 1998 agreement says a sale needs written consent from all four children. Alex has asked the family attorney to confirm.", gpt: "A 1998 agreement may require all four children to consent. The family attorney is confirming." } },
    ],
    ross: [
      { q: "What title would I have after the sale?", card: "role", tools: ["deal.terms(loi_v3, section='management')"],
        a: { claude: "The letter doesn't name a role for you yet; it keeps the sales team for a year. That's worth raising with Alex before the family meeting.", gpt: "No role is named for you in the letter yet; the sales team is retained for 12 months. Raise it with Alex before Nov 12." } },
    ],
    sloane: [
      { q: "Who decides who leads?", card: "meeting", tools: ["calendar.next('family_meeting')", "brief.status()"],
        a: { claude: "No one decides alone. Three of you expect to lead, so a Hawthorn IFS facilitator is running a family meeting on November 12. Your private answers stay private there too.", gpt: "It's on the agenda for the facilitated family meeting on Nov 12. Several family members expect to lead; your answers stay private." } },
      { q: "Can Dad sell without us?", card: "clause", tools: ["docs.search('consent AND sale')", "policy.check(legal_advice=false)"],
        a: { claude: "Possibly not. A 1998 agreement says a sale needs written consent from all four children. Alex has asked the family attorney to confirm.", gpt: "A 1998 agreement may require consent from all four children. The family attorney is checking." } },
    ],
    marisa: [
      { q: "What happens to me if Walt dies?", card: "contingency", tools: ["ledger.lookup('contingency')", "docs.search('spouse')"],
        a: { claude: "There's a signed plan for the business. Your own position depends on Walt's estate plan, which is older than your marriage terms. Alex has flagged it for an estate review.", gpt: "The business has a signed contingency plan. Your personal position depends on Walt's estate plan, which needs a review; Alex has flagged it." } },
    ],
    alex: [
      { q: "Prepare me for the family meeting", card: "prep", tools: ["brief.gaps()", "claims.count()", "docs.findings(risk='High')"],
        a: { claude: "Three things to cover, in this order: the consent clause, then who leads, then fairness. Don't reveal who said what. Let the facilitator name the leadership collision as a pattern, not a person.", gpt: "Agenda: 1) consent clause, 2) leadership, 3) fairness. Keep individual answers private; frame the leadership collision as a pattern." } },
      { q: "Which heirs could we lose?", card: "heirs", tools: ["graph.heirs(pnc=false)"],
        a: { claude: "Dale, Ross and Sloane bank elsewhere today. Together they could receive $9.0M to $10.0M at closing. Sloane is the most engaged, so start with her.", gpt: "Three heirs (Dale, Ross, Sloane) have no PNC relationship and could receive $9.0M–$10.0M combined. Sloane is the most engaged." } },
    ],
  },
};
