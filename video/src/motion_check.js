// node motion_check.js [baseUrl] -> frame strips of the entrance and split-toggle motion, plus privacy and escaping checks
const { chromium } = require("playwright-core");
const path = require("path");
const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = process.argv[2] || "http://localhost:4311/prototype/";
const OUT = process.argv[3] || "/tmp";

(async () => {
  const b = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars"] });
  const errors = [];
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE + "?reset#/", { waitUntil: "networkidle" });

  // 1. entrance frames on the advisor home and Dale's home
  for (const r of ["advisor", "me/dale"]) {
    await page.evaluate(h => { location.hash = "#/" + h; }, r);
    for (const t of [120, 450, 900, 1800]) {
      await page.waitForTimeout(t === 120 ? 120 : t - [120, 450, 900, 1800][[120, 450, 900, 1800].indexOf(t) - 1]);
      await page.screenshot({ path: `${OUT}/motion_${r.replace("/", "_")}_${t}.png` });
    }
  }
  // 2. split toggle: number should tween, bars glide
  await page.click('button[data-act="preset"][data-id="100"]');
  const mid = await page.evaluate(() => document.querySelector("[data-mine]").textContent);
  await page.waitForTimeout(600);
  const end = await page.evaluate(() => document.querySelector("[data-mine]").textContent);

  // 3. privacy: Sloane opts out of the summary -> advisor count drops; nothing shared by default
  await page.evaluate(() => { location.hash = "#/advisor/align"; });
  await page.waitForTimeout(400);
  const before = await page.evaluate(() => document.querySelector(".hero .value").textContent.trim());
  const sealedBefore = await page.evaluate(() => [...document.querySelectorAll(".sealed")].map(x => x.textContent.trim()));
  await page.evaluate(() => { location.hash = "#/me/sloane/checkin"; });
  await page.waitForTimeout(400);
  await page.click('button[data-act="toggle-summary"]');
  // 4. escaping: type markup into answer 1 and share it
  await page.fill('textarea[data-live="q1"]', '<img src=x onerror="window.__xss=1"> Dad promised me.');
  await page.waitForTimeout(600);
  await page.click('button[data-act="toggle-share"][data-id="q1"]');
  await page.evaluate(() => { location.hash = "#/advisor/align"; });
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => document.querySelector(".hero .value").textContent.trim());
  const xss = await page.evaluate(() => ({ fired: !!window.__xss, injected: !!document.querySelector(".quote img") }));
  await b.close();
  console.log(JSON.stringify({ errors, splitMid: mid, splitEnd: end, alignBefore: before, sealedBefore, alignAfterOptOut: after, xss }, null, 1));
})();
