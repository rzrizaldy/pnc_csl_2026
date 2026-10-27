// node shots.js [baseUrl]  -> desktop (1920x1080) and mobile (390x844 @2x) PNGs in ../../prototype/shots, plus console errors.
// FULL=1 takes full-page shots. Some shots set up demo state first (a sent question, a reply, votes) via window.FT.set.
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const BASE = process.argv[2] || "http://localhost:4320/prototype/";
const OUT = path.join(__dirname, "../../prototype/shots");
// [route, name, state patch applied before the shot]
const MID = { started: true, invited: true, shared: ["q1"], approved: true };
const VOTED = { ...MID, votes: { sam: "balanced" } };
const ASKED = { ...VOTED, msgs: [{ id: "sam-demo", from: "sam", qi: 0, at: "Just now" }] };
const REPLIED = { ...ASKED, replies: { "sam-demo": "At closing, expected next fall. Your share is $4.0M with an equal split and up to $4.5M if Ben's buyer equity counts. It can go to any bank. If you'd like an account next to the family's plan, I can introduce you to a PNC wealth advisor, with no obligation." } };
const DESKTOP = [
  ["", "splash"], ["preview", "preview"], ["me/margaret/setup", "me_margaret_setup", { fairMeans: "balanced" }], ["advisor/guide", "advisor_guide", MID],
  ["me/sam/decide", "me_sam_decide", { tree: { sam: { count: "balanced", pay: "trust", earn: "half" } } }], ["advisor", "advisor"], ["advisor/align", "advisor_align"], ["advisor/align", "advisor_align_approved", MID],
  ["advisor/inbox", "advisor_inbox", ASKED], ["advisor/plan", "advisor_plan", VOTED],
  ["me/margaret", "me_margaret"], ["me/margaret/plan", "me_margaret_plan"], ["me/tom", "me_tom"], ["me/ben", "me_ben"], ["me/claire", "me_claire"],
  ["me/claire/checkin", "me_claire_checkin", { shared: ["q1"] }], ["me/sam", "me_sam"], ["me/sam/options", "me_sam_options"], ["me/sam/options", "me_sam_voted", VOTED],
  ["me/sam/ask", "me_sam_ask", REPLIED], ["year-one", "year_one"],
  ["story/hook", "story_hook"], ["story/cast", "story_cast"], ["story/problem", "story_problem"], ["story/sauce", "story_sauce"], ["story/close", "story_close"],
];
const MOBILE = [
  ["", "splash_m"], ["preview", "preview_m"], ["me/margaret/setup", "me_margaret_setup_m"], ["advisor/guide", "advisor_guide_m", MID],
  ["me/sam/decide", "me_sam_decide_m", { tree: { sam: { count: "balanced", pay: "trust", earn: "half" } } }], ["year-one", "year_one_full_m"], ["advisor", "advisor_m"], ["advisor/align", "advisor_align_m"], ["advisor/inbox", "advisor_inbox_m", ASKED],
  ["me/margaret", "me_margaret_m"], ["me/sam", "me_sam_m"], ["me/claire/checkin", "me_claire_checkin_m", { shared: ["q1"] }],
  ["me/sam/options", "me_sam_options_m"], ["me/sam/options", "me_sam_voted_m", VOTED], ["me/sam/ask", "me_sam_ask_m", REPLIED], ["year-one", "year_one_m"],
];

async function shoot(browser, viewport, list, errors) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: viewport.width < 500 ? 2 : 1 });
  await page.emulateMedia({ reducedMotion: "reduce" }); // stills show the final state, not mid-animation
  page.on("console", m => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(BASE + "?reset#/", { waitUntil: "networkidle" });
  for (const [r, name, patch] of list) {
    await page.evaluate(p => { window.FT.reset(); if (p) window.FT.set(p); }, patch || null);
    await page.evaluate(h => { location.hash = "#/" + h; }, r);
    await page.waitForTimeout(350);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(OUT, name + ".png"), fullPage: process.env.FULL === "1" });
  }
  await page.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars"] });
  const errors = [];
  await shoot(browser, { width: 1920, height: 1080 }, DESKTOP, errors);
  await shoot(browser, { width: 390, height: 844 }, MOBILE, errors);
  await browser.close();
  console.log("desktop:", DESKTOP.length, "mobile:", MOBILE.length, "errors:", errors.length ? errors : "none");
})();
