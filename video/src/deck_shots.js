// node deck_shots.js [baseUrl]  -> one 1920x1080 PNG per deck slide in ../../prototype/shots/deck_NN.png, after its build has played.
// Also prints console errors. Default base is the launch.json "prototype" server.
const { chromium } = require("playwright-core");
const path = require("path");

const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = (process.argv[2] || "http://localhost:4310/").replace(/\/?$/, "/");
const OUT = path.join(__dirname, "../../prototype/shots");

(async () => {
  const browser = await chromium.launch({ executablePath: BIN });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(BASE + "deck.html?clean#1", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const n = await page.evaluate(() => window.DECK.slides.length);
  for (let i = 0; i < n; i++) {
    await page.evaluate(k => window.DECK.show(k), i);
    await page.waitForTimeout(3600); // the longest build is about 3 s
    const id = await page.evaluate(() => window.DECK.slides[window.DECK.index]);
    const file = path.join(OUT, `deck_${String(i + 1).padStart(2, "0")}_${id}.png`);
    await page.screenshot({ path: file });
    const hidden = await page.evaluate(() => [...document.querySelectorAll(".slide:not(.leave) .b")].filter(e => +getComputedStyle(e).opacity < 0.99).length);
    console.log(`${i + 1}. ${id}${hidden ? `  (${hidden} elements still faded)` : ""}`);
  }
  await browser.close();
  if (errors.length) { console.log("console errors:\n" + errors.join("\n")); process.exit(1); }
})();
