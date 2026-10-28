// node slide_shots_canva.js [base] [--tablet] -> the screens used on the three Canva slides (client experience, advisor
// workbench, secret sauce): phone shots at 390x844 @2x and slide-ratio desktop crops at 1100x518 @2x, into slides/canva/raw.
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");
const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = (process.argv[2] && !process.argv[2].startsWith("--") && process.argv[2]) || "http://localhost:4311/prototype/";
const TABLET = process.argv.includes("--tablet") || process.argv.includes("--landscape"); // tablet mockups for the three-slide Claude deck
const LAND = process.argv.includes("--landscape"); // 1024 x 768, the three core-journey screens only
const OUT = path.join(__dirname, LAND ? "../../slides/claude_three/raw_land" : TABLET ? "../../slides/claude_three/raw" : "../../slides/canva/raw");
const MID = { started: true, invited: true, shared: ["q1"], approved: true };
const PHONE = [
  ["preview", "p1_preview", { pv: { preset: "wilson", value: 48, kids: 3, inBiz: 1 } }, null],
  ["me/margaret/setup", "p2_setup", { fairMeans: "balanced" }, ".refine"],
  ["me/claire/checkin", "p3_checkin", { shared: ["q1"] }, ".q"],
  ["me/sam/decide", "p4_decide", { ...MID, votes: { sam: "balanced" }, tree: { sam: { count: "balanced", pay: "trust", earn: "half" } } }, null],
  ["me/sam/ask", "p5_ask", { ...MID, msgs: [{ id: "s1", from: "sam", qi: 0, at: "Yesterday" }], replies: { s1: "At closing, expected next fall. Your share is $4.0M with an equal split, and up to $4.5M if Ben's buyer equity is counted. The earnout isn't part of the family gift." } }, null],
];
const DESK = [
  ["advisor", "d1_signal", {}],
  ["advisor/align", "d2_brief", { started: true, invited: true, shared: ["q1"] }],
  ["advisor/guide", "d3_guide", { ...MID, fairMeans: "balanced" }],
  ["advisor/inbox", "d4_inbox", { ...MID, msgs: [{ id: "s1", from: "sam", qi: 0, at: "Just now" }] }],
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars"] });
  const errs = [];
  const go = async (p, r, st) => { await p.evaluate(([r, st]) => { window.FT.reset(); window.FT.set(st); location.hash = "#/" + r; }, [r, st]); await p.waitForTimeout(450); };
  const p = await b.newPage({ viewport: LAND ? { width: 1024, height: 768 } : TABLET ? { width: 768, height: 1024 } : { width: 390, height: 844 }, deviceScaleFactor: 2 });
  p.on("pageerror", e => errs.push(e.message));
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto(BASE + "?reset#/", { waitUntil: "networkidle" });
  for (const [r, n, st, to] of (LAND ? PHONE.filter(([, n]) => /checkin|decide|ask/.test(n)) : PHONE)) {
    await go(p, r, st);
    if (to && !LAND) await p.evaluate(s => { const el = document.querySelector(s); scrollTo(0, el.getBoundingClientRect().top + scrollY - 64); }, to);
    await p.evaluate(() => Promise.all([...document.images].map(i => i.complete || new Promise(r => { i.onload = i.onerror = r; }))));
    await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(OUT, n + ".png") });
  }
  if (TABLET) { await b.close(); console.log("errors:", errs.length ? errs : "none"); return; }
  const d = await b.newPage({ viewport: { width: 1100, height: 620 }, deviceScaleFactor: 2 });
  d.on("pageerror", e => errs.push(e.message));
  await d.emulateMedia({ reducedMotion: "reduce" });
  await d.goto(BASE + "?reset#/", { waitUntil: "networkidle" });
  for (const [r, n, st] of DESK) { await go(d, r, st); await d.screenshot({ path: path.join(OUT, n + ".png") }); }
  await b.close();
  console.log("errors:", errs.length ? errs : "none");
})();
