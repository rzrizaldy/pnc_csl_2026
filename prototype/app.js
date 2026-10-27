// Family Table prototype. Hash routes, no build step, mobile-first.
(function () {
  const S = window.SEED;
  const P = Object.fromEntries(S.people.map(p => [p.id, p]));
  const KIDS = ["dale", "kyle", "ross", "sloane"];
  const app = document.getElementById("app");
  const sheetRoot = document.getElementById("sheet-root");

  // ---------- state ----------
  const KEY = "family-table-v3";
  const fresh = () => ({ detail: "plain", model: "claude", shared: ["q2"], approved: false, started: false,
    routed: {}, notified: false, weight: 50, trust: false, picked: false, agreed: {}, answers: {} });
  let state = fresh();
  try {
    if (new URLSearchParams(location.search).has("reset")) localStorage.removeItem(KEY);
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved) state = Object.assign(fresh(), saved);
  } catch (e) { /* storage blocked: keep in-memory state */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const set = patch => { Object.assign(state, patch); save(); render(); };
  let ask = { open: false, convo: [], busy: false };

  // ---------- helpers ----------
  const money = v => "$" + v.toFixed(1) + "M";
  const t = (plain, detail) => state.detail === "plain" ? plain : detail;
  const ini = p => p.name.split(" ").map(x => x[0]).join("");
  const av = (p, s = 36) => `<span class="av" style="background:${p.color};width:${s}px;height:${s}px;font-size:${Math.round(s / 2.8)}px">${ini(p)}</span>`;
  const gap = th => { const v = Object.values(th.s); return (Math.max(...v) - Math.min(...v)) / 4; };
  const net = () => { const d = S.deal; return d.offer - d.earnout - d.debt - d.fees - d.tax; };
  // Deterministic split of the gift: count w (0..1) of the equity each child keeps with the buyer.
  const gifts = (w) => {
    const pot = S.deal.buckets.find(b => b.id === "gift").value, R = S.deal.rollover;
    const eq = KIDS.reduce((s, k) => s + (R[k] || 0), 0);
    const target = (pot + w * eq) / KIDS.length;
    return Object.fromEntries(KIDS.map(k => [k, target - w * (R[k] || 0)]));
  };
  const giftRange = id => { const a = gifts(0)[id], b = gifts(1)[id]; return [Math.min(a, b), Math.max(a, b)]; };

  const ICON = {
    ok: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7Z"/>',
    attn: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/>',
    req: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.2 12.8-1.4 1.4L12 13.4l-2.8 2.8-1.4-1.4 2.8-2.8-2.8-2.8 1.4-1.4 2.8 2.8 2.8-2.8 1.4 1.4-2.8 2.8 2.8 2.8Z"/>',
    rec: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 15.5a1.5 1.5 0 0 1-1.5-1.5h3a1.5 1.5 0 0 1-1.5 1.5Zm4-2.5H8v-1l1-1v-2.6a3 3 0 0 1 2.2-2.9V7a.8.8 0 0 1 1.6 0v.5A3 3 0 0 1 15 10.4V13l1 1v1Z"/>',
    info: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/>',
    lock: '<path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Z"/>',
    home: '<path fill="currentColor" d="M12 3 2 11h3v9h5v-6h4v6h5v-9h3L12 3Z"/>',
    talk: '<path fill="currentColor" d="M4 4h16v12H7l-3 3V4Zm4 5v2h8V9H8Z"/>',
    scale: '<path fill="currentColor" d="M11 3h2v3h6l-3 7a3 3 0 0 0 6 0l-3-7h1V4h-7V3h-2v1H4v2h1l-3 7a3 3 0 0 0 6 0L5 6h6v13H7v2h10v-2h-4V6h-2V3Z"/>',
    flag: '<path fill="currentColor" d="M5 3h2v18H5V3Zm3 1h11l-3 5 3 5H8V4Z"/>',
    doc: '<path fill="currentColor" d="M6 2h8l6 6v14H6V2Zm7 1.5V9h5.5L13 3.5ZM8 13h10v2H8v-2Zm0 4h10v2H8v-2Z"/>',
    spark: '<path fill="currentColor" d="M12 2l2.2 6.3L20 10l-5.8 1.7L12 18l-2.2-6.3L4 10l5.8-1.7L12 2Zm7 12 1 2.6 2.5.9-2.5.9-1 2.6-1-2.6-2.5-.9 2.5-.9 1-2.6Z"/>',
  };
  const icon = (k, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
  const note = (kind, html, act = "") => `<div class="note ${kind}">${icon(kind)}<div>${html}</div>${act ? `<div class="act">${act}</div>` : ""}</div>`;

  // ---------- visualisations ----------
  function familyTable({ size = 300, center = true } = {}) {
    const n = S.people.length, c = 160, R = 118;
    const done = S.people.filter(p => p.status === "checked").length;
    const seats = S.people.map((p, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n, x = c + R * Math.cos(a), y = c + R * Math.sin(a);
      const ring = p.status === "checked" ? `stroke="#3C8A3F" stroke-width="3.5"` : `stroke="#8C929B" stroke-width="2.5" stroke-dasharray="4 3"`;
      const pnc = !p.pnc.startsWith("None");
      const ly = y + (Math.sin(a) > 0.3 ? 40 : -34);
      return `<g><circle cx="${x}" cy="${y}" r="28" fill="#fff" ${ring}/><circle cx="${x}" cy="${y}" r="22" fill="${p.color}"/>
        <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">${ini(p)}</text>
        <circle cx="${x + 20}" cy="${y - 20}" r="7" fill="${pnc ? "#10214D" : "#fff"}" stroke="${pnc ? "#fff" : "#EF6A00"}" stroke-width="2"/>
        <text x="${x}" y="${ly}" text-anchor="middle" font-size="13.5" fill="#2B2F36" font-weight="600">${p.short}</text></g>`;
    }).join("");
    return `<svg class="viz" viewBox="-20 -10 360 350" style="max-width:${size}px" role="img" aria-label="Family table: ${done} of ${n} checked in">
      <ellipse cx="${c}" cy="${c}" rx="74" ry="74" fill="#F2F3F5" stroke="#DDE0E4" stroke-width="2"/>
      ${center ? `<text x="${c}" y="${c - 2}" text-anchor="middle" font-size="34" font-weight="300" fill="#10214D">${done} of ${n}</text><text x="${c}" y="${c + 20}" text-anchor="middle" font-size="13" fill="#5E646E">checked in</text>` : ""}
      ${seats}</svg>`;
  }
  const tableLegend = () => `<div class="legend"><span><span class="swatch" style="border:3px solid #3C8A3F"></span>Checked in</span><span><span class="swatch" style="border:2px dashed #8C929B"></span>Invited</span><span><span class="swatch" style="background:#10214D"></span>Banks with PNC</span><span><span class="swatch" style="border:2px solid #EF6A00"></span>Banks elsewhere</span></div>`;

  function gauge(score) {
    const a = Math.PI * (1 - score / 100), x = 100 + 80 * Math.cos(a), y = 100 - 80 * Math.sin(a);
    return `<svg class="viz" viewBox="0 0 200 118" style="max-width:220px" role="img" aria-label="Sale likelihood ${score} of 100">
      <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="#E6E8EB" stroke-width="16" stroke-linecap="round"/>
      <path d="M20 100 A80 80 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}" fill="none" stroke="#EF6A00" stroke-width="16" stroke-linecap="round"/>
      <text x="100" y="92" text-anchor="middle" font-size="40" font-weight="300" fill="#10214D">${score}</text>
      <text x="100" y="112" text-anchor="middle" font-size="12" fill="#5E646E">likely sale · ${S.signal.horizon}</text></svg>`;
  }

  function donut(items, total, label, size = 140) {
    const R = 52, C = 2 * Math.PI * R; let off = 0;
    const arcs = items.map(b => { const len = b.value / total * C; const s = `<circle r="${R}" cx="70" cy="70" fill="none" stroke="${b.color}" stroke-width="22" stroke-dasharray="${Math.max(len - 2, 0)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"/>`; off += len; return s; }).join("");
    return `<svg class="viz" viewBox="0 0 140 140" style="max-width:${size}px" role="img" aria-label="${label}">${arcs}
      <text x="70" y="72" text-anchor="middle" font-size="20" font-weight="300" fill="#2B2F36">${money(total)}</text><text x="70" y="88" text-anchor="middle" font-size="9.5" fill="#5E646E">at closing</text></svg>`;
  }

  function waterfall() {
    const d = S.deal, cash = d.offer - d.earnout, n = net(), sc = v => (v / d.offer * 100).toFixed(2) + "%";
    const row = (label, cls, left, w, val) => `<div class="wf ${cls}"><span>${label}</span><b>${val}</b><div class="track"><i style="left:${sc(left)};width:${sc(w)}"></i></div></div>`;
    return row(t("The buyer's offer", "Offer (NorthPeak LOI v3)"), "", 0, d.offer, money(d.offer)) +
      row(t("Paid later, only if targets are hit", "Earnout (contingent, years 1–3)"), "cont", cash, d.earnout, "−" + money(d.earnout)) +
      row(t("Company debt paid off", "Debt payoff"), "minus", cash - d.debt, d.debt, "−" + money(d.debt)) +
      row(t("Lawyers and advisers", "Transaction fees"), "minus", cash - d.debt - d.fees, d.fees, "−" + money(d.fees)) +
      row(t("Estimated tax", "Estimated federal + state tax"), "minus", n, d.tax, "−" + money(d.tax)) +
      row(t("What lands at closing", "Net proceeds at close"), "net", 0, n, money(n));
  }

  function spread(th) {
    const v = Object.values(th.s), lo = Math.min(...v), hi = Math.max(...v), pos = x => (x + 2) / 4 * 100;
    const dots = v.map((x, i) => `<span class="dot" style="left:${pos(x)}%;top:${16 - v.slice(0, i).filter(y => y === x).length * 11}px"></span>`).join("");
    return `<div class="spread"><div class="axis"></div><div class="range" style="left:${pos(lo)}%;width:${pos(hi) - pos(lo)}%"></div>${dots}</div>`;
  }

  function splitBars(w, compact) {
    const g = gifts(w / 100);
    return `<div class="split">${KIDS.map(k => `<div class="who-row"><span>${P[k].short}</span><span class="bar"><i style="width:${g[k] / 4 * 100}%;background:${P[k].color}"></i></span><b>${money(g[k])}</b></div>`).join("")}</div>
      ${compact ? "" : `<p class="small muted" style="margin-top:6px">${state.trust ? "Paid into a family trust, released over 10 years." : "Paid at closing."}</p>`}`;
  }

  const timeline = () => `<ol class="timeline">${S.deal.timeline.map(s => `<li class="${s.done ? "done" : ""} ${s.now ? "now" : ""}"><b>${s.label}</b><small>${s.when}</small></li>`).join("")}</ol>`;

  function collision() {
    const named = state.shared.includes("q1");
    return `<div class="collision"><div class="seat"><div class="chair">Leads after the sale</div>
      <div class="claimants">${S.claims.map((id, i) => named && id === "sloane" ? `<span class="claimant named" style="background:${P.sloane.color}" title="Sloane shared this">S</span>` : `<span class="claimant" aria-label="anonymous">?</span>`).join("")}</div></div>
      <p><b>${S.claims.length} of 5 people who checked in expect to lead.</b> ${t("They can't all be right. Someone made promises in private.", "Expectation collision on the leadership theme; one answer mentions a private promise.")}</p>
      <p class="small muted">${named ? "Sloane chose to share her answer. The other two stay anonymous." : "You see names only if people choose to share."}</p></div>`;
  }

  // ---------- adaptive cards (family side) ----------
  const REASON = {
    proceeds: "The money is the first question owners ask.", mine: "This is what the sale means for you personally.",
    timeline: "The sale is in the buyer-checks stage now.", options: "Gift options are ready to compare.",
    table: "So you can see who has had their say.", role: "Your job after the sale is in the buyer's letter.",
    meeting: "Who leads will be decided together, not in private.", checkin: "Your private answers shape the family plan.",
    nextchapter: "Owners who plan their next chapter regret the sale less.", contingency: "Half of business exits are not planned.",
  };
  function cardFor(id, pid) {
    const p = P[pid];
    switch (id) {
      case "proceeds": {
        const n = net(), items = S.deal.buckets;
        return `<h2>${t("What you keep from the sale", "From offer to net proceeds")}</h2><p class="lede">${t("The earnout is shown apart because it isn't guaranteed.", "Earnout excluded from cash at close; estimates confirmed by a PNC tax specialist.")}</p>
          ${waterfall()}
          <div class="donut-row">${donut(items, n, "Live on, give, invest")}<ul class="legend-list">${items.map(b => `<li style="--c:${b.color}"><span>${b.label}<small>${b.detail}</small></span><b>${money(b.value)}</b></li>`).join("")}</ul></div>`;
      }
      case "mine": {
        const [lo, hi] = giftRange(pid);
        return `<h2>${t("Your share, and when", "Your share of the family gift")}</h2>
          <div class="big" style="margin-top:10px">${money(lo)}–${money(hi).slice(1)}<small>at closing</small></div>
          <p class="lede">${t("Depends on which split the family picks. Expected in March.", `Range across equal and equitable splits of the ${money(12)} gift; closing expected March.`)}</p>
          ${splitBars(state.weight, true)}
          <a class="btn ghost block" style="margin-top:12px" href="#/me/${pid}/options">Try the split yourself</a>`;
      }
      case "timeline": return `<h2>Where the sale is</h2>${timeline()}`;
      case "options": return `<h2>${t("Ways to split the gift", "Gift options")}</h2><p class="lede">Drag a slider and see each share change.</p>${splitBars(state.weight, true)}<a class="btn ghost block" style="margin-top:12px" href="#/me/${pid}/options">Compare options</a>`;
      case "table": return `<h2>Who has had their say</h2><div class="table-wrap">${familyTable({ size: 280 })}</div>${tableLegend()}`;
      case "role": {
        const kyle = pid === "kyle";
        return `<h2>Your role after the sale</h2>
          <div class="stack" style="margin-top:10px">${kyle
            ? `<div class="row"><span class="big">2 yrs</span><span class="muted">COO contract offered</span></div><div class="row"><span class="big">${money(1.5)}</span><span class="muted">equity you keep in NorthPeak</span></div>`
            : `<div class="row"><span class="big">12 mo</span><span class="muted">sales team kept</span></div><p class="lede">No title is named for you yet. Worth raising before the meeting.</p>`}</div>
          <p class="small muted" style="margin-top:10px">From the buyer's letter of intent. Read by a language model, checked by Alex.</p>`;
      }
      case "meeting": return `<h2>Family meeting · Nov 12</h2><p class="lede">With a Hawthorn IFS facilitator, at the Pittsburgh office.</p>
          <ol class="timeline"><li><b>Can a sale go ahead?</b><small>An old agreement may need all four children to agree</small></li><li><b>Who leads after the sale</b><small>More than one person expects to</small></li><li><b>What's fair</b><small>Bring the option you like</small></li></ol>
          <span class="chip priv">${icon("lock", 14)} Your private answers stay private in the room</span>`;
      case "checkin": {
        const done = p.status === "checked";
        return `<h2>${done ? "Your check-in" : "Have your say"}</h2><p class="lede">${done ? "You've answered. You choose what Alex can read." : "About 10 minutes. Nobody in the family sees your answers."}</p>
          <a class="btn ${done ? "ghost" : "cta"} block" style="margin-top:12px" href="#/me/${pid}/checkin">${done ? "Review my answers" : "Start my check-in"}</a>`;
      }
      case "nextchapter": return `<h2>Your next chapter</h2><p class="lede">${t("What will your week look like six months after the sale?", "Owners who define post-sale purpose before signing report less regret (PNC, Paper 7).")}</p>
          <div class="suggest" style="margin-top:10px"><button>Board seat at NorthPeak</button><button>Hale Family Foundation</button><button>Mentor new owners</button></div>
          <p class="small muted" style="margin-top:8px">Ideas suggested by a language model from what Walt told Alex. Tap to add.</p>`;
      case "contingency": return `<h2>If Walt can't continue</h2><p class="lede">${S.contingency}</p>`;
    }
    return "";
  }

  // ---------- shells ----------
  const isAdvisor = () => viewer() === "alex";
  let route = "";
  function viewer() { const m = route.match(/^me\/(\w+)/); return m ? m[1] : route.startsWith("advisor") ? "alex" : null; }

  function bar() {
    const v = viewer();
    const tabs = v === "alex"
      ? [["advisor", "Home"], ["advisor/align", "Align"], ["advisor/docs", "Documents"], ["advisor/plan", "Plan"]]
      : v ? [[`me/${v}`, "Home"], [`me/${v}/checkin`, "Check-in"], [`me/${v}/options`, "Options"], [`me/${v}/plan`, "Plan"]] : [];
    const who = v === "alex" ? `<span class="av" style="background:#44566C">AL</span>Alex · advisor` : v ? `${av(P[v], 28)}${P[v].short}` : "Choose a view";
    return `<header class="appbar">
      <a class="brand" href="#/">${markSvg()} Family Table <small>· PNC Private Bank concept</small></a>
      <nav class="tabs" aria-label="Sections">${tabs.map(([h, l]) => `<a href="#/${h}" class="${route === h ? "on" : ""}">${l}</a>`).join("")}</nav>
      ${v ? `<button class="toggle-detail" data-act="detail" aria-pressed="${state.detail !== "plain"}">${state.detail === "plain" ? "Plain words" : "Detailed"}</button>` : ""}
      <a class="who" href="#/" aria-label="Switch person">${who}</a></header>`;
  }
  const markSvg = () => `<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16" cy="16" r="5" fill="#EF6A00"/><circle cx="16" cy="5" r="2.4" fill="#fff"/><circle cx="26" cy="20" r="2.4" fill="#fff"/><circle cx="6" cy="20" r="2.4" fill="#fff"/></svg>`;
  function bnav() {
    const v = viewer(); if (!v) return "";
    const items = v === "alex"
      ? [["advisor", "Home", "home"], ["advisor/align", "Align", "scale"], ["advisor/docs", "Docs", "doc"], ["advisor/plan", "Plan", "flag"]]
      : [[`me/${v}`, "Home", "home"], [`me/${v}/checkin`, "Check-in", "talk"], [`me/${v}/options`, "Options", "scale"], [`me/${v}/plan`, "Plan", "flag"]];
    return `<nav class="bnav" aria-label="Sections">${items.map(([h, l, i]) => `<a href="#/${h}" class="${route === h ? "on" : ""}">${icon(i, 22)}${l}</a>`).join("")}</nav>
      <button class="fab" data-act="ask-open">${icon("spark", 20)} Ask</button>`;
  }
  const hero = (crumb, title, desc) => `<section class="hero"><div style="max-width:1176px;margin:0 auto"><div class="crumb">${crumb}</div><h1>${title}</h1>${desc ? `<p>${desc}</p>` : ""}</div></section>`;

  // ---------- screens ----------
  function picker() {
    return `${hero("Concept prototype · fictional family", "Whose eyes do you want to see this through?", "The Hales run a $48M freight company. Each of them is modelled on a character from HBO's Succession. Pick one: the app adapts to who you are.")}
      <div class="wrap"><div class="pick">
        <a class="persona advisor" href="#/advisor"><span class="av" style="background:#EF6A00">AL</span><span class="txt"><b>Alex Lee · PNC advisor</b><span>Private Business Strategist. Sees signals, gaps and documents.</span></span><span class="go">Open</span></a>
        ${S.people.map(p => `<a class="persona" href="#/me/${p.id}">${av(p, 44)}<span class="txt"><b>${p.name}</b><span>${p.role}</span><em>The ${p.archetype.split(" ")[0]}: ${p.pattern}</em></span><span class="go">Open</span></a>`).join("")}
      </div>
      <p class="small muted" style="margin-top:16px">All people, firms and figures are fictional. Character references are to HBO's Succession, used for commentary. <a href="?reset#/">Reset the demo</a> · <a href="../">About the project</a></p></div>`;
  }

  function memberHome(pid) {
    const p = P[pid], f = S.focus[pid];
    const [lo, hi] = KIDS.includes(pid) ? giftRange(pid) : [0, 0];
    const summary = {
      walt: `The sale could close in March. About ${money(net())} lands then. Your family meets on Nov 12.`,
      marisa: "Walt is selling the company. You haven't had your say yet, and the plan affects you.",
      dale: `If the sale closes in March, you could get ${money(lo)} to ${money(hi)} then.`,
      kyle: "The buyer wants you as COO for two years. Who leads the family side is on Nov 12.",
      ross: "The buyer keeps the sales team for a year. Your title isn't decided yet.",
      sloane: "More than one of you expects to lead. That's the first thing the family meeting will settle.",
    }[pid];
    const clause = state.notified && KIDS.includes(pid) ? note("req", `Alex found a clause in an old agreement that affects you.<small>A 1998 agreement may require all four children to agree to a sale. The family attorney is confirming.</small>`) : "";
    const cards = f.cards.map((c, i) => `<section class="card ${i === 0 ? "accent" : ""}" data-card="${c}">${cardFor(c, pid)}
        <p class="why">${icon("spark", 14)}<span><b>Why you see this${i === 0 ? " first" : ""}:</b> ${i === 0 ? f.why : REASON[c]}</span></p></section>`).join("");
    return `${hero(`${p.role} · Hale family`, `Hi ${p.short}.`, `${icon("spark", 14)} ${summary}`)}
      <div class="wrap"><div class="stack">${clause}</div><div class="grid two" style="margin-top:${clause ? 14 : 0}px">${cards}</div>
      <p class="small muted" style="margin-top:14px">This screen is arranged for ${p.short}. A ranking model orders cards by role and by the themes ${p.short} raised. Switch person to see it change.</p></div>`;
  }

  // live tagging rules: a stand-in for the language model that maps free text to themes
  const RULES = [
    { re: /(run things|lead|in charge|ceo|be the one|next in line|take over)/i, tag: "Who leads", note: "expects to lead", c: 0.92 },
    { re: /(just the two of us|privately|don'?t think .{0,24}knows|secret|promised|told me)/i, tag: "Private promise", note: "flag", c: 0.81, flag: true },
    { re: /(equal|fair|same share)/i, tag: "Fairness", note: "wants equal shares", c: 0.9 },
    { re: /(salar|stock|equity)/i, tag: "Buyer equity", note: "should count", c: 0.77 },
    { re: /(nothing to do|project|bored|purpose|retire|scared he)/i, tag: "Walt's next chapter", note: "worried", c: 0.86 },
    { re: /(cash|money|when .{0,10}get|paid)/i, tag: "Cash timing", note: "matters", c: 0.74 },
  ];
  const tagsFor = txt => RULES.filter(r => r.re.test(txt));
  const tagHtml = txt => tagsFor(txt).map(r => `<span class="tag ${r.flag ? "flag" : ""}">${r.tag}<i>${Math.round(r.c * 100)}%</i></span>`).join("") || `<span class="small muted">No themes yet</span>`;

  function checkin(pid) {
    const p = P[pid];
    if (pid !== "sloane") {
      const mine = S.themes.filter(th => th.s[pid] !== undefined);
      const word = v => ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"][v + 2];
      return `${hero(`Private check-in · ${p.short}`, p.status === "checked" ? "Here's what we heard from you." : "Have your say, privately.", "Only you see this page. Alex sees where the family agrees or not, never your words, unless you share them.")}
        <div class="wrap"><div class="grid two">
          <section class="card"><h2>${p.status === "checked" ? "Your answers, as themes" : "Start with one question"}</h2>
          ${p.status === "checked" ? `<ul class="list">${mine.map(th => `<li><span>${th.label}<span class="meta">${word(th.s[pid])}</span></span><button class="btn ghost right" style="min-height:36px;padding:4px 10px">Fix</button></li>`).join("")}</ul>
            <p class="small muted" style="margin-top:8px">A language model turned your words into these. If one is wrong, fix it.</p>`
            : `<div class="qa" style="box-shadow:none;padding:0;margin-top:10px"><div class="q">What should happen to the family when Walt sells?</div><textarea data-live="intro" placeholder="Say it the way you would to a friend."></textarea><div class="tags" data-tags="intro"></div></div>`}
          </section>
          <section class="card"><h2>What Alex sees</h2><p class="lede">Themes and the size of each disagreement. No names, no words.</p>
            <div style="margin-top:8px">${S.themes.slice(0, 3).map(th => `<div class="gap-row ${gap(th) >= 0.75 ? "high" : ""}"><div class="top"><span>${th.short}</span><b>${gap(th).toFixed(2)}</b></div><div class="spread-wrap">${spread(th)}</div></div>`).join("")}</div></section>
        </div></div>`;
    }
    const qa = S.checkin.sloane.map(q => {
      const on = state.shared.includes(q.id), txt = state.answers[q.id] ?? q.a;
      return `<article class="qa" data-q="${q.id}"><div class="q">${q.q}</div>
        <textarea data-live="${q.id}" aria-label="${q.q}">${txt}</textarea>
        <div class="tags" data-tags="${q.id}">${tagHtml(txt)}</div>
        <div class="seg" role="group" aria-label="Who can see this answer">
          <button class="priv ${on ? "" : "on"}" data-act="private" data-id="${q.id}" aria-pressed="${!on}">${icon("lock", 14)} Keep private</button>
          <button class="share ${on ? "on" : ""}" data-act="share" data-id="${q.id}" aria-pressed="${on}">Share with Alex</button></div>
        ${on ? `<div class="shared"><small>Alex sees your words</small>“${txt}”</div>` : `<div class="sealed"><b>Alex sees only:</b> ${tagsFor(txt).map(r => r.tag).join(" · ") || "nothing yet"}<i style="width:90%"></i><i style="width:60%"></i></div>`}
      </article>`;
    }).join("");
    return `${hero("Private check-in · Sloane", "Sloane, this part is just for you.", "Say it the way you would to a friend. As you type, AI picks out the themes. You decide, answer by answer, what Alex can read.")}
      <div class="wrap">${note("info", "Nobody in your family will see your answers.<small>Not your dad, not your brothers. Alex only sees themes, unless you share.</small>")}<div style="margin-top:12px">${qa}</div></div>`;
  }

  function options(pid) {
    const w = state.weight, g = gifts(w / 100), you = KIDS.includes(pid) ? pid : null;
    return `${hero("Options · the $12.0M family gift", t("How should the gift be split?", "Gift allocation: equal vs equitable vs staged"), "Move the slider. The numbers come from a calculator, not from AI.")}
      <div class="wrap"><div class="grid main-side">
        <section class="card accent"><h2>${t("Split it your way", "Equalisation weight")}</h2>
          <div class="slider"><label for="w">${t("Count the company shares Kyle and Ross keep?", "Weight on rollover equity")}</label>
            <input id="w" type="range" min="0" max="100" step="25" value="${w}" data-act="weight" aria-valuetext="${w}%">
            <div class="ends"><span>No: equal shares</span><span data-wlabel>${w}%</span><span>Yes: fully</span></div></div>
          <div data-split>${splitBars(w)}</div>
          <label class="switch"><input type="checkbox" data-act="trust" ${state.trust ? "checked" : ""}> Put it in a family trust, paid over 10 years</label>
          <div class="explain"><span data-sentence>${sentenceFor(w)}</span>${state.trust ? " A trust protects the gift from divorce and creditors, but Dale and Sloane may read it as a lack of trust." : ""}<small>Explanation written by a language model from the calculator's numbers. Reviewed by Alex.</small></div>
          <div class="row" style="margin-top:14px">${state.picked ? `<span class="chip ok">${icon("ok", 14)} Saved for the Nov 12 meeting</span>` : `<button class="btn cta" data-act="pick">Bring this to the meeting</button>`}</div>
        </section>
        <div class="stack">
          ${you ? `<section class="card"><h2>You</h2><div class="big" style="margin-top:8px" data-you>${money(g[you])}</div><p class="lede">${state.trust ? "Over 10 years" : "At closing, expected March"}</p></section>` : ""}
          <section class="card"><h2>Why families fight about this</h2><p class="lede">${t("Kids in the business feel their years should count. Kids outside it feel left out. Both are fair points.", "Active vs non-active heirs: equal ownership can cause conflict (PNC, Paper 3).")}</p></section>
        </div></div></div>`;
  }

  function sentenceFor(w) {
    return w === 0 ? "Everyone gets the same amount."
      : w === 100 ? `The equity Kyle (${money(1.5)}) and Ross (${money(0.5)}) keep with the buyer is fully counted, so Dale and Sloane get more cash to even it out.`
      : `Part of the equity Kyle and Ross keep with the buyer is counted (${w}%), so totals move closer together.`;
  }

  function famPlan(pid) {
    const steps = { walt: "Sign the dated successor decision (replaces the desk note)", marisa: "Do your check-in, then an estate review with Alex", dale: "Open an account for your gift, at any bank", kyle: "Review your COO contract with business banking", ross: "Ask for a named role before the letter is signed", sloane: "Come to the Nov 12 meeting; decide if you'll share answer 1" };
    const agreed = state.agreed[pid];
    return `${hero("Plan · Hale family", t("One next step for everyone.", "Plan, decisions and contingency"), "Every decision is dated, signed and kept by PNC. No more notes in desk drawers.")}
      <div class="wrap"><div class="grid two">
        <section class="card accent"><h2>Your next step</h2><p style="font-size:18px;margin-top:8px">${steps[pid]}</p>
          <div class="row" style="margin-top:12px">${agreed ? `<span class="chip ok">${icon("ok", 14)} You agreed to the plan in principle</span>` : `<button class="btn cta" data-act="agree" data-id="${pid}">I agree in principle</button>`}</div></section>
        <section class="card"><h2>Everyone else</h2><ul class="list">${S.people.filter(x => x.id !== pid).map(x => `<li>${av(x, 30)}<span>${x.short}<span class="meta">${steps[x.id]}</span></span></li>`).join("")}</ul></section>
        <section class="card"><h2>If Walt can't continue</h2><p class="lede">${S.contingency}</p></section>
        <section class="card"><h2>Where the sale is</h2>${timeline()}</section>
      </div></div>`;
  }

  // ---------- advisor ----------
  function advHome() {
    const s = S.signal, heirs = S.people.filter(p => p.gen === 2 && p.pnc.startsWith("None"));
    return `${hero("Advisor workbench · Alex Lee", "Good morning, Alex. One family needs you this week.", t("The Hales. A sale is likely, and the family isn't on the same page.", "Hale Freight: sale-likelihood 81; leadership collision; consent clause found."))}
      <div class="wrap"><div class="grid three">
        <section class="card accent"><h2>Hale Freight may sell</h2><div class="table-wrap">${gauge(s.score)}</div>
          <ul class="reasons">${s.reasons.map(r => `<li><span>${r.text}</span><span class="bar"><i style="width:${r.weight / 0.36 * 100}%"></i></span></li>`).join("")}</ul>
          <p class="small muted" style="margin-top:8px">Machine-learning score from business-account activity. Bars show each reason's share.</p>
          <div style="margin-top:12px">${state.started ? `<span class="chip ok">${icon("ok", 14)} You called Walt on Oct 15</span>` : `<button class="btn cta block" data-act="start">Call Walt</button>`}</div></section>
        <section class="card"><h2>The family table</h2><div class="table-wrap">${familyTable({ size: 280 })}</div>${tableLegend()}
          <p class="lede" style="margin-top:8px"><b>${heirs.length} of 4 children</b> bank elsewhere. They could receive ${money(9)}–${money(10).slice(1)} at closing.</p></section>
        <section class="card"><h2>Needs you</h2><div class="stack" style="margin-top:10px">
          ${note("req", `An old agreement may let any child block the sale.<small>Document AI · 93% confident</small>`, `<a href="#/advisor/docs">Review</a>`)}
          ${note("req", `3 people expect to lead after the sale.<small>From private check-ins · names hidden</small>`, `<a href="#/advisor/align">See</a>`)}
          ${note("attn", `Marisa hasn't checked in.<small>Invited Oct 20</small>`, `<button class="btn ghost" style="min-height:32px;padding:2px 10px" data-act="remind">Nudge</button>`)}
          ${note("rec", `Family meeting booked for Nov 12.<small>Hawthorn IFS facilitator</small>`)}
        </div></section>
      </div>
      <section class="card" style="margin-top:14px"><h2>Where the Hales are</h2>
        <div class="steps4"><div class="done"><i></i>1 · Spot</div><div class="done"><i></i>2 · Listen</div><div class="now"><i></i>3 · Align</div><div><i></i>4 · Act</div></div></section></div>`;
  }

  function advAlign() {
    const rows = S.themes.map(th => ({ th, g: gap(th) })).sort((a, b) => b.g - a.g).map(({ th, g }) =>
      `<div class="gap-row ${g >= 0.75 ? "high" : ""}"><div class="top"><span>${th.label}</span><b>${g.toFixed(2)}</b></div><div class="spread-wrap">${spread(th)}<div class="spread-labels"><span>disagree</span><span>agree</span></div></div></div>`).join("");
    const ans = S.checkin.sloane.map((q, i) => state.shared.includes(q.id)
      ? `<div class="shared"><small>Sloane shared · ${q.q}</small>“${state.answers[q.id] ?? q.a}”</div>`
      : `<div class="sealed">${icon("lock", 14)} <b>Private answer ${i + 1}</b> · themes: ${tagsFor(state.answers[q.id] ?? q.a).map(r => r.tag).join(", ")}<i style="width:90%"></i></div>`).join("");
    const named = state.shared.includes("q1");
    return `${hero("Align · Hale family", "Where the family agrees, and where it doesn't.", "You see the size of each gap. You see someone's words only if they share them.")}
      <div class="wrap"><div class="grid main-side">
        <div class="stack">
          <section class="card accent"><h2>Who leads after the sale?</h2>${collision()}</section>
          <section class="card"><h2>Gaps by theme</h2><p class="lede">Each dot is one person, unnamed. Wider bar, bigger gap.</p>${rows}
            <p class="small muted" style="margin-top:8px">Gap = spread between the furthest-apart answers, 0 to 1. A fixed formula, not AI.</p></section>
        </div>
        <div class="stack">
          <section class="card"><h2>Brief for the family meeting</h2>
            <div class="draft ${state.approved ? "approved" : ""}">
              ${state.approved ? note("ok", "Approved by you. Ready for Nov 12.") : note("rec", "Draft by a language model, from check-in themes only.")}
              <p style="margin-top:10px"><b>Settle the consent clause first.</b> Until it's clear whether all four children must agree, every other conversation is about leverage.</p>
              <p><b>Name the leadership collision as a pattern.</b> Three people expect to lead${named ? "; Sloane says Walt promised her privately" : ""}. Ask Walt to say, in the room, what he has promised.</p>
              <p><b>Then fairness (gap 1.00).</b> Bring the equal and equitable splits; let the facilitator run it.</p>
              <div class="row" style="margin-top:10px">${state.approved ? `<button class="btn ghost" data-act="unapprove">Reopen</button>` : `<button class="btn" data-act="approve">Approve brief</button><button class="btn ghost">Edit</button>`}</div>
            </div></section>
          <section class="card"><h2>Sloane's check-in</h2>${ans}</section>
        </div></div></div>`;
  }

  function advDocs() {
    return `${hero("Documents · Hale family", "What the old paperwork says.", "Document AI reads each file and flags anything that could change the sale. Nothing goes to the family until you approve it.")}
      <div class="wrap"><div class="grid two">${S.docs.map(d => {
        const routed = state.routed[d.id];
        return `<section class="card doc"><div class="row" style="align-items:flex-start;flex-wrap:nowrap"><span class="ext ${d.type === "Scan" ? "scan" : ""}">${d.type}</span><div><h2 style="font-size:17px">${d.name}</h2><span class="small muted">${d.pages} page${d.pages > 1 ? "s" : ""} · read by a language model</span></div><span class="chip ${d.risk === "High" ? "req" : "warn"}" style="margin-left:auto">${d.risk}</span></div>
          <p style="margin-top:12px"><b>${d.finding}</b></p><p class="lede">${d.impact}</p>
          <div class="conf"><span class="bar"><i style="width:${d.conf * 100}%"></i></span>${Math.round(d.conf * 100)}% confident</div>
          <div class="row" style="margin-top:12px">${routed ? `<span class="chip ok">${icon("ok", 14)} Sent: ${d.action}</span>` : `<button class="btn" data-act="route" data-id="${d.id}">${d.action}</button>`}
            ${d.id === "divorce" && routed ? (state.notified ? `<span class="chip ok">${icon("ok", 14)} Family told</span>` : `<button class="btn cta" data-act="notify">Tell the four children</button>`) : ""}</div></section>`;
      }).join("")}
      <section class="card"><h2>Why this matters</h2><p class="lede">${t("In Succession, a forgotten clause in a divorce deal decided who could block the sale. Here, it's found months before closing.", "Governance documents (buy-sell, divorce settlements, voting trusts) carry consent and valuation terms that surface late in diligence.")}</p></section>
      </div></div>`;
  }

  function advPlan() {
    const heirs = S.people.filter(p => p.gen === 2 && p.pnc.startsWith("None"));
    return `${hero("Plan · Hale family", "Decisions, tasks and the next generation.", "Every decision is dated and signed. Every model output is logged with who approved it.")}
      <div class="wrap"><div class="grid two">
        <section class="card accent"><h2>Next generation</h2><p class="lede">Children who bank elsewhere today.</p>
          <ul class="list">${heirs.map(h => { const [lo, hi] = giftRange(h.id); return `<li>${av(h, 32)}<span>${h.name}<span class="meta">${money(lo)}–${money(hi).slice(1)} at closing · ${h.role}</span></span><button class="btn ghost right" style="min-height:36px;padding:4px 12px">Offer intro</button></li>`; }).join("")}</ul></section>
        <section class="card"><h2>Specialist tasks</h2><ul class="list">${S.tasks.map(x => `<li><span><b>${x.who}</b><span class="meta">${x.what} · ${x.due}</span></span><span class="chip right ${x.status === "Booked" ? "ok" : x.status.startsWith("Waiting") ? "priv" : "rec"}">${x.status}</span></li>`).join("")}</ul></section>
        <section class="card"><h2>If Walt can't continue</h2><p class="lede">${S.contingency}</p><p class="small muted" style="margin-top:8px">Half of business exits are involuntary (PNC, Business Succession Planning series).</p></section>
        <section class="card"><h2>Decision log</h2><ul class="list">${S.ledger.map(l => `<li><span class="meta" style="width:52px;flex:none">${l.t}</span><span><b>${l.who}</b><span class="meta">${l.what}</span></span></li>`).join("")}
          ${Object.keys(state.agreed).map(id => `<li><span class="meta" style="width:52px;flex:none">Today</span><span><b>${P[id].name}</b><span class="meta">Agreed to the plan in principle.</span></span></li>`).join("")}</ul></section>
      </div></div>`;
  }

  // ---------- story cards (video only) ----------
  function story(id) {
    const eyebrow = `<div class="eyebrow">Family Table · a PNC Private Bank concept</div>`;
    const cards = {
      hook: `${eyebrow}<h1>In Succession, Logan Roy sells the company and loses the family.</h1><p class="sub">Promises made in private. A clause no one remembered. A note in a safe. Every one of those happens in real family businesses too.</p><div class="rule"></div>`,
      cast: `${eyebrow}<h1>Meet the Hales: a $48M freight company with the same problems.</h1><div class="cast">${S.people.filter(p => p.id !== "marisa").map(p => `<div style="--c:${p.color === "#10214D" ? "#EF6A00" : p.color}"><b>${p.name}</b><span>The ${p.archetype.split(" ")[0]} · ${p.pattern}</span></div>`).join("")}<div style="--c:#fff"><b>Alex Lee, PNC</b><span>The advisor who usually hears about it last.</span></div></div>`,
      problem: `${eyebrow}<h1>The sale is when families split and money leaves the bank.</h1><div class="stats">
        <div class="stat"><b>13%</b><p>of heirs keep their parents' financial advisor.</p><small>Cerulli Associates, 2019</small></div>
        <div class="stat"><b>75%</b><p>of owners “profoundly regretted” selling a year later.</p><small>PNC, Begin at the end</small></div>
        <div class="stat"><b>50%</b><p>of business exits are involuntary: death, illness, divorce, dispute.</p><small>PNC Business Succession Planning series</small></div></div>`,
      sauce: `${eyebrow}<h1>Why only PNC can build this</h1><div class="stats">
        <div class="stat"><b style="font-size:34px">A signal PNC already holds</b><p>Business-account activity flags a sale a year before closing.</p></div>
        <div class="stat" style="border-color:#9A7FC6"><b style="font-size:34px">Private by default</b><p>Each person answers alone. The advisor sees the gaps, not the words.</p></div>
        <div class="stat" style="border-color:#93B86F"><b style="font-size:34px">One household graph</b><p>Heirs become PNC clients before the money moves.</p></div></div>`,
      close: `${eyebrow}<h1>Keep the proceeds. Meet the next generation. Help a family stay a family.</h1><div class="rule"></div><p class="sub" style="font-size:20px">Alen Ilmi · Rizaldy Utomo · Nindy Aditya Dewi · Aditya Mulya Pratama · Carnegie Mellon University</p>`,
    };
    return `<section class="storycard"><div class="inner">${cards[id] || cards.hook}</div></section>`;
  }

  // ---------- Ask Family Table (simulated AI) ----------
  function askCard(kind, v) {
    switch (kind) {
      case "proceeds": return `<div class="mini-card">${waterfall()}</div>`;
      case "mine": { const [lo, hi] = giftRange(v); return `<div class="mini-card"><div class="big">${money(lo)}–${money(hi).slice(1)}</div><p class="small muted">your share at closing, by split</p>${splitBars(state.weight, true)}</div>`; }
      case "clause": return `<div class="mini-card doc"><div class="row" style="flex-wrap:nowrap"><span class="ext">PDF</span><span><b>Divorce agreement, 1998 · clause 7.2</b><span class="small muted" style="display:block">Consent of all four children needed</span></span></div><div class="conf"><span class="bar"><i style="width:93%"></i></span>93% confident · attorney confirming</div></div>`;
      case "role": return `<div class="mini-card">${cardFor("role", v === "ross" ? "ross" : "kyle").replace(/<h2>.*?<\/h2>/, "")}</div>`;
      case "meeting": return `<div class="mini-card">${cardFor("meeting", v).replace(/<h2>.*?<\/h2>/, "<b>Nov 12 · family meeting</b>")}</div>`;
      case "contingency": return `<div class="mini-card"><b>Signed contingency plan</b><p class="small" style="margin-top:4px">${S.contingency}</p></div>`;
      case "prep": return `<div class="mini-card"><ol class="timeline"><li class="now"><b>Consent clause</b><small>Attorney's answer first</small></li><li><b>Who leads</b><small>Pattern, not people</small></li><li><b>What's fair</b><small>Equal vs equitable, live</small></li></ol></div>`;
      case "heirs": return `<div class="mini-card"><div class="row">${S.people.filter(p => p.gen === 2 && p.pnc.startsWith("None")).map(p => `${av(p, 30)} ${p.short}`).join(" ")}</div><p class="small muted" style="margin-top:6px">${money(9)}–${money(10).slice(1)} at closing, combined</p></div>`;
    }
    return "";
  }
  function renderSheet() {
    if (!ask.open) { sheetRoot.innerHTML = ""; return; }
    const v = viewer() || "alex", qs = S.ask[v] || [];
    const convo = ask.convo.map(m => m.role === "user" ? `<div class="msg user"><p>${m.text}</p></div>`
      : `<div class="msg"><div class="trace">${m.tools.slice(0, m.shownTools).map(x => `<div>${x}</div>`).join("")}</div>
          ${m.shown ? `<div class="answer"><span class="who">${m.model === "claude" ? "Claude" : "GPT"} via PNC AI gateway</span>${m.shown}</div>` : ""}
          ${m.done ? askCard(m.card, v) + `<div class="guard"><span>Numbers from PNC's calculator</span><span>Private answers not used</span><span>Not legal or tax advice</span><span>Alex reviews decisions</span></div>` : ""}</div>`).join("");
    sheetRoot.innerHTML = `<div class="sheet-bg" data-act="ask-close"></div>
      <div class="sheet" role="dialog" aria-label="Ask Family Table"><header><div class="row"><h2>${icon("spark", 18)} Ask Family Table</h2><button class="close" data-act="ask-close" aria-label="Close">×</button></div>
        <div class="models" role="group" aria-label="Model"><button class="${state.model === "claude" ? "on" : ""}" data-act="model" data-id="claude">Claude</button><button class="${state.model === "gpt" ? "on" : ""}" data-act="model" data-id="gpt">GPT</button></div></header>
        <div class="body" id="ask-body"><p class="small muted">Ask in your own words. Answers use only what ${v === "alex" ? "you're allowed to see" : "you can see"}.</p>
          <div class="suggest" style="margin-top:10px">${qs.map((q, i) => `<button data-act="ask" data-id="${i}" ${ask.busy ? "disabled" : ""}>${q.q}</button>`).join("")}</div>${convo}</div>
        <div class="foot">Simulated: no live model runs in this prototype. In production both models sit behind the same PNC gateway, schema and guardrails.</div></div>`;
    const body = document.getElementById("ask-body"); if (body) body.scrollTop = body.scrollHeight;
  }
  function runAsk(i) {
    const v = viewer() || "alex", item = S.ask[v][i]; if (!item || ask.busy) return;
    ask.busy = true;
    const m = { role: "ai", tools: item.tools, shownTools: 0, shown: "", done: false, card: item.card, model: state.model };
    ask.convo.push({ role: "user", text: item.q }, m); renderSheet();
    let k = 0;
    const tick = () => {
      if (m.shownTools < m.tools.length) { m.shownTools++; renderSheet(); return setTimeout(tick, 380); }
      const full = item.a[m.model];
      if (k < full.length) { k = Math.min(full.length, k + 4); m.shown = full.slice(0, k); renderSheet(); return setTimeout(tick, 16); }
      m.done = true; ask.busy = false; renderSheet();
    };
    setTimeout(tick, 300);
  }

  // ---------- router ----------
  function render() {
    route = location.hash.replace(/^#\/?/, "");
    const v = viewer();
    let html;
    if (route.startsWith("story/")) html = story(route.split("/")[1]);
    else if (v === "alex") html = ({ "advisor": advHome, "advisor/align": advAlign, "advisor/docs": advDocs, "advisor/plan": advPlan }[route] || advHome)();
    else if (v && P[v]) { const sub = route.split("/")[2]; html = sub === "checkin" ? checkin(v) : sub === "options" ? options(v) : sub === "plan" ? famPlan(v) : memberHome(v); }
    else html = picker();
    document.body.classList.toggle("story", route.startsWith("story/"));
    app.innerHTML = route.startsWith("story/") ? html : bar() + html + bnav();
    renderSheet();
  }

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, id = el.dataset.id;
    if (a === "detail") set({ detail: state.detail === "plain" ? "detail" : "plain" });
    else if (a === "start") set({ started: true });
    else if (a === "share" && !state.shared.includes(id)) set({ shared: [...state.shared, id] });
    else if (a === "private") set({ shared: state.shared.filter(x => x !== id) });
    else if (a === "approve") set({ approved: true });
    else if (a === "unapprove") set({ approved: false });
    else if (a === "route") set({ routed: Object.assign({}, state.routed, { [id]: true }) });
    else if (a === "notify") set({ notified: true });
    else if (a === "pick") set({ picked: true });
    else if (a === "agree") set({ agreed: Object.assign({}, state.agreed, { [id]: true }) });
    else if (a === "remind") { el.textContent = "Sent"; el.disabled = true; }
    else if (a === "ask-open") { ask.open = true; renderSheet(); }
    else if (a === "ask-close") { ask.open = false; renderSheet(); }
    else if (a === "model") { state.model = id; save(); renderSheet(); }
    else if (a === "ask") runAsk(+id);
  });
  document.addEventListener("input", e => {
    const el = e.target;
    if (el.dataset.act === "weight") {
      state.weight = +el.value; save();
      const q = sel => document.querySelector(sel), v = viewer();
      if (q("[data-split]")) q("[data-split]").innerHTML = splitBars(state.weight);
      if (q("[data-sentence]")) q("[data-sentence]").textContent = sentenceFor(state.weight);
      if (q("[data-wlabel]")) q("[data-wlabel]").textContent = state.weight + "%";
      if (q("[data-you]") && KIDS.includes(v)) q("[data-you]").textContent = money(gifts(state.weight / 100)[v]);
      el.setAttribute("aria-valuetext", state.weight + "%");
    }
    if (el.dataset.live) {
      const box = document.querySelector(`[data-tags="${el.dataset.live}"]`);
      if (el.dataset.live !== "intro") state.answers[el.dataset.live] = el.value;
      if (box) box.innerHTML = `<span class="reading">${icon("spark", 13)} AI is reading…</span>`;
      clearTimeout(el._t); el._t = setTimeout(() => { if (box) box.innerHTML = tagHtml(el.value); save(); }, 450);
    }
  });
  document.addEventListener("change", e => { if (e.target.dataset.act === "trust") set({ trust: e.target.checked }); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && ask.open) { ask.open = false; renderSheet(); } });
  window.addEventListener("hashchange", () => { ask.open = false; ask.convo = []; render(); window.scrollTo(0, 0); });
  window.FT = { reset() { state = fresh(); save(); render(); }, state: () => state, ask: i => { ask.open = true; runAsk(i); } };
  render();
})();
