// node slide_crops.js -> slide-ratio crops of the advisor screens (1100x518 @2x) for the Claude Slides deck
const { chromium } = require("playwright-core");
const path = require("path");
const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const OUT = path.join(__dirname, "../../prototype/shots");
(async () => {
  const b = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars"] });
  const p = await b.newPage({ viewport: { width: 1100, height: 518 }, deviceScaleFactor: 2 });
  await p.emulateMedia({ reducedMotion: "reduce" });
  await p.goto("http://localhost:4311/prototype/?reset#/", { waitUntil: "networkidle" });
  for (const [r, n] of [["advisor", "slide_advisor_home"], ["advisor/align", "slide_advisor_align"]]) {
    await p.evaluate(h => { location.hash = "#/" + h; }, r); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(OUT, n + ".png") });
  }
  await b.close();
})();
