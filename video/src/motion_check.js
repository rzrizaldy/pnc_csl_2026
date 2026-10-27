// node motion_check.js [baseUrl] [outDir] -> entrance and AI-trace frames, the option-switch tween, plus privacy and escaping checks:
// Claire opts out of the summary (gap 1.00 from 4 people -> 0.75 from 3), the vote tally stays hidden below MIN_GROUP,
// and markup typed into a check-in answer or a question to Alex is escaped everywhere it shows up.
const { chromium } = require("playwright-core");
const path = require("path");
const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = process.argv[2] || "http://localhost:4320/prototype/";
const OUT = process.argv[3] || "/tmp";
const XSS = '<img src=x onerror="window.__xss=1">';

(async () => {
  const b = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars"] });
  const errors = [];
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } });
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  await page.goto(BASE + "?reset#/", { waitUntil: "networkidle" });
  const go = async h => { await page.evaluate(h => { location.hash = "#/" + h; }, h); await page.waitForTimeout(450); };

  // 1. entrance frames on the advisor signal, and the AI trace playing step by step
  for (const r of ["advisor", "advisor/align"]) {
    await page.evaluate(h => { location.hash = "#/" + h; }, r);
    let last = 0;
    for (const t of [150, 900, 2200, 5200]) { await page.waitForTimeout(t - last); last = t; await page.screenshot({ path: `${OUT}/motion_${r.replace("/", "_")}_${t}.png` }); }
  }
  const traceEnd = await page.evaluate(() => ({ playing: !!document.querySelector(".trace.playing"), done: document.querySelectorAll(".tr-step.on").length }));

  // 2. option switch: Sam's number tweens from $4.25M to $4.5M
  await go("me/sam/options");
  await page.waitForTimeout(800);
  await page.click('button[data-act="pick"][data-id="equity"]');
  await page.waitForTimeout(120);
  const mid = await page.evaluate(() => document.querySelector(".hero .value").textContent);
  await page.waitForTimeout(600);
  const end = await page.evaluate(() => document.querySelector(".hero .value").textContent);

  // 3. vote tally: hidden with 2 of 5 votes, counts only (no names) at 3
  const tallyBefore = await page.evaluate(() => ({ tallyShown: !!document.querySelector(".tally"), text: document.querySelector(".tally-panel .aside").textContent }));
  await page.click('button[data-act="vote"]');
  const tallyAfter = await page.evaluate(() => ({ tallyShown: !!document.querySelector(".tally"), counts: [...document.querySelectorAll(".tl")].map(r => r.textContent.trim()), names: /Margaret|Ben|Claire|Tom/.test(document.querySelector(".tally-panel").textContent) }));

  // 4. privacy: nothing shared by default; Claire opts out -> the summary drops to 3 people
  await go("advisor/align");
  const before = await page.evaluate(() => document.querySelector("[data-gapsummary]").textContent.trim());
  const sealedBefore = await page.evaluate(() => [...document.querySelectorAll(".sealed")].map(x => x.textContent.trim()));
  await go("me/claire/checkin");
  await page.click('button[data-act="toggle-summary"]');
  // 5. escaping: markup in a check-in answer, shared with Alex
  await page.fill('textarea[data-live="q1"]', XSS + " Mom never asked me.");
  await page.waitForTimeout(600);
  await page.click('button[data-act="toggle-share"][data-id="q1"]');
  await go("advisor/align");
  const after = await page.evaluate(() => document.querySelector("[data-gapsummary]").textContent.trim());
  const xssCheckin = await page.evaluate(() => ({ injected: !!document.querySelector(".quote img"), shownAsText: [...document.querySelectorAll(".quote")].some(q => q.textContent.includes("<img")) }));
  // 6. escaping: markup in a free-text question to Alex, then in Alex's edited reply
  await go("me/sam/ask");
  await page.fill("textarea[data-compose]", XSS + " Can I see Ben's number?");
  await page.click('button[data-act="send-free"]');
  await go("advisor/inbox");
  const inboxEsc = await page.evaluate(() => ({ injected: !!document.querySelector(".inmsg img"), fallback: !!document.querySelector(".warn-line") }));
  const id = await page.evaluate(() => [...document.querySelectorAll('[data-act="send"][data-from="sam"]')].pop().dataset.id);
  await page.fill(`textarea[data-draft="${id}"]`, XSS + " Thanks, Sam. I can't share a sibling's number.");
  await page.click(`[data-act="send"][data-id="${id}"]`);
  await go("me/sam/ask");
  const replyEsc = await page.evaluate(() => ({ injected: !!document.querySelector(".thread img"), replyShown: document.querySelector(".thread").textContent.includes("can't share") }));
  const fired = await page.evaluate(() => !!window.__xss);
  await b.close();
  console.log(JSON.stringify({ errors, traceEnd, splitMid: mid, splitEnd: end, tallyBefore, tallyAfter, alignBefore: before, sealedBefore, alignAfterOptOut: after,
    xss: { fired, checkin: xssCheckin, inbox: inboxEsc, reply: replyEsc } }, null, 1));
})();
