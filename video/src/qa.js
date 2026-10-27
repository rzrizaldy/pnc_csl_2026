// node qa.js [base] -> full QA report: links/assets, console errors, overflow at 5 widths, clipped text,
// dead buttons, missing alt text, small tap targets (mobile), the guided demo end to end from the splash, and the
// ask-Alex loop for every member (question sent, AI draft approved in Alex's inbox, reply shown on the family side).
const { chromium } = require("playwright-core");
const path = require("path");
const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = process.argv[2] || "http://localhost:4320/";
const PAGES = ["index.html", "case.html", "architecture.html"];
const ROUTES = ["", "preview", "advisor", "advisor/align", "advisor/docs", "advisor/guide", "advisor/inbox", "advisor/plan", "year-one", "me/margaret/setup",
  ...["margaret", "tom", "ben", "claire", "sam"].flatMap(p => [`me/${p}`, `me/${p}/checkin`, `me/${p}/options`, `me/${p}/decide`, `me/${p}/ask`, `me/${p}/plan`])];
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
    for (const r of ROUTES) { await p.evaluate(h => { location.hash = "#/" + h; }, r); await p.waitForTimeout(150); await check(p, "#/" + (r || "splash"), w); }
    await p.close();
  }

  // 5. guided demo end to end on a phone, from the splash, tapping each highlighted target
  {
    const p = await ctx.newPage(); await p.setViewportSize({ width: 390, height: 844 }); await p.emulateMedia({ reducedMotion: "reduce" });
    p.on("pageerror", e => out.errors.push("tour: " + e.message));
    await p.goto(BASE + "prototype/?tour", { waitUntil: "networkidle" });
    out.tour.push("start: " + (await p.evaluate(() => location.hash + (document.querySelector('.onb [data-act="tour-start"]') ? " (splash with start button)" : " (NO SPLASH)"))));
    await p.click('[data-act="tour-start"]');
    for (let i = 0; i < 10; i++) {
      await p.waitForTimeout(500);
      const step = await p.evaluate(() => ({ route: location.hash, title: document.querySelector(".tour b")?.textContent, target: !!document.querySelector(".tour-target"), last: document.querySelector('[data-act="tour-next"]')?.textContent === "Finish" }));
      if (step.target) await p.click(".tour-target");
      else if (!step.last) out.tour.push(`step ${i + 1} ${step.title}: NO HIGHLIGHTED TARGET`);
      await p.waitForTimeout(200);
      if (await p.$(".present")) { out.tour.push(`  presenter opened with ${await p.evaluate(() => document.querySelector(".pz-c").textContent)} slides`); for (let k = 0; k < 4; k++) await p.click('.present [data-act="present-nav"][data-id="1"]'); await p.click('.present [data-act="present-close"]'); }
      await p.waitForTimeout(300);
      const after = await p.evaluate(() => ({ btn: document.querySelector('[data-act="tour-next"]')?.textContent, msg: document.querySelector(".tour p")?.textContent }));
      out.tour.push(`step ${i + 1} ${step.title} @ ${step.route}: ${step.target ? "tapped target" : "no action needed"} -> “${after.btn}”, “${after.msg}”`);
      await p.click('[data-act="tour-next"]');
    }
    await p.waitForTimeout(400);
    out.tour.push("after finish: " + (await p.evaluate(() => location.hash + (document.querySelector(".tour") ? " (demo bar still showing!)" : " (demo bar closed)"))));
    await p.close();
  }

  // 6. ask-Alex loop for every member: send each suggested question, Alex approves every AI draft, replies come back
  {
    const p = await ctx.newPage(); await p.setViewportSize({ width: 1440, height: 900 }); await p.emulateMedia({ reducedMotion: "reduce" });
    p.on("pageerror", e => out.errors.push("ask: " + e.message));
    await p.goto(BASE + "prototype/?reset#/", { waitUntil: "networkidle" });
    const members = ["margaret", "tom", "ben", "claire", "sam"];
    for (const v of members) {
      await p.evaluate(h => { location.hash = "#/" + h; }, `me/${v}/ask`); await p.waitForTimeout(200);
      while (await p.$('[data-act="send-q"]')) { await p.click('[data-act="send-q"]'); await p.waitForTimeout(80); }
    }
    await p.evaluate(() => { location.hash = "#/advisor/inbox"; }); await p.waitForTimeout(200);
    const queued = await p.$$eval('[data-act="send"]', b => b.length);
    while (await p.$('[data-act="send"]')) { await p.click('[data-act="send"]'); await p.waitForTimeout(80); }
    out.ask.push(`inbox: ${queued} AI drafts approved and sent`);
    for (const v of members) {
      await p.evaluate(h => { location.hash = "#/" + h; }, `me/${v}/ask`); await p.waitForTimeout(200);
      const r = await p.evaluate(() => ({ asked: document.querySelectorAll(".msg.mine").length, replies: document.querySelectorAll(".msg.alex").length, cards: document.querySelectorAll(".msg.alex .mini").length }));
      out.ask.push(`${v}: ${r.asked} asked, ${r.replies} replies from Alex, ${r.cards} number cards`);
    }
    await p.close();
  }
  await b.close();
  for (const [k, v] of Object.entries(out)) { console.log(`\n== ${k} (${v.length})`); [...new Set(v)].slice(0, 60).forEach(x => console.log("  " + x)); }
})();
