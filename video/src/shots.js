// node shots.js [baseUrl]  -> 1920x1080 PNG of every route in ../../prototype/shots, plus console errors
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = process.argv[2] || "http://localhost:4310/";
const OUT = path.join(__dirname, "../../prototype/shots");
const ROUTES = [
  "advisor/signals", "advisor/family", "advisor/brief", "advisor/plan",
  "family/overview", "family/checkin", "family/options", "family/plan",
  "story/hook", "story/problem", "story/sauce", "story/close",
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars"] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(BASE + "?reset#/advisor/signals", { waitUntil: "networkidle" });
  for (const r of ROUTES) {
    await page.evaluate(h => { location.hash = "#/" + h; }, r);
    await page.waitForTimeout(250);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, r.replace("/", "_") + ".png"), fullPage: process.env.FULL === "1" });
  }
  await browser.close();
  console.log("shots:", ROUTES.length, "errors:", errors.length ? errors : "none");
})();
