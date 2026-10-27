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


  // The three split options the family votes on. w = share of Ben's buyer equity that counts (see the split formula).
  options: [
    { id: "equal", label: "Equal", w: 0, line: "The same cash for each child. Ben's $1.5M of buyer equity isn't counted." },
    { id: "balanced", label: "Balanced", w: 0.5, line: "Half of Ben's buyer equity counts, so the gap between siblings narrows." },
    { id: "equity", label: "Equity counted", w: 1, line: "All of Ben's buyer equity counts, so every child's total is $4.5M." },
  ],
  // Before a family engages with PNC: a scenario preview. Ratios come from the Wilson deal so every preset is consistent
  // with the demo: net at closing = 27/48 of the offer, the children's gift = 12/27 of net, buyer equity kept by each
  // child who stays = 1.5/48 of the offer. Illustrative only.
  preview: {
    netRatio: 27 / 48, giftShare: 12 / 27, equityRatio: 1.5 / 48,
    presets: [
      { id: "wilson", label: "Like the Wilsons", value: 48, kids: 3, inBiz: 1 },
      { id: "both", label: "Two children, both in it", value: 30, kids: 2, inBiz: 2 },
      { id: "mixed", label: "Four children, two in it", value: 80, kids: 4, inBiz: 2 },
    ],
    compare: [
      ["Who is heard", "The founder, usually alone", "Every family member, privately"],
      ["When the family talks", "After the deal is signed", "Before the letter of intent"],
      ["Each child's number", "A guess, or a surprise", "Their own number, under every option"],
      ["The next generation", "13% stay with their parents' advisor", "Meets PNC before the money moves"],
    ],
    month: [
      ["Week 1", "A call with your PNC advisor"],
      ["Weeks 1–2", "A private check-in for each family member"],
      ["Week 3", "Your options, with every child's number"],
      ["Week 4", "A family meeting with a Hawthorn facilitator"],
    ],
  },

  // Onboarding: the founder confirms the facts PNC already holds, then picks and sharpens her goals.
  facts: [
    ["Offer from NorthPeak", "$48.0M", "From the latest offer, shared with Alex"],
    ["Company debt", "$3.5M", "From Wilson Transport's PNC accounts"],
    ["Expected closing", "Next fall", "From the deal timeline"],
    ["Family", "5 people", "Margaret, Tom, Ben, Claire and Sam"],
  ],
  goals: [
    { id: "fair", label: "Treat the children fairly", icon: "scale" },
    { id: "live", label: "Keep enough to live on", icon: "home" },
    { id: "chapter", label: "Have a next chapter of my own", icon: "compass" },
    { id: "give", label: "Give back to Pittsburgh", icon: "users" },
    { id: "name", label: "Keep the company name and staff", icon: "shield" },
  ],

  // The decision tree the family works through before Nov 12: 3 × 2 × 2 = 12 possible plans.
  tree: [
    { id: "count", q: "Does Ben's $1.5M of buyer equity count toward his share?", opts: [["equal", "No", "Equal"], ["balanced", "Half of it", "Balanced"], ["equity", "All of it", "Equity counted"]] },
    { id: "pay", q: "How is each child's gift paid?", opts: [["close", "All at closing", "Cash next fall"], ["trust", "Through a family trust", "Paid out over 10 years"]] },
    { id: "earn", q: "If the $8.0M earnout pays out later, where does it go?", opts: [["parents", "Margaret and Tom keep it", "Their cushion grows"], ["half", "Half to the children", "$4.0M, split equally"]] },
  ],

  // Alex's meeting guide for Nov 12, drafted by AI from the approved brief. Minutes add up to 90.
  guide: [
    { min: 10, title: "Welcome and ground rules", say: "Nobody's answers are on the table, only the family's range. Decisions today are in principle.", show: "The agenda", ask: "What would make today a good meeting for you?" },
    { min: 15, title: "Where you already agree", say: "Everyone, Margaret included, says her next chapter isn't planned yet. Start there.", show: "Gap 0.25 on Margaret's next chapter", ask: "Margaret, what would a good Monday look like a year from now?" },
    { min: 30, title: "The fairness question", say: "The family is furthest apart on equal shares. Show the range, never who said what.", show: "The three options, every child's bar", ask: "What would make a split feel fair to someone outside the business?" },
    { min: 20, title: "Walk the decision tree", say: "Three choices turn 12 possible plans into one. Settle them in order.", show: "The decision tree", ask: "Can we agree the first choice in principle today?" },
    { min: 15, title: "The will and next steps", say: "Share counsel's summary of the 2012 will, not a conclusion. Each person leaves with one next step.", show: "Everyone's next step", ask: "Who needs a follow-up call with me this week?" },
  ],
  guardrails: ["Never attribute a view to a person", "Every number comes from the calculator", "Counsel's summary, never a legal conclusion", "The facilitator runs the fairness discussion"],
  faqs: [
    ["Why doesn't everyone just get the same?", "Ben keeps $1.5M of NorthPeak equity. Equal cash means his total is higher; the options show what each choice does."],
    ["Can we change our minds later?", "Yes. Today's decisions are in principle. The family confirms them with counsel before closing."],
    ["What if the earnout never pays?", "Nothing changes at closing. The earnout is excluded from every number you've seen."],
  ],

  // One year on: where each dollar of the $27.0M sits, by PNC service. Totals match the buckets and the Balanced split.
  products: [
    { bucket: "spend", name: "Income portfolio", who: "Margaret and Tom", amt: 7.5, line: "Funds their spending for 30 years" },
    { bucket: "spend", name: "Cash and a credit line", who: "Margaret and Tom", amt: 1.5, line: "Cash on hand without selling investments" },
    { bucket: "gift", name: "Next-gen accounts", who: "Claire and Sam", amt: 8.5, line: "Opened after Alex's introduction" },
    { bucket: "gift", name: "Ben's account and equity plan", who: "Ben", amt: 3.5, line: "Plus planning for his $1.5M of NorthPeak stock" },
    { bucket: "invest", name: "Long-term portfolio", who: "The family", amt: 4.0, line: "Managed for the next generation" },
    { bucket: "invest", name: "Wilson family foundation", who: "Margaret", amt: 2.0, line: "With PNC's philanthropic advisory" },
  ],
  services: ["Estate plan and family trust, updated for an estate in cash", "A yearly family meeting with Hawthorn IFS", "Business banking for Ben at NorthPeak"],

  // Private votes already cast before the demo starts. In production each vote sits in the member's own vault;
  // the app only ever reads the counts, and only once at least MIN_GROUP people have voted.
  votes: { margaret: "balanced", ben: "equity" },

  // Questions each member can send to Alex. The AI drafts a reply from the plan and the calculator; Alex edits and sends it.
  ask: {
    margaret: [
      { q: "How much will Tom and I keep?", card: "proceeds", tools: ["Read the latest offer", "Ran the proceeds calculator", "Checked: no private answers used"],
        draft: "About $27.0M lands at closing, after debt, fees and estimated tax. The $8.0M earnout is paid later and only if targets are met, so I've left it out of every number." },
      { q: "How do I make the split feel fair to all three?", card: "split", tools: ["Read the anonymous family summary", "Ran the gift calculator", "Checked: no private answers used"],
        draft: "Your family's widest gap is fairness, so let's bring all three options to November 12 and let the facilitator lead that part. That way it isn't you against one of your children." },
    ],
    tom: [
      { q: "What happens to me if Margaret can't continue?", card: "contingency", tools: ["Checked the decision log", "Searched the estate documents", "Checked: not legal advice"],
        draft: "The business has a signed contingency plan. Your own position depends on Margaret's 2012 will, which was written before the sale. An estate attorney is updating it, and I'd like to walk you through it." },
    ],
    ben: [
      { q: "Does my buyer equity reduce my share?", card: "mine", tools: ["Read the latest offer", "Ran the gift calculator", "Checked: no private answers used"],
        draft: "It depends on the split the family chooses. With an equal split you receive $4.0M and your equity isn't counted. If it's fully counted, you receive $3.0M in cash, and with your $1.5M of equity your total matches your siblings' $4.5M." },
      { q: "What's my role after the sale?", card: "role", tools: ["Read the latest offer, management section", "Checked: the buyer decides roles"],
        draft: "The offer proposes a two-year COO contract and $1.5M of equity in NorthPeak. The buyer decides operating roles. How the equity counts in the family split is on the agenda for November 12." },
    ],
    claire: [
      { q: "When is the family meeting?", card: "meeting", tools: ["Checked the family calendar", "Checked the brief status"],
        draft: "Thursday, November 12, with a Hawthorn facilitator. We'll open with your mother's next chapter, then fairness. Your private answers stay private." },
      { q: "Who can see what I write?", card: "privacy", tools: ["Checked your sharing settings"],
        draft: "Only you. I can read an answer only if you switch sharing on for it, and you can switch it off again. Your family never sees your words." },
    ],
    sam: [
      { q: "When do I get my share, and does it have to go to PNC?", card: "mine", tools: ["Read the deal timeline", "Ran the gift calculator", "Checked: no product push"],
        draft: "At closing, expected next fall. Your share is $4.0M with an equal split and up to $4.5M if Ben's buyer equity counts. It can go to any bank. If you'd like an account next to the family's plan, I can introduce you to a PNC wealth advisor, with no obligation." },
      { q: "Is the earnout part of my share?", card: "proceeds", tools: ["Read the latest offer", "Ran the proceeds calculator"],
        draft: "No. The $8.0M earnout is paid later and only if NorthPeak's targets are met, so it isn't in the family gift. Your share comes from the $27.0M at closing." },
    ],
  },
  // A question already waiting in Alex's inbox when the demo starts (member + index into ask[member]).
  inbox: [{ id: "seed-claire", from: "claire", qi: 0, at: "Yesterday" }],
  // Draft for a question the AI can't answer from the plan: it says so, and Alex writes the reply.
  fallbackDraft: name => `Thanks, ${name}. Good question. I'll check with the right specialist and come back to you by Friday.`,
  slots: ["Thu Nov 5, 10:00", "Fri Nov 6, 2:00 PM", "Mon Nov 9, 9:30"],

  // One year on (fictional, derived from the figures above). The family chose Balanced (w = 0.5) at the Nov 12 meeting:
  // Ben $3.5M, Claire $4.25M, Sam $4.25M, so $8.5M reached the two heirs who banked elsewhere.
  yearOne: {
    when: "November 2027",
    chosen: "balanced",
    pncBefore: 3, pncAfter: 5,
    feeRate: 0.008, // illustrative blended fee from the economics sensitivity, not a forecast
    events: [
      { stage: "Signal", what: "Alex called Margaret 12 months before closing" },
      { stage: "Join", what: "Five of five family members checked in" },
      { stage: "Align", what: "Fairness was talked through on Nov 12, with a facilitator" },
      { stage: "Allocate", what: "The family chose the Balanced split" },
      { stage: "Activate", what: "The will was updated for an estate in cash" },
      { stage: "Continue", what: "The first yearly check-in is open" },
    ],
  },
};
