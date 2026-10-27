// Family Table prototype. Hash routes, no build step, mobile-first.
(function () {
  const S = window.SEED;
  const P = Object.fromEntries(S.people.map(p => [p.id, p]));
  const KIDS = ["dale", "kyle", "ross", "sloane"];
  const PRESETS = [["Equal", 0], ["Balanced", 50], ["Equity counted", 100]];
  const app = document.getElementById("app");
  const sheetRoot = document.getElementById("sheet-root");

  // ---------- state ----------
  const KEY = "family-table-v5";
  const fresh = () => ({ model: "claude", shared: [], optOut: false, approved: false, started: false, routed: {}, notified: false,
    weight: 50, trust: false, proposed: false, agreed: {}, answers: {}, intro: {} });
  let state = fresh();
  try {
    if (new URLSearchParams(location.search).has("reset")) localStorage.removeItem(KEY);
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved) state = Object.assign(fresh(), saved);
  } catch (e) { /* storage blocked: keep in-memory state */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
  const set = patch => { Object.assign(state, patch); save(); render(); };
  let sheet = { kind: null, convo: [], busy: false };

  // ---------- helpers ----------
  const money = v => "$" + v.toFixed(1) + "M";
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const MIN_GROUP = 3; // the family summary appears only when at least this many members contribute
  // Themes that feed the advisor's anonymous summary: only members who agreed to contribute.
  const summaryThemes = () => S.themes.map(th => ({ ...th, s: Object.fromEntries(Object.entries(th.s).filter(([k]) => !(k === "sloane" && state.optOut))) }));
  const contributors = () => S.people.filter(p => p.status === "checked" && !(p.id === "sloane" && state.optOut)).length;
  const claimants = () => S.claims.filter(id => !(id === "sloane" && state.optOut));
  const numWord = n => ["No", "One", "Two", "Three", "Four", "Five"][n] || String(n);
  const ini = p => p.name.split(" ").map(x => x[0]).join("");
  const av = (p, s = 40) => `<span class="av" style="background:${p.color};width:${s}px;height:${s}px;font-size:${Math.round(s / 2.9)}px">${ini(p)}</span>`;
  const gap = th => { const v = Object.values(th.s); return (Math.max(...v) - Math.min(...v)) / 4; };
  const net = () => { const d = S.deal; return d.offer - d.earnout - d.debt - d.fees - d.tax; };
  // Deterministic gift split: count w (0..1) of the equity each child keeps with the buyer, so totals even out.
  const gifts = w => {
    const pot = S.deal.buckets.find(b => b.id === "gift").value, R = S.deal.rollover;
    const eq = KIDS.reduce((s, k) => s + (R[k] || 0), 0), target = (pot + w * eq) / KIDS.length;
    return Object.fromEntries(KIDS.map(k => [k, target - w * (R[k] || 0)]));
  };
  const presetName = () => (PRESETS.find(p => p[1] === state.weight) || ["Custom"])[0];
  const heirs = () => S.people.filter(p => p.gen === 2 && p.pnc.startsWith("None"));

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
    search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM20 20l-4.8-4.8',
    chev: 'M9 5l7 7-7 7',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    x: 'M6 6l12 12M18 6 6 18',
    alert: 'M12 3 2 20h20zM12 10v4M12 17v.5',
    sort: 'M7 4v16M3.5 16.5 7 20l3.5-3.5M17 20V4M13.5 7.5 17 4l3.5 3.5',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z',
  };
  const ic = (k, s = 20, w = 1.8) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${I[k]}"/></svg>`;
  const chev = `<span class="chev">${ic("chev", 18)}</span>`;

  // ---------- visualisations ----------
  function lineChart(data, { w = 640, h = 170, color = "#EF6A00" } = {}) {
    const step = w / (data.length - 1), y = v => h - 8 - (v / 100) * (h - 16);
    const pts = data.map((v, i) => [i * step, y(v)]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
    const last = pts[pts.length - 1];
    return `<svg class="viz" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Sale likelihood over 12 months, now ${data[data.length - 1]}">
      <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".18"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <line x1="0" x2="${w}" y1="${y(50)}" y2="${y(50)}" stroke="#E6E8EC" stroke-dasharray="3 4"/>
      <path class="area" d="${d} L${w} ${h} L0 ${h} Z" fill="url(#lg)"/>
      <path class="draw" pathLength="1" d="${d}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>
      <circle class="end-dot" cx="${last[0] - 5}" cy="${last[1]}" r="5" fill="${color}" stroke="#fff" stroke-width="2"/></svg>`;
  }
  function spark(data, color) {
    const w = 72, h = 28, step = w / (data.length - 1), mn = Math.min(...data), mx = Math.max(...data);
    const d = data.map((v, i) => (i ? "L" : "M") + (i * step).toFixed(1) + " " + (h - 3 - (v - mn) / ((mx - mn) || 1) * (h - 6)).toFixed(1)).join(" ");
    return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"/></svg>`;
  }
  function familyTable(size = 280) {
    const n = S.people.length, c = 160, R = 116, done = S.people.filter(p => p.status === "checked").length;
    const seats = S.people.map((p, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n, x = c + R * Math.cos(a), y = c + R * Math.sin(a);
      const ring = p.status === "checked" ? `stroke="#2E7D32" stroke-width="3"` : `stroke="#A9AFB8" stroke-width="2.5" stroke-dasharray="4 3"`;
      const pnc = !p.pnc.startsWith("None"), ly = y + (Math.sin(a) > 0.3 ? 40 : -33);
      return `<g class="seat-g" style="--i:${i}"><circle cx="${x}" cy="${y}" r="27" fill="#fff" ${ring}/><circle cx="${x}" cy="${y}" r="21" fill="${p.color}"/>
        <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="13.5" font-weight="700" fill="#fff">${ini(p)}</text>
        ${pnc ? `<circle cx="${x + 19}" cy="${y - 19}" r="6.5" fill="#10214D" stroke="#fff" stroke-width="2"/>` : ""}
        <text x="${x}" y="${ly}" text-anchor="middle" font-size="13.5" fill="#1F2430" font-weight="600">${p.short}</text></g>`;
    }).join("");
    return `<svg class="viz" viewBox="-20 -12 360 352" style="max-width:${size}px" role="img" aria-label="${done} of ${n} family members have checked in">
      <circle cx="${c}" cy="${c}" r="72" fill="#F4F5F7"/>
      <text x="${c}" y="${c + 2}" text-anchor="middle" font-size="34" font-weight="600" fill="#10214D">${done}/${n}</text>
      <text x="${c}" y="${c + 22}" text-anchor="middle" font-size="12.5" fill="#5E646E">checked in</text>${seats}</svg>`;
  }
  const tableLegend = () => `<div class="legend"><span><span class="ring" style="border:2.5px solid #2E7D32"></span>Checked in</span><span><span class="ring" style="border:2px dashed #A9AFB8"></span>Invited</span><span><span class="ring" style="background:#10214D"></span>PNC client</span></div>`;

  function trip() {
    const tl = S.deal.timeline, cur = tl.findIndex(s => s.now);
    return `<div class="trip" aria-label="Sale progress"><div class="bars">${tl.map((s, i) => `<i class="${i < cur ? "done" : i === cur ? "now" : ""}"></i>`).join("")}</div>
      <div class="now-line"><b>Buyer is reviewing the books</b><span>Closing · Mar</span></div>
      <div class="steps">${["Offer", "Review", "Closing", "Earnout"].map((l, i) => `<span class="${i === cur ? "cur" : ""}">${l}</span>`).join("")}</div></div>`;
  }
  function waterfall() {
    const d = S.deal, cash = d.offer - d.earnout, n = net(), sc = v => (v / d.offer * 100).toFixed(2) + "%";
    const r = (label, cls, left, w, val) => `<div class="r ${cls}"><span>${label}</span><b>${val}</b><div class="track"><i style="left:${sc(left)};width:${sc(w)}"></i></div></div>`;
    return `<div class="wf">${r("Offer from NorthPeak", "", 0, d.offer, money(d.offer))}${r("Earnout, paid later if targets are met", "cont", cash, d.earnout, "−" + money(d.earnout))}${r("Company debt", "minus", cash - d.debt, d.debt, "−" + money(d.debt))}${r("Deal fees", "minus", cash - d.debt - d.fees, d.fees, "−" + money(d.fees))}${r("Estimated tax", "minus", n, d.tax, "−" + money(d.tax))}${r("At closing", "net", 0, n, money(n))}</div>`;
  }
  function spread(th) {
    const v = Object.values(th.s), lo = Math.min(...v), hi = Math.max(...v), pos = x => (x + 2) / 4 * 100;
    return `<div class="spread" aria-hidden="true"><div class="axis"></div><div class="range" style="left:${pos(lo)}%;width:${Math.max(pos(hi) - pos(lo), 3)}%"></div></div>`;
  }
  function siblings() {
    const g = gifts(state.weight / 100);
    return `<div class="rows">${KIDS.map(k => `<div class="row" data-kid="${k}">${av(P[k], 36)}<div class="tx"><b>${P[k].short}</b><div class="bar" style="margin-top:6px"><i style="width:${g[k] / 4 * 100}%;background:${P[k].color}"></i></div></div><div class="rt">${money(g[k])}</div></div>`).join("")}</div>`;
  }

  // ---------- app shell ----------
  let route = "";
  const viewer = () => { const m = route.match(/^me\/(\w+)/); return m ? m[1] : route.startsWith("advisor") ? "alex" : null; };
  const mark = `<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16" cy="16" r="5" fill="#EF6A00"/><circle cx="16" cy="5" r="2.4" fill="#fff"/><circle cx="26" cy="20" r="2.4" fill="#fff"/><circle cx="6" cy="20" r="2.4" fill="#fff"/></svg>`;
  function nav() {
    const v = viewer();
    return v === "alex"
      ? [["advisor", "Home", "home"], ["advisor/align", "Alignment", "users"], ["advisor/docs", "Documents", "doc"], ["advisor/plan", "Plan", "flag"]]
      : v ? [[`me/${v}`, "Home", "home"], [`me/${v}/checkin`, "Check-in", "chat"], [`me/${v}/options`, "Options", "scale"], [`me/${v}/plan`, "Plan", "flag"]] : [];
  }
  function appbar() {
    const v = viewer(), who = v === "alex" ? `Alex Lee<span class="av" style="background:#EF6A00">AL</span>` : v ? `${P[v].short}${av(P[v], 28)}` : "Switch person";
    return `<header class="appbar"><div class="in"><a class="brand" href="#/">${mark}Family Table <small>PNC Private Bank</small></a>
      <nav class="tabs" aria-label="Sections">${nav().map(([h, l]) => `<a href="#/${h}" class="${route === h ? "on" : ""}">${l}</a>`).join("")}</nav>
      <a class="me" href="#/" aria-label="Switch person">${who}</a></div></header>`;
  }
  const bnav = () => nav().length ? `<nav class="bnav" aria-label="Sections">${nav().map(([h, l, i]) => `<a href="#/${h}" class="${route === h ? "on" : ""}">${ic(i, 22)}${l}</a>`).join("")}</nav>` : "";
  const askbar = (label = "Ask about the sale") => `<button class="askbar" data-act="ask-open">${ic("search", 20, 2)}${label}<span class="kbd">CLAUDE · GPT</span></button>`;
  const seg = () => `<div class="seg" role="group" aria-label="Split">${PRESETS.map(([l, w]) => `<button class="${state.weight === w ? "on" : ""}" data-act="preset" data-id="${w}" aria-pressed="${state.weight === w}">${l}</button>`).join("")}</div>`;

  // ---------- picker ----------
  function picker() {
    return `<section class="splash"><div class="in"><h1>See one family sale through seven pairs of eyes.</h1>
      <p>The Hales are selling Hale Freight for $48M. Each family member is modelled on a character from HBO's Succession. Choose a person; the app adapts to them.</p></div></section>
      <div class="page"><div class="section"><div class="section-head"><h2>PNC</h2></div>
        <div class="rows"><a class="row" href="#/advisor"><span class="av" style="background:#EF6A00">AL</span><div class="tx"><b>Alex Lee</b><span>Private Business Strategist</span><em>Sees signals, gaps and documents across the family</em></div>${chev}</a></div></div>
      <div class="section"><div class="section-head"><h2>The Hale family</h2><span class="aside">Fictional</span></div>
        <div class="rows people">${S.people.map(p => `<a class="row" href="#/me/${p.id}">${av(p)}<div class="tx"><b>${p.name}</b><span>${p.role}</span><em>The ${p.archetype.split(" ")[0]} · ${p.pattern}</em></div>${chev}</a>`).join("")}</div></div>
      <p class="micro faint" style="margin-top:20px">All people, firms and figures are fictional. Succession references are commentary. <a href="?reset#/">Reset demo</a> · <a href="../">About this project</a></p></div>`;
  }

  // ---------- family: home ----------
  function rowFor(id, pid) {
    const p = P[pid], done = p.status === "checked";
    const R = {
      meeting: ["cal", "", "Family meeting", "Thu, Nov 12 · Hawthorn facilitator", `<span class="badge g">Booked</span>`, `me/${pid}/plan`],
      checkin: ["lock", done ? "g" : "o", "Your check-in", done ? (pid === "sloane" ? `Complete · ${state.shared.length} of 3 answers shared` : "Complete") : "Not started · about 10 minutes", done ? "" : `<span class="badge o">To do</span>`, `me/${pid}/checkin`],
      options: ["scale", "", "Compare gift options", `${money(12)} split across four children`, "", `me/${pid}/options`],
      role: ["brief", pid === "ross" ? "o" : "", "Your role after the sale", pid === "kyle" ? "COO for 2 years · $1.5M equity in NorthPeak" : "No role named in the offer yet", pid === "ross" ? `<span class="badge o">Raise it</span>` : "", `me/${pid}/plan`],
      account: ["bank", "", "Set up an account for your gift", "Any bank · PNC can open one in minutes", "", `me/${pid}/plan`],
      nextchapter: ["compass", "p", "Plan your next chapter", "Owners who plan life after a sale regret it less", "", `me/${pid}/plan`],
      contingency: ["shield", "", "If Walt can't continue", "Signed plan on file · Oct 20", "", `me/${pid}/plan`],
    }[id];
    if (!R) return "";
    return `<a class="row" href="#/${R[5]}"><span class="ic ${R[1]}">${ic(R[0])}</span><div class="tx"><b>${R[2]}</b><span>${R[3]}</span></div>${R[4]}${chev}</a>`;
  }
  const ORDER = {
    walt: ["nextchapter", "meeting", "contingency", "options", "checkin"],
    marisa: ["checkin", "contingency", "meeting"],
    dale: ["options", "account", "meeting", "checkin"],
    kyle: ["role", "meeting", "options", "checkin"],
    ross: ["role", "options", "meeting", "checkin"],
    sloane: ["meeting", "checkin", "options", "account"],
  };
  function heroFor(pid) {
    if (pid === "walt") return `<div class="label">What you keep at closing</div><div class="value" data-count="${net()}" data-fmt="m">${money(net())}</div><div class="caption">After debt, fees and estimated tax. The $8.0M earnout is paid later, if targets are met.</div>`;
    if (pid === "marisa") return `<div class="label">Set aside for you and Walt</div><div class="value" data-count="9" data-fmt="m">${money(9)}</div><div class="caption">Part of the ${money(net())} Walt keeps at closing.</div>`;
    return `<div class="label">Your share of the family gift</div><div class="value" data-mine data-count="${gifts(state.weight / 100)[pid]}" data-fmt="m">${money(gifts(state.weight / 100)[pid])}</div><div class="caption">At closing, expected in March · <span data-preset>${presetName()}</span> split</div>${seg()}`;
  }
  function memberHome(pid) {
    const p = P[pid], kid = KIDS.includes(pid);
    const alert = state.notified && kid ? `<div class="alert">${ic("alert", 20)}<div><b>A 1998 agreement may affect you</b><span>Counsel's summary: it may require all four children to agree to a sale. Final advice comes from your own attorney.</span></div></div>` : "";
    const side = kid
      ? `<div class="panel"><div class="section-head"><h2>Your family</h2><span class="aside">5 of 6 checked in</span></div><div class="table-viz">${familyTable(260)}</div>${tableLegend()}</div>
         <div class="panel"><div class="section-head"><h2>Split preview</h2><span class="aside" data-preset>${presetName()}</span></div><div data-sibs>${siblings()}</div></div>`
      : `<div class="panel"><div class="section-head"><h2>Breakdown</h2></div>${waterfall()}</div>
         <div class="panel"><div class="section-head"><h2>How it's allocated</h2></div><div class="alloc">${S.deal.buckets.map(b => `<i style="width:${b.value / net() * 100}%;background:${b.color}"></i>`).join("")}</div>
         <div class="rows" style="margin-top:6px">${S.deal.buckets.map(b => `<div class="row"><span class="dot" style="background:${b.color}"></span><div class="tx"><b>${b.label}</b><span>${b.detail}</span></div><div class="rt">${money(b.value)}</div></div>`).join("")}</div></div>`;
    return `<div class="page"><div class="cols"><div class="col-main">
        <section class="hero"><div class="hello">Hi, ${p.short}</div>${heroFor(pid)}${trip()}</section>
        ${askbar()}${alert}
        <section class="section"><div class="section-head"><h2>Up next</h2><button class="aside" data-act="why">${ic("sort", 15)} Sorted for you</button></div>
          <div class="rows">${ORDER[pid].map(id => rowFor(id, pid)).join("")}</div></section>
      </div><aside class="col-side">${side}</aside></div></div>`;
  }

  // ---------- family: check-in ----------
  const RULES = [
    { re: /(run things|lead|in charge|ceo|be the one|next in line|take over)/i, tag: "Leadership" },
    { re: /(just the two of us|privately|don'?t think .{0,24}knows|secret|promised|told me)/i, tag: "Private promise", flag: true },
    { re: /(equal|fair|same share)/i, tag: "Fairness" },
    { re: /(salar|stock|equity)/i, tag: "Buyer equity" },
    { re: /(nothing to do|project|bored|purpose|retire|scared he)/i, tag: "Walt's next chapter" },
    { re: /(cash|money|when .{0,10}get|paid)/i, tag: "Cash timing" },
  ];
  const tagsFor = txt => RULES.filter(r => r.re.test(txt));
  const themesHtml = txt => { const t = tagsFor(txt); return `<span class="lab">Themes detected</span>` + (t.length ? t.map(r => `<span class="theme ${r.flag ? "flag" : ""}">${r.tag}</span>`).join("") : `<span class="faint">None yet</span>`); };
  function checkin(pid) {
    const p = P[pid];
    const head = `<section class="hero"><div class="label">${ic("lock", 15)} Private to you</div><h1 style="font-size:32px;font-weight:600;color:var(--navy);margin-top:4px">Your check-in</h1>
      <div class="caption">Your family never sees your answers. Alex sees the themes, and an answer only if you share it.</div></section>`;
    if (pid !== "sloane") {
      const word = v => ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"][v + 2];
      const mine = S.themes.filter(th => th.s[pid] !== undefined);
      return `<div class="page"><div class="cols"><div class="col-main">${head}
        <section class="section"><div class="section-head"><h2>${p.status === "checked" ? "Your answers, as themes" : "Start your check-in"}</h2><span class="aside">${p.status === "checked" ? "Submitted Oct 22" : "About 10 minutes"}</span></div>
        ${p.status === "checked" ? `<div class="rows">${mine.map(th => `<div class="row"><div class="tx"><b>${th.label}</b><span>${word(th.s[pid])}</span></div></div>`).join("")}</div><p class="micro faint" style="margin-top:8px">Themes were picked out of your words. If one looks wrong, tell Alex and it will be corrected before the meeting.</p>`
          : `<div class="q"><h3>What matters most to you as Walt sells the company?</h3><textarea data-live="intro" placeholder="Write it the way you'd say it."></textarea><div class="themes" data-tags="intro">${themesHtml("")}</div></div>`}</section>
        </div><aside class="col-side"><div class="panel"><div class="section-head"><h2>What Alex sees</h2></div><p class="small muted">How far apart the family's answers are. No names, no words, and only when at least ${MIN_GROUP} people contribute.</p>
          ${summaryThemes().slice(0, 3).map(th => `<div class="gap-row ${gap(th) >= 0.75 ? "high" : ""}"><span>${th.short}</span>${spread(th)}<b>${gap(th).toFixed(2)}</b></div>`).join("")}</div></aside></div></div>`;
    }
    const qs = S.checkin.sloane.map((q, i) => {
      const on = state.shared.includes(q.id), txt = state.answers[q.id] ?? q.a;
      return `<div class="q" data-q="${q.id}"><h3>${i + 1}. ${q.q}</h3>
        <textarea data-live="${q.id}" aria-label="${q.q}">${esc(txt)}</textarea>
        <div class="themes" data-tags="${q.id}">${themesHtml(txt)}</div>
        <div class="switch-row"><div class="tx"><b>Share this answer with Alex</b><span>${on ? "Alex can read your words. Your family can't." : state.optOut ? "Private. Not used anywhere." : "Private. Counted, without your name, in the family summary."}</span></div>
          <button class="switch" role="switch" aria-checked="${on}" aria-label="Share answer ${i + 1} with Alex" data-act="toggle-share" data-id="${q.id}"></button></div></div>`;
    }).join("");
    const summary = `<div class="switch-row" style="margin-top:20px;padding:14px 16px;background:var(--surface);border-radius:var(--r)"><div class="tx"><b>Include my themes in the family summary</b><span>Alex sees how far apart the family is on each topic, never who said what. Shown only when ${MIN_GROUP}+ people take part.</span></div>
        <button class="switch" role="switch" aria-checked="${!state.optOut}" aria-label="Include my themes in the family summary" data-act="toggle-summary"></button></div>`;
    return `<div class="page"><div class="cols"><div class="col-main">${head}${summary}<section class="section">${qs}</section></div>
      <aside class="col-side"><div class="panel"><div class="section-head"><h2>Preview: what Alex sees</h2></div>
        ${S.checkin.sloane.map((q, i) => state.shared.includes(q.id) ? `<div class="quote"><small>Answer ${i + 1} · shared</small>“${esc(state.answers[q.id] ?? q.a)}”</div>` : `<div class="sealed">${ic("lock", 16)}<span>Answer ${i + 1} · private</span></div>`).join("")}
        <p class="micro faint" style="margin-top:10px">${state.optOut ? "Your themes are not in the family summary." : "Your themes count toward the family summary, without your name."}</p>
      </div></aside></div></div>`;
  }

  // ---------- family: options ----------
  function sentenceFor(w) {
    return w === 0 ? "Each child receives the same amount. The equity Kyle and Ross keep with the buyer isn't counted."
      : w === 100 ? "The equity Kyle ($1.5M) and Ross ($0.5M) keep with the buyer is fully counted, so Dale and Sloane receive more cash to even out totals."
      : `${w}% of the equity Kyle and Ross keep with the buyer is counted, which narrows the gap between siblings.`;
  }
  function options(pid) {
    const kid = KIDS.includes(pid);
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero"><div class="label">${kid ? "Your share" : "Family gift"}</div><div class="value" ${kid ? "data-mine" : ""} data-count="${kid ? gifts(state.weight / 100)[pid] : 12}" data-fmt="m">${kid ? money(gifts(state.weight / 100)[pid]) : money(12)}</div>
        <div class="caption">${kid ? `${state.trust ? "Released over 10 years" : "At closing"} · <span data-preset>${presetName()}</span> split` : "Split across Dale, Kyle, Ross and Sloane"}</div>${seg()}</section>
      <section class="section"><div class="section-head"><h2>Fine-tune</h2><span class="aside" data-wlabel>${state.weight}% of buyer equity counted</span></div>
        <input type="range" min="0" max="100" step="5" value="${state.weight}" data-act="weight" aria-label="Share of buyer equity counted"><div class="range-ends"><span>Equal</span><span>Fully counted</span></div>
        <div data-sibs style="margin-top:6px">${siblings()}</div>
        <div class="switch-row" style="margin-top:4px"><div class="tx"><b>Pay through a family trust</b><span>Released over 10 years; can help protect the gift in a divorce or creditor claim</span></div><button class="switch" role="switch" aria-checked="${state.trust}" aria-label="Pay through a family trust" data-act="trust"></button></div>
        <div class="note-box"><span data-sentence>${sentenceFor(state.weight)}</span>${state.trust ? " A trust can add protection, but Dale and Sloane may read staging as a lack of trust. A trust specialist confirms terms." : ""}<small>Amounts from PNC's calculator. Explanation drafted by a language model and reviewed by Alex.</small></div>
        <div class="sticky-cta">${state.proposed ? `<button class="btn done block" disabled>${ic("check", 18, 2.4)} Proposed for the Nov 12 meeting</button>` : `<button class="btn block" data-act="propose">Propose for the Nov 12 meeting</button>`}</div></section>
      </div><aside class="col-side"><div class="panel"><div class="section-head"><h2>Why this is hard</h2></div><p class="small muted">Children in the business feel their years should count. Children outside it worry they'll be left behind. Both are reasonable, which is why the family decides together.</p></div></aside></div></div>`;
  }

  // ---------- family: plan ----------
  const STEPS = { walt: "Sign a dated successor decision to replace the desk note", marisa: "Complete your check-in, then an estate review with Alex", dale: "Choose where your gift should be paid", kyle: "Review your COO contract with business banking", ross: "Ask for a named role before the offer is signed", sloane: "Decide whether to share answer 1 before Nov 12" };
  function famPlan(pid) {
    const agreed = state.agreed[pid];
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero"><div class="label">Your next step</div><h1 style="font-size:28px;font-weight:600;color:var(--navy);line-height:1.2;margin-top:4px">${STEPS[pid]}</h1>
        <div style="margin-top:18px">${agreed ? `<button class="btn done block" disabled>${ic("check", 18, 2.4)} You agreed to the plan in principle</button>` : `<button class="btn block" data-act="agree" data-id="${pid}">Agree to the plan in principle</button>`}</div></section>
      <section class="section"><div class="section-head"><h2>Everyone's next step</h2></div><div class="rows">${S.people.filter(x => x.id !== pid).map(x => `<div class="row">${av(x, 36)}<div class="tx"><b>${x.short}</b><span>${STEPS[x.id]}</span></div>${state.agreed[x.id] ? `<span class="badge g">Agreed</span>` : ""}</div>`).join("")}</div></section>
      </div><aside class="col-side"><div class="panel"><div class="section-head"><h2>If Walt can't continue</h2><span class="badge g">Signed</span></div><p class="small muted" style="margin-top:6px">${S.contingency}</p></div>
        <div class="panel"><div class="section-head"><h2>Where the sale is</h2></div>${trip()}</div></aside></div></div>`;
  }

  // ---------- advisor ----------
  function advHome() {
    const s = S.signal, list = [{ client: "Hale Freight", note: "Walt Hale · 6 family members", score: s.score, change: s.change, history: s.history }, ...s.others];
    const watch = list.map(c => `<a class="row" href="#/advisor"><div class="tx"><b>${c.client}</b><span>${c.note}</span></div>${spark(c.history, c.change > 0 ? "#EF6A00" : "#2E7D32")}<div class="rt">${c.score}<small style="color:${c.change > 0 ? "var(--orange-700)" : "var(--pos)"}">${c.change > 0 ? "▲" : "▼"} ${Math.abs(c.change)}</small></div></a>`).join("");
    const attention = [
      ["r", "doc", "A 1998 agreement may let any child block the sale", "Document AI · 93% confidence", "advisor/docs"],
      ["o", "users", `${numWord(claimants().length)} family members expect to lead`, `Anonymous family summary · ${contributors()} contributors`, "advisor/align"],
      ["", "chat", "Marisa hasn't checked in", "Invited Oct 20", "advisor/align"],
      ["g", "cal", "Family meeting booked", "Thu, Nov 12 · Hawthorn facilitator", "advisor/plan"],
    ].map(([c, i, t, s2, h]) => `<a class="row" href="#/${h}"><span class="ic ${c}">${ic(i)}</span><div class="tx"><b>${t}</b><span>${s2}</span></div>${chev}</a>`).join("");
    return `<div class="page"><div class="cols wide-side">
      <aside class="col-side"><div class="section-head"><h2>Watchlist</h2><span class="aside">Sale likelihood</span></div><div class="rows">${watch}</div></aside>
      <div class="col-main">
        <section class="hero"><div class="label">Hale Freight · sale likelihood</div><div class="value"><span data-count="${s.score}" data-fmt="i">${s.score}</span><span class="unit">/ 100</span></div>
          <div class="delta up">▲ ${s.change} this month</div><div class="caption">Likely sale in ${s.horizon}, based on activity in the company's PNC accounts.</div>
          <div class="chart">${lineChart(s.history)}<div class="chart-x"><span>Nov</span><span>Feb</span><span>May</span><span>Aug</span><span>Oct</span></div></div></section>
        <section class="section"><div class="section-head"><h2>What's driving it</h2><span class="aside">Share of score</span></div>
          <div class="rows">${s.reasons.map(r => `<div class="row"><div class="tx"><b style="font-weight:500">${r.text}</b></div><div class="bar weight"><i style="width:${r.weight / 0.36 * 100}%;background:var(--orange)"></i></div><div class="rt" style="width:40px">${Math.round(r.weight * 100)}%</div></div>`).join("")}</div>
          <div style="margin-top:14px">${state.started ? `<button class="btn done" disabled>${ic("check", 18, 2.4)} Called Walt · Oct 15</button>` : `<button class="btn" data-act="start">${ic("phone", 18)} Call Walt</button>`}</div></section>
        <div class="cols" style="margin-top:8px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px">
          <section class="section"><div class="section-head"><h2>Needs your attention</h2></div><div class="rows">${attention}</div></section>
          <section class="section"><div class="section-head"><h2>The Hale family</h2><span class="aside">${heirs().length} of 4 children bank elsewhere</span></div><div class="table-viz">${familyTable(260)}</div>${tableLegend()}</section>
        </div>
        ${askbar("Ask about the Hale family")}
      </div></div></div>`;
  }

  function advAlign() {
    const named = state.shared.includes("q1"), n = contributors(), cl = claimants();
    if (n < MIN_GROUP) return `<div class="page"><section class="hero"><div class="label">Hale family · alignment</div><div class="value">Not enough answers</div><div class="caption">The family summary appears when at least ${MIN_GROUP} members contribute.</div></section></div>`;
    const rows = summaryThemes().map(th => ({ th, g: gap(th) })).sort((a, b) => b.g - a.g).map(({ th, g }) => `<div class="gap-row ${g >= 0.75 ? "high" : ""}"><span>${th.label}</span>${spread(th)}<b>${g.toFixed(2)}</b></div>`).join("");
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero"><div class="label">Hale family · leadership after the sale</div><div class="value">${cl.length} of ${n}<span class="unit">expect to lead</span></div>
        <div class="caption">${named ? `Sloane shared that Walt promised her the role in private. The others remain anonymous.` : `From the anonymous summary of ${n} members who agreed to contribute. No names unless someone shares.`}</div>
        <div class="claim"><div class="seat">Leads<br>after sale</div><div class="claimants">${cl.map(id => named && id === "sloane" ? `<span class="claimant" style="background:${P.sloane.color}">S</span>` : `<span class="claimant" aria-label="Anonymous">?</span>`).join("")}</div></div></section>
      <section class="section"><div class="section-head"><h2>Where the family differs</h2><span class="aside">Gap, 0 to 1</span></div>${rows}
        <p class="micro faint" style="margin-top:8px">The bar shows how far apart answers are, with no per-person positions. Gap = spread between the furthest-apart answers, calculated by a fixed formula.</p></section>
      ${askbar("Prepare me for the family meeting")}
      </div><aside class="col-side">
        <div class="panel"><div class="section-head"><h2>Brief for Nov 12</h2>${state.approved ? `<span class="badge g">Approved</span>` : `<span class="badge p">Draft</span>`}</div>
          <div class="rows">
            <div class="row"><span class="ic">1</span><div class="tx"><b>Settle the consent clause</b><span>Until it's clear whether all four children must agree, every other topic becomes leverage.</span></div></div>
            <div class="row"><span class="ic">2</span><div class="tx"><b>Name the leadership overlap</b><span>${cl.length} people expect to lead. Present it as a pattern, not a person. Ask Walt to state what he has promised.</span></div></div>
            <div class="row"><span class="ic">3</span><div class="tx"><b>Then fairness (gap 1.00)</b><span>Bring the equal and balanced splits; let the facilitator lead.</span></div></div></div>
          <p class="micro faint">Drafted by a language model from themes and shared answers only.</p>
          <div style="margin-top:12px">${state.approved ? `<button class="btn ghost block" data-act="unapprove">Reopen draft</button>` : `<button class="btn navy block" data-act="approve">Approve brief</button>`}</div></div>
        <div class="panel"><div class="section-head"><h2>Sloane's answers</h2><span class="aside">${state.shared.length} of 3 shared</span></div>
          ${S.checkin.sloane.map((q, i) => state.shared.includes(q.id) ? `<div class="quote"><small>${q.q}</small>“${esc(state.answers[q.id] ?? q.a)}”</div>` : `<div class="sealed">${ic("lock", 16)}<span>Answer ${i + 1} · private</span></div>`).join("")}</div>
      </aside></div></div>`;
  }

  function advDocs() {
    const docs = S.docs.map(d => {
      const routed = state.routed[d.id];
      return `<div class="panel"><div class="row" style="padding:0;border:0"><span class="file ${d.type === "Scan" ? "scan" : ""}">${d.type === "Scan" ? "IMG" : "PDF"}</span><div class="tx"><b>${d.name}</b><span>${d.pages} page${d.pages > 1 ? "s" : ""}</span></div><span class="badge ${d.risk === "High" ? "r" : "o"}">${d.risk} risk</span></div>
        <p style="margin-top:14px;font-weight:600">${d.finding}</p><p class="small muted" style="margin-top:4px">${d.impact}</p>
        <div class="conf"><div class="bar"><i style="width:${d.conf * 100}%"></i></div>${Math.round(d.conf * 100)}% extraction confidence</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">${routed ? `<button class="btn done sm" disabled>${ic("check", 16, 2.4)} Sent · ${d.action}</button>` : `<button class="btn navy sm" data-act="route" data-id="${d.id}">${d.action}</button>`}
          ${d.id === "divorce" && routed ? (state.notified ? `<button class="btn done sm" disabled>${ic("check", 16, 2.4)} Counsel's summary shared</button>` : `<button class="btn sm" data-act="notify">Share counsel's summary with the children</button>`) : ""}</div></div>`;
    }).join("");
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero"><div class="label">Hale family · documents reviewed</div><div class="value">2<span class="unit">high-risk findings</span></div><div class="caption">Document AI read 3 files, 61 pages. Nothing reaches the family until you approve it.</div></section>
      <section class="section">${docs}</section></div>
      <aside class="col-side"><div class="panel"><div class="section-head"><h2>Why it matters</h2></div><p class="small muted">In Succession, a clause in an old divorce agreement decided who could block the sale, and the children learned too late. Here it surfaces months before closing.</p></div></aside></div></div>`;
  }

  function advPlan() {
    return `<div class="page"><div class="cols"><div class="col-main">
      <section class="hero"><div class="label">Next generation · not yet PNC clients</div><div class="value">$9.0–10.0M</div><div class="caption">Dale, Ross and Sloane could receive this at closing. None bank with PNC today.</div></section>
      <section class="section"><div class="section-head"><h2>Introduce PNC</h2></div><div class="rows">${heirs().map(h => `<div class="row">${av(h)}<div class="tx"><b>${h.name}</b><span>${money(gifts(state.weight / 100)[h.id])} at closing · ${h.role}</span></div>${state.intro[h.id] ? `<span class="badge g">Intro requested</span>` : `<button class="btn ghost sm" data-act="intro" data-id="${h.id}">Introduce</button>`}</div>`).join("")}</div></section>
      <section class="section"><div class="section-head"><h2>Specialist tasks</h2></div><div class="rows">${S.tasks.map(t => `<div class="row"><div class="tx"><b>${t.what}</b><span>${t.who} · due ${t.due}</span></div><span class="badge ${t.status === "Booked" ? "g" : t.status.startsWith("Waiting") ? "p" : "n"}">${t.status}</span></div>`).join("")}</div></section>
      </div><aside class="col-side">
        <div class="panel"><div class="section-head"><h2>If Walt can't continue</h2><span class="badge g">Signed</span></div><p class="small muted" style="margin-top:6px">${S.contingency}</p></div>
        <div class="panel"><div class="section-head"><h2>Decision log</h2></div><div class="rows">${[...S.ledger, ...Object.keys(state.agreed).map(id => ({ t: "Today", who: P[id].name, what: "Agreed to the plan in principle." }))].map(l => `<div class="row"><div class="tx"><b>${l.who}</b><span>${l.what}</span></div><div class="rt micro faint" style="font-weight:500">${l.t}</div></div>`).join("")}</div></div>
      </aside></div></div>`;
  }

  // ---------- story cards (video only) ----------
  function story(id) {
    const eyebrow = `<div class="eyebrow">Family Table · a PNC Private Bank concept</div>`;
    const cards = {
      hook: `${eyebrow}<h1>In Succession, Logan Roy sells the company and loses the family.</h1><p class="sub">Promises made in private. A clause no one remembered. A note in a safe. Real family businesses face the same moments.</p><div class="rule"></div>`,
      cast: `${eyebrow}<h1>Meet the Hales: a $48M freight company with the same problems.</h1><div class="cast">${S.people.filter(p => p.id !== "marisa").map(p => `<div style="--c:${p.color === "#10214D" ? "#EF6A00" : p.color}"><b>${p.name}</b><span>The ${p.archetype.split(" ")[0]} · ${p.pattern}</span></div>`).join("")}<div style="--c:#fff"><b>Alex Lee, PNC</b><span>The advisor who usually hears about it last.</span></div></div>`,
      problem: `${eyebrow}<h1>The sale is when families split and money leaves the bank.</h1><div class="stats">
        <div class="stat"><b>13%</b><p>of adult children use their parents' financial advisor.</p><small>Cerulli Associates, 2019</small></div>
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

  // ---------- sheets: assistant and "sorted for you" ----------
  const flat = inner => `<div class="mini"><div class="row" style="padding:0;border:0">${inner}</div></div>`;
  function miniCard(kind, v) {
    switch (kind) {
      case "proceeds": return `<div class="mini">${waterfall()}</div>`;
      case "mine": return `<div class="mini"><div class="small muted">Your share at closing</div><div style="font-size:32px;font-weight:600;color:var(--navy)">${money(gifts(0)[v])}–${money(gifts(1)[v]).slice(1)}</div><div class="micro faint">Equal split to equity counted</div></div>`;
      case "clause": return `<div class="mini"><div class="row" style="padding:0;border:0"><span class="file">PDF</span><div class="tx"><b>Divorce agreement, 1998</b><span>Clause 7.2 · consent of all four children</span></div></div><div class="conf"><div class="bar"><i style="width:93%"></i></div>93% confidence · attorney confirming</div></div>`;
      case "role": return v === "ross" ? flat(`<span class="ic o">${ic("brief")}</span><div class="tx"><b>Sales team retained 12 months</b><span>No role named for Ross</span></div>`) : flat(`<span class="ic">${ic("brief")}</span><div class="tx"><b>COO · 2-year contract</b><span>$1.5M equity in NorthPeak</span></div>`);
      case "meeting": return flat(`<span class="ic">${ic("cal")}</span><div class="tx"><b>Family meeting · Thu, Nov 12</b><span>Consent clause · Leadership · Fairness</span></div>`);
      case "contingency": return flat(`<span class="ic g">${ic("shield")}</span><div class="tx"><b>Contingency plan · signed Oct 20</b><span>Kyle leads 90 days; family council decides within 30</span></div>`);
      case "prep": return `<div class="mini"><div class="rows"><div class="row"><span class="ic">1</span><div class="tx"><b>Consent clause</b></div></div><div class="row"><span class="ic">2</span><div class="tx"><b>Leadership overlap</b></div></div><div class="row"><span class="ic">3</span><div class="tx"><b>Fairness</b></div></div></div></div>`;
      case "heirs": return `<div class="mini"><div class="rows">${heirs().map(h => `<div class="row">${av(h, 32)}<div class="tx"><b>${h.short}</b><span>${h.pnc}</span></div><div class="rt">${money(gifts(0)[h.id])}+</div></div>`).join("")}</div></div>`;
    }
    return "";
  }
  function renderSheet() {
    if (!sheet.kind) { sheetRoot.innerHTML = ""; return; }
    const v = viewer() || "alex";
    if (sheet.kind === "why") {
      const p = P[v];
      const top = S.themes.filter(th => th.s[v] !== undefined).sort((a, b) => Math.abs(b.s[v]) - Math.abs(a.s[v])).slice(0, 2).map(th => th.short.toLowerCase());
      sheetRoot.innerHTML = `<div class="scrim" data-act="close"></div><div class="sheet" role="dialog" aria-label="How this list is sorted"><div class="grab"></div>
        <header><h2>Sorted for ${p.short}</h2><button class="x" data-act="close" aria-label="Close">${ic("x", 18)}</button></header>
        <div class="body"><p class="muted">In this prototype, Up next follows three simple rules. Required notices always come first. A learned ranking would replace the rules only if it tests better with families.</p>
          <div class="rows" style="margin-top:8px">
            <div class="row"><span class="ic">${ic("users")}</span><div class="tx"><b>Role in the family</b><span>${p.role}</span></div></div>
            <div class="row"><span class="ic p">${ic("chat")}</span><div class="tx"><b>What ${p.short} raised in the check-in</b><span>${top.length ? top.join(", ") : "No check-in yet"}</span></div></div>
            <div class="row"><span class="ic o">${ic("flag")}</span><div class="tx"><b>Where the sale is</b><span>Buyer is reviewing the books</span></div></div></div>
          <p class="micro faint" style="margin-top:10px">Private answers are used only to rank ${p.short}'s own screen. They are never shown to anyone else.</p></div></div>`;
      return;
    }
    const qs = S.ask[v] || [];
    const qRows = () => `<div class="rows">${qs.map((q, i) => `<button class="row" data-act="ask" data-id="${i}"><span class="ic">${ic("chat", 18)}</span><div class="tx"><b style="font-weight:500">${q.q}</b></div>${chev}</button>`).join("")}</div>`;
    const convo = sheet.convo.map(m => m.role === "user" ? `<div class="msg-user"><p>${m.text}</p></div>`
      : `<div class="steps-list">${m.tools.slice(0, m.shownTools).map(([label, call]) => `<div>${ic("check", 16, 2.4)}${label}<code>${call}</code></div>`).join("")}</div>
         ${m.shown ? `<div class="answer"><span class="src">${m.model === "claude" ? "Claude" : "GPT"} · via PNC AI gateway</span>${m.shown}</div>` : ""}
         ${m.done ? miniCard(m.card, v) + `<div class="checks"><span>${ic("check", 14, 2.4)}Figures from PNC's calculator</span><span>${ic("check", 14, 2.4)}No private answers used</span><span>${ic("check", 14, 2.4)}Not legal or tax advice</span></div>` : ""}`).join("");
    sheetRoot.innerHTML = `<div class="scrim" data-act="close"></div>
      <div class="sheet" role="dialog" aria-label="Ask"><div class="grab"></div>
        <header><h2>Ask</h2><div class="model-seg" role="group" aria-label="Model"><button class="${state.model === "claude" ? "on" : ""}" data-act="model" data-id="claude">Claude</button><button class="${state.model === "gpt" ? "on" : ""}" data-act="model" data-id="gpt">GPT</button></div><button class="x" data-act="close" aria-label="Close">${ic("x", 18)}</button></header>
        <div class="body" id="ask-body">${sheet.convo.length ? convo + (sheet.busy ? "" : `<div style="margin-top:14px">${qRows()}</div>`) : `<p class="small muted">Answers draw only on what ${v === "alex" ? "your role" : "you"} can see.</p>${qRows()}`}</div>
        <div class="foot">Demo responses: no live model is connected. In production both models run behind one PNC gateway with the same output schema and guardrails.</div></div>`;
    const body = document.getElementById("ask-body"); if (body) body.scrollTop = body.scrollHeight;
  }
  function runAsk(i) {
    const v = viewer() || "alex", item = (S.ask[v] || [])[i]; if (!item || sheet.busy) return;
    sheet.busy = true;
    const m = { role: "ai", tools: item.tools, shownTools: 0, shown: "", done: false, card: item.card, model: state.model };
    sheet.convo.push({ role: "user", text: item.q }, m); renderSheet();
    let k = 0;
    const tick = () => {
      if (m.shownTools < m.tools.length) { m.shownTools++; renderSheet(); return setTimeout(tick, 420); }
      const full = item.a[m.model];
      if (k < full.length) { k = Math.min(full.length, k + 4); m.shown = full.slice(0, k); renderSheet(); return setTimeout(tick, 16); }
      m.done = true; sheet.busy = false; renderSheet();
    };
    setTimeout(tick, 300);
  }

  // ---------- router ----------
  const motionOK = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  let animTimer = 0;
  const fmtNum = (v, f) => f === "m" ? money(v) : String(Math.round(v));
  function tween(el, from, to, f, dur = 800) {
    if (!motionOK || from === to) { el.textContent = fmtNum(to, f); el._v = to; return; }
    const t0 = performance.now(); el._v = to;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmtNum(from + (to - from) * e, f); if (k < 1 && el._v === to) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  // Entrance choreography: stagger indices for lists, then count numbers up. Only on arrival, never on in-page updates.
  function enter() {
    app.querySelectorAll(".rows, .wf, .people, .stats, .cast, .claimants, .col-side").forEach(c => [...c.children].forEach((el, i) => el.style.setProperty("--i", i)));
    app.querySelectorAll("[data-count]").forEach(el => tween(el, 0, +el.dataset.count, el.dataset.fmt, 900));
    app.classList.add("anim"); clearTimeout(animTimer); animTimer = setTimeout(() => app.classList.remove("anim"), 2000);
  }
  function render(arrive) {
    route = location.hash.replace(/^#\/?/, "");
    const v = viewer();
    let html;
    if (route.startsWith("story/")) html = story(route.split("/")[1]);
    else if (v === "alex") html = ({ advisor: advHome, "advisor/align": advAlign, "advisor/docs": advDocs, "advisor/plan": advPlan }[route] || advHome)();
    else if (v && P[v]) { const sub = route.split("/")[2]; html = sub === "checkin" ? checkin(v) : sub === "options" ? options(v) : sub === "plan" ? famPlan(v) : memberHome(v); }
    else html = picker();
    document.body.classList.toggle("story", route.startsWith("story/"));
    app.innerHTML = route.startsWith("story/") ? html : appbar() + html + bnav();
    app.classList.remove("anim");
    if (arrive && motionOK) enter();
    renderSheet();
  }
  function refreshSplit() {
    const q = s => document.querySelectorAll(s), v = viewer();
    const g = gifts(state.weight / 100);
    q("[data-sibs] [data-kid]").forEach(row => { const k = row.dataset.kid, rt = row.querySelector(".rt"), from = rt._v ?? parseFloat(rt.textContent.slice(1));
      row.querySelector(".bar i").style.width = (g[k] / 4 * 100) + "%"; tween(rt, from, g[k], "m", 350); });
    q("[data-preset]").forEach(el => el.textContent = presetName());
    q("[data-sentence]").forEach(el => el.textContent = sentenceFor(state.weight));
    q("[data-wlabel]").forEach(el => el.textContent = state.weight + "% of buyer equity counted");
    if (KIDS.includes(v)) q("[data-mine]").forEach(el => { const from = el._v ?? parseFloat(el.textContent.slice(1)); tween(el, from, g[v], "m", 400); el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); });
    q(".seg button").forEach(b => { const on = +b.dataset.id === state.weight; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });
    const r = document.querySelector('input[data-act="weight"]'); if (r && +r.value !== state.weight) r.value = state.weight;
  }

  document.addEventListener("click", e => {
    const el = e.target.closest("[data-act]"); if (!el) return;
    const a = el.dataset.act, id = el.dataset.id;
    if (a === "start") set({ started: true });
    else if (a === "toggle-share") set({ shared: state.shared.includes(id) ? state.shared.filter(x => x !== id) : [...state.shared, id] });
    else if (a === "approve") set({ approved: true });
    else if (a === "unapprove") set({ approved: false });
    else if (a === "route") set({ routed: Object.assign({}, state.routed, { [id]: true }) });
    else if (a === "notify") set({ notified: true });
    else if (a === "propose") set({ proposed: true });
    else if (a === "trust") set({ trust: !state.trust });
    else if (a === "toggle-summary") set({ optOut: !state.optOut });
    else if (a === "intro") set({ intro: Object.assign({}, state.intro, { [id]: true }) });
    else if (a === "agree") set({ agreed: Object.assign({}, state.agreed, { [id]: true }) });
    else if (a === "preset") { state.weight = +id; save(); refreshSplit(); }
    else if (a === "ask-open") { sheet = { kind: "ask", convo: [], busy: false }; renderSheet(); }
    else if (a === "why") { sheet = { kind: "why", convo: [], busy: false }; renderSheet(); }
    else if (a === "close") { sheet.kind = null; renderSheet(); }
    else if (a === "model") { state.model = id; save(); renderSheet(); }
    else if (a === "ask") runAsk(+id);
  });
  document.addEventListener("input", e => {
    const el = e.target;
    if (el.dataset.act === "weight") { state.weight = +el.value; save(); refreshSplit(); }
    if (el.dataset.live) {
      const box = document.querySelector(`[data-tags="${el.dataset.live}"]`);
      if (el.dataset.live !== "intro") state.answers[el.dataset.live] = el.value;
      if (box) box.innerHTML = `<span class="lab">Analyzing…</span>`;
      clearTimeout(el._t); el._t = setTimeout(() => { if (box) box.innerHTML = themesHtml(el.value); save(); }, 450);
    }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && sheet.kind) { sheet.kind = null; renderSheet(); } });
  window.addEventListener("hashchange", () => {
    sheet.kind = null;
    const go = () => { render(true); window.scrollTo(0, 0); };
    if (motionOK && document.startViewTransition) document.startViewTransition(go); else go();
  });
  window.FT = { reset() { state = fresh(); save(); render(); }, state: () => state,
    ask: i => { sheet = { kind: "ask", convo: [], busy: false }; runAsk(i); }, why: () => { sheet = { kind: "why", convo: [], busy: false }; renderSheet(); } };
  render(true);
})();
