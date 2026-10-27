// node shots.js [baseUrl]  -> desktop (1920x1080) and mobile (390x844) PNGs in ../../prototype/shots, plus console errors
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = process.argv[2] || "http://localhost:4311/prototype/";
const OUT = path.join(__dirname, "../../prototype/shots");
const DESKTOP = [
  "", "advisor", "advisor/align", "advisor/docs", "advisor/plan",
  "me/walt", "me/dale", "me/kyle", "me/sloane", "me/sloane/checkin", "me/dale/options", "me/walt/plan",
  "story/hook", "story/cast", "story/problem", "story/sauce", "story/close",
];
const MOBILE = ["", "advisor", "advisor/align", "me/dale", "me/sloane/checkin", "me/dale/options"];
// Each "ask" shot opens the assistant on a route and runs one suggested question.
const ASKS = [{ route: "me/dale", q: 1, name: "ask_dale_clause" }, { route: "advisor", q: 0, name: "ask_alex_prep" }];

async function shoot(browser, viewport, routes, suffix, errors) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: suffix === "m" ? 2 : 1 });
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(BASE + "?reset#/", { waitUntil: "networkidle" });
  for (const r of routes) {
    await page.evaluate(h => { location.hash = "#/" + h; }, r);
    await page.waitForTimeout(300);
    await page.evaluate(() => document.fonts.ready);
    const name = (r || "picker").replace(/\//g, "_") + (suffix ? "_" + suffix : "");
    await page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: process.env.FULL === "1" });
  }
  if (suffix !== "m") {
    for (const a of ASKS) {
      await page.evaluate(h => { location.hash = "#/" + h; }, a.route);
      await page.waitForTimeout(300);
      await page.evaluate(q => window.FT.ask(q), a.q);
      await page.waitForTimeout(4500);
      await page.screenshot({ path: path.join(OUT, a.name + ".png") });
    }
  }
  await page.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars"] });
  const errors = [];
  await shoot(browser, { width: 1920, height: 1080 }, DESKTOP, "", errors);
  await shoot(browser, { width: 390, height: 844 }, MOBILE, "m", errors);
  await browser.close();
  console.log("desktop:", DESKTOP.length, "mobile:", MOBILE.length, "asks:", ASKS.length, "errors:", errors.length ? errors : "none");
})();
