// node slide_shots_v2.js [base] -> slide-ready shots of the round-7 screens: phone shots (390x844 @2x) and
// slide-ratio desktop crops (1100x518 @2x) of the meeting guide and the presenter.
const { chromium } = require("playwright-core");
const path = require("path");
const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = process.argv[2] || "http://localhost:4311/prototype/";
const OUT = path.join(__dirname, "../../prototype/shots");
const PHONE = [
  ["preview", "slide_preview_m", { pvRead: true, pvDocs: { names: ["Financial statements, 2023 to 2025.pdf", "Shareholder register.pdf", "NorthPeak letter of intent.pdf"], own: false }, pv: { value: 48, kids: 3, inBiz: 1 } }, null],
  ["me/margaret/setup", "slide_setup_m", { fairMeans: "balanced" }, ".refine"],
  ["me/sam/decide", "slide_decide_m", { votes: { sam: "balanced" }, tree: { sam: { count: "balanced", pay: "trust" } } }, null],
];
(async () => {
  const b = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars"] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto(BASE + "?reset#/", { waitUntil: "networkidle" });
  for (const [r, n, st, scrollTo] of PHONE) {
    await p.evaluate(([r, st]) => { window.FT.reset(); window.FT.set(st); location.hash = "#/" + r; }, [r, st]); await p.waitForTimeout(400);
    if (scrollTo) await p.evaluate(s => { const el = document.querySelector(s); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 70); }, scrollTo);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(OUT, n + ".png") });
  }
  const d = await b.newPage({ viewport: { width: 1100, height: 518 }, deviceScaleFactor: 2 });
  await d.emulateMedia({ reducedMotion: "reduce" });
  await d.goto(BASE + "?reset#/", { waitUntil: "networkidle" });
  await d.evaluate(() => { window.FT.set({ approved: true, fairMeans: "balanced" }); location.hash = "#/advisor/guide"; }); await d.waitForTimeout(400);
  await d.screenshot({ path: path.join(OUT, "slide_guide.png") });
  await d.click('[data-act="present-open"]'); await d.click('[data-act="present-nav"][data-id="1"]'); await d.waitForTimeout(400);
  await d.screenshot({ path: path.join(OUT, "slide_present.png") });
  await b.close();
})();
