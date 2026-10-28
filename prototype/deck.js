// The deck, animated. Ten slides from the submitted PDF, each built from the prototype's own data and screenshots.
// Routes: deck.html#1 … #10. Keys: arrows, space, PageUp/Down, Home/End. Click the right half to advance, the left to go back.
// ?auto[=ms] plays through and hides the HUD; ?clean hides the HUD only. The stage is 1920×1080 and scales to fit.
(function () {
  const S = window.SEED, stage = document.getElementById("stage"), hud = document.getElementById("hud");
  const qp = new URLSearchParams(location.search);
  const AUTO = qp.has("auto") ? (+qp.get("auto") || 0) : null;
  if (AUTO !== null || qp.has("clean")) document.body.classList.add("clean");
  const motionOK = !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);

  // ---------- bits ----------
  const I = {
    arrow: "M5 12h14M13 6l6 6-6 6",
    check: "M5 12.5l4.5 4.5L19 7",
    rocket: "M5 13l-2 6 6-2m-4-4c4-9 8-11 14-11 0 6-2 10-11 14zm9-5a1.5 1.5 0 1 0 0 .01",
    expand: "M4 10V4h6M20 14v6h-6M20 4l-6 6M4 20l6-6",
    align: "M4 12h5M15 12h5M11 7l1 5-1 5M13 7l-1 5 1 5",
    pie: "M12 3a9 9 0 1 0 9 9h-9z M14 3.5a9 9 0 0 1 6.5 6.5H14z",
    power: "M12 3v8M6.3 6.3a8 8 0 1 0 11.4 0",
  };
  const ic = (k, s = 20, w = 2.2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${I[k]}"/></svg>`;
  const arrow = (cls = "") => `<span class="arrow ${cls}">${ic("arrow", 22, 2.6)}</span>`;
  const mark = (s = 48, ink = "#fff", core = "#EF6A00") => `<svg class="mark" viewBox="0 0 32 32" width="${s}" height="${s}" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="${ink}" stroke-width="1.8"/><circle cx="16" cy="16" r="5" fill="${core}"/><circle cx="16" cy="5" r="2.4" fill="${ink}"/><circle cx="26" cy="20" r="2.4" fill="${ink}"/><circle cx="6" cy="20" r="2.4" fill="${ink}"/></svg>`;
  const sq = (pos, extra = "") => `<div class="sq ${pos} ${extra}" aria-hidden="true"><i></i><i></i><i></i></div>`;
  const b = (html, cls = "") => `<div class="b ${cls}">${html}</div>`;
  // A region of a 1920-wide prototype screenshot, scaled so `w` source pixels fill a `cw`-wide box.
  const crop = (src, x, y, w, cw) => { const k = cw / w; return `<img src="shots/${src}.png" alt="" style="width:${Math.round(1920 * k)}px;left:${-Math.round(x * k)}px;top:${-Math.round(y * k)}px">`; };
  const num = (v, text, cls = "") => `<b class="num ${cls}" data-count="${v}" data-text="${text}">${text}</b>`;

  const TEAM = ["Alen Ilmi, MBA, Tepper School of Business", "Rizaldy U., MS in Analytics, Policy & Artificial Intelligence", "Nindy Aditya Dewi, MIIPS", "Aditya Mulya Pratama, MIIPS"];

  // ---------- 8: the stack, same geometry as the splash ----------
  const STACK = [
    { label: "PNC systems", top: "#3B55A0", left: "#2A3D74", right: "#334A8C", ink: "#fff" },
    { label: "Data and consent", top: "#F4F1FA", left: "#D9D2EC", right: "#E8E3F4", ink: "#10214D" },
    { label: "Formulas", top: "#F4F1FA", left: "#D9D2EC", right: "#E8E3F4", ink: "#10214D" },
    { label: "AI layer", top: "#F4F1FA", left: "#D9D2EC", right: "#E8E3F4", ink: "#10214D" },
    { label: "Experience", top: "#EF6A00", left: "#B84F00", right: "#D45E00", ink: "#fff" },
  ];
  function stackSvg() {
    const n = STACK.length, m = `<g transform="translate(120,60) scale(2.4,1.2) translate(-16,-16)" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="#10214D"/><circle cx="16" cy="5" r="2.6" fill="#fff"/><circle cx="26" cy="20" r="2.6" fill="#fff"/><circle cx="6" cy="20" r="2.6" fill="#fff"/></g>`;
    const layers = STACK.map((l, i) => `<g transform="translate(30,${160 - i * 36})"><g class="stack-in" style="--i:${i}">
        <polygon points="0,60 120,120 120,148 0,88" fill="${l.left}" stroke="rgba(255,255,255,.22)" stroke-width=".8"/><polygon points="120,120 240,60 240,88 120,148" fill="${l.right}" stroke="rgba(255,255,255,.22)" stroke-width=".8"/>
        <polygon points="0,60 120,0 240,60 120,120" fill="${l.top}" stroke="rgba(255,255,255,.3)" stroke-width=".8"/>${i === n - 1 ? m : ""}
        <text transform="translate(12,84) rotate(26.565)" font-size="13" font-weight="600" fill="${l.ink}" font-family="Barlow, sans-serif">${l.label}</text></g></g>`).join("");
    return `<svg viewBox="0 0 300 330" role="img" aria-label="Five layers: PNC systems, data and consent, formulas, AI layer, experience">${layers}</svg>`;
  }

  // ---------- slides ----------
  const SLIDES = [
    { id: "cover", cls: "navy-flat cover", hold: 7000, html: () => `
      <div class="photo"><svg class="ring b pop" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16" cy="16" r="5" fill="#EF6A00"/><circle cx="16" cy="5" r="2.4" fill="#fff"/><circle cx="26" cy="20" r="2.4" fill="#fff"/><circle cx="6" cy="20" r="2.4" fill="#fff"/></svg></div>
      <div class="top b">Carnegie Mellon University<br>2026 Nationwide Graduate and PhD Student Case Competition</div>
      <div class="pnc b"><span>PNC <small>Private Bank</small></span></div>
      <div class="copy">${b(`<div class="name">${mark(44)}Family Table</div>`)}${b(`<h1>Helping business-owning families plan life after a sale, with PNC</h1>`, "slow")}${b(`<p class="sub">A consent-based AI coordination layer for PNC’s commercial and private-bank clients</p>`)}</div>
      <div class="team b">${TEAM.join("<br>")}</div>${sq("br")}` },

    { id: "summary", cls: "exec", hold: 11000, html: () => {
      const rows = [["Problem", "Difficult family conversations and fragmented advice put post-sale wealth relationships at risk."],
        ["Solution", "<strong>Family Table</strong> gives owners, spouses and heirs an advisor-led journey: Align, Allocate, Activate."],
        ["Difference", "Members control sharing. AI drafts briefs and guidance for advisor review. Formulas compute financial scenarios."],
        ["Opportunity", "Up to $100B in business enterprise value through 2035, assuming a 2% PNC share of the sale-viable market.", "hi"],
        ["Next Step", "Validate with owners and advisors, then run a 90-day pilot with 10 families and 3 advisors.", "hi"]];
      return `${sq("tr", "flat")}${b(`<h1 class="title">Executive<br>Summary</h1>`)}
      <div class="rows">${rows.map(([k, v, c]) => b(`<div class="row ${c || ""}"><b>${k}</b><span>${v}</span></div>`)).join("")}</div>
      <div class="panel b slow"><div class="lab">Value proposition</div><h2>A shared family plan.<br>A stronger PNC relationship.</h2><p>Helping families make informed decisions after a business sale, while keeping PNC involved in their next chapter.</p>
        <div class="shot"><img src="shots/year_one.png" alt=""></div></div>`; } },

    { id: "problem", cls: "prob", hold: 10000, html: () => `${sq("tr")}
      ${b(`<h1 class="title">A business exit puts both assets and family relationships in motion</h1>`)}
      <div class="stats">
        <div>${b(`<div class="lead">Wealth is moving</div>`)}${b(`<div class="big">${num(124, "$124T")}</div>`)}${b(`<p class="cap">Projected U.S. wealth transfer through 2048 <sup>[1]</sup></p>`)}</div>
        <div>${b(`<div class="lead">Planning remains fragmented</div>`)}
          <div class="pair">${b(`<div class="big nv">${num(89, "89%")}</div><p class="cap">want connected business and personal advice <sup>[2]</sup></p>`)}${b(`<div class="big nv">${num(67, "67%")}</div><p class="cap">still manage those needs separately <sup>[2]</sup></p>`)}</div>
          ${b(`<div class="rule"></div><p class="line83"><b>83%</b> say family dynamics affect succession or exit planning. <sup>[2]</sup></p>`)}</div>
      </div>
      <div class="band b slow"><div class="bt">The PNC<br>opportunity</div><div class="bx"><b>Retaining post-sale assets and building relationships with the next generation.</b>Building toward wealth management through deposits, custody, trust, lending and brokerage.</div></div>
      <p class="src b">Sources: [1] Cerulli Associates, The Cerulli Report: U.S. High-Net-Worth and Ultra-High-Net-Worth Markets 2024; press release, Dec. 5, 2024.<br>[2] PNC Private Bank, Business Owner Wealth Insights 2026, pp. 2, 3 and 6; Ipsos survey of 300 U.S. middle-market business owners, Nov. 19 to Dec. 10, 2025.</p>` },

    { id: "discovery", cls: "disc", hold: 12000, html: () => {
      const cases = [["Hospital group", "Partial sale during financial distress"], ["Bus operator", "Next-generation investment"], ["Catering business", "Sudden succession"], ["Catering business", "Joining the family business"], ["Clothing brand", "Considering an exit"]];
      const learn = [["Letting go is personal", "Control and family identity can complicate an owner’s decision to sell."], ["Family members need clearer roles", "Different expectations can complicate investment decisions and working relationships."], ["Knowledge needs a handover", "A sudden transition can leave the next generation managing unfamiliar operations and finances."]];
      return `${b(`<div class="kicker">Customer Discovery</div><h1 class="title">Involving more than financial decisions in every business transition</h1>`)}
      <div class="grid">
        <div class="cases">${b(`<p><b>Five primary cases study</b> across four sectors and different transition situations</p>`)}${cases.map(([t, s], i) => b(`<div class="case"><i>${i + 1}</i><div><b>${t}</b><span>${s}</span></div></div>`)).join("")}</div>
        <div class="learn">${b(`<span class="pill">What we learned</span>`)}${learn.map(([t, s]) => b(`<div class="item">${arrow()}<div><b>${t}</b><p>${s}</p></div></div>`)).join("")}</div>
        <div class="means">${sq("tr")}${b(`<span class="pill">What this means for our design</span>`)}${b(`<p>Families need space to express concerns privately, understand their options, and agree on a documented plan.</p>`)}</div>
      </div>`; } },

    { id: "introducing", cls: "intro", hold: 12000, html: () => {
      const stages = [["align", "Align"], ["pie", "Allocate"], ["power", "Activate"]];
      const m = [["Share priorities privately", "Complete Check-in<br>Choose what PNC can see"], ["Compare and propose", "Explore Options<br>Compare illustrative scenarios"], ["Agree on next steps", "Discuss together<br>Confirm shared plan"]];
      const a = [["Review the family brief", "Assess gaps<br>Approve AI draft<br>Arrange support"], ["Validate the options", "Check assumptions with specialists"], ["Coordinate approved actions", "Route documents,<br>Coordinate relevant specialist support"]];
      const step = ([t, s]) => b(`<div class="step">${arrow()}<div><b>${t}</b><span>${s}</span></div></div>`);
      return `${sq("tr", "flat")}<div class="head">${b(`<div class="kicker">Introducing Family Table</div><h1 class="title">A shared planning space for families and their PNC advisor</h1>`)}</div>
      <div class="lower">${[0, 1, 2].map(i => `<div class="vline" style="left:${596 + 36 + i * 411}px;top:0"></div>`).join("")}</div>
      ${[0, 1, 2].map(i => `<div class="vline" style="left:${596 + 36 + i * 411}px"></div>`).join("")}
      <div class="cols">${stages.map(([k, t]) => b(`<div class="stage-h"><i>${ic(k, 36, 2)}</i>${t.toUpperCase()}</div>`, "pop")).join("")}</div>
      <div class="who m b"><img src="faces/margaret.jpg" alt=""><div><b>Margaret Wilson</b><span>Family business owner</span><em>Needs a clear plan the family understands and trusts</em></div></div>
      <div class="steps-m">${m.map(step).join("")}</div>
      <div class="who a b"><img src="faces/alex.jpg" alt=""><div><b>Alex Lee</b><span>PNC Advisor</span><em>Needs to understand family concerns before decisions are made</em></div></div>
      <div class="steps-a">${a.map(step).join("")}</div>`; } },

    { id: "client", cls: "navy client", hold: 13000, html: () => {
      const cols = [["me_claire_checkin", "Share priorities privately", "Each member checks in alone and decides, answer by answer, what the advisor sees.", "NLP extracts themes, privately"],
        ["me_sam_decide", "Compare and propose", "Family members compare illustrative scenarios privately, bring their questions to the advisor-led discussion, and confirm a shared plan.", "explains trade-offs; formulas compute"],
        ["me_sam_ask", "Act on the shared plan", "The advisor coordinates the approved actions, routes documents and brings in specialists.", "drafts next-step summaries for advisor approval."]];
      return `${b(`<div class="kicker">AI Client &amp; Family Experience</div><h1 class="title">Taking each family member from a private view to a plan the whole family can stand behind</h1>`)}
      <a class="see b pop" href="./?tour">See Prototype ${arrow()}</a>
      <div class="three">${cols.map(([src, t, p, ai]) => `${b(`<div class="shot">${crop(src, 372, 0, 1176, 533)}</div>`, "slow")}`).join("")}
        ${cols.map(([src, t, p, ai]) => b(`<h3>${t}</h3><p>${p}</p><div class="ai"><b>AI:</b> ${ai}</div>`)).join("")}</div>
      <div class="band-o b slow"><div class="fo">${ic("check", 72, 1.6)}<span>Family<br>outcome</span></div><p><b>Greater clarity</b> on options, trade-offs, and unanswered questions, <b>fairness</b> without confrontation, and <b>confidence</b> that a person reviews every answer.</p></div>
      ${sq("bl", "dk sm")}`; } },

    { id: "advisor", cls: "adv", hold: 12000, html: () => {
      const cards = [["advisor_align", 380, 100, 420, "Align", "Family brief", "AI turns check-ins and family documents into a brief of the gaps the advisor will facilitate."],
        ["advisor_guide", 380, 80, 700, "Allocate", "Family Session", "AI prepares the scenario comparison and keeps the discussion anchored to the priorities the family shared."],
        ["advisor_inbox", 380, 300, 700, "Activate", "Post sales actions", "AI drafts next steps and routing for the advisor to approve."]];
      return `${b(`<div class="kicker">AI Advisor Workbench</div><h1 class="title">Preparing the analysis with AI, leaving the call to the advisor</h1>`)}
      <div class="laptop b slow"><div class="scr"><img src="shots/advisor_align.png" alt=""></div><div class="base"></div></div>
      <div class="cards">${cards.map(([src, x, y, w, st, t, p]) => b(`<div class="card">${arrow()}<div><div class="crop">${crop(src, x, y, w, 460)}</div><div class="ch"><span class="pill sm">${st}</span>${t}</div><p>${p}</p></div></div>`)).join("")}</div>
      <div class="band b slow"><div class="bt">Foundation<br>Governance</div><div class="bx">Nothing reaches the family until the advisor approves it.<br>Every output is logged and the advisor sees the compiled result.</div></div>`; } },

    { id: "sauce", cls: "sauce", hold: 14000, html: () => {
      const L = [["Experience", "", "One plan, two views: a family app and an advisor workbench.", "Margaret’s family and Alex"],
        ["AI-infused services", "Proprietary family intelligence", "NLP themes, Document AI and drafts behind one gateway, with review.", "Alex reviews every output before it reaches the client"],
        ["Deterministic formulas", "", "Proceeds calculator, gap score and decision tree; every number auditable.", "Tax and trust specialists own the rules"],
        ["Data and consent", "Proprietary household graph", "Member vaults, consent ledger and a graph of business, owners and heirs.", "Each member controls sharing; compliance audits the ledger"],
        ["PNC systems", "Proprietary early signal", "Permissioned commercial relationship signals may indicate that an advisor conversation is timely. Advisor reviews every signal before outreach.", "Business Banking, Private Bank, wealth and Hawthorn IFS"]];
      return `${sq("tr")}${sq("bl", "sm")}${b(`<div class="kicker">The Secret Sauce &amp; Core Innovation</div><h1 class="title">Three proprietary assets inside one consented, AI-infused stack</h1>`)}
      <div class="fig">${stackSvg()}</div>
      <div class="list">${L.map(([t, tag, p, w], i) => b(`<div class="lay ${i === 4 ? "long" : ""}"><b>${t}${tag ? `<span class="pill sm">${tag}</span>` : ""}</b><p>${p}</p><p><b>Works with:</b> ${w}</p></div>`)).join("")}</div>`; } },

    { id: "impact", cls: "slate impact", hold: 12000, html: () => `
      <div class="left">${b(`<div class="kicker">Business Impact</div><h1 class="title">Keeping post-sale client assets at PNC</h1>`)}${b(`<div class="upto">Up to</div>`)}${b(`<div class="big">${num(100, "$100B")}</div>`, "slow")}${b(`<div class="cap">associated enterprise value in the sale-viable segment</div>`)}</div>
      <div class="box b slow">${arrow()}<div><b><span class="num">~6M</span> SMBs face ownership transitions</b><p>More than 1M are viable sale candidates, representing up to $5T in enterprise value.</p></div></div>
      <div class="photo b slow"><div class="faces"><img src="faces/margaret.jpg" alt=""><img src="faces/claire.jpg" alt=""></div>${sq("br", "dk")}</div>
      <div class="right">${b(`<div class="lead">PNC’s broader client asset base</div>`)}${b(`<div class="big2 num">${num(499, "$499B")}</div><p class="cap">Total client assets under administration, excluding brokerage</p><small>September 30, 2026</small>`)}
        <div class="three">${[["$146B", "Private Bank AUM"], ["$104B", "Institutional AUM"], ["$249B", "Nondiscretionary AUA"]].map(([v, l]) => b(`<b>${v}</b><span>${l}</span>`)).join("")}</div></div>
      <p class="src b">Sources: McKinsey IEM, 26 Feb 2026; PNC investor presentation, 7 Nov 2025; Census, 27 Jan 2026; Cerulli, 5 Dec 2024</p>` },

    { id: "roadmap", cls: "road", hold: 13000, html: () => {
      const C = [["c1", "check", "01", "Validate", "Weeks 1–6", ["Complete owner and advisor research", "Test sharing choices &amp; comprehension", "Agree on review rules with PNC"], "Proceed when", "Families understand permissions and advisors can use the brief"],
        ["c2", "rocket", "02", "Pilot", "Next 90 days", ["Proposed cohort: 10 families, 3 advisors", "Use owner-authorized invitations", "Keep every AI output under review"], "Measure", "Check-in completion and brief usefulness<br>Advisor prep time versus a baseline"],
        ["c3", "expand", "03", "Expand selectively", "6–12 month follow-up", ["Refine the workflow using pilot evidence", "Assess approved CRM connections", "Track family and next-gen engagement"], "Expand when", "Engagement and advisor workload justify a larger, controlled rollout"]];
      return `${sq("tr")}${b(`<div class="kicker">Roadmap &amp; Next Steps</div><h1 class="title">A staged pilot before broader rollout</h1>`)}
      <div class="cols">${C.map(([c, i, n, t, w, items, gk, gv]) => `<div class="${c}">${b(`<div class="icon">${ic(i, 70, 1.8)}</div><div class="stem"></div>`, "pop")}${b(`<div class="chev">${n}</div>`)}${b(`<h3>${t}</h3><div class="when">${w}</div>`)}
        <ul class="items">${items.map(x => `<li class="b">${arrow("sm")}${x}</li>`).join("")}</ul>${b(`<div class="gate"><b>${gk.toUpperCase()}</b><p>${gv}</p></div>`)}</div>`).join("")}</div>`; } },
  ];

  // ---------- engine ----------
  let cur = -1, autoT = 0;
  const fmtNum = (v, text) => text.replace(/[\d.]+/, m => { const d = (m.split(".")[1] || "").length; return v.toFixed(d); });
  function countUp(el) {
    const to = +el.dataset.count, text = el.dataset.text; if (!motionOK || !to) { el.textContent = text; return; }
    const t0 = performance.now(), dur = 1400, from = 0;
    const step = now => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmtNum(from + (to - from) * e, text); if (k < 1 && el.isConnected) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function show(i, dir = 1) {
    i = Math.max(0, Math.min(SLIDES.length - 1, i)); if (i === cur) return;
    const s = SLIDES[i], old = stage.querySelector(".slide");
    const el = document.createElement("section"); el.className = `slide ${s.cls}`; el.innerHTML = s.html();
    el.querySelectorAll(".b").forEach((n, k) => n.style.setProperty("--i", k));
    stage.appendChild(el);
    if (old) { old.classList.add("leave"); setTimeout(() => old.remove(), motionOK ? 460 : 0); }
    requestAnimationFrame(() => requestAnimationFrame(() => { el.classList.add("in");
      el.querySelectorAll("[data-count]").forEach(n => { const d = (+getComputedStyle(n.closest(".b") || n).animationDelay.replace("s", "") || 0) * 1000; setTimeout(() => countUp(n), motionOK ? d + 150 : 0); }); }));
    cur = i; if (location.hash !== "#" + (i + 1)) history.replaceState(null, "", "#" + (i + 1));
    document.getElementById("hud-n").textContent = `${i + 1} / ${SLIDES.length} · ${s.id}`;
    document.getElementById("hud-bar").style.width = `${((i + 1) / SLIDES.length) * 100}%`;
    document.title = `${i + 1}. ${s.id} — Family Table deck`;
    clearTimeout(autoT);
    if (AUTO !== null && i < SLIDES.length - 1) autoT = setTimeout(() => show(i + 1), AUTO || s.hold);
  }
  const fromHash = () => { const n = parseInt(location.hash.slice(1), 10); return Number.isFinite(n) && n >= 1 && n <= SLIDES.length ? n - 1 : 0; };
  function fit() {
    const k = Math.min(innerWidth / 1920, (innerHeight - (document.body.classList.contains("clean") ? 0 : 36)) / 1080);
    stage.style.transform = `scale(${k})`;
  }
  addEventListener("resize", fit); fit();
  addEventListener("hashchange", () => show(fromHash()));
  addEventListener("keydown", e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(e.key)) { e.preventDefault(); show(cur + 1); }
    else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(e.key)) { e.preventDefault(); show(cur - 1); }
    else if (e.key === "Home") show(0); else if (e.key === "End") show(SLIDES.length - 1);
    else if (/^[0-9]$/.test(e.key)) show((+e.key || 10) - 1);
    else if (e.key === "r") { const i = cur; cur = -1; stage.innerHTML = ""; show(i); }
  });
  stage.addEventListener("click", e => { if (e.target.closest("a")) return; const r = stage.getBoundingClientRect(); show(cur + (e.clientX - r.left > r.width / 2 ? 1 : -1)); });
  window.DECK = { show, slides: SLIDES.map(s => s.id), get index() { return cur; } };
  show(fromHash());
})();
