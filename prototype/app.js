// Family Table prototype. Hash routes, no build step, mobile-first.
// Structure: an onboarding splash, a guided 8-step story that alternates the family and advisor sides,
// focused screens with one big number each, and a "one year on" payoff.
(function () {
  const S = window.SEED;
  const P = Object.fromEntries(S.people.map(p => [p.id, p]));
  const KIDS = ["ben", "claire", "sam"];
  const OPT = Object.fromEntries(S.options.map(o => [o.id, o]));
  const app = document.getElementById("app");
  const sheetRoot = document.getElementById("sheet-root");
  const embedded = window.self !== window.top; // shown inside the phone mockup on the project site
  if (embedded) document.documentElement.classList.add("embedded");

  // ---------- state ----------
  const KEY = "family-table-v7";
  const fresh = () => ({ shared: [], optOut: false, approved: false, started: false, routed: {}, pick: "balanced", votes: {},
    answers: {}, intro: {}, invited: false, chapter: [], agreed: {}, msgs: [], replies: {}, drafts: {}, calls: {}, confirmed: {},
    shareReply: {}, tour: -1 });
  let state = fresh();
  try {
    const qp = new URLSearchParams(location.search);
    if (qp.has("reset") || qp.has("tour")) localStorage.removeItem(KEY);
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved) state = Object.assign(fresh(), saved);
    if (qp.has("tour")) history.replaceState(null, "", location.pathname + "#/");
  } catch (e) { /* storage blocked: keep in-memory state */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const set = patch => { Object.assign(state, patch); save(); render(); };
  const ui = { callOpen: false };
  let sheet = { kind: null };

  // ---------- helpers ----------
  const money = v => "$" + (Math.abs(v * 10 - Math.round(v * 10)) > 0.001 ? v.toFixed(2) : v.toFixed(1)) + "M";
  const range = (a, b) => money(Math.min(a, b)) + "–" + money(Math.max(a, b)).slice(1);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MIN_GROUP = 3; // aggregates (family summary, vote tally) appear only when at least this many members contribute
  // Themes that feed the advisor's anonymous summary: only members who agreed to contribute.
  const summaryThemes = () => S.themes.map(th => ({ ...th, s: Object.fromEntries(Object.entries(th.s).filter(([k]) => !(k === "claire" && state.optOut))) }));
  const contributors = () => S.people.filter(p => p.status === "checked" && !(p.id === "claire" && state.optOut)).length;
  const checkedIn = () => S.people.filter(p => p.status === "checked").length;
  const ini = p => p.name.split(" ").map(x => x[0]).join("");
  const av = (p, s = 40) => `<span class="av" style="background:${p.color};width:${s}px;height:${s}px;font-size:${Math.round(s / 2.9)}px">${ini(p)}</span>`;
  const avAlex = (s = 40) => `<span class="av" style="background:#EF6A00;width:${s}px;height:${s}px;font-size:${Math.round(s / 2.9)}px">AL</span>`;
  const gap = th => { const v = Object.values(th.s); return (Math.max(...v) - Math.min(...v)) / 4; };
  const net = () => { const d = S.deal; return d.offer - d.earnout - d.debt - d.fees - d.tax; };
  // Deterministic gift split: count w (0..1) of the equity each child keeps with the buyer, so totals even out.
  const gifts = w => {
    const pot = S.deal.buckets.find(b => b.id === "gift").value, R = S.deal.rollover;
    const eq = KIDS.reduce((s, k) => s + (R[k] || 0), 0), target = (pot + w * eq) / KIDS.length;
    return Object.fromEntries(KIDS.map(k => [k, target - w * (R[k] || 0)]));
  };
  const heirs = () => S.people.filter(p => p.gen === 2 && p.pnc.startsWith("None"));
  const heirSum = w => heirs().reduce((s, h) => s + gifts(w)[h.id], 0);
  // Votes are private: screens only ever read the counts.
  const votes = () => Object.assign({}, S.votes, state.votes);
  const tally = () => { const t = Object.fromEntries(S.options.map(o => [o.id, 0])); Object.values(votes()).forEach(v => t[v]++); return t; };
  // Messages to Alex: the seeded inbox plus anything sent in this session.
  const messages = () => [...S.inbox, ...state.msgs];
  const qText = m => m.qi != null ? S.ask[m.from][m.qi].q : m.text;
  const draftFor = m => state.drafts[m.id] ?? (m.qi != null ? S.ask[m.from][m.qi].draft : S.fallbackDraft(P[m.from].short));
  const waiting = () => messages().filter(m => state.replies[m.id] == null);
  const callReqs = () => Object.keys(state.calls).filter(id => !state.confirmed[id]);

  const I = {
    home: 'M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
    chat: 'M4 5h16v11H8l-4 4z',
    scale: 'M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z',
    flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
    users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7.5M22 21a7 7 0 0 0-4-6.3',
    doc: 'M6 3h8l5 5v13H6zM14 3v5h5M9 13h7M9 17h7',
    cal: 'M4 6h16v15H4zM4 10h16M8 3v5M16 3v5',
    lock: 'M6 11h12v10H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
    brief: 'M4 8h16v12H4zM9 8V5h6v3M4 13h16',
    bank: 'M3 10 12 4l9 6M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18',
    shield: 'M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z',
    compass: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM15.5 8.5l-2 5-5 2 2-5z',
    chev: 'M9 5l7 7-7 7',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    x: 'M6 6l12 12M18 6 6 18',
    alert: 'M12 3 2 20h20zM12 10v4M12 17v.5',
    sort: 'M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
    pulse: 'M3 12h4l3-7 4 14 3-7h4',
    repeat: 'M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4',
    send: 'M4 12 20 4l-5 16-3-7z',
    person: 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
  };
  const ic = (k, s = 20, w = 1.8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${I[k]}"/></svg>`;
  const chev = `<span class="chev">${ic("chev", 18)}</span>`;
  const mark = `<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16" cy="16" r="5" fill="#EF6A00"/><circle cx="16" cy="5" r="2.4" fill="#fff"/><circle cx="26" cy="20" r="2.4" fill="#fff"/><circle cx="6" cy="20" r="2.4" fill="#fff"/></svg>`;

  // The team deck's six stages.
  const STAGES = [
    { id: "signal", label: "Signal", icon: "pulse", line: "PNC spots a likely sale a year before closing" },
    { id: "join", label: "Join", icon: "users", line: "The founder invites the whole family" },
    { id: "align", label: "Align", icon: "lock", line: "Private check-ins. AI finds where the family differs" },
    { id: "allocate", label: "Allocate", icon: "scale", line: "Each person sees their number and votes privately" },
    { id: "activate", label: "Activate", icon: "chat", line: "Questions to the advisor, specialists, next steps" },
    { id: "continue", label: "Continue", icon: "repeat", line: "A yearly check-in keeps the plan current" },
  ];

  // ---------- visualisations ----------
  function lineChart(data, { w = 640, h = 170, color = "#EF6A00" } = {}) {
    const step = w / (data.length - 1), y = v => h - 8 - (v / 100) * (h - 16);
    const pts = data.map((v, i) => [i * step, y(v)]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const last = pts[pts.length - 1];
    return `<svg class="viz" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Sale likelihood over 12 months, now ${data[data.length - 1]}">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".16"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <line x1="0" x2="${w}" y1="${y(50)}" y2="${y(50)}" stroke="#E6E8EC" stroke-dasharray="3 4"/>
      <path class="area" d="${d} L${w} ${h} L0 ${h} Z" fill="url(#lg)"/>
      <path class="draw" d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <circle class="end-dot" cx="${last[0] - 6}" cy="${last[1]}" r="6" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
  }
  function familyTable(size = 260) {
    const n = S.people.length, c = 160, R = 116, done = checkedIn();
    const seats = S.people.map((p, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n, x = c + R * Math.cos(a), y = c + R * Math.sin(a);
      const ring = p.status === "checked" ? `stroke="#2E7D32" stroke-width="3"` : `stroke="#A9AFB8" stroke-width="2.5" stroke-dasharray="4 3"`;
      const ly = y + (Math.sin(a) > 0.3 ? 40 : -33);
      return `<g class="seat-g" style="--i:${i}"><circle cx="${x}" cy="${y}" r="27" fill="#fff" ${ring}/><circle cx="${x}" cy="${y}" r="21" fill="${p.color}"/>
        <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#fff">${ini(p)}</text>
        <text x="${x}" y="${ly}" text-anchor="middle" font-size="13.5" fill="#1F2430" font-weight="600">${p.short}</text></g>`;
    }).join("");
    return `<svg class="viz" viewBox="-20 -12 360 352" style="max-width:${size}px" role="img" aria-label="${done} of ${n} family members have checked in">
      <circle cx="${c}" cy="${c}" r="72" fill="#F4F5F7"/>
      <text x="${c}" y="${c + 4}" text-anchor="middle" font-size="36" font-weight="600" fill="#10214D">${done}/${n}</text>
      <text x="${c}" y="${c + 25}" text-anchor="middle" font-size="13" fill="#5E646E">checked in</text>${seats}</svg>`;
  }
  function trip() {
    const tl = S.deal.timeline, cur = tl.findIndex(s => s.now);
    return `<div class="trip" aria-label="Sale progress"><div class="bars">${tl.map((s, i) => `<i class="${i < cur ? "done" : i === cur ? "now" : ""}"></i>`).join("")}</div>
      <div class="steps">${["Offer", "Terms", "Buyer review", "Closing"].map((l, i) => `<span class="${i === cur ? "cur" : ""}">${l}</span>`).join("")}</div></div>`;
  }
  function waterfall() {
    const d = S.deal, cash = d.offer - d.earnout, n = net(), sc = v => (v / d.offer * 100).toFixed(2) + "%";
    const r = (label, cls, left, w, val) => `<div class="r ${cls}"><span>${label}</span><b>${val}</b><div class="track"><i style="left:${sc(left)};width:${sc(w)}"></i></div></div>`;
    return `<div class="wf">${r("Offer from NorthPeak", "", 0, d.offer, money(d.offer))}${r("Earnout, paid later if targets are met", "cont", cash, d.earnout, "−" + money(d.earnout))}${r("Company debt", "minus", cash - d.debt, d.debt, "−" + money(d.debt))}${r("Deal fees", "minus", cash - d.debt - d.fees, d.fees, "−" + money(d.fees))}${r("Estimated tax", "minus", n, d.tax, "−" + money(d.tax))}${r("At closing", "net", 0, n, money(n))}</div>`;
  }
  // One stacked bar for live on, give and invest, with the three numbers underneath.
  const allocBar = () => `<div class="alloc" role="img" aria-label="Live on $9.0M, give $12.0M, invest $6.0M">${S.deal.buckets.map(b => `<i style="flex:${b.value};background:${b.color}"></i>`).join("")}</div>
    <div class="alloc-legend">${S.deal.buckets.map(b => `<div><span class="dot" style="background:${b.color}"></span><b>${money(b.value)}</b><span>${b.label}</span></div>`).join("")}</div>`;
  // Every child's number under one option; the viewer's own bar is highlighted.
  const optBars = (o, pid) => { const g = gifts(o.w);
    return `<span class="obars">${KIDS.map(k => `<span class="ob ${k === pid || pid == null ? "mine" : ""}"><span class="ob-n">${k === pid ? "You" : P[k].short}</span><span class="ob-t"><i style="width:${(g[k] / 4.5 * 100).toFixed(1)}%;background:${P[k].color}"></i></span><b>${money(g[k])}</b></span>`).join("")}</span>`; };
  // Gap by theme, 0 to 1, with the facilitator threshold drawn at 0.75. No per-person positions.
  const gapBars = ths => `<div class="gaps">${ths.map(({ th, g }) => `<div class="gb ${g >= 0.75 ? "high" : ""}"><span>${th.short}</span><span class="gb-t"><i style="width:${g * 100}%"></i></span><b>${g.toFixed(2)}</b></div>`).join("")}
    <div class="gb gb-axis" aria-hidden="true"><span></span><span class="gb-t"><em style="left:75%">Facilitator line, 0.75</em></span><b></b></div></div>`;
  const voices = () => `<div class="voices">${S.people.map(p => `<span class="voice ${p.status === "checked" ? "on" : ""}">${av(p, 36)}<small>${p.short}</small></span>`).join("")}</div>`;
  function tallyPanel(forAlex) {
    const vs = votes(), n = Object.keys(vs).length, total = S.people.length, t = tally(), lead = Math.max(...Object.values(t));
    const body = n < MIN_GROUP
      ? `<div class="ballots" aria-label="${n} of ${total} have voted">${S.people.map((_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("")}</div>
         <p class="small muted">Results appear once ${MIN_GROUP} people have voted, so no single vote can be traced.</p>`
      : `<div class="tally">${S.options.map(o => `<div class="tl ${t[o.id] === lead && lead ? "lead" : ""}"><span>${o.label}</span><span class="tl-t"><i style="width:${(t[o.id] / n * 100).toFixed(0)}%"></i></span><b>${t[o.id]}</b></div>`).join("")}</div>
         <p class="small muted">Counts only. ${forAlex ? "Alex can't see" : "Nobody can see"} who voted for what.</p>`;
    return `<section class="panel tally-panel"><div class="section-head"><h2>The family's vote</h2><span class="aside">${n} of ${total} voted</span></div>${body}
      <p class="micro faint" style="margin-top:10px">Advisory, not binding. The count goes to the Nov 12 meeting, where the family decides together with a Hawthorn facilitator.</p></section>`;
  }

  // ---------- app shell ----------
  let route = "";
  const viewer = () => { const m = route.match(/^me\/(\w+)/); return m && P[m[1]] ? m[1] : route.startsWith("advisor") ? "alex" : null; };
  function nav() {
    const v = viewer(), n = waiting().length + callReqs().length;
    return v === "alex"
      ? [["advisor", "Signal", "pulse"], ["advisor/align", "AI brief", "brief"], ["advisor/inbox", "Inbox", "chat", n], ["advisor/plan", "Plan", "flag"]]
      : v ? [[`me/${v}`, "Home", "home"], [`me/${v}/checkin`, "Check-in", "lock"], [`me/${v}/options`, "Vote", "scale"], [`me/${v}/ask`, "Ask Alex", "chat"]] : [];
  }
  const tabOf = r => r === "advisor/docs" ? "advisor/align" : r.replace(/\/vote$/, "/options").replace(/^(me\/\w+)\/plan$/, "$1");
  function appbar() {
    const v = viewer(), who = v === "alex" ? `Alex Lee${avAlex(28)}` : v ? `${P[v].short}${av(P[v], 28)}` : `View as${ic("person", 18)}`;
    const cur = tabOf(route);
    return `<header class="appbar"><div class="in"><a class="brand" href="#/">${mark}Family Table <small>PNC Private Bank</small></a>
      <nav class="tabs" aria-label="Sections">${nav().map(([h, l, , n]) => `<a href="#/${h}" class="${cur === h ? "on" : ""}">${l}${n ? `<span class="count">${n}</span>` : ""}</a>`).join("")}</nav>
      <a class="yr ${route === "year-one" ? "on" : ""}" href="#/year-one">One year on</a>
      <button class="me" data-act="switch" aria-label="Switch person">${who}</button></div></header>`;
  }
  const bnav = () => nav().length && state.tour < 0 ? `<nav class="bnav" aria-label="Sections">${nav().map(([h, l, i, n]) => `<a href="#/${h}" class="${tabOf(route) === h ? "on" : ""}">${ic(i, 22)}${l}${n ? `<span class="count">${n}</span>` : ""}</a>`).join("")}</nav>` : "";
  const nextLink = (href, text) => state.tour >= 0 ? "" : `<a class="next" href="#/${href}"><span>Next</span><b>${text}</b>${chev}</a>`;

  // ---------- onboarding splash ----------
  function splash() {
    const cast = [["MW", "#10214D", "Margaret Wilson", "Founder, selling Wilson Transport"], ["AL", "#EF6A00", "Alex Lee", "Her PNC advisor"],
      ...S.people.filter(p => p.id !== "margaret").map(p => [ini(p), p.color, p.name, p.role.split(",")[0]])];
    return `<section class="onb"><div class="onb-in">
        <header class="onb-top"><span class="brand">${mark}Family Table <small>PNC Private Bank</small></span><button class="onb-link" data-act="switch">Explore on your own</button></header>
        <div class="onb-hero">
          <div class="onb-copy">
            <h1>Plan the sale of a family business, together.</h1>
            <p>Every family member gets a private voice. Their PNC advisor gets the whole picture a year before closing, and nobody's words are shared unless they choose.</p>
            <button class="btn xl" data-act="tour-start">Start the 2-minute demo</button>
            <p class="onb-note">Eight taps, both sides of one sale.</p>
          </div>
          <div class="onb-how"><h2>How it works</h2>
            <ol class="stages">${STAGES.map((s, i) => `<li style="--i:${i}"><span class="st-ic">${ic(s.icon, 18)}</span><span class="st-tx"><b>${s.label}</b><span>${s.line}</span></span></li>`).join("")}</ol></div>
        </div></div></section>
      <section class="onb-end"><div class="in">
        <h2>Where it ends, a year after the sale</h2>
        <div class="ends">
          <div><b data-count="27" data-fmt="m">$27.0M</b><span>placed by a plan the whole family agreed</span></div>
          <div><b>5 of 5</b><span>family members working with PNC, up from 3</span></div>
          <div><b data-count="8.5" data-fmt="m">$8.5M</b><span>reached the two children who banked elsewhere</span></div>
        </div>
        <p class="small muted">Today, only 13% of adult children use their parents' financial advisor (Cerulli, 2019).</p>
      </div></section>
      <section class="onb-cast"><div class="in"><h2>Meet the Wilsons</h2>
        <p class="muted">Margaret is selling the trucking company she built over 35 years for $48.0M. She thinks her children agree on what's fair.</p>
        <div class="cast-row">${cast.map(([i, c, n, r]) => `<div><span class="av" style="background:${c}">${i}</span><span class="tx"><b>${n}</b><span>${r}</span></span></div>`).join("")}</div>
        <p class="micro faint" style="margin-top:22px">All people, firms and figures are fictional. AI steps are simulated; the formulas are real. <a href="?reset#/">Reset the demo</a> or <a href="../">read about the project</a>.</p>
      </div></section>`;
  }

  // ---------- guided story: alternates the two sides ----------
  const TOUR = [
    { side: "Advisor", stage: "Signal", route: "advisor", title: "Alex sees the sale coming",
      hint: "PNC's own account data puts Wilson Transport at 81 out of 100, a year before closing. Tap Call Margaret.", target: '[data-act="start"]', done: () => state.started },
    { side: "Family", stage: "Join", route: "me/margaret", title: "Margaret brings her family in",
      hint: "$27.0M lands at closing. Before anyone splits it, she invites the family to private check-ins.", target: '[data-act="invite"]', done: () => state.invited },
    { side: "Family", stage: "Align", route: "me/claire/checkin", title: "Claire says what she's never said",
      hint: "Her words stay on this screen unless she shares them. Share answer 1 with Alex.", target: '[data-act="toggle-share"][data-id="q1"]', done: () => state.shared.includes("q1") },
    { side: "Advisor", stage: "Align", route: "advisor/align", title: "The AI reads. Alex decides.", noScroll: true,
      hint: "Four private check-ins become one finding: the widest gap is fairness. Approve the brief.", target: '[data-act="approve"]', done: () => state.approved },
    { side: "Family", stage: "Allocate", route: "me/sam/options", title: "Sam sees his number, then votes",
      hint: "Each option shows every child's share. Votes are private, and counts appear only after 3 votes. Cast Sam's vote.", target: '[data-act="vote"]', done: () => !!state.votes.sam },
    { side: "Family", stage: "Activate", route: "me/sam/ask", title: "Sam asks Alex directly",
      hint: "Tap the first question. It goes to Alex, not straight to an AI.", target: '[data-act="send-q"]', done: () => state.msgs.some(m => m.from === "sam") },
    { side: "Advisor", stage: "Activate", route: "advisor/inbox", title: "AI drafts. Alex sends.",
      prep: () => { if (!state.msgs.some(m => m.from === "sam")) state.msgs.push({ id: "sam-demo", from: "sam", qi: 0, at: "Just now" }); },
      hint: "The draft uses calculator numbers and passes the checks. Alex can edit it. Approve and send.", target: '[data-act="send"][data-from="sam"]',
      done: () => state.msgs.some(m => m.from === "sam" && state.replies[m.id] != null) },
    { side: "Both sides", stage: "Continue", route: "year-one", title: "One year on",
      hint: "The sale has closed and the plan runs as everyday banking. That's Family Table.", target: null, done: () => true },
  ];
  function tourBar() {
    if (embedded || state.tour < 0 || route.startsWith("story/") || route === "") return "";
    const t = TOUR[state.tour], last = state.tour === TOUR.length - 1, here = route === t.route, ok = t.done();
    const cls = t.side === "Family" ? "f" : t.side === "Advisor" ? "a" : "b";
    return `<div class="tour" role="region" aria-label="Guided demo">
      <div class="tour-top"><span class="side ${cls}">${t.side}</span><span class="stage">${t.stage}</span>
        <div class="tour-dots" aria-label="Step ${state.tour + 1} of ${TOUR.length}">${TOUR.map((s, i) => `<i class="${i < state.tour ? "past" : i === state.tour ? "cur" : ""}"></i>`).join("")}</div>
        <button class="tour-x" data-act="tour-end" aria-label="End the demo">${ic("x", 16)}</button></div>
      <b>${t.title}</b><p>${here ? (ok && t.target ? "Done. On to the next step." : t.hint) : "Open this step to continue."}</p>
      <div class="tour-actions">${state.tour > 0 ? `<button class="btn ghost sm" data-act="tour-back">Back</button>` : ""}
        ${here ? `<button class="btn sm ${ok ? "" : "quiet"}" data-act="tour-next">${last ? "Finish" : ok ? "Next" : "Skip"}</button>` : `<button class="btn sm" data-act="tour-go">Go to step ${state.tour + 1}</button>`}</div></div>`;
  }
  function tourTarget(scroll) {
    if (state.tour < 0) return;
    const t = TOUR[state.tour]; if (route !== t.route || !t.target || t.done()) return;
    const el = app.querySelector(t.target); if (!el) return;
    el.classList.add("tour-target");
    if (scroll && !t.noScroll) setTimeout(() => el.scrollIntoView({ block: "center", behavior: motionOK ? "smooth" : "auto" }), 450);
  }
  const goStep = i => { state.tour = i; const t = TOUR[i]; if (t.prep) t.prep(); save(); if (location.hash === "#/" + t.route) render(true); else location.hash = "#/" + t.route; };

  // ---------- family: home ----------
  function rowFor(id, pid) {
    const p = P[pid], done = p.status === "checked", mine = votes()[pid], replies = messages().filter(m => m.from === pid && state.replies[m.id] != null).length;
    const R = {
      meeting: ["cal", "", "Family meeting", "Thursday, Nov 12, with a Hawthorn facilitator", `<span class="badge g">Booked</span>`, `me/${pid}/plan`],
      checkin: ["lock", done ? "g" : "o", "Your private check-in", done ? (pid === "claire" ? `Done. ${state.shared.length} of 3 answers shared` : "Done. Your words stay private") : "Takes about 10 minutes", done ? "" : `<span class="badge o">To do</span>`, `me/${pid}/checkin`],
      vote: ["scale", mine ? "g" : "o", "Vote on the split", mine ? `You voted ${OPT[mine].label}. You can change it until Nov 12` : "Three options. Your vote is private", mine ? "" : `<span class="badge o">Open</span>`, `me/${pid}/options`],
      ask: ["chat", "", "Ask Alex", replies ? `${replies} ${replies === 1 ? "reply" : "replies"} from Alex` : "Questions go to your PNC advisor", "", `me/${pid}/ask`],
      nextchapter: ["compass", "p", "Plan your next chapter", "Owners who plan life after a sale regret it less", "", `me/${pid}/plan`],
    }[id];
    return `<a class="row" href="#/${R[5]}"><span class="ic ${R[1]}">${ic(R[0])}</span><span class="tx"><b>${R[2]}</b><span>${R[3]}</span></span>${R[4]}${chev}</a>`;
  }
  const ORDER = {
    margaret: ["meeting", "vote", "nextchapter", "ask"],
    tom: ["checkin", "vote", "meeting", "ask"],
    ben: ["vote", "ask", "meeting", "checkin"],
    claire: ["checkin", "vote", "meeting", "ask"],
    sam: ["vote", "ask", "meeting", "checkin"],
  };
  function heroFor(pid) {
    if (pid === "margaret") return `<div class="label">What you keep at closing</div><div class="value big" data-count="${net()}" data-fmt="m">${money(net())}</div>
      <div class="caption">From NorthPeak's $48.0M offer, after debt, fees and estimated tax. <button class="linkbtn" data-act="breakdown">See the breakdown</button></div>${allocBar()}`;
    if (pid === "tom") return `<div class="label">Set aside for you and Margaret</div><div class="value big" data-count="9" data-fmt="m">${money(9)}</div><div class="caption">Part of the ${money(net())} Margaret keeps at closing, planned for 30 years with a cushion.</div>${allocBar()}`;
    const lo = Math.min(gifts(0)[pid], gifts(1)[pid]), hi = Math.max(gifts(0)[pid], gifts(1)[pid]);
    return `<div class="label">Your share at closing</div><div class="value big">${range(lo, hi)}</div>
      <div class="caption">${pid === "ben" ? "In cash, plus your $1.5M of NorthPeak equity. " : ""}It depends on the split the family chooses. Closing is expected next fall.</div>`;
  }
  function invitePanel() {
    if (!state.invited) return `<section class="panel invite"><span class="ic p">${ic("users")}</span><div><b>Bring your family in</b><p>Tom, Ben, Claire and Sam each get a private check-in. You'll see who has answered, never what they said.</p>
      <button class="btn" data-act="invite">Invite the family</button></div></section>`;
    return `<section class="panel invite on"><div><b>Your family is taking part</b><p>${checkedIn()} of ${S.people.length} have checked in. Their answers stay private, even from you.</p>${voices()}</div></section>`;
  }
  function memberHome(pid) {
    const p = P[pid];
    return `<div class="page"><div class="cols"><div class="col-main">
        <section class="hero"><div class="hello">Hi, ${p.short}</div>${heroFor(pid)}${trip()}</section>
        ${pid === "margaret" ? `<section class="section desk-only"><div class="section-head"><h2>From offer to closing</h2></div>${waterfall()}</section>` : ""}
        ${KIDS.includes(pid) ? `<section class="section"><div class="section-head"><h2>Your number under each option</h2></div>
          <div class="tri">${S.options.map(o => `<a class="tri-c" href="#/me/${pid}/options"><span>${o.label}</span><b>${money(gifts(o.w)[pid])}</b></a>`).join("")}</div></section>` : ""}
      </div><aside class="col-side">
        ${pid === "margaret" ? invitePanel() : ""}
        <section class="section"><div class="section-head"><h2>Up next</h2><button class="aside" data-act="why">${ic("sort", 15)} Why this order</button></div>
          <div class="rows">${ORDER[pid].map(id => rowFor(id, pid)).join("")}</div></section>
      </aside></div></div>`;
  }

  // ---------- family: check-in ----------
  const RULES = [
    { re: /(equal|fair|same share|split)/i, tag: "Fairness" },
    { re: /(salar|stock|equity|years in)/i, tag: "Buyer equity" },
    { re: /(never said|haven'?t said|never brought|don'?t want to fight|assumes)/i, tag: "Unspoken concern", flag: true },
    { re: /(lost without|nothing to do|purpose|retire|something that'?s hers|worked every day)/i, tag: "Margaret's next chapter" },
    { re: /(cash|when .{0,10}get|paid)/i, tag: "Cash timing" },
    { re: /(role|run things|in charge|take over)/i, tag: "Role after the sale" },
  ];
  const tagsFor = txt => RULES.filter(r => r.re.test(txt));
  const themesHtml = txt => { const t = tagsFor(txt); return `<span class="lab">AI themes</span>` + (t.length ? t.map(r => `<span class="theme ${r.flag ? "flag" : ""}">${r.tag}</span>`).join("") : `<span class="faint">None yet</span>`); };
  function checkin(pid) {
    const p = P[pid];
    const head = `<section class="hero"><div class="label lock">${ic("lock", 16)} Private to you</div><h1 class="title">Your check-in</h1>
      <div class="caption">${pid === "margaret" ? "Your family never sees your answers." : "Your family, Margaret included, never sees your answers."} Alex sees themes from the whole family, and your words only if you share them.</div></section>`;
    if (pid !== "claire") {
      const word = v => ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"][v + 2];
      const mine = S.themes.filter(th => th.s[pid] !== undefined);
      return `<div class="page narrow">${head}
        <section class="section"><div class="section-head"><h2>${p.status === "checked" ? "Your answers, as themes" : "Start your check-in"}</h2><span class="aside">${p.status === "checked" ? "Submitted Oct 22" : "About 10 minutes"}</span></div>
        ${p.status === "checked" ? `<div class="rows">${mine.map(th => `<div class="row"><span class="tx"><b>${th.label}</b><span>${word(th.s[pid])}</span></span></div>`).join("")}</div><p class="micro faint" style="margin-top:8px">The AI picked these themes out of your words. If one looks wrong, tell Alex and it will be corrected before the meeting.</p>`
          : `<div class="q"><h3>What matters most to you as Margaret sells the company?</h3><textarea data-live="intro" aria-label="Your answer" placeholder="Write it the way you'd say it."></textarea><div class="themes" data-tags="intro">${themesHtml("")}</div></div>`}</section></div>`;
    }
    const qs = S.checkin.claire.map((q, i) => {
      const on = state.shared.includes(q.id), txt = state.answers[q.id] ?? q.a;
      return `<div class="q" data-q="${q.id}"><h3>${q.q}</h3>
        <textarea data-live="${q.id}" aria-label="${q.q}">${esc(txt)}</textarea>
        <div class="themes" data-tags="${q.id}">${themesHtml(txt)}</div>
        <div class="switch-row"><span class="tx"><b>Share with Alex</b><span>${on ? "Alex can read these words. Your family can't." : state.optOut ? "Private. Not used anywhere." : "Private. Only its themes count, without your name."}</span></span>
          <button class="switch" role="switch" aria-checked="${on}" aria-label="Share answer ${i + 1} with Alex" data-act="toggle-share" data-id="${q.id}"></button></div></div>`;
    }).join("");
    const summary = `<div class="switch-row card-row"><span class="tx"><b>Count my themes in the family summary</b><span>Alex sees how far apart the family is, never who said what, and only when ${MIN_GROUP} or more take part.</span></span>
        <button class="switch" role="switch" aria-checked="${!state.optOut}" aria-label="Include my themes in the family summary" data-act="toggle-summary"></button></div>`;
    return `<div class="page"><div class="cols"><div class="col-main">${head}${summary}<section class="section">${qs}</section></div>
      <aside class="col-side"><div class="panel"><div class="section-head"><h2>What Alex sees</h2></div>
        ${S.checkin.claire.map((q, i) => state.shared.includes(q.id) ? `<div class="quote"><small>${ic("chat", 14)} Answer ${i + 1}, shared</small>“${esc(state.answers[q.id] ?? q.a)}”</div>` : `<div class="sealed">${ic("lock", 16)}<span>Answer ${i + 1} is private</span></div>`).join("")}
        <p class="micro faint" style="margin-top:10px">${state.optOut ? "Your themes are not in the family summary." : "Your themes count toward the family summary, without your name."}</p>
      </div></aside></div></div>`;
  }

  // ---------- family: vote ----------
  function options(pid) {
    const kid = KIDS.includes(pid), o = OPT[state.pick], g = gifts(o.w), mine = votes()[pid];
    const hero = kid
      ? `<div class="label">Your share with <span data-pickname>${o.label}</span></div><div class="value big" data-count="${g[pid]}" data-fmt="m" data-key="mine-${pid}">${money(g[pid])}</div>
         <div class="caption">${pid === "ben" ? "In cash, plus your $1.5M of NorthPeak equity." : "Paid at closing, expected next fall."}</div>`
      : `<div class="label">The family gift</div><div class="value big" data-count="12" data-fmt="m">${money(12)}</div><div class="caption">Split three ways. Ben also keeps $1.5M of NorthPeak equity, and that's what the options disagree on.</div>`;
    const cards = S.options.map(x => `<button class="opt ${x.id === state.pick ? "on" : ""}" data-act="pick" data-id="${x.id}" aria-pressed="${x.id === state.pick}">
        <span class="opt-head"><b>${x.label}</b>${mine === x.id ? `<span class="badge g">Your vote</span>` : ""}</span><span class="opt-line">${x.line}</span>${optBars(x, pid)}</button>`).join("");
    const cta = mine === state.pick
      ? `<button class="btn done block" disabled>${ic("check", 18, 2.4)} You voted ${o.label}</button><p class="micro faint center">You can change your vote until the Nov 12 meeting.</p>`
      : `<button class="btn block" data-act="vote">${mine ? `Change my vote to ${o.label}` : `Vote ${o.label}`}</button>`;
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero">${hero}</section>
      <section class="section"><div class="section-head"><h2>Three ways to split $12.0M</h2></div><div class="opts">${cards}</div>
        <div class="vote-cta">${cta}<p class="privacy">${ic("lock", 15)} Your vote is private. Nobody sees how you voted, Alex included.</p></div></section>
      </div><aside class="col-side">${tallyPanel(false)}</aside></div></div>`;
  }

  // ---------- family: ask Alex ----------
  function miniCard(kind, v) {
    const flat = (icn, b, s) => `<span class="mini"><span class="ic">${ic(icn, 18)}</span><span class="tx"><b>${b}</b><span>${s}</span></span></span>`;
    switch (kind) {
      case "proceeds": return flat("bank", `${money(net())} at closing`, "The $8.0M earnout is excluded");
      case "mine": return flat("scale", `${range(gifts(0)[v] ?? 4, gifts(1)[v] ?? 4.5)} at closing`, v === "ben" ? "Cash, plus $1.5M of buyer equity" : "Equal split to equity counted");
      case "split": return flat("scale", "Three options for Nov 12", "Equal, Balanced, Equity counted");
      case "role": return flat("brief", "Two-year COO contract", "$1.5M equity in NorthPeak");
      case "meeting": return flat("cal", "Thursday, Nov 12", "With a Hawthorn facilitator");
      case "contingency": return flat("shield", "Contingency plan, signed Oct 20", "Ben runs operations for 90 days; the family decides within 30");
      case "privacy": return flat("lock", "Your words stay yours", `${state.shared.length} of 3 answers shared; withdraw any time`);
    }
    return "";
  }
  function askAlex(pid) {
    const mine = messages().filter(m => m.from === pid), asked = new Set(mine.filter(m => m.qi != null).map(m => m.qi));
    const sugg = (S.ask[pid] || []).map((q, i) => [q, i]).filter(([, i]) => !asked.has(i));
    const thread = mine.length ? mine.map(m => {
      const reply = state.replies[m.id], item = m.qi != null ? S.ask[m.from][m.qi] : null;
      return `<div class="msg mine"><p>${esc(qText(m))}</p><small>You, ${m.at.toLowerCase()}</small></div>` + (reply != null
        ? `<div class="msg alex">${avAlex(32)}<div class="bub"><p>${esc(reply)}</p>${item ? miniCard(item.card, pid) : ""}<small>${ic("check", 13, 2.4)} Reviewed and sent by Alex</small>
            <div class="switch-row"><span class="tx"><b>Share with the family</b><span>${state.shareReply[m.id] ? "Your family can read this answer." : "Only you can see this answer."}</span></span><button class="switch" role="switch" aria-checked="${!!state.shareReply[m.id]}" aria-label="Share this answer with the family" data-act="share-reply" data-id="${m.id}"></button></div></div></div>`
        : `<div class="msg-status"><span class="pulse-dot"></span>With Alex for review. Replies usually come within a day.</div>`);
    }).join("") : `<p class="muted small empty">No questions yet. Ask anything about the sale or the plan.</p>`;
    const shared = messages().filter(m => m.from !== pid && state.shareReply[m.id] && state.replies[m.id] != null);
    const call = state.calls[pid]
      ? `<div class="row"><span class="ic ${state.confirmed[pid] ? "g" : "o"}">${ic("phone", 18)}</span><span class="tx"><b>Call with Alex, ${state.calls[pid]}</b><span>${state.confirmed[pid] ? "Confirmed. Alex will call you." : "Requested. Waiting for Alex to confirm."}</span></span></div>`
      : ui.callOpen ? `<div class="slots">${S.slots.map((s, i) => `<button class="slot" data-act="call" data-id="${i}">${s}</button>`).join("")}</div>`
      : `<button class="btn ghost" data-act="call-open">${ic("phone", 18)} Book a call with Alex</button>`;
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero ask-hero">${avAlex(56)}<div><h1 class="title">Ask Alex</h1><div class="caption">Alex Lee is your family's PNC advisor. AI helps Alex draft each reply, and Alex checks it before it reaches you.</div></div></section>
      <section class="thread">${thread}</section>
      <section class="compose">${sugg.length ? `<div class="chips">${sugg.map(([q, i]) => `<button class="chip" data-act="send-q" data-id="${i}">${q.q}</button>`).join("")}</div>` : ""}
        <div class="compose-row"><textarea data-compose aria-label="Your question for Alex" placeholder="Or write your own question"></textarea><button class="btn send" data-act="send-free" aria-label="Send to Alex">${ic("send", 18)}</button></div></section>
      </div><aside class="col-side">
        <section class="panel"><div class="section-head"><h2>Rather talk it through?</h2></div><div style="margin-top:8px">${call}</div></section>
        ${shared.length ? `<section class="panel"><div class="section-head"><h2>Shared with the family</h2></div>${shared.map(m => `<div class="quote"><small>${P[m.from].short} asked: ${esc(qText(m))}</small>${esc(state.replies[m.id])}</div>`).join("")}</section>` : ""}
      </aside></div></div>`;
  }

  // ---------- family: plan ----------
  const STEPS = { margaret: "Start your next-chapter plan before the letter of intent", tom: "Finish your check-in, then an estate review with Alex", ben: "Review your COO contract with business banking", claire: "Get ready for the Nov 12 family meeting", sam: "Choose where your gift should be paid" };
  const STEPS_OTHERS = { margaret: "Start her next-chapter plan with Alex", tom: "Check in, then an estate review with Alex", ben: "Review his COO contract with business banking", claire: "Get ready for the Nov 12 family meeting", sam: "Choose where his gift is paid" };
  const CHAPTER = [["advise", "Stay on as an adviser to the buyer for a year", "Advising NorthPeak for a year"], ["foundation", "Start the Wilson family foundation", "Started the Wilson family foundation"], ["mentor", "Mentor first-time founders in Pittsburgh", "Mentoring first-time founders in Pittsburgh"], ["time", "Take six months with no plan at all", "Took six months with no plan at all"]];
  function famPlan(pid) {
    const agreed = state.agreed[pid];
    const chapter = pid !== "margaret" ? "" : `<section class="section"><div class="section-head"><h2>Your next chapter</h2><span class="aside">Pick any to talk through with Alex</span></div>
      <div class="rows">${CHAPTER.map(([id, t]) => { const on = state.chapter.includes(id); return `<button class="row pick ${on ? "on" : ""}" data-act="chapter" data-id="${id}" aria-pressed="${on}"><span class="ic ${on ? "g" : ""}">${ic(on ? "check" : "compass", 18, on ? 2.4 : 1.8)}</span><span class="tx"><b>${t}</b></span></button>`; }).join("")}</div></section>`;
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero"><div class="label">Your next step</div><h1 class="title">${STEPS[pid]}</h1>
        <div style="margin-top:18px">${agreed ? `<button class="btn done block" disabled>${ic("check", 18, 2.4)} You agreed to the plan in principle</button>` : `<button class="btn block" data-act="agree" data-id="${pid}">Agree to the plan in principle</button>`}</div></section>
      ${chapter}
      <section class="section"><div class="section-head"><h2>Everyone's next step</h2></div><div class="rows">${S.people.filter(x => x.id !== pid).map(x => `<div class="row">${av(x, 36)}<span class="tx"><b>${x.short}</b><span>${STEPS_OTHERS[x.id]}</span></span>${state.agreed[x.id] ? `<span class="badge g">Agreed</span>` : ""}</div>`).join("")}</div></section>
      </div><aside class="col-side"><div class="panel"><div class="section-head"><h2>${pid === "margaret" ? "If you can't continue" : "If Margaret can't continue"}</h2><span class="badge g">Signed</span></div><p class="small muted" style="margin-top:6px">${S.contingency}</p></div>
        <div class="panel"><div class="section-head"><h2>Where the sale is</h2></div>${trip()}</div></aside></div></div>`;
  }

  // ---------- advisor: signal ----------
  function advSignal() {
    const s = S.signal;
    return `<div class="page"><div class="cols"><div class="col-main">
        <section class="hero"><div class="label">Wilson Transport, sale likelihood</div>
          <div class="value huge"><span data-count="${s.score}" data-fmt="i">${s.score}</span><span class="unit">/ 100</span></div>
          <div class="delta up">▲ ${s.change} this month</div><div class="caption">A likely sale in ${s.horizon}, read from activity in the company's PNC accounts.</div>
          <div class="chart">${lineChart(s.history)}<div class="chart-x"><span>Nov</span><span>Feb</span><span>May</span><span>Aug</span><span>Oct</span></div></div></section>
        <section class="section"><div class="section-head"><h2>Why it moved</h2><span class="aside">Share of the score</span></div>
          <div class="rows">${s.reasons.map(r => `<div class="row reason"><span class="tx"><b>${r.text}</b></span><span class="bar weight"><i style="width:${r.weight / 0.36 * 100}%;background:var(--orange)"></i></span><span class="rt">${Math.round(r.weight * 100)}%</span></div>`).join("")}</div>
          <div class="cta-row">${state.started ? `<button class="btn done" disabled>${ic("check", 18, 2.4)} Called Margaret on Oct 15</button>` : `<button class="btn" data-act="start">${ic("phone", 18)} Call Margaret</button>`}</div></section>
      </div><aside class="col-side">
        <section class="panel stake"><div class="label">At stake for PNC</div><div class="value">${range(heirSum(0), heirSum(1))}</div>
          <p class="small muted">heading to Claire and Sam at closing. Neither banks with PNC, and only 13% of adult children use their parents' advisor (Cerulli, 2019).</p></section>
        <section class="panel"><div class="section-head"><h2>The Wilson family</h2><span class="aside">Status, not answers</span></div><div class="table-viz">${familyTable(240)}</div></section>
        ${state.started ? nextLink("me/margaret", "Margaret invites her family") : ""}
      </aside></div></div>`;
  }

  // ---------- advisor: AI at work ----------
  function advAI() {
    const n = contributors();
    if (n < MIN_GROUP) return `<div class="page"><section class="hero"><div class="label">Wilson family summary</div><div class="value">Not enough answers</div><div class="caption">The family summary appears when at least ${MIN_GROUP} members contribute.</div></section></div>`;
    const ths = summaryThemes().map(th => ({ th, g: gap(th) })).sort((a, b) => b.g - a.g), top = ths[0], low = ths[ths.length - 1];
    const will = S.docs.find(d => d.id === "will"), routed = state.routed.will;
    const step = (k, title, body, cls = "", icon = "check") => `<li class="tr-step ${cls}" data-k="${k}"><span class="tr-ic"><span class="tr-n">${k + 1}</span>${ic(icon, 16, 2.6)}<span class="spin"></span></span><div class="tr-body"><b>${title}</b>${body}</div></li>`;
    const steps = [
      step(0, `Read ${n} private check-ins`, `<p>Turned each person's words into a stance on ${S.themes.length} themes. The words stay in each person's own vault.</p>
        <div class="chips static">${S.themes.map(t => `<span class="chip">${t.short}</span>`).join("")}</div>`),
      step(1, "Scored the gaps with a fixed formula", `<p class="formula">gap = (highest − lowest) ÷ 4</p>${gapBars(ths)}`),
      step(2, "Compared it with Margaret's plan", `<p>Margaret plans an equal split. Her family is furthest apart on exactly that question.</p>`),
      step(3, `Read ${S.docs.length} family documents`, `<div class="docrow"><span class="file">PDF</span><span class="tx"><b>${will.name}</b><span>${will.finding} It doesn't say whether Ben's buyer equity counts.</span></span><span class="badge r">High risk</span></div>
        <div class="docbtn">${routed ? `<button class="btn done sm" disabled>${ic("check", 16, 2.4)} ${will.done}</button>` : `<button class="btn ghost sm" data-act="route" data-id="will">${will.action}</button>`}</div>
        <p class="micro faint">Also flagged: the key-person policy ends at closing; the buy-sell agreement values the company at 4×.</p>`),
      step(4, "Drafted the brief for Nov 12", `<ol class="agenda"><li><b>Open with common ground.</b> Everyone says Margaret's next chapter isn't planned (gap ${low.g.toFixed(2)}).</li>
        <li><b>Then fairness (gap ${top.g.toFixed(2)}).</b> Show all three options as a range, not as people.</li><li><b>Close with the will.</b> Share counsel's summary, not a conclusion.</li></ol>
        <p class="note">${ic("users", 16)} A gap of 0.75 or more calls for a facilitator. Hawthorn IFS is booked.</p>`),
      step(5, state.approved ? "Approved by Alex" : "Alex reviews and approves", state.approved
        ? `<p>The brief goes to the facilitator. The family sees the agenda, never the inputs.</p><button class="linkbtn" data-act="unapprove">Reopen the draft</button>`
        : `<p>Nothing reaches the family or the facilitator until Alex approves.</p><button class="btn navy" data-act="approve">${ic("check", 18, 2.4)} Approve the brief</button>`, "human", state.approved ? "check" : "person"),
    ].join("");
    return `<div class="page"><div class="cols ai"><div class="col-side sticky">
        <section class="hero"><div class="label">The family's widest gap</div><div class="value huge orange" data-count="${top.g}" data-fmt="g">${top.g.toFixed(2)}</div>
          <div class="gap-name">${top.th.label}</div>
          <p class="caption" data-gapsummary>Gap ${top.g.toFixed(2)} from ${n} people, on a scale of 0 to 1. No names.</p>
          <blockquote class="said"><small>Margaret told Alex</small>“${S.ownerPlan.says}”<span>Her plan: ${S.ownerPlan.split.toLowerCase()}.</span></blockquote></section>
        <section class="panel"><div class="section-head"><h2>Claire's words</h2><span class="aside">${state.shared.length} of 3 shared</span></div>
          ${S.checkin.claire.map((q, i) => state.shared.includes(q.id) ? `<div class="quote"><small>${q.q}</small>“${esc(state.answers[q.id] ?? q.a)}”</div>` : `<div class="sealed">${ic("lock", 16)}<span>Answer ${i + 1} is private</span></div>`).join("")}</section>
      </div><div class="col-main">
        <section class="section trace-wrap"><div class="section-head"><h2>How the AI got there</h2><span class="aside">Simulated AI, real formulas</span></div>
          <ol class="trace">${steps}</ol></section>
      </div></div></div>`;
  }
  let traceTimers = [];
  function playTrace() {
    traceTimers.forEach(clearTimeout); traceTimers = [];
    const box = app.querySelector(".trace"); if (!box || !motionOK || state.approved) return;
    const steps = [...box.querySelectorAll(".tr-step")], gapT = 760;
    box.classList.add("playing");
    steps.forEach((el, k) => {
      traceTimers.push(setTimeout(() => { el.classList.add("run");
        if (state.tour >= 0) { const r = el.getBoundingClientRect(); if (r.bottom > innerHeight - 220) el.scrollIntoView({ block: "center", behavior: "smooth" }); } }, 250 + k * gapT));
      traceTimers.push(setTimeout(() => { el.classList.remove("run"); el.classList.add("on"); }, 250 + k * gapT + 520));
    });
    traceTimers.push(setTimeout(() => box.classList.remove("playing"), 250 + steps.length * gapT + 300));
  }

  // ---------- advisor: inbox ----------
  function advInbox() {
    const w = waiting(), reqs = callReqs(), sent = messages().filter(m => state.replies[m.id] != null);
    const card = m => { const p = P[m.from], item = m.qi != null ? S.ask[m.from][m.qi] : null;
      return `<article class="inmsg" data-msg="${m.id}"><header>${av(p, 36)}<span class="tx"><b>${p.name}</b><span>Asked ${m.at.toLowerCase()}</span></span></header>
        <p class="asked">“${esc(qText(m))}”</p>
        <div class="draft"><div class="draft-head">AI draft</div>
          ${item ? `<ul class="tools">${item.tools.map(t => `<li>${ic("check", 14, 2.6)}${t}</li>`).join("")}</ul>` : `<p class="warn-line">${ic("alert", 15)} Not in the plan or the calculator. Alex writes this one.</p>`}
          <textarea data-draft="${m.id}" aria-label="Reply to ${p.short}">${esc(draftFor(m))}</textarea>
          <div class="checks"><span>${ic("check", 14, 2.4)}Figures from PNC's calculator</span><span>${ic("check", 14, 2.4)}No private answers used</span><span>${ic("check", 14, 2.4)}Not legal or tax advice</span></div></div>
        <div class="inmsg-actions"><button class="btn navy" data-act="send" data-id="${m.id}" data-from="${m.from}">${ic("send", 17)} Approve and send</button></div></article>`; };
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero"><div class="label">Waiting for you</div><div class="value huge">${w.length + reqs.length}</div>
        <div class="caption">AI drafts each reply from the plan and the calculator. Nothing reaches the family until you send it.</div></section>
      <section class="section">${w.length ? w.map(card).join("") : `<div class="empty-state">${ic("check", 22, 2.4)}<b>All replies sent</b><span>New questions from the family land here.</span></div>`}</section>
      </div><aside class="col-side">
        ${reqs.length ? `<section class="panel"><div class="section-head"><h2>Call requests</h2></div><div class="rows">${reqs.map(id => `<div class="row">${av(P[id], 36)}<span class="tx"><b>${P[id].short}</b><span>${state.calls[id]}</span></span><button class="btn sm navy" data-act="confirm-call" data-id="${id}">Confirm</button></div>`).join("")}</div></section>` : ""}
        <section class="panel"><div class="section-head"><h2>Sent</h2><span class="aside">${sent.length}</span></div>${sent.length ? `<div class="rows">${sent.map(m => `<div class="row">${av(P[m.from], 32)}<span class="tx"><b>${P[m.from].short}</b><span>${esc(qText(m))}</span></span><span class="badge g">Sent</span></div>`).join("")}</div>` : `<p class="small muted" style="margin-top:6px">Nothing sent yet.</p>`}</section>
      </aside></div></div>`;
  }

  // ---------- advisor: plan ----------
  function advPlan() {
    const log = [...S.ledger,
      ...(state.approved ? [{ t: "Today", who: "Alex Lee", what: "Approved the brief for Nov 12." }] : []),
      ...messages().filter(m => state.replies[m.id] != null).map(m => ({ t: "Today", who: "Alex Lee", what: `Replied to ${P[m.from].short}, AI draft reviewed.` })),
      ...Object.keys(state.agreed).map(id => ({ t: "Today", who: P[id].name, what: "Agreed to the plan in principle." }))];
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero"><div class="label">Heading to heirs who bank elsewhere</div><div class="value huge">${range(heirSum(0), heirSum(1))}</div><div class="caption">${heirs().map(h => h.short).join(" and ")} could receive this at closing. Neither banks with PNC today.</div></section>
      <section class="section"><div class="section-head"><h2>Introduce PNC</h2><span class="aside">With Margaret's agreement</span></div><div class="rows">${heirs().map(h => `<div class="row">${av(h)}<span class="tx"><b>${h.name}</b><span>${range(gifts(0)[h.id], gifts(1)[h.id])} at closing</span></span>${state.intro[h.id] ? `<span class="badge g">Intro requested</span>` : `<button class="btn ghost sm" data-act="intro" data-id="${h.id}">Introduce</button>`}</div>`).join("")}</div></section>
      <section class="section"><div class="section-head"><h2>Specialists</h2><span class="aside">${S.tasks.length} teams, one plan</span></div><div class="rows">${S.tasks.map(t => `<div class="row"><span class="tx"><b>${t.what}</b><span>${t.who}, due ${t.due}</span></span><span class="badge ${t.status === "Booked" ? "g" : t.status.startsWith("Waiting") ? "p" : "n"}">${t.status}</span></div>`).join("")}</div></section>
      </div><aside class="col-side">${tallyPanel(true)}
        <div class="panel"><div class="section-head"><h2>Decision log</h2></div><div class="rows">${log.map(l => `<div class="row"><span class="tx"><b>${l.who}</b><span>${l.what}</span></span><span class="rt micro faint">${l.t}</span></div>`).join("")}</div></div>
        ${nextLink("year-one", "One year on")}
      </aside></div></div>`;
  }

  // ---------- one year on ----------
  function yearOne() {
    const Y = S.yearOne, ch = OPT[Y.chosen], g = gifts(ch.w), placed = heirSum(ch.w), fee = net() * Y.feeRate * 1000;
    const picks = state.chapter.length ? CHAPTER.filter(([id]) => state.chapter.includes(id)).map(([, , done]) => done) : ["Started the Wilson family foundation"];
    const fam = [
      [P.margaret, "Margaret's next chapter", picks[0] + (picks.length > 1 ? `, and ${picks.length - 1} more` : "")],
      [P.ben, "Ben", "COO at NorthPeak, year one of two, with $1.5M of its equity"],
      [P.claire, "Claire and Sam", `${money(g.claire)} each, in PNC accounts they chose to open`],
      [P.tom, "Tom", "His estate review with Alex is done"],
    ];
    const pnc = [
      ["repeat", "One yearly check-in", "The family meets every November. The plan and the decision log stay current."],
      ["users", `${Y.pncAfter} of 5 relationships`, `Up from ${Y.pncBefore}. Alex knows the next generation before the next transfer.`],
      ["bank", `About $${Math.round(fee)}K a year`, "In fees on the $27.0M, at an illustrative 0.8% blended rate."],
    ];
    return `<section class="y1"><div class="in">
        <div class="label">${Y.when}</div><h1>One year on, the plan is everyday banking.</h1>
        <p>The sale to NorthPeak has closed. The family chose the ${ch.label} split together, and nobody was surprised.</p>
        <div class="ends">
          <div><b data-count="${net()}" data-fmt="m">${money(net())}</b><span>placed by the plan at closing</span></div>
          <div><b>${Y.pncAfter} of 5</b><span>family members work with PNC, up from ${Y.pncBefore}</span></div>
          <div><b data-count="${placed}" data-fmt="m">${money(placed)}</b><span>reached Claire and Sam, who banked elsewhere a year ago</span></div>
        </div></div></section>
      <div class="page"><div class="cols"><div class="col-main">
        <section class="section"><div class="section-head"><h2>Where the ${money(net())} went</h2></div>${allocBar()}
          <div class="split-out"><div class="small muted">The ${money(12)} gift, ${ch.label} split</div>${optBars(ch, null)}</div></section>
        <section class="section"><div class="section-head"><h2>For the family</h2></div><div class="rows">${fam.map(([p, t, s]) => `<div class="row">${av(p, 36)}<span class="tx"><b>${t}</b><span>${s}</span></span></div>`).join("")}</div></section>
      </div><aside class="col-side">
        <section class="panel"><div class="section-head"><h2>For PNC</h2></div><div class="rows">${pnc.map(([i, t, s]) => `<div class="row"><span class="ic o">${ic(i)}</span><span class="tx"><b>${t}</b><span>${s}</span></span></div>`).join("")}</div></section>
        <section class="panel"><div class="section-head"><h2>How they got here</h2></div><ol class="recap">${Y.events.map(e => `<li><span class="rc-ic">${ic("check", 14, 2.6)}</span><span class="tx"><b>${e.stage}</b><span>${e.what}</span></span></li>`).join("")}</ol></section>
      </aside></div>
      <div class="y1-actions">${state.tour >= 0 ? "" : `<button class="btn" data-act="tour-start">Replay the demo</button>`}<a class="btn ghost" href="#/">Back to the start</a></div>
      <p class="micro faint center" style="margin-top:14px">A fictional outcome, derived from the demo's figures.</p></div>`;
  }

  // ---------- story cards (video only) ----------
  function story(id) {
    const eyebrow = `<div class="eyebrow">${mark} Family Table, a PNC Private Bank concept</div>`;
    const tile = (bg, i, n, s) => `<div><span class="av" style="background:${bg}">${i}</span><span><b>${n}</b><small>${s}</small></span></div>`;
    const cards = {
      hook: `${eyebrow}<h1>Margaret is selling the company she built. Her family has never talked about what's fair.</h1><p class="sub">Most families don't, until the money arrives. By then, the advisor is the last to know.</p>`,
      cast: `${eyebrow}<h1>One sale, seen from both sides.</h1><div class="cast">${tile("#EF6A00", "MW", "Margaret Wilson", "Founder, Wilson Transport")}${tile("#fff;color:#10214D", "AL", "Alex Lee, PNC", "Private Business Strategist")}${S.people.filter(p => p.id !== "margaret").map(p => tile(p.color, ini(p), p.name, p.role.split(",")[0])).join("")}</div>`,
      problem: `${eyebrow}<h1>The sale is when families split and money leaves the bank.</h1><div class="stats">
        <div class="stat"><b>13%</b><p>of adult children use their parents' financial advisor.</p><small>Cerulli Associates, 2019</small></div>
        <div class="stat"><b>75%</b><p>of owners “profoundly regretted” selling a year later.</p><small>PNC, Begin at the end</small></div>
        <div class="stat"><b>1 in 2</b><p>business exits are involuntary: death, illness, divorce or dispute.</p><small>PNC Business Succession Planning series</small></div></div>`,
      sauce: `${eyebrow}<h1>Why only PNC can build this</h1><div class="stats pillars">
        <div class="stat"><span class="pi">${ic("flag", 26)}</span><b>A signal PNC already holds</b><p>Business-account activity can flag a sale a year before closing.</p></div>
        <div class="stat"><span class="pi">${ic("lock", 26)}</span><b>Private by default</b><p>Each person answers alone. The advisor sees the gaps, not the words.</p></div>
        <div class="stat"><span class="pi">${ic("users", 26)}</span><b>One household graph</b><p>Heirs meet PNC before the money moves.</p></div></div>`,
      close: `${eyebrow}<h1>A plan the family trusts. An advisor who hears everyone. Proceeds that stay.</h1><p class="sub" style="font-size:20px">Alen Ilmi, Rizaldy Utomo, Nindy Aditya Dewi and Aditya Mulya Pratama, Carnegie Mellon University</p>`,
    };
    return `<section class="storycard"><div class="inner">${cards[id] || cards.hook}</div></section>`;
  }

  // ---------- sheets ----------
  function renderSheet() {
    if (!sheet.kind) { sheetRoot.innerHTML = ""; return; }
    const shell = (title, body) => `<div class="scrim" data-act="close"></div><div class="sheet" role="dialog" aria-label="${title}"><div class="grab"></div>
      <header><h2>${title}</h2><button class="x" data-act="close" aria-label="Close">${ic("x", 18)}</button></header><div class="body">${body}</div></div>`;
    if (sheet.kind === "switch") {
      sheetRoot.innerHTML = shell("View as", `<div class="rows">
        <a class="row" href="#/advisor" data-act="close">${avAlex(40)}<span class="tx"><b>Alex Lee</b><span>PNC advisor, the advisor side</span></span>${chev}</a>
        ${S.people.map(p => `<a class="row" href="#/me/${p.id}" data-act="close">${av(p)}<span class="tx"><b>${p.name}</b><span>${p.role}</span></span>${chev}</a>`).join("")}
        <a class="row" href="#/year-one" data-act="close"><span class="ic o">${ic("repeat")}</span><span class="tx"><b>One year on</b><span>Where the plan ends up</span></span>${chev}</a></div>`);
      return;
    }
    if (sheet.kind === "breakdown") { sheetRoot.innerHTML = shell("From offer to closing", `${waterfall()}<p class="micro faint" style="margin-top:12px">From PNC's proceeds calculator. A PNC tax specialist confirms real figures.</p>`); return; }
    if (sheet.kind === "why") {
      const v = viewer(), p = P[v];
      const top = S.themes.filter(th => th.s[v] !== undefined).sort((a, b) => Math.abs(b.s[v]) - Math.abs(a.s[v])).slice(0, 2).map(th => th.short);
      sheetRoot.innerHTML = shell(`Sorted for ${p.short}`, `<p class="muted">Up next follows three simple rules. A learned ranking would replace them only if it tests better with families.</p>
        <div class="rows" style="margin-top:8px">
          <div class="row"><span class="ic">${ic("users")}</span><span class="tx"><b>Role in the family</b><span>${p.role}</span></span></div>
          <div class="row"><span class="ic p">${ic("chat")}</span><span class="tx"><b>What ${p.short} raised in the check-in</b><span>${top.length ? top.join(", ") : "No check-in yet"}</span></span></div>
          <div class="row"><span class="ic o">${ic("flag")}</span><span class="tx"><b>Where the sale is</b><span>Offer in hand, terms in negotiation</span></span></div></div>
        <p class="micro faint" style="margin-top:10px">Private answers only order ${p.short}'s own screen. Nobody else ever sees them.</p>`);
    }
  }

  // ---------- router ----------
  const motionOK = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  let animTimer = 0;
  const lastVals = {};
  const fmtNum = (v, f) => f === "m" ? money(Math.round(v * 100) / 100) : f === "g" ? v.toFixed(2) : String(Math.round(v));
  function tween(el, from, to, f, dur = 800) {
    if (!motionOK || from === to) { el.textContent = fmtNum(to, f); return; }
    const t0 = performance.now(); el._to = to;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = k < 1 ? fmtNum(from + (to - from) * e, f) : fmtNum(to, f); if (k < 1 && el._to === to) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  // Entrance choreography on arrival only; in-page changes only tween the numbers that changed.
  function enter() {
    app.querySelectorAll(".rows, .stages, .ends, .voices, .col-side, .opts, .cast-row, .gaps, .recap, .tally, .chips").forEach(c => [...c.children].forEach((el, i) => el.style.setProperty("--i", i)));
    app.classList.add("anim"); clearTimeout(animTimer); animTimer = setTimeout(() => app.classList.remove("anim"), 2200);
  }
  function numbers(arrive) {
    app.querySelectorAll("[data-count]").forEach(el => {
      const to = +el.dataset.count, key = el.dataset.key;
      if (arrive && motionOK) tween(el, 0, to, el.dataset.fmt, 900);
      else if (key && lastVals[key] != null && lastVals[key] !== to) tween(el, lastVals[key], to, el.dataset.fmt, 420);
      if (key) lastVals[key] = to;
    });
  }
  function render(arrive) {
    route = location.hash.replace(/^#\/?/, "");
    const v = viewer(), sub = route.split("/")[2];
    let html, bare = false;
    if (route.startsWith("story/")) { html = story(route.split("/")[1]); bare = true; }
    else if (route === "year-one") html = yearOne();
    else if (v === "alex") html = ({ advisor: advSignal, "advisor/align": advAI, "advisor/docs": advAI, "advisor/inbox": advInbox, "advisor/plan": advPlan }[route] || advSignal)();
    else if (v) html = sub === "checkin" ? checkin(v) : sub === "options" || sub === "vote" ? options(v) : sub === "ask" ? askAlex(v) : sub === "plan" ? famPlan(v) : memberHome(v);
    else { html = splash(); bare = true; route = ""; }
    document.body.classList.toggle("story", route.startsWith("story/"));
    document.body.classList.toggle("onboarding", route === "");
    app.innerHTML = bare ? html : appbar() + `<main>${html}</main>` + tourBar() + bnav();
    document.body.classList.toggle("touring", state.tour >= 0 && !bare && !embedded);
    tourTarget(arrive);
    app.classList.remove("anim");
    if (arrive && motionOK) enter();
    numbers(arrive);
    if (arrive) playTrace();
    renderSheet();
  }

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, id = el.dataset.id, v = viewer();
    if (a === "start") set({ started: true });
    else if (a === "toggle-share") set({ shared: state.shared.includes(id) ? state.shared.filter(x => x !== id) : [...state.shared, id] });
    else if (a === "toggle-summary") set({ optOut: !state.optOut });
    else if (a === "approve") set({ approved: true });
    else if (a === "unapprove") set({ approved: false });
    else if (a === "route") set({ routed: Object.assign({}, state.routed, { [id]: true }) });
    else if (a === "invite") set({ invited: true });
    else if (a === "chapter") set({ chapter: state.chapter.includes(id) ? state.chapter.filter(x => x !== id) : [...state.chapter, id] });
    else if (a === "intro") set({ intro: Object.assign({}, state.intro, { [id]: true }) });
    else if (a === "agree") set({ agreed: Object.assign({}, state.agreed, { [id]: true }) });
    else if (a === "pick") set({ pick: id });
    else if (a === "vote" && v && v !== "alex") set({ votes: Object.assign({}, state.votes, { [v]: state.pick }) });
    else if (a === "send-q" && v) set({ msgs: [...state.msgs, { id: v + "-" + Date.now(), from: v, qi: +id, at: "Just now" }] });
    else if (a === "send-free" && v) {
      const box = app.querySelector("textarea[data-compose]"), text = box ? box.value.trim() : "";
      if (text) set({ msgs: [...state.msgs, { id: v + "-" + Date.now(), from: v, qi: null, text: text.slice(0, 600), at: "Just now" }] });
      else if (box) box.focus();
    }
    else if (a === "send") {
      const m = messages().find(x => x.id === id); if (!m) return;
      const box = app.querySelector(`textarea[data-draft="${id}"]`), text = (box ? box.value : draftFor(m)).trim() || draftFor(m);
      set({ replies: Object.assign({}, state.replies, { [id]: text }) });
    }
    else if (a === "share-reply") set({ shareReply: Object.assign({}, state.shareReply, { [id]: !state.shareReply[id] }) });
    else if (a === "call-open") { ui.callOpen = true; render(); }
    else if (a === "call" && v) { ui.callOpen = false; set({ calls: Object.assign({}, state.calls, { [v]: S.slots[+id] }) }); }
    else if (a === "confirm-call") set({ confirmed: Object.assign({}, state.confirmed, { [id]: true }) });
    else if (a === "tour-start") { sheet.kind = null; state = Object.assign(fresh(), { tour: 0 }); goStep(0); }
    else if (a === "tour-go") goStep(state.tour);
    else if (a === "tour-next") { if (state.tour >= TOUR.length - 1) set({ tour: -1 }); else goStep(state.tour + 1); }
    else if (a === "tour-back") goStep(Math.max(0, state.tour - 1));
    else if (a === "tour-end") set({ tour: -1 });
    else if (a === "switch") { sheet = { kind: "switch" }; renderSheet(); }
    else if (a === "breakdown") { sheet = { kind: "breakdown" }; renderSheet(); }
    else if (a === "why") { sheet = { kind: "why" }; renderSheet(); }
    else if (a === "close") { sheet.kind = null; renderSheet(); }
  });
  document.addEventListener("input", e => {
    const el = e.target;
    if (el.dataset.draft) { state.drafts[el.dataset.draft] = el.value; save(); }
    if (el.dataset.live) {
      const box = document.querySelector(`[data-tags="${el.dataset.live}"]`);
      if (el.dataset.live !== "intro") state.answers[el.dataset.live] = el.value;
      if (box) box.innerHTML = `<span class="lab">Reading…</span>`;
      clearTimeout(el._t); el._t = setTimeout(() => { if (box) box.innerHTML = themesHtml(el.value); save(); }, 450);
    }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && sheet.kind) { sheet.kind = null; renderSheet(); } });
  window.addEventListener("hashchange", () => {
    sheet.kind = null; ui.callOpen = false;
    const go = () => { render(true); window.scrollTo(0, 0); };
    if (motionOK && document.startViewTransition) document.startViewTransition(go); else go();
  });
  // Debug and tooling hooks (screenshots, QA): reset, read state, patch state, jump to a demo step.
  window.FT = { reset() { state = fresh(); save(); render(true); }, state: () => state, set: patch => set(patch), step: i => goStep(i) };
  render(true);
})();
