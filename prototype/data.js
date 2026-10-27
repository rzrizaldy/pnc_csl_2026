// Seed data for the prototype. The Wilson family matches the team's personas: Margaret Wilson, the founder, and
// Alex Lee, her PNC advisor. Every firm, person and figure is fictional and illustrative.
window.SEED = {
  business: {
    name: "Wilson Transport",
    city: "Pittsburgh",
    founded: 1990,
    staff: 240,
    relationship: "PNC business client since 2003",
    buyer: "NorthPeak Logistics",
  },

  // Order = seats around the family table, clockwise from the top.
  people: [
    { id: "margaret", name: "Margaret Wilson", short: "Margaret", age: 63, role: "Founder and CEO", inBiz: true, gen: 1,
      line: "Wants a plan her family understands and trusts.",
      status: "checked", pnc: "Business banking", color: "#10214D" },
    { id: "tom", name: "Tom Wilson", short: "Tom", age: 65, role: "Margaret's husband, retired teacher", inBiz: false, gen: 1,
      line: "Not an owner, but his future depends on the plan.",
      status: "invited", pnc: "Joint with Margaret", color: "#8C929B" },
    { id: "ben", name: "Ben Wilson", short: "Ben", age: 40, role: "COO, 16 years in the business", inBiz: true, gen: 2,
      line: "Will stay on with the buyer. Thinks his years should count.",
      status: "checked", pnc: "Business banking", color: "#6F9A4B" },
    { id: "claire", name: "Claire Wilson", short: "Claire", age: 37, role: "Nurse practitioner in Columbus, not in the business", inBiz: false, gen: 2,
      line: "Thinks equal is fair. Has never said so to her mother.",
      status: "checked", pnc: "None, banks elsewhere", color: "#6D4AA0" },
    { id: "sam", name: "Sam Wilson", short: "Sam", age: 33, role: "Software engineer in Austin, not in the business", inBiz: false, gen: 2,
      line: "Mostly wants to know how much, and when.",
      status: "checked", pnc: "None, banks elsewhere", color: "#6593C9" },
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
      { id: "spend", label: "Live on", detail: "Margaret and Tom, 30 years, with a cushion", value: 9.0, color: "#6F9A4B" },
      { id: "gift", label: "Give to the children", detail: "Split three ways; see Options", value: 12.0, color: "#6D4AA0" },
      { id: "invest", label: "Invest and give back", detail: "Long-term portfolio and a family foundation", value: 6.0, color: "#6593C9" },
    ],
    // equity the child in the business keeps with the buyer, used by the options slider
    rollover: { ben: 1.5 },
    timeline: [
      { id: "offer", label: "Offer in hand", when: "Oct", now: true },
      { id: "loi", label: "Letter of intent", when: "Jan" },
      { id: "diligence", label: "Buyer checks the books", when: "Feb–Jul" },
      { id: "close", label: "Closing, cash arrives", when: "Next fall" },
    ],
  },

  // Stances on a −2..+2 scale, extracted from private check-ins (4 of 5 done; Tom not yet).
  themes: [
    { id: "fair", label: "Equal shares for every child", short: "Equal shares", s: { margaret: 1, ben: -2, claire: 2, sam: 1 } },
    { id: "sell", label: "Sell now rather than wait", short: "Sell now", s: { margaret: 2, ben: -1, claire: 1, sam: 2 } },
    { id: "cash", label: "Cash soon matters most", short: "Cash soon", s: { margaret: 0, ben: -1, claire: 0, sam: 1 } },
    { id: "name", label: "Keep the company name and staff", short: "Keep the name", s: { margaret: 2, ben: 2, claire: 1, sam: 0 } },
    { id: "after", label: "Margaret's life after the sale is planned", short: "Margaret's next chapter", s: { margaret: -1, ben: -1, claire: -2, sam: -1 } },
  ],
  // What the owner told Alex directly, before Family Table. The founder's view, set against the family's.
  ownerPlan: { split: "Equal shares for all three children", says: "I think the kids are on the same page." },

  checkin: {
    claire: [
      { id: "q1", theme: "fair", q: "What would feel fair when the money is split?",
        a: "Equal. Ben already gets a salary and stock from the buyer. Sam and I only get what's in the split. I've never said that to Mom." },
      { id: "q2", theme: "unsaid", q: "Is there anything you haven't said to your family?",
        a: "I don't want to fight with Ben over money, so I've never brought it up. I think he assumes his years in the company count." },
      { id: "q3", theme: "after", q: "What do you hope Mom's life looks like a year after the sale?",
        a: "She's worked every day for 35 years. I'm worried she'll be lost without it. She needs something that's hers." },
    ],
  },

  docs: [
    { id: "will", name: "Margaret's will, 2012", type: "PDF", pages: 14,
      finding: "Leaves the company shares equally to the three children.",
      impact: "After the sale the shares become cash. The will doesn't say whether Ben's buyer equity counts toward his share. Counsel to advise.", risk: "High", action: "Send to estate attorney", done: "With the estate attorney", conf: 0.9 },
    { id: "policy", name: "Key-person life policy, 2015", type: "PDF", pages: 6,
      finding: "Pays the company, not the family, and ends at closing.",
      impact: "If Margaret can't continue before closing, the family may have no cover. An insurance specialist should review it.", risk: "Medium", action: "Send to insurance specialist", done: "With the insurance specialist", conf: 0.86 },
    { id: "buysell", name: "Shareholder buy-sell agreement, 2009", type: "Scan", pages: 18,
      finding: "Valuation formula fixed at 4× earnings in 2009.",
      impact: "The buyer's offer implies about 7×. Expect questions on price.", risk: "Medium", action: "Send to valuation specialist", done: "With the valuation specialist", conf: 0.88 },
  ],

  tasks: [
    { who: "Hawthorn IFS facilitator", what: "Family meeting: what's fair, and what comes next", due: "Nov 12", status: "Booked" },
    { who: "Estate attorney", what: "Update Margaret's 2012 will for an estate in cash", due: "Nov 19", status: "In progress" },
    { who: "Business banking", what: "Review Ben's COO contract and buyer equity", due: "Nov 24", status: "Requested" },
    { who: "Trust specialist", what: "Model a family trust for the gifts", due: "Dec 1", status: "Requested" },
    { who: "Wealth advisor", what: "Accounts for Claire and Sam for gifted assets", due: "Dec 3", status: "Waiting on consent" },
  ],

  ledger: [
    { t: "Oct 14", who: "Signal model", what: "Sale likelihood 81 for Wilson Transport. Sent to Alex for review." },
    { t: "Oct 15", who: "Alex Lee", what: "Reviewed the signal. Called Margaret." },
    { t: "Oct 20", who: "Margaret Wilson", what: "Invited her family. Chose private check-ins." },
    { t: "Oct 24", who: "Document AI", what: "Flagged the 2012 will and the key-person policy. Sent to Alex." },
    { t: "Oct 25", who: "Alex Lee", what: "Approved the meeting brief. Booked Hawthorn IFS." },
  ],

  contingency: "If Margaret cannot continue before closing, Ben runs day-to-day operations for 90 days and the family decides next steps within 30 days, with Alex. Signed by Margaret, dated, kept by PNC.",

  // Demo assistant answers. Both models return the same structured card; only the wording differs.
  ask: {
    margaret: [
      { q: "How much will Tom and I keep?", card: "proceeds", tools: [["Read the latest offer", "deal.terms(offer_v2)"], ["Ran the proceeds calculator", "calc.proceeds(offer=48.0)"]],
        a: { claude: "About $27.0M lands at closing, after debt, fees and estimated taxes. The $8.0M earnout is paid later and only if targets are met, so it isn't included.", gpt: "$27.0M at closing after debt, fees and estimated tax. The $8.0M earnout is contingent and excluded." } },
      { q: "How do I make the split feel fair to all three?", card: "split", tools: [["Read the anonymous family summary", "summary.gaps(min_group=3)"], ["Ran the gift calculator", "calc.gift_options()"]],
        a: { claude: "Your family's widest gap is on fairness, so bring two options to the November 12 meeting: an equal split, and one that counts the $1.5M Ben keeps with the buyer. Let the facilitator lead that part, so it isn't you against one of your children.", gpt: "Fairness is the family's widest gap. Bring an equal split and an equity-counted split to Nov 12, and let the facilitator lead." } },
    ],
    tom: [
      { q: "What happens to me if Margaret can't continue?", card: "contingency", tools: [["Checked the decision log", "ledger.lookup('contingency')"], ["Searched estate documents", "docs.search('spouse')"]],
        a: { claude: "The business has a signed contingency plan. Your own position depends on Margaret's 2012 will, which was written before the sale. An estate attorney is updating it, and Alex has scheduled a review with you.", gpt: "The business is covered by a signed plan. Your position depends on Margaret's 2012 will, which is being updated; Alex has scheduled a review." } },
    ],
    ben: [
      { q: "What's my role after the sale?", card: "role", tools: [["Read the latest offer", "deal.terms(offer_v2, section='management')"]],
        a: { claude: "The offer proposes a two-year COO contract and $1.5M of equity in NorthPeak; the buyer decides operating roles. How that equity counts in the family split is on the agenda for Thursday, November 12.", gpt: "The offer proposes a 2-year COO contract plus $1.5M of buyer equity. How it counts in the family split is on the Nov 12 agenda." } },
      { q: "Does my buyer equity reduce my share?", card: "mine", tools: [["Ran the gift calculator", "calc.gift_options(child='ben')"]],
        a: { claude: "It depends on the split the family chooses. With an equal split you receive $4.0M and your equity isn't counted. If it's fully counted, you receive $3.0M in cash, and with your $1.5M of equity your total matches your siblings' $4.5M.", gpt: "Equal split: $4.0M, equity not counted. Fully counted: $3.0M cash plus $1.5M equity, matching your siblings' $4.5M." } },
    ],
    claire: [
      { q: "Who can see what I write?", card: "privacy", tools: [["Checked your sharing settings", "consent.status('claire')"]],
        a: { claude: "Only you. Alex can read an answer only if you switch sharing on for it, and you can switch it off again. Your family never sees your words. If you stay in the family summary, your themes are counted without your name.", gpt: "Only you. Alex reads an answer only if you share it, and you can withdraw it. Your family never sees your words." } },
      { q: "When is the family meeting?", card: "meeting", tools: [["Checked the family calendar", "calendar.next('family_meeting')"], ["Checked brief status", "brief.status()"]],
        a: { claude: "Thursday, November 12, with a Hawthorn facilitator. The agenda opens with your mother's next chapter, then fairness. Your private answers stay private.", gpt: "Thursday, Nov 12, with a Hawthorn facilitator: Mom's next chapter, then fairness. Your answers remain private." } },
    ],
    sam: [
      { q: "When will I receive my share?", card: "mine", tools: [["Read the deal timeline", "deal.timeline()"], ["Ran the gift calculator", "calc.gift_options(child='sam')"]],
        a: { claude: "At closing, expected next fall. Your share is $4.0M with an equal split, and up to $4.5M if Ben's buyer equity is counted. The earnout isn't part of the family gift.", gpt: "Expected at closing next fall: $4.0M with an equal split, up to $4.5M if Ben's buyer equity is counted." } },
      { q: "Do I have to move my money to PNC?", card: "account", tools: [["Checked payment instructions", "plan.payout('sam')"], ["Checked advice policy", "policy.check(product_push=false)"]],
        a: { claude: "No. Your gift can be paid to any bank. If you'd like your account in the same place as the family's plan, PNC can open one for you in minutes.", gpt: "No. It can be paid to any bank. PNC can open an account if you want one next to the family plan." } },
    ],
    alex: [
      { q: "Prepare me for the family meeting", card: "prep", tools: [["Summarized gaps", "brief.gaps()"], ["Compared the owner's plan", "plan.compare(owner='margaret')"], ["Pulled high-risk findings", "docs.findings(risk='High')"]],
        a: { claude: "Open with common ground: everyone, Margaret included, says her next chapter isn't planned. Then fairness, the widest gap. Margaret's plan assumes an equal split, so present the range, not the people, and let the facilitator lead. Close with the will update.", gpt: "Agenda: Margaret's next chapter (common ground), fairness (widest gap, present as a range), then the will update." } },
      { q: "Which heirs bank elsewhere?", card: "heirs", tools: [["Queried the household graph", "graph.heirs(pnc=false)"]],
        a: { claude: "Claire and Sam bank elsewhere. Together they could receive $8.0M to $9.0M at closing. Claire is the most engaged; start there, with Margaret's agreement.", gpt: "Claire and Sam have no PNC relationship and could receive $8.0M–$9.0M combined. Start with Claire." } },
    ],
  },
};
