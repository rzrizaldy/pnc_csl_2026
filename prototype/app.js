// Family Table concept prototype. Hash routes, no build step.
(function () {
  const S = window.SEED;
  const app = document.getElementById("app");
  const byId = Object.fromEntries(S.family.map(m => [m.id, m]));
  const COLORS = { margaret: "#16233A", tom: "#44566C", ryan: "#E2701F", emma: "#6A5A8E", jake: "#4F8571" };

  // ---------- state (per-viewer, survives reloads when storage is available) ----------
  const KEY = "family-table-state-v1";
  const fresh = () => ({ shared: ["q1"], approved: false, started: false, option: "equitable", planApproved: false });
  let state = fresh();
  try {
    if (new URLSearchParams(location.search).has("reset")) localStorage.removeItem(KEY);
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved) state = Object.assign(fresh(), saved);
  } catch (e) { /* storage blocked: keep in-memory state */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function set(patch) { Object.assign(state, patch); save(); render(); }

  const money = v => "$" + v.toFixed(1) + "M";
  const initials = m => m.name.split(" ").map(p => p[0]).join("").slice(0, 2);
  const avatar = (m, size) => `<span class="avatar" style="background:${COLORS[m.id]};${size ? `width:${size}px;height:${size}px` : ""}">${initials(m)}</span>`;
  const divergence = t => { const v = Object.values(t.stances); return (Math.max(...v) - Math.min(...v)) / 4; };

  // ---------- advisor workbench ----------
  const ADV = [
    ["signals", "Signals", 1],
    ["family", "Family map"],
    ["brief", "Alignment brief"],
    ["plan", "Plan & routing"],
  ];

  function advisorShell(active, body) {
    return `<div class="advisor">
      <aside class="rail">
        <div class="who"><span class="avatar" style="background:#44566C">AL</span><div><b>Alex Lee</b><small>Private Business Strategist</small></div></div>
        ${ADV.map(([id, label, n]) => `<a href="#/advisor/${id}" class="${id === active ? "on" : ""}">${label}${n ? `<span class="count">${n}</span>` : ""}</a>`).join("")}
        <div class="rule"><b>Review rule</b><br>Nothing the models produce reaches a client until you approve it. Family answers stay private unless that person shares them.</div>
      </aside>
      <main class="main">${body}</main>
    </div>`;
  }

  function signals() {
    const rows = S.signals.map(s => `
      <div class="signal-row band-${s.band}" data-signal="${s.id}">
        <div class="score"><b>${Math.round(s.score * 100)}</b><span>${s.band}</span></div>
        <div>
          <h3>${s.client}</h3>
          <div class="meta">${s.owner} · likely transition in ${s.horizon} · ${s.household}</div>
          <ul class="reasons">${s.reasons.map(r => `<li><span class="bar"><i style="width:${Math.round(r.weight / 0.35 * 100)}%"></i></span>${r.text}</li>`).join("")}</ul>
        </div>
        <div>${s.id === "wilson"
          ? (state.started ? `<a class="btn done" href="#/advisor/family">Conversation started</a>` : `<button class="btn signal" data-act="start">Start conversation</button>`)
          : `<button class="btn ghost">Watch</button>`}</div>
      </div>`).join("");
    return advisorShell("signals", `
      <div class="head"><div><h1>Transition signals</h1><p>Commercial clients whose account activity looks like an upcoming sale or transfer. Scores come from a gradient-boosted model over business-account events. Bars show each reason's share of the score.</p></div></div>
      <section class="panel">${rows}</section>
      <p class="muted small" style="margin-top:14px">Model output is a prompt to talk, not a conclusion. Signals use only data PNC already holds for the business, under the client's existing agreements.</p>`);
  }

  function familyMap() {
    // positions as % of the map box
    const pos = { biz: [50, 14], margaret: [32, 44], tom: [68, 44], ryan: [18, 84], emma: [50, 84], jake: [82, 84] };
    const consent = {
      margaret: [["Shares full profile", "ok"]],
      tom: [["Invite sent Oct 20", "warn"]],
      ryan: [["Shares summary", "ok"], ["2 answers private", "priv"]],
      emma: [["Shared 1 answer", "ok"], ["2 answers private", "priv"]],
      jake: [["Reminder due", "warn"]],
    };
    const link = (a, b) => `<line x1="${pos[a][0]}%" y1="${pos[a][1]}%" x2="${pos[b][0]}%" y2="${pos[b][1]}%" stroke="#C9D0D8" stroke-width="1.5"/>`;
    const nodes = S.family.map(m => `
      <div class="node" style="left:${pos[m.id][0]}%;top:${pos[m.id][1]}%">
        <div style="display:flex;gap:10px;align-items:center">${avatar(m, 30)}<div><h3>${m.name}</h3><small>${m.role}</small></div></div>
        <div class="chips"><span class="chip ${m.pnc.startsWith("None") ? "warn" : "ok"}">PNC: ${m.pnc}</span>${consent[m.id].map(([t, c]) => `<span class="chip ${c}">${t}</span>`).join("")}</div>
      </div>`).join("");
    const atPnc = S.family.filter(m => m.gen === 2 && !m.pnc.startsWith("None")).length;
    return advisorShell("family", `
      <div class="head"><div><h1>Wilson family</h1><p>Who is involved, who has joined, and what each person has agreed to share. Margaret chose private check-ins for everyone.</p></div>
        <button class="btn ghost" data-act="remind">Send Jake a reminder</button></div>
      <div class="kpis panel">
        <div class="kpi"><b>3 of 5</b><span>family members checked in</span></div>
        <div class="kpi"><b>${atPnc} of 3</b><span>children with a PNC relationship today</span></div>
        <div class="kpi"><b>$24.7M</b><span>estimated net proceeds at close (illustrative)</span></div>
      </div>
      <section class="panel"><div class="map">
        <svg class="links" aria-hidden="true">${link("biz", "margaret")}${link("biz", "tom")}${link("margaret", "tom")}${["ryan", "emma", "jake"].map(c => link("margaret", c) + link("tom", c)).join("")}</svg>
        <div class="node biz" style="left:${pos.biz[0]}%;top:${pos.biz[1]}%"><h3>${S.business.name}</h3><small>${S.business.sector} · ${S.business.employees} staff · ${S.business.relationship}</small></div>
        ${nodes}
      </div></section>`);
  }

  function brief() {
    const checked = ["margaret", "ryan", "emma"];
    const strip = t => `<div style="position:relative;height:26px;min-width:220px">
        <div style="position:absolute;left:0;right:0;top:12px;height:2px;background:#C9D0D8"></div>
        ${checked.map((id, i) => { const dup = checked.slice(0, i).filter(o => t.stances[o] === t.stances[id]).length;
          return `<span title="${byId[id].short}" style="position:absolute;top:1px;left:calc(${(t.stances[id] + 2) / 4 * 100}% - 11px + ${dup * 16}px)"><span class="avatar" style="width:22px;height:22px;font-size:11px;background:${COLORS[id]};box-shadow:0 0 0 2px #F5F6F3">${byId[id].short[0]}</span></span>`; }).join("")}
      </div>`;
    const rows = S.themes.map(t => ({ t, d: divergence(t) })).sort((a, b) => b.d - a.d).map(({ t, d }) => `
      <tr><td>${t.label}</td><td>${strip(t)}</td>
        <td><div class="gap ${d >= 0.75 ? "high" : ""}"><span class="bar"><i style="width:${d * 100}%"></i></span><b>${d.toFixed(2)}</b></div></td></tr>`).join("");

    const answers = S.checkin.answers.map((a, i) => state.shared.includes(a.id)
      ? `<div class="shared reveal" data-answer="${a.id}"><small>Shared by Emma · ${S.themes.find(t => t.id === a.theme).label}</small>“${a.a}”</div>`
      : `<div class="sealed" data-answer="${a.id}"><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Z"/></svg>
          <div class="lines"><b>Private answer ${i + 1} · ${S.themes.find(t => t.id === a.theme).label}</b><i style="width:92%"></i><i style="width:70%"></i></div></div>`).join("");

    const roleShared = state.shared.includes("q2");
    const draft = `
      <div class="draft ${state.approved ? "approved" : ""}">
        <span class="tag">${state.approved ? "Approved by Alex Lee · ready to use in the family meeting" : "Draft written by a language model from check-in summaries · review before use"}</span>
        <p><b>Fairness is the widest gap (1.00).</b> Ryan sees his 20 years in the business as part of his share; Emma expects equal shares and wants that settled before any will is drafted.</p>
        <p><b>Ryan's role after the sale is a second gap (0.75).</b> ${roleShared ? "Emma shared that Ryan plans to stay with the buyer for five years, and that Margaret may not know." : "One private answer touches this theme; ask Ryan and Margaret directly rather than inferring."}</p>
        <p><b>Margaret's life after the sale is unplanned</b> in all three check-ins. This is the pattern behind most post-sale regret.</p>
        <div class="actions">${state.approved ? `<button class="btn ghost" data-act="unapprove">Reopen draft</button>` : `<button class="btn" data-act="approve">Approve brief</button><button class="btn ghost">Edit</button>`}</div>
      </div>`;

    return advisorShell("brief", `
      <div class="head"><div><h1>Alignment brief · Wilson family</h1><p>Where the family agrees and where it doesn't, from private check-ins. You see the size of each gap. You only see someone's words if they chose to share them.</p></div></div>
      <div class="grid2">
        <div><section class="panel">
          <h2>Gaps by theme</h2>
          <table class="veil"><thead><tr><th>Theme</th><th>Disagree ← stance → Agree</th><th>Gap</th></tr></thead><tbody>${rows}</tbody></table>
          <div class="legend">${checked.map(id => `<span><span class="dot" style="background:${COLORS[id]}"></span>${byId[id].short}</span>`).join("")}<span class="muted">Tom and Jake not checked in yet</span></div>
          <p class="muted small">Gap = spread between the furthest-apart stances, from 0 (agree) to 1 (opposite ends). A fixed formula calculates it, not a model.</p>
        </section>
          <section class="panel" style="margin-top:18px"><h2>Suggested next steps</h2>
            <ul class="nba">
              <li><span>Book a Hawthorn IFS facilitator for a fairness conversation<small>Before the letter of intent is signed</small></span><button class="btn ghost">Book</button></li>
              <li><span>Model equal, equitable and trust options with a trust specialist<small>Calculator output, shared with the family portal after review</small></span><button class="btn ghost">Request</button></li>
              <li><span>Plan a first meeting with Emma and Jake<small>Neither banks with PNC today</small></span><button class="btn ghost">Schedule</button></li>
            </ul></section></div>
        <div>
          <section class="panel"><h2>Emma's check-in</h2>${answers}</section>
          <section class="panel"><h2>Brief for the family meeting</h2>${draft}</section>

        </div>
      </div>`);
  }

  function plan() {
    return advisorShell("plan", `
      <div class="head"><div><h1>Plan & routing · Wilson family</h1><p>Specialist tasks, what each family member has agreed to, and a record of every model output and who approved it.</p></div></div>
      <div class="grid2">
        <section class="panel"><h2>Specialist tasks</h2>
          <table class="list"><thead><tr><th>Specialist</th><th>Task</th><th>Due</th><th>Status</th></tr></thead><tbody>
          ${S.tasks.map(t => `<tr><td><b>${t.who}</b></td><td>${t.what}</td><td>${t.due}</td><td><span class="chip ${t.status === "Booked" ? "ok" : t.status.startsWith("Waiting") ? "priv" : "warn"}">${t.status}</span></td></tr>`).join("")}
          </tbody></table></section>
        <section class="panel"><h2>Decision and consent log</h2>
          <table class="list log"><tbody>${S.log.map(l => `<tr><td><time>${l.t}</time></td><td><b>${l.who}</b><br>${l.what}</td></tr>`).join("")}
          ${state.planApproved ? `<tr class="reveal"><td><time>Nov 14, 17:30</time></td><td><b>Wilson family</b><br>Approved the equitable option in principle. Trust specialist to draft terms.</td></tr>` : ""}
          </tbody></table></section>
      </div>`);
  }

  // ---------- family portal ----------
  const FAM = [
    ["overview", "What the sale means", "Margaret"],
    ["checkin", "Private check-in", "Emma"],
    ["options", "Options", "Family"],
    ["plan", "Your plan", "Family"],
  ];
  function familyShell(active, body, wide) {
    return `<div class="family">
      <nav class="steps" aria-label="Family steps">${FAM.map(([id, label, as], i) => `<a href="#/family/${id}" class="${id === active ? "on" : ""}"><span>${i + 1}</span>${label}<em class="as">· ${as}</em></a>`).join("")}</nav>
      <div class="page ${wide ? "wide" : ""}">${body}</div></div>`;
  }

  function overview() {
    const P = S.proceeds, cash = P.headline - P.earnout, net = cash - P.debt - P.fees - P.tax;
    const scale = v => (v / P.headline * 100).toFixed(2) + "%";
    const step = (label, cls, left, width, value) => `<div class="wf ${cls}"><span>${label}</span><div class="track"><i style="left:${scale(left)};width:${scale(width)}"></i></div><b>${value}</b></div>`;
    return familyShell("overview", `
      <h1 class="greet">Margaret, here is what the sale could mean for your family.</h1>
      <p class="lede">The headline price is not what you take home. This shows what is left after debt, fees and taxes, and keeps the earnout separate because it is not guaranteed.</p>
      <section class="fcard"><h2>From sale price to what you keep</h2>
        <div class="waterfall">
          ${step("Offer from the buyer", "", 0, P.headline, money(P.headline))}
          ${step("Earnout, paid only if targets are met", "contingent", cash, P.earnout, "−" + money(P.earnout))}
          ${step("Business debt paid off", "minus", cash - P.debt, P.debt, "−" + money(P.debt))}
          ${step("Advisor and legal fees", "minus", cash - P.debt - P.fees, P.fees, "−" + money(P.fees))}
          ${step("Estimated taxes", "minus", net, P.tax, "−" + money(P.tax))}
          ${step("Yours at closing", "net", 0, net, money(net))}
        </div>
        <p class="explain">Illustrative estimate. A PNC tax specialist confirms the real figures before you decide anything.</p>
      </section>
      <section class="fcard"><h2>Spend, gift, invest</h2>
        <p class="muted" style="margin:0">A starting split you and Alex drafted. Change it any time.</p>
        <div class="buckets">${P.buckets.map(b => `<div class="bucket"><b>${money(b.value)}</b><h3>${b.label}</h3><p>${b.detail}</p></div>`).join("")}</div>
      </section>
      <section class="fcard"><h2>Your family</h2>
        <p class="muted" style="margin:0">Each person answers privately. You'll see when someone has finished, never what they wrote.</p>
        <div class="members">${S.family.filter(m => m.id !== "margaret").map(m => `<div class="member">${avatar(m, 32)}<div>${m.short}<small>${m.status}</small></div></div>`).join("")}</div>
      </section>`);
  }

  function checkin() {
    const qa = S.checkin.answers.map(a => {
      const on = state.shared.includes(a.id);
      return `<article class="qa" data-q="${a.id}">
        <div class="q">${a.q}</div>
        <div class="a">${a.a}</div>
        <div class="toggle" role="group" aria-label="Who can see this answer">
          <button class="priv ${on ? "" : "on"}" data-act="private" data-id="${a.id}" aria-pressed="${!on}">Keep private</button>
          <button class="share ${on ? "on" : ""}" data-act="share" data-id="${a.id}" aria-pressed="${on}">Share with Alex</button>
        </div>
        <div class="who-sees">${on ? "Alex can read this answer. Your family cannot." : "Only you can read this. Alex sees only which themes it touches."}</div>
      </article>`;
    }).join("");
    return familyShell("checkin", `
      <h1 class="greet">Emma, this part is just for you.</h1>
      <p class="lede">Your mom asked everyone to share what matters to them before the sale. Say it the way you would to a friend.</p>
      <div class="promise"><svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Z"/></svg>
        <p><b>Nobody in your family will see your answers.</b> Your advisor sees where the family agrees or disagrees, not your words, unless you choose to share an answer below.</p></div>
      ${qa}`);
  }

  function options() {
    const max = 4;
    const cards = S.options.map(o => `
      <article class="option ${state.option === o.id ? "pick" : ""}" data-option="${o.id}">
        <h2>${o.name}</h2>
        <div class="split">${["ryan", "emma", "jake"].map(id => `<div><span>${byId[id].short}</span><span class="bar"><i style="width:${o.split[id] / max * 100}%;background:${COLORS[id]}"></i></span><b>${money(o.split[id])}</b></div>`).join("")}</div>
        ${o.staged ? `<p class="small muted" style="margin:-6px 0 8px">${o.staged}</p>` : ""}
        <dl><dt>Why it helps</dt><dd>${o.pros}</dd><dt>What to watch</dt><dd>${o.cons}</dd></dl>
        <p class="gapnote">${o.gap}</p>
        <button class="btn ${state.option === o.id ? "" : "ghost"}" style="margin-top:12px" data-act="pick" data-id="${o.id}">${state.option === o.id ? "Selected for discussion" : "Select for discussion"}</button>
      </article>`).join("");
    return familyShell("options", `
      <h1 class="greet">Three ways to share the $9.0M family gift.</h1>
      <p class="lede">These options came out of the family's check-ins. Ryan already keeps $1.2M of equity with the buyer, which the equitable option counts.</p>
      <div class="options">${cards}</div>
      <p class="explain">Amounts come from a calculator your advisor reviewed. A language model wrote the plain-language explanations from those numbers. Nothing here is a recommendation until you discuss it with Alex.</p>
      <div style="margin-top:18px"><a class="btn" href="#/family/plan" data-act="discuss">Discuss with Alex</a></div>`, true);
  }

  function famPlan() {
    const steps = [
      ["Margaret", "margaret", "Family meeting with a Hawthorn IFS facilitator", "Nov 12 · Pittsburgh office", "Booked"],
      ["Ryan", "ryan", "Review rollover equity and earnout terms with business banking", "Before the letter of intent", "This week"],
      ["Emma", "emma", "Open an account for gifted assets", "Your choice of bank; PNC can set it up for you", "When you're ready"],
      ["Jake", "jake", "Finish your private check-in", "About 10 minutes", "Waiting"],
    ];
    return familyShell("plan", `
      <h1 class="greet">The Wilson family plan.</h1>
      <p class="lede">Agreed in principle: the equitable option, with a trust specialist drafting terms. Everyone has one next step.</p>
      <section class="fcard"><h2>Next steps</h2>
        <ul class="tasks">${steps.map(([n, id, what, when, st]) => `<li>${avatar(byId[id], 34)}<div><b>${n}:</b> ${what}<small>${when}</small></div><span class="chip ${st === "Booked" ? "ok" : st === "Waiting" ? "warn" : ""}">${st}</span></li>`).join("")}</ul>
        <div class="actions">${state.planApproved ? `<span class="chip ok" style="font-size:14px;padding:6px 12px">Plan approved · Alex notified</span>` : `<button class="btn" data-act="approve-plan">Approve plan</button>`}</div>
      </section>
      <section class="fcard next-chapter"><h2>Margaret, your next chapter</h2>
        <p class="muted" style="margin:0">Owners who plan life after the sale are the ones who don't regret it. Start with one sentence.</p>
        <textarea aria-label="Your next chapter">Six months after closing, I want to be running the Wilson Family Foundation two days a week and coaching new owners at the chamber.</textarea>
      </section>`);
  }

  // ---------- story cards (video only, not linked from the app) ----------
  function story(id) {
    const cards = {
      hook: `<h1>Margaret built Wilson Transport over 30 years. In about a year, she will sell it.</h1>
        <p class="sub">Her three children don't know what that means for them. And neither does her bank.</p>
        <p class="small" style="margin-top:40px;color:rgba(255,255,255,.5)">Margaret and her family are fictional.</p>`,
      problem: `<h1>The sale is the moment families split and money leaves.</h1>
        <div class="stats">
          <div class="stat"><b>80–90%</b><p>of a business owner's net worth is usually tied up in the business.</p><small>PNC Business Succession Planning series</small></div>
          <div class="stat"><b>75%</b><p>of owners “profoundly regretted” selling a year later.</p><small>PNC, Begin at the end (Paper 2)</small></div>
          <div class="stat"><b>13%</b><p>of next-gen family members are confident the company runs smoothly if a key family employee leaves.</p><small>PNC Business Succession Planning series</small></div>
        </div>`,
      sauce: `<h1>Why only PNC can build this</h1>
        <div class="layers">
          <div class="layer" style="border-color:var(--signal)"><h2>A signal PNC already holds</h2><p>Business-account activity flags a likely sale 12 to 18 months before closing, while advice still changes the outcome.</p><small>Wealth managers outside the bank only see the money after it moves.</small></div>
          <div class="layer" style="border-color:var(--private)"><h2>Private by default</h2><p>Each family member answers alone. The advisor sees the gaps, not the words, unless someone chooses to share.</p><small>Honest answers are the data no competitor can collect.</small></div>
          <div class="layer" style="border-color:var(--sage)"><h2>One household graph</h2><p>Business, owners, spouse, heirs, trusts and accounts in one consented map.</p><small>Heirs become PNC relationships before the assets move.</small></div>
        </div>
        <p class="moat">Fixed formulas calculate the numbers. Language models only explain them. An advisor approves everything.</p>`,
      close: `<h1>Family Table</h1>
        <p class="sub">Keep the proceeds at PNC. Meet the next generation before the money moves. Help a family stay a family.</p>
        <p class="small" style="margin-top:40px;color:rgba(255,255,255,.6)">Alen Ilmi · Rizaldy Utomo · Nindy Aditya Dewi · Aditya Mulya Pratama — Carnegie Mellon University</p>`,
    };
    return `<section class="story"><div class="inner">${cards[id] || cards.hook}</div></section>`;
  }

  // ---------- router ----------
  const ROUTES = {
    "advisor/signals": signals, "advisor/family": familyMap, "advisor/brief": brief, "advisor/plan": plan,
    "family/overview": overview, "family/checkin": checkin, "family/options": options, "family/plan": famPlan,
  };
  function render() {
    const path = (location.hash.replace(/^#\/?/, "") || "advisor/signals");
    let html;
    if (path.startsWith("story/")) html = story(path.split("/")[1]);
    else html = (ROUTES[path] || signals)();
    app.innerHTML = html;
    const view = path.split("/")[0];
    document.querySelectorAll(".views a").forEach(a => a.classList.toggle("on", a.dataset.view === view));
    document.body.dataset.route = path;
  }

  app.addEventListener("click", e => {
    const el = e.target.closest("[data-act]");
    if (!el) return;
    const act = el.dataset.act, id = el.dataset.id;
    if (act === "start") set({ started: true });
    else if (act === "share" && !state.shared.includes(id)) set({ shared: [...state.shared, id] });
    else if (act === "private") set({ shared: state.shared.filter(x => x !== id) });
    else if (act === "approve") set({ approved: true });
    else if (act === "unapprove") set({ approved: false });
    else if (act === "pick") set({ option: id });
    else if (act === "approve-plan") set({ planApproved: true });
    else if (act === "remind") { el.textContent = "Reminder sent"; el.disabled = true; }
  });
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
  window.FT = { reset() { state = fresh(); save(); render(); }, state: () => state };
  render();
})();
