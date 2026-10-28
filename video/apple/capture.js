// node capture.js -> high-res app screens for the film, plus boxes.json with the zoom targets (in image pixels).
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path");
const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = process.argv[2] || "http://localhost:4311/prototype/";
const OUT = path.join(__dirname, "assets");
const MID = { started: true, invited: true, shared: ["q1"], approved: true, fairMeans: "balanced" };
const PHONE = [
  ["phone_checkin", "me/claire/checkin", { shared: ["q1"] }, { themes: ".themes", share: '[data-act="toggle-share"][data-id="q1"]' }, ".q"],
  ["phone_vote", "me/sam/options", { ...MID, votes: { sam: "balanced" }, pick: "balanced" }, { opt: ".opt.on", hero: ".hero .value" }, null],
  ["phone_decide", "me/sam/decide", { ...MID, votes: { sam: "balanced" }, tree: { sam: { count: "balanced", pay: "trust", earn: "half" } } }, { hero: ".hero" }, null],
  ["phone_ask", "me/sam/ask", { ...MID, msgs: [{ id: "s1", from: "sam", qi: 0, at: "Yesterday" }], replies: { s1: "At closing, expected next fall. Your share is $4.0M with an equal split, and up to $4.5M if Ben's buyer equity is counted. The earnout isn't part of the family gift." } }, { reply: ".msg.alex" }, null],
];
const DESK = [
  ["desk_brief", "advisor/align", { started: true, invited: true, shared: ["q1"] }, { gap: ".col-side.sticky .hero", bars: ".gaps" }],
  ["desk_inbox", "advisor/inbox", { ...MID, msgs: [{ id: "s1", from: "sam", qi: 0, at: "Just now" }] }, { draft: ".inmsg", send: '[data-act="send"]' }],
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars"] });
  const boxes = {};
  const go = async (p, r, st) => { await p.evaluate(([r, st]) => { FT.reset(); FT.set(st); location.hash = "#/" + r; }, [r, st]); await p.waitForTimeout(600);
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete || new Promise(r => { i.onload = i.onerror = r; })))); };
  const measure = (p, sels) => p.evaluate(sels => Object.fromEntries(Object.entries(sels).map(([k, s]) => { const e = document.querySelector(s); if (!e) return [k, null]; const r = e.getBoundingClientRect(); return [k, [r.left, r.top, r.width, r.height].map(v => Math.round(v * 2))]; })), sels);
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto(BASE + "?reset#/", { waitUntil: "networkidle" });
  for (const [n, r, st, sels, to] of PHONE) {
    await go(p, r, st);
    if (to) await p.evaluate(s => { const el = document.querySelector(s); scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }, to);
    await p.waitForTimeout(200);
    boxes[n] = { size: [780, 1688], ...(await measure(p, sels)) };
    await p.screenshot({ path: path.join(OUT, n + ".png") });
  }
  const d = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await d.emulateMedia({ reducedMotion: "reduce" });
  await d.goto(BASE + "?reset#/", { waitUntil: "networkidle" });
  for (const [n, r, st, sels] of DESK) { await go(d, r, st); boxes[n] = { size: [2880, 1800], ...(await measure(d, sels)) }; await d.screenshot({ path: path.join(OUT, n + ".png") }); }
  await b.close();
  for (const f of ["margaret", "alex", "claire", "sam", "ben", "tom"]) fs.copyFileSync(path.join(__dirname, "../../prototype/faces", f + ".jpg"), path.join(OUT, f + ".jpg"));
  fs.writeFileSync(path.join(OUT, "boxes.json"), JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
})();
