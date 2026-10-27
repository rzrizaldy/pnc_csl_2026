// node qa.js [base] -> full QA report: links/assets, console errors, overflow at 5 widths, clipped text,
// dead buttons, missing alt text, small tap targets (mobile), the guided tour end to end, every Ask answer on both models.
const { chromium } = require("playwright-core");
const path = require("path");
const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = process.argv[2] || "http://localhost:4311/";
const PAGES = ["index.html", "case.html", "architecture.html"];
const ROUTES = ["", "advisor", "advisor/align", "advisor/docs", "advisor/plan",
  ...["margaret", "tom", "ben", "claire", "sam"].flatMap(p => [`me/${p}`, `me/${p}/checkin`, `me/${p}/options`, `me/${p}/plan`])];
const WIDTHS = [360, 390, 768, 1024, 1440];
const out = { links: [], errors: [], overflow: [], clipped: [], dead: [], noAlt: [], smallTaps: [], tour: [], ask: [] };

(async () => {
  const b = await chromium.launch({ executablePath: BIN });
  const ctx = await b.newContext();

  // 1. links and assets on every site page
  const seen = new Set();
  for (const pg of PAGES) {
    const p = await ctx.newPage();
    await p.goto(BASE + pg, { waitUntil: "networkidle" });
    const urls = await p.evaluate(() => [...document.querySelectorAll("a[href], img[src], iframe[src], link[href]")].map(e => e.href || e.src).filter(u => u && !u.startsWith("mailto:")));
    for (const u of urls) {
      const clean = u.split("#")[0]; if (!clean || seen.has(clean)) continue; seen.add(clean);
      try { const r = await ctx.request.get(clean, { timeout: 15000, maxRedirects: 5 }); if (r.status() >= 400) out.links.push(`${pg}: ${r.status()} ${clean}`); }
      catch (e) { out.links.push(`${pg}: FAIL ${clean} (${e.message.split("\n")[0]})`); }
    }
    await p.close();
  }

  // 2-4. every page and route at every width
  const check = async (p, label, w) => {
    const r = await p.evaluate((w) => {
      const res = { overflow: 0, clipped: [], dead: [], noAlt: [], small: [] };
      res.overflow = document.documentElement.scrollWidth - w;
      for (const el of document.querySelectorAll("p, h1, h2, h3, b, span, a, button, td, th, label")) {
        const cs = getComputedStyle(el); if (cs.display === "none" || cs.visibility === "hidden") continue;
        if (el.scrollWidth > el.clientWidth + 1 && cs.overflow !== "visible" && el.clientWidth > 0) res.clipped.push(el.tagName + " “" + el.textContent.trim().slice(0, 40) + "”");
        const r = el.getBoundingClientRect();
        if (r.right > w + 1 && !el.closest(".phone, .table-scroll, svg")) res.clipped.push("past edge: " + el.tagName + " “" + el.textContent.trim().slice(0, 40) + "”");
      }
      for (const bt of document.querySelectorAll("button")) if (!bt.dataset.act && !bt.closest("[data-act]") && !bt.disabled) res.dead.push(bt.textContent.trim().slice(0, 40));
      for (const im of document.querySelectorAll("img")) if (!im.hasAttribute("alt")) res.noAlt.push(im.src.split("/").pop());
      if (w <= 390) for (const t of document.querySelectorAll("button, a.btn, .bnav a, a.row, .seg button")) { const r = t.getBoundingClientRect(); if (r.width && r.height < 36 && !t.closest(".tour-dots")) res.small.push(t.textContent.trim().slice(0, 30) + ` (${Math.round(r.height)}px)`); }
      return res;
    }, w);
    if (r.overflow > 0) out.overflow.push(`${label} @${w}: +${r.overflow}px`);
    r.clipped.forEach(c => out.clipped.push(`${label} @${w}: ${c}`));
    r.dead.forEach(c => out.dead.push(`${label}: ${c}`));
    r.noAlt.forEach(c => out.noAlt.push(`${label}: ${c}`));
    r.small.forEach(c => out.smallTaps.push(`${label} @${w}: ${c}`));
  };
  for (const w of WIDTHS) {
    const p = await ctx.newPage({});
    await p.setViewportSize({ width: w, height: 900 }); await p.emulateMedia({ reducedMotion: "reduce" });
    p.on("pageerror", e => out.errors.push(`@${w} ${p.url()}: ${e.message}`));
    p.on("console", m => m.type() === "error" && out.errors.push(`@${w} ${p.url()}: ${m.text()}`));
    for (const pg of PAGES) { await p.goto(BASE + pg, { waitUntil: "networkidle" }); await p.waitForTimeout(200); await check(p, pg, w); }
    await p.goto(BASE + "prototype/?reset#/", { waitUntil: "networkidle" });
    for (const r of ROUTES) { await p.evaluate(h => { location.hash = "#/" + h; }, r); await p.waitForTimeout(150); await check(p, "#/" + (r || "picker"), w); }
    await p.close();
  }

  // 5. tour end to end on a phone, clicking each target
  {
    const p = await ctx.newPage(); await p.setViewportSize({ width: 390, height: 844 }); await p.emulateMedia({ reducedMotion: "reduce" });
    p.on("pageerror", e => out.errors.push("tour: " + e.message));
    await p.goto(BASE + "prototype/?tour", { waitUntil: "networkidle" });
    for (let i = 0; i < 6; i++) {
      await p.waitForTimeout(500);
      const step = await p.evaluate(() => ({ route: location.hash, title: document.querySelector(".tour b")?.textContent, target: !!document.querySelector(".tour-target") }));
      if (!step.target) { out.tour.push(`step ${i + 1} ${step.title}: no highlighted target`); }
      else await p.click(".tour-target");
      await p.waitForTimeout(300);
      const after = await p.evaluate(() => ({ btn: document.querySelector('[data-act="tour-next"]')?.textContent, msg: document.querySelector(".tour p")?.textContent }));
      out.tour.push(`step ${i + 1} ${step.title} @ ${step.route}: after tap -> button “${after.btn}”, “${after.msg}”`);
      await p.click('[data-act="tour-next"]');
    }
    await p.waitForTimeout(400);
    out.tour.push("after finish: " + (await p.evaluate(() => location.hash + (document.querySelector(".tour") ? " (tour still showing!)" : " (tour closed)"))));
    await p.close();
  }

  // 6. every Ask answer, both models
  {
    const p = await ctx.newPage(); await p.setViewportSize({ width: 1440, height: 900 });
    p.on("pageerror", e => out.errors.push("ask: " + e.message));
    await p.goto(BASE + "prototype/?reset#/", { waitUntil: "networkidle" });
    const viewers = { alex: "advisor", margaret: "me/margaret", tom: "me/tom", ben: "me/ben", claire: "me/claire", sam: "me/sam" };
    for (const [v, r] of Object.entries(viewers)) for (const model of ["claude", "gpt"]) {
      await p.evaluate(h => { location.hash = "#/" + h; }, r); await p.waitForTimeout(200);
      const count = await p.evaluate(v => (window.SEED.ask[v] || []).length, v);
      for (let i = 0; i < count; i++) {
        await p.click('[data-act="ask-open"]'); await p.waitForTimeout(150);
        await p.click(`[data-act="model"][data-id="${model}"]`); await p.waitForTimeout(100);
        await p.click(`.sheet [data-act="ask"][data-id="${i}"]`); await p.waitForTimeout(4200);
        const res = await p.evaluate(() => ({ answer: document.querySelector(".answer")?.textContent.length || 0, card: !!document.querySelector(".mini"), src: document.querySelector(".answer .src")?.textContent }));
        out.ask.push(`${v}/${model} q${i + 1}: answer ${res.answer} chars, card ${res.card ? "yes" : "MISSING"}, ${res.src}`);
        await p.keyboard.press("Escape"); await p.waitForTimeout(100);
      }
    }
    await p.close();
  }
  await b.close();
  for (const [k, v] of Object.entries(out)) { console.log(`\n== ${k} (${v.length})`); [...new Set(v)].slice(0, 60).forEach(x => console.log("  " + x)); }
})();
