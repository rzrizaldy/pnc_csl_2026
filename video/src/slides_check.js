// node slides_check.js <deckRoot> <outDir>
// Renders each project/slides/<id>.html at 1920x1080 with a preflight-style reset, and reports overflow:
// elements past the 920px footer line (except the pinned footer), past the canvas, or wider than their box.
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const [root, out] = process.argv.slice(2);
const SHOTS = path.join(__dirname, "../../prototype/shots");
const BLOBS = {
  "46d7200a7f8b22515fb2e7b41c2b416c": "me_dale_m.png",
  "625893920ad910b40f97780c54418830": "me_sloane_checkin_m.png",
  "77df969c7ccdb6d532b897da02ffb6d6": "advisor.png",
  "a9490ad77fee05a355c70d24e72ef719": "advisor_align.png",
  "d0f8f95dbc0879ed7072b3a17c48f9e0": "slide_advisor_home.png",
  "e189d56a99a8f3b3dffd75d0d2c938bc": "slide_advisor_align.png",
};
const deck = JSON.parse(fs.readFileSync(path.join(root, "project/deck.json"), "utf8"));
const CSS = `*,:before,:after{box-sizing:border-box;margin:0;padding:0;border:0 solid}
html,body{margin:0;background:#222}
section{position:relative;width:1920px;height:1080px;overflow:hidden}
h1{font-size:96px;font-weight:600;line-height:1.1}h2{font-size:64px;font-weight:600;line-height:1.15}h3{font-size:44px;font-weight:600;line-height:1.2}
p{font-size:32px;line-height:1.4}img,svg{display:block}aside{display:none}
table{border-collapse:collapse;width:100%}th,td{padding:.35em .6em;text-align:left;border-bottom:1px solid rgba(0,0,0,.12);vertical-align:top}th{font-weight:600}
hr{height:0;border-top-width:1px}`;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ executablePath: BIN });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const report = [];
  for (const id of deck.order) {
    let html = fs.readFileSync(path.join(root, "project/slides", id + ".html"), "utf8");
    html = html.replace(/\/_blob\/([0-9a-f]{32})/g, (m, b) => BLOBS[b] ? "file://" + path.join(SHOTS, BLOBS[b]) : m);
    const doc = `<!doctype html><html><head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>${CSS}</style></head><body>${html}</body></html>`;
    const file = path.join(out, id + ".html");
    fs.writeFileSync(file, doc);
    await page.goto("file://" + file, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const issues = await page.evaluate(() => {
      const sec = document.querySelector("section"), S = sec.getBoundingClientRect(), res = [];
      for (const el of sec.querySelectorAll("*")) {
        if (el.closest("svg") && el.tagName !== "svg") continue;
        const r = el.getBoundingClientRect(); if (!r.width && !r.height) continue;
        const pinned = getComputedStyle(el).position === "absolute";
        const label = el.tagName.toLowerCase() + " “" + (el.textContent || el.alt || "").trim().slice(0, 50) + "”";
        if (r.bottom > S.top + 1080 + 0.5 || r.right > S.left + 1920 + 0.5) res.push("off canvas: " + label + ` bottom=${Math.round(r.bottom)} right=${Math.round(r.right)}`);
        else if (!pinned && r.bottom > S.top + 920.5 && !el.closest("[style*='position:absolute']")) res.push("past 920 line: " + label + ` bottom=${Math.round(r.bottom)}`);
        if (el.scrollWidth > el.clientWidth + 1 && /^(P|H1|H2|H3|TD|TH)$/.test(el.tagName)) res.push("text wider than box: " + label);
      }
      const flowBottom = Math.max(...[...sec.children].filter(c => getComputedStyle(c).position !== "absolute" && c.tagName !== "ASIDE").map(c => c.getBoundingClientRect().bottom));
      return { flowBottom: Math.round(flowBottom), res };
    });
    await page.screenshot({ path: path.join(out, id + ".png") });
    report.push({ id, ...issues });
  }
  await browser.close();
  for (const r of report) console.log(`${r.id}: flow ends at ${r.flowBottom}px${r.res.length ? "\n  - " + [...new Set(r.res)].join("\n  - ") : " · ok"}`);
})();
