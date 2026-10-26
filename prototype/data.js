// Seed data for the prototype. Every person, firm and figure here is fictional and illustrative.
window.SEED = {
  business: {
    name: "Wilson Transport Co.",
    founded: 1994,
    sector: "Regional freight and logistics",
    employees: 210,
    relationship: "PNC commercial client since 2009",
  },

  // Advisor signal feed. Scores come from a classifier over commercial-account events (concept).
  signals: [
    {
      id: "wilson",
      client: "Wilson Transport Co.",
      owner: "Margaret Wilson",
      score: 0.78,
      band: "High",
      horizon: "12–18 months",
      reasons: [
        { text: "Two payments to an M&A advisory firm and a valuation firm in the last 60 days", weight: 0.31 },
        { text: "Credit team asked for three years of audited financials", weight: 0.24 },
        { text: "$2.0M line-of-credit paydown, 14 months ahead of schedule", weight: 0.19 },
      ],
      household: "Owner, spouse, 3 adult children · 1 of 3 children banks with PNC",
    },
    {
      id: "okafor",
      client: "Okafor Precision Machining",
      owner: "Daniel Okafor",
      score: 0.41,
      band: "Watch",
      horizon: "24+ months",
      reasons: [{ text: "Buy-sell agreement review requested by company counsel", weight: 0.22 }],
      household: "Two co-owners, 4 adult children",
    },
    {
      id: "reyes",
      client: "Reyes Family Dental Group",
      owner: "Lucia Reyes",
      score: 0.23,
      band: "Low",
      horizon: "—",
      reasons: [{ text: "Key-person insurance policy renewed at a higher value", weight: 0.09 }],
      household: "Owner, 2 adult children, both at PNC",
    },
  ],

  family: [
    { id: "margaret", name: "Margaret Wilson", short: "Margaret", role: "Founder · CEO", age: 68, gen: 1, active: true, status: "Joined", pnc: "Commercial + Private Bank" },
    { id: "tom", name: "Tom Wilson", short: "Tom", role: "Spouse", age: 70, gen: 1, active: false, status: "Invited", pnc: "Joint with Margaret" },
    { id: "ryan", name: "Ryan Wilson", short: "Ryan", role: "COO · active in business", age: 41, gen: 2, active: true, status: "Checked in", pnc: "Business banking" },
    { id: "emma", name: "Emma Wilson-Park", short: "Emma", role: "Not in business · teacher, Denver", age: 38, gen: 2, active: false, status: "Checked in", pnc: "None — banks elsewhere" },
    { id: "jake", name: "Jake Wilson", short: "Jake", role: "Not in business · software, Austin", age: 34, gen: 2, active: false, status: "Not started", pnc: "None — banks elsewhere" },
  ],

  // Stance per theme on a −2..+2 scale, extracted from private check-ins (Margaret, Ryan, Emma so far).
  // Divergence = (max − min) / 4, so 0 means full agreement and 1 means opposite ends.
  themes: [
    { id: "liquidity", label: "Cash now vs. keep invested", stances: { margaret: 1, ryan: -1, emma: 1 } },
    { id: "legacy", label: "Keep the Wilson name in the community", stances: { margaret: 2, ryan: 2, emma: 1 } },
    { id: "fairness", label: "Equal shares for every child", stances: { margaret: 0, ryan: -2, emma: 2 } },
    { id: "role", label: "Ryan stays on after the sale", stances: { margaret: 1, ryan: 2, emma: -1 } },
    { id: "purpose", label: "Margaret's life after the sale is planned", stances: { margaret: -1, ryan: 0, emma: -1 } },
    { id: "timing", label: "Close within 12 months", stances: { margaret: 1, ryan: -1, emma: 0 } },
  ],

  // Emma's private check-in. Each answer is private until she shares it.
  checkin: {
    member: "emma",
    answers: [
      {
        id: "q1",
        theme: "fairness",
        q: "When you picture the money from the sale being divided, what feels fair to you?",
        a: "Ryan gave twenty years to the company and I respect that. But if 'fair' quietly means Ryan gets the business side and Jake and I get whatever is left, I'd rather know now than at the reading of a will.",
      },
      {
        id: "q2",
        theme: "role",
        q: "Is there anything you'd find hard to say in front of the whole family?",
        a: "I don't think Mom knows Ryan wants to stay on with the buyer for five more years. I only know because he told me at Thanksgiving.",
      },
      {
        id: "q3",
        theme: "purpose",
        q: "What do you hope your mom's life looks like a year after the sale?",
        a: "Honestly I'm worried. The company is her whole week. I'd love for her to do something with the foundation idea she keeps mentioning.",
      },
    ],
  },

  // Deterministic proceeds calculation (illustrative; a PNC tax specialist confirms real figures).
  proceeds: {
    headline: 42.0,
    earnout: 6.0, // contingent over 3 years, not counted as cash
    debt: 3.1,
    fees: 1.3,
    tax: 6.9,
    buckets: [
      { id: "spend", label: "Spend", detail: "Margaret and Tom's lifestyle for 30 years, with a 20% cushion", value: 8.0 },
      { id: "gift", label: "Gift", detail: "Children, grandchildren and the family trust", value: 9.0 },
      { id: "invest", label: "Invest & give", detail: "Long-term portfolio and the foundation Margaret is considering", value: 7.7 },
    ],
  },

  // Distribution options for the $9.0M gift bucket. Amounts are calculator output, not model output.
  options: [
    {
      id: "equal",
      name: "Equal thirds",
      split: { ryan: 3.0, emma: 3.0, jake: 3.0 },
      pros: "Simple to explain. No one feels singled out.",
      cons: "Ignores Ryan's 20 years in the business and his rollover equity question.",
      gap: "Leaves Ryan's concern open",
    },
    {
      id: "equitable",
      name: "Equitable, with Ryan's equity counted",
      split: { ryan: 1.8, emma: 3.6, jake: 3.6 },
      pros: "Counts the $1.2M rollover equity Ryan keeps with the buyer, so totals land closer together.",
      cons: "Needs an open family conversation about what Ryan's role is worth.",
      gap: "Addresses both sides if discussed openly",
    },
    {
      id: "trust",
      name: "Family trust, staged",
      split: { ryan: 3.0, emma: 3.0, jake: 3.0 },
      staged: "Released over 10 years",
      pros: "Protects the gift from divorce and creditors, and gives time to adjust.",
      cons: "Emma and Jake may read staging as a lack of trust.",
      gap: "Equal in amount, but control stays with the trustee",
    },
  ],

  tasks: [
    { who: "Hawthorn IFS facilitator", what: "Family conversation on fairness before the letter of intent", due: "Nov 12", status: "Booked" },
    { who: "Trust & estate specialist", what: "Model the staged family trust against the equitable option", due: "Nov 19", status: "In progress" },
    { who: "Business banking", what: "Rollover equity and earnout terms review for Ryan", due: "Nov 21", status: "Requested" },
    { who: "Wealth advisor", what: "Open accounts for Emma and Jake for gifted assets", due: "Dec 3", status: "Waiting on consent" },
  ],

  log: [
    { t: "Oct 14, 09:12", who: "Model", what: "Liquidity-event score 0.78 for Wilson Transport. Routed to Alex Lee for review." },
    { t: "Oct 14, 10:05", who: "Alex Lee", what: "Reviewed signal. Opened a conversation with Margaret." },
    { t: "Oct 20, 16:40", who: "Margaret Wilson", what: "Invited Tom, Ryan, Emma and Jake. Chose private check-ins." },
    { t: "Oct 24, 19:22", who: "Emma Wilson-Park", what: "Completed check-in. Shared 1 of 3 answers with Alex." },
    { t: "Oct 25, 08:30", who: "Language model", what: "Drafted alignment brief from 3 check-ins (summaries only)." },
    { t: "Oct 25, 09:02", who: "Alex Lee", what: "Edited and approved the brief. Booked Hawthorn IFS session." },
  ],
};
