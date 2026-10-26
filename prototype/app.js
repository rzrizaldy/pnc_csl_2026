// Family Table concept prototype. Hash routes, no build step.
(function () {
  const S = window.SEED;
  const app = document.getElementById("app");
  const byId = Object.fromEntries(S.family.map(m => [m.id, m]));
  // design-system data-viz palette
  const COLORS = { margaret: "#424B5A", tom: "#8C929B", ryan: "#6F9A4B", emma: "#6D4AA0", jake: "#6593C9" };

  // ---------- state (per-viewer, survives reloads when storage is available) ----------
  const KEY = "family-table-state-v2";
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
  const themeLabel = id => S.themes.find(t => t.id === id).label;

  const ICON = {
    ok: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1.2 14.2-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7Z"/>',
    attn: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-2h2v2Zm0-4h-2V7h2v6Z"/>',
    req: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.2 12.8-1.4 1.4L12 13.4l-2.8 2.8-1.4-1.4 2.8-2.8-2.8-2.8 1.4-1.4 2.8 2.8 2.8-2.8 1.4 1.4-2.8 2.8 2.8 2.8Z"/>',
    rec: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 15.5a1.5 1.5 0 0 1-1.5-1.5h3a1.5 1.5 0 0 1-1.5 1.5Zm4-2.5H8v-1l1-1v-2.6a3 3 0 0 1 2.2-2.9V7a.8.8 0 0 1 1.6 0v.5A3 3 0 0 1 15 10.4V13l1 1v1Z"/>',
    info: '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z"/>',
    lock: '<path fill="currentColor" d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 0 1 6 0v3H9Z"/>',
  };
  const icon = (k, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
  const note = (kind, html) => `<div class="note ${kind}">${icon(kind)}<p>${html}</p></div>`;

  // ---------- shells ----------
  const ADV = [["signals", "Signals", 1], ["family", "Family map"], ["brief", "Alignment brief"], ["plan", "Plan & routing"]];
  function advisorShell(active, title, desc, body, right = "") {
    return `<section class="banner"><div class="row"><div>
        <div class="crumb">Advisor workbench · Alex Lee, Private Business Strategist</div>
        <h1>${title}</h1><p>${desc}</p></div>${right}</div></section>
      <nav class="tabs" aria-label="Workbench sections">${ADV.map(([id, label, n]) => `<a href="#/advisor/${id}" class="${id === active ? "on" : ""}">${label}${n ? `<span class="count">${n}</span>` : ""}</a>`).join("")}</nav>
      <main class="main">${body}</main>`;
  }
  const FAM = [["overview", "What the sale means", "Margaret"], ["checkin", "Private check-in", "Emma"], ["options", "Options", "Family"], ["plan", "Your plan", "Family"]];
  function familyShell(active, title, desc, body, wide) {
    return `<section class="banner"><div class="page ${wide ? "wide" : ""}" style="padding:0">
        <div class="crumb">Family portal · Wilson family</div><h1>${title}</h1><p>${desc}</p></div></section>
      <nav class="tabs" aria-label="Family steps" style="justify-content:center">${FAM.map(([id, label, as], i) => `<a href="#/family/${id}" class="${id === active ? "on" : ""}">${i + 1}. ${label} <em>${as}</em></a>`).join("")}</nav>
      <div class="page ${wide ? "wide" : ""}">${body}</div>`;
  }

  // ---------- advisor workbench ----------
  function signals() {
    const rows = S.signals.map(s => `
      <tr class="${s.id === "wilson" ? "hl" : ""}" data-signal="${s.id}">
        <td style="width:90px"><div class="score">${Math.round(s.score * 100)}</div><div class="band ${s.band}">${s.band}</div></td>
        <td><div class="client">${s.client}</div><div class="small muted">${s.owner} · ${s.household}</div>
          <ul class="reasons">${s.reasons.map(r => `<li><span class="bar"><i style="width:${Math.round(r.weight / 0.35 * 100)}%"></i></span>${r.text}</li>`).join("")}</ul></td>
        <td style="width:150px">${s.horizon}</td>
        <td style="width:210px;text-align:right">${s.id === "wilson"
          ? (state.started ? `<a class="btn done" href="#/advisor/family">Conversation started</a>` : `<button class="btn cta" data-act="start">Start conversation</button>`)
          : `<button class="btn ghost">Watch</button>`}</td>
      </tr>`).join("");
    const top = state.started
      ? note("ok", "Conversation started with Margaret Wilson. She chose private check-ins for her family.<small>Next: watch who joins on the family map.</small>")
      : note("rec", "Wilson Transport shows a likely sale in 12–18 months. Talk to Margaret before a letter of intent is signed.<small>Recommended action · score 78, three reasons below</small>");
    return advisorShell("signals", "Transition signals",
      "Commercial clients whose business-account activity looks like an upcoming sale or transfer.",
      `${top}
      <section class="panel" style="margin-top:18px"><table class="data">
        <thead><tr><th>Score</th><th>Client and top reasons</th><th>Likely timing</th><th></th></tr></thead><tbody>${rows}</tbody></table></section>
      <div style="margin-top:18px">${note("info", "A gradient-boosted model scores business-account events. Bars show each reason's share of the score. A score is a reason to call, not a conclusion, and nothing goes to a client without your review.")}</div>`);
  }

  function familyMap() {
    const pos = { biz: [50, 13], margaret: [33, 43], tom: [67, 43], ryan: [17, 83], emma: [50, 83], jake: [83, 83] };
    const consent = {
      margaret: [["Shares full profile", "ok"]],
      tom: [["Invite sent Oct 20", "warn"]],
      ryan: [["Shares summary", "ok"], ["2 answers private", "priv"]],
      emma: [["Shared 1 answer", "ok"], ["2 answers private", "priv"]],
      jake: [["Not started", "warn"]],
    };
    const link = (a, b) => `<line x1="${pos[a][0]}%" y1="${pos[a][1]}%" x2="${pos[b][0]}%" y2="${pos[b][1]}%" stroke="#C5CAD1" stroke-width="1.5"/>`;
    const nodes = S.family.map(m => `
      <div class="node" style="left:${pos[m.id][0]}%;top:${pos[m.id][1]}%;--c:${COLORS[m.id]}">
        <div style="display:flex;gap:10px;align-items:center">${avatar(m, 30)}<div><h3>${m.name}</h3><small>${m.role}</small></div></div>
        <div class="chips"><span class="chip ${m.pnc.startsWith("None") ? "warn" : "ok"}">PNC: ${m.pnc}</span>${consent[m.id].map(([t, c]) => `<span class="chip ${c}">${t}</span>`).join("")}</div>
      </div>`).join("");
    const atPnc = S.family.filter(m => m.gen === 2 && !m.pnc.startsWith("None")).length;
    return advisorShell("family", "Wilson family",
      "Who is involved, who has joined, and what each person has agreed to share.",
      `${note("attn", "Jake hasn't started his check-in, and neither Emma nor Jake banks with PNC today.<small>Invites sent Oct 20</small>")}
      <section class="panel kpis" style="margin-top:18px">
        <div class="kpi"><b>3 of 5</b><span>family members checked in</span></div>
        <div class="kpi"><b>${atPnc} of 3</b><span>children with a PNC relationship today</span></div>
        <div class="kpi"><b>$24.7M</b><span>estimated net proceeds at closing (illustrative)</span></div>
      </section>
      <section class="panel"><div class="map">
        <svg class="links" aria-hidden="true">${link("biz", "margaret")}${link("biz", "tom")}${link("margaret", "tom")}${["ryan", "emma", "jake"].map(c => link("margaret", c) + link("tom", c)).join("")}</svg>
        <div class="node biz" style="left:${pos.biz[0]}%;top:${pos.biz[1]}%"><h3>${S.business.name}</h3><small>${S.business.sector} · ${S.business.employees} staff · ${S.business.relationship}</small></div>
        ${nodes}
      </div></section>`,
      `<button class="btn ghost" data-act="remind">Send Jake a reminder</button>`);
  }

  function brief() {
    const checked = ["margaret", "ryan", "emma"];
    const strip = t => `<div style="position:relative;height:26px;min-width:220px">
        <div style="position:absolute;left:0;right:0;top:12px;height:2px;background:#C5CAD1"></div>
        ${checked.map((id, i) => { const dup = checked.slice(0, i).filter(o => t.stances[o] === t.stances[id]).length;
          return `<span title="${byId[id].short}" style="position:absolute;top:1px;left:calc(${(t.stances[id] + 2) / 4 * 100}% - 11px + ${dup * 24}px)"><span class="avatar" style="width:22px;height:22px;font-size:11px;background:${COLORS[id]};box-shadow:0 0 0 2px #fff">${byId[id].short[0]}</span></span>`; }).join("")}
      </div>`;
    const rows = S.themes.map(t => ({ t, d: divergence(t) })).sort((a, b) => b.d - a.d).map(({ t, d }) => `
      <tr class="${d >= 0.75 ? "high" : ""}"><td>${t.label}</td><td>${strip(t)}</td>
        <td><div class="gap ${d >= 0.75 ? "high" : ""}"><span class="bar"><i style="width:${d * 100}%"></i></span><b>${d.toFixed(2)}</b></div></td></tr>`).join("");

    const answers = S.checkin.answers.map((a, i) => state.shared.includes(a.id)
      ? `<div class="shared reveal" data-answer="${a.id}"><small>Shared by Emma · ${themeLabel(a.theme)}</small>“${a.a}”</div>`
      : `<div class="sealed" data-answer="${a.id}">${icon("lock")}<div class="lines"><b>Private answer ${i + 1} · ${themeLabel(a.theme)}</b><i style="width:92%"></i><i style="width:70%"></i></div></div>`).join("");

    const roleShared = state.shared.includes("q2");
    const draft = `
      <div class="draft ${state.approved ? "approved" : ""}">
        ${state.approved ? note("ok", "Approved by Alex Lee. Ready for the family meeting.") : note("rec", "Draft written by a language model from check-in summaries. Review before use.")}
        <p><b>Fairness is the widest gap (1.00).</b> Ryan sees his 20 years in the business as part of his share; Emma expects equal shares and wants that settled before any will is drafted.</p>
        <p><b>Ryan's role after the sale is a second gap (0.75).</b> ${roleShared ? `<span class="reveal" style="display:inline">Emma shared that Ryan plans to stay with the buyer for five years, and that Margaret may not know.</span>` : "One private answer touches this theme; ask Ryan and Margaret directly rather than inferring."}</p>
        <p><b>Margaret's life after the sale is unplanned</b> in all three check-ins. This is the pattern behind most post-sale regret.</p>
        <div class="actions">${state.approved ? `<button class="btn ghost" data-act="unapprove">Reopen draft</button>` : `<button class="btn" data-act="approve">Approve brief</button><button class="btn ghost">Edit</button>`}</div>
      </div>`;

    return advisorShell("brief", "Alignment brief · Wilson family",
      "Where the family agrees and where it doesn't. You see the size of each gap, and someone's words only if they chose to share them.",
      `<div class="grid2">
        <div class="stack">
          <section class="panel"><h2>Gaps by theme</h2>
            <table class="veil"><thead><tr><th>Theme</th><th>Disagree ← stance → Agree</th><th>Gap</th></tr></thead><tbody>${rows}</tbody></table>
            <div class="legend">${checked.map(id => `<span><span class="dot" style="background:${COLORS[id]}"></span>${byId[id].short}</span>`).join("")}<span class="muted">Tom and Jake not checked in yet</span></div>
            <p class="muted small">Gap = spread between the furthest-apart stances, from 0 (agree) to 1 (opposite ends). A fixed formula calculates it, not a model.</p>
          </section>
          <section class="panel"><h2>Suggested next steps</h2>
            <ul class="nba">
              <li><span>Book a Hawthorn IFS facilitator for a fairness conversation<small>Before the letter of intent is signed</small></span><button class="btn ghost">Book</button></li>
              <li><span>Model equal, equitable and trust options with a trust specialist<small>Calculator output, shared to the family portal after your review</small></span><button class="btn ghost">Request</button></li>
              <li><span>Plan a first meeting with Emma and Jake<small>Neither banks with PNC today</small></span><button class="btn ghost">Schedule</button></li>
            </ul></section>
        </div>
        <div class="stack">
          <section class="panel"><h2>Emma's check-in</h2>${answers}</section>
          <section class="panel"><h2>Brief for the family meeting</h2>${draft}</section>
        </div>
      </div>`);
  }

  function plan() {
    return advisorShell("plan", "Plan & routing · Wilson family",
      "Specialist tasks, what each family member agreed to share, and a record of every model output and who approved it.",
      `${state.planApproved ? note("ok", "The Wilson family approved the equitable option in principle.<small>Trust specialist notified Nov 14</small>") : note("info", "Waiting for the family to approve a plan in the portal.")}
      <div class="grid2" style="margin-top:18px">
        <section class="panel"><h2>Specialist tasks</h2>
          <table class="list"><thead><tr><th>Specialist</th><th>Task</th><th>Due</th><th>Status</th></tr></thead><tbody>
          ${S.tasks.map(t => `<tr><td><b>${t.who}</b></td><td>${t.what}</td><td>${t.due}</td><td><span class="chip ${t.status === "Booked" ? "ok" : t.status.startsWith("Waiting") ? "priv" : "rec"}">${t.status}</span></td></tr>`).join("")}
          </tbody></table></section>
        <section class="panel"><h2>Decision and consent log</h2>
          <table class="list log"><tbody>${S.log.map(l => `<tr><td><time>${l.t}</time></td><td><b>${l.who}</b><br>${l.what}</td></tr>`).join("")}
          ${state.planApproved ? `<tr class="reveal"><td><time>Nov 14, 17:30</time></td><td><b>Wilson family</b><br>Approved the equitable option in principle. Trust specialist to draft terms.</td></tr>` : ""}
          </tbody></table></section>
      </div>`);
  }

  // ---------- family portal ----------
  function donut(items, total, center) {
    const R = 100, C = 2 * Math.PI * R, gap = 3;
    let off = 0;
    const arcs = items.map(b => {
      const len = b.value / total * C;
      const a = `<circle r="${R}" cx="130" cy="130" fill="none" stroke="${b.color}" stroke-width="34" stroke-dasharray="${Math.max(len - gap, 0)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 130 130)"/>`;
      off += len; return a;
    }).join("");
    return `<div class="donut"><svg width="260" height="260" viewBox="0 0 260 260" role="img" aria-label="Spend, gift and invest split">${arcs}</svg>
      <div class="center"><b>${center[0]}</b><span>${center[1]}</span></div></div>`;
  }

  function overview() {
    const P = S.proceeds, cash = P.headline - P.earnout, net = cash - P.debt - P.fees - P.tax;
    const scale = v => (v / P.headline * 100).toFixed(2) + "%";
    const step = (label, cls, left, width, value) => `<div class="wf ${cls}"><span>${label}</span><div class="track"><i style="left:${scale(left)};width:${scale(width)}"></i></div><b>${value}</b></div>`;
    const bucketColors = { spend: "#6F9A4B", gift: "#6D4AA0", invest: "#6593C9" };
    const items = P.buckets.map(b => Object.assign({ color: bucketColors[b.id] }, b));
    return familyShell("overview", "Margaret, here is what the sale could mean for your family.",
      "The offer is not what you take home. This shows what is left after debt, fees and taxes, and keeps the earnout separate because it is not guaranteed.",
      `${note("rec", "Alex updated your estimate from the latest letter of intent.<small>Oct 22 · reviewed by Alex Lee before sharing</small>")}
      <section class="fcard" style="margin-top:18px"><h2>From offer to what you keep</h2>
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
        <div class="donut-wrap">${donut(items, net, [money(net), "yours at closing"])}
          <table class="legend-table"><thead><tr><th>Use</th><th>Amount</th></tr></thead><tbody>
          ${items.map(b => `<tr><td style="--c:${b.color}">${b.label}<small>${b.detail}</small></td><td><b>${money(b.value)}</b></td></tr>`).join("")}
          </tbody></table></div>
      </section>
      <section class="fcard"><h2>Deal documents</h2>
        <p class="muted" style="margin:0">A language model reads the terms (price, earnout, escrow) into the estimate above. Alex checks every extracted number first.</p>
        <ul class="files">
          <li><span class="ext">PDF</span><span>Letter_of_intent_v3.pdf</span><small>Terms extracted · checked by Alex</small></li>
          <li><span class="ext">PDF</span><span>Earnout_schedule.pdf</span><small>Terms extracted · checked by Alex</small></li>
        </ul>
        <div class="dropzone"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#2A6EBB" d="M5 20h14v-2H5v2Zm7-16-6 6h4v6h4v-6h4l-6-6Z"/></svg><a href="#/family/overview">Select files</a> or drag and drop to share with Alex
          <span class="types">Accepted: .PDF, .DOCX, .XLSX<br>Max 10MB each</span></div>
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
    return familyShell("checkin", "Emma, this part is just for you.",
      "Your mom asked everyone to share what matters to them before the sale. Say it the way you would to a friend.",
      `${note("info", "Nobody in your family will see your answers.<small>Your advisor sees where the family agrees or disagrees, not your words, unless you choose to share an answer below.</small>")}
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
        <button class="btn ${state.option === o.id ? "" : "ghost"}" style="margin-top:12px;justify-content:center" data-act="pick" data-id="${o.id}">${state.option === o.id ? "Selected for discussion" : "Select for discussion"}</button>
      </article>`).join("");
    return familyShell("options", "Three ways to share the $9.0M family gift.",
      "These options came out of the family's check-ins. Ryan already keeps $1.2M of equity with the buyer, which the equitable option counts.",
      `<div class="options">${cards}</div>
      <p class="explain">Amounts come from a calculator your advisor reviewed. A language model wrote the plain-language explanations from those numbers. Nothing here is a recommendation until you discuss it with Alex.</p>
      <div style="margin-top:14px"><a class="btn cta" href="#/family/plan">Discuss with Alex</a></div>`, true);
  }

  function famPlan() {
    const steps = [
      ["Margaret", "margaret", "Family meeting with a Hawthorn IFS facilitator", "Nov 12 · Pittsburgh office", "Booked", "ok"],
      ["Ryan", "ryan", "Review rollover equity and earnout terms with business banking", "Before the letter of intent", "This week", "rec"],
      ["Emma", "emma", "Open an account for gifted assets", "Your choice of bank; PNC can set it up for you", "When you're ready", ""],
      ["Jake", "jake", "Finish your private check-in", "About 10 minutes", "Waiting", "warn"],
    ];
    return familyShell("plan", "The Wilson family plan.",
      "Agreed in principle: the equitable option, with a trust specialist drafting terms. Everyone has one next step.",
      `${state.planApproved ? note("ok", "Plan approved. Alex has been notified.") : ""}
      <section class="fcard" ${state.planApproved ? 'style="margin-top:18px"' : ""}><h2>Next steps</h2>
        <ul class="tasks">${steps.map(([n, id, what, when, st, c]) => `<li>${avatar(byId[id], 34)}<div><b>${n}:</b> ${what}<small>${when}</small></div><span class="chip ${c}">${st}</span></li>`).join("")}</ul>
        <div class="actions">${state.planApproved ? "" : `<button class="btn cta" data-act="approve-plan">Approve plan</button>`}</div>
      </section>
      <section class="fcard next-chapter"><h2>Margaret, your next chapter</h2>
        <p class="muted" style="margin:0">Owners who plan life after the sale are the ones who don't regret it. Start with one sentence.</p>
        <textarea aria-label="Your next chapter">Six months after closing, I want to be running the Wilson Family Foundation two days a week and coaching new owners at the chamber.</textarea>
      </section>`);
  }

  // ---------- story cards (video only, not linked from the app) ----------
  function story(id) {
    const brand = `<div class="brand"><b>Family Table</b> · a PNC Private Bank concept</div>`;
    const cards = {
      hook: `${brand}<h1>Margaret built Wilson Transport over 30 years. In about a year, she will sell it.</h1>
        <p class="sub">Her three children don't know what that means for them. Neither does her bank.</p><div class="rule"></div>
        <p class="small" style="margin-top:28px;color:rgba(255,255,255,.55)">Margaret and her family are fictional.</p>`,
      problem: `${brand}<h1>The sale is the moment families split and money leaves.</h1>
        <div class="stats">
          <div class="stat"><b>80–90%</b><p>of a business owner's net worth is usually tied up in the business.</p><small>PNC Business Succession Planning series</small></div>
          <div class="stat"><b>75%</b><p>of owners “profoundly regretted” selling a year later.</p><small>PNC, Begin at the end (Paper 2)</small></div>
          <div class="stat"><b>13%</b><p>of next-gen family members are confident the company runs smoothly if a key family employee leaves.</p><small>PNC Business Succession Planning series</small></div>
        </div>`,
      sauce: `${brand}<h1>Why only PNC can build this</h1>
        <div class="layers">
          <div class="layer" style="border-color:var(--orange)"><h2>A signal PNC already holds</h2><p>Business-account activity flags a likely sale 12 to 18 months before closing, while advice can still change the outcome.</p><small>Wealth managers outside the bank only see the money after it moves.</small></div>
          <div class="layer" style="border-color:#9A7FC6"><h2>Private by default</h2><p>Each family member answers alone. The advisor sees the gaps, not the words, unless someone chooses to share.</p><small>Honest answers are data no competitor can collect.</small></div>
          <div class="layer" style="border-color:#93B86F"><h2>One household graph</h2><p>Business, owners, spouse, heirs, trusts and accounts in one consented map.</p><small>Heirs become PNC relationships before the assets move.</small></div>
        </div>
        <p class="moat">Fixed formulas calculate the numbers. Language models only explain them. An advisor approves everything.</p>`,
      close: `${brand}<h1>Keep the proceeds at PNC. Meet the next generation before the money moves.</h1>
        <p class="sub">Help a family stay a family.</p><div class="rule"></div>
        <p class="small" style="margin-top:28px;color:rgba(255,255,255,.65)">Alen Ilmi · Rizaldy Utomo · Nindy Aditya Dewi · Aditya Mulya Pratama · Carnegie Mellon University</p>`,
    };
    return `<section class="story banner"><div class="inner">${cards[id] || cards.hook}</div></section>`;
  }

  // ---------- router ----------
  const ROUTES = {
    "advisor/signals": signals, "advisor/family": familyMap, "advisor/brief": brief, "advisor/plan": plan,
    "family/overview": overview, "family/checkin": checkin, "family/options": options, "family/plan": famPlan,
  };
  function render() {
    const path = (location.hash.replace(/^#\/?/, "") || "advisor/signals");
    app.innerHTML = path.startsWith("story/") ? story(path.split("/")[1]) : (ROUTES[path] || signals)();
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
