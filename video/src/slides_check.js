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
  "7a443fab7cc85da3af9e053f8f822af8": "../../slides/claude_three/raw_land/p3_checkin.png",
  "1be6eb346b1834d3dbd6ae0bc9948737": "../../slides/claude_three/raw_land/p4_decide.png",
  "4aef0e68153783241b74dfe501e7ea06": "../../slides/claude_three/raw_land/p5_ask.png",
  "1cb0f5b1113dc45f059174e77e356b79": "../../slides/claude_three/raw/p1_preview.png",
  "316019cbfc0dbc99ebe8c3c1662e1ee0": "../../slides/claude_three/raw/p2_setup.png",
  "c85abe67e76cb8efe76991d7a8abc647": "../../slides/claude_three/raw/p3_checkin.png",
  "2a928541732968e0879d946d6c07b261": "../../slides/claude_three/raw/p4_decide.png",
  "f74c6b25cfbf615cb9270e24198f0b0e": "../../slides/claude_three/raw/p5_ask.png",
  "00b10a6fb555babc2955d568ad271aaf": "../../slides/canva/raw/p1_preview.png",
  "4a78d2396571c3d174f4b8ff7ef2cca7": "../../slides/canva/raw/p2_setup.png",
  "ea944ac49113e8d4e2d86c84a008eea0": "../../slides/canva/raw/p3_checkin.png",
  "0c9eaf352033a2506c833691f6614387": "../../slides/canva/raw/p4_decide.png",
  "877f83e937a54a086c837e3a5dad7cc2": "../../slides/canva/raw/p5_ask.png",
  "e28ff431a61dd2cc888fb85e2d6329ba": "../../slides/canva/raw/d2_brief.png",
  "f6f8d993b93b82da60e607184f52e4e6": "../../slides/canva/raw/d3_guide.png",
  "ad241fcbe874903a1f894ac64e3080b7": "../../slides/canva/raw/d4_inbox.png",
  "c3df44f46f8730bb04ac591f3e265f61": "../../slides/canva/raw/p1_preview.png",
  "8bcedb65332eed8909956d0bf86083ab": "../../slides/canva/raw/p2_setup.png",
  "4dd6b1639d2acee6f039ef34a53d56f8": "../../slides/canva/raw/p3_checkin.png",
  "d2f47a7cc2add5ac5f01cb3dec1a278b": "../../slides/canva/raw/p4_decide.png",
  "d59daa154b6060e96a22e972c90214a1": "../../slides/canva/raw/p5_ask.png",
  "fe3a5a9f6b4663f1a5136c6ee75c8caa": "../../slides/canva/raw/d2_brief.png",
  "ec877cd5e46ed532fa962c9f764c5bd9": "../../slides/canva/raw/d3_guide.png",
  "7bda77cdf091d189984f112ac9ce2664": "../../slides/canva/raw/d4_inbox.png",
  "be9555390a513ef93a7b24a1ab700976": "slide_preview_m.png",
  "fa0b0d6ce2a47680f0954b59c30cabd0": "slide_setup_m.png",
  "e10018dd1d0577b06bfb4bbc93382ffa": "slide_guide.png",
  "ba23ff44203349fd5b042a9a0291bc5c": "slide_present.png",
  "bb6ce9bce7e651bd16badfc4b975f215": "me_sam_voted_m.png",
  "3bb084389be7f5aecbfa94e9515c5996": "me_claire_checkin_m.png",
  "c23687b87853216f7c4e53d773bcad8a": "slide_advisor_home.png",
  "10300e4c12ca713e3ec613b333dbd32b": "slide_advisor_align.png",
  "d0c08c634393e7bbfcbb1d47eca4c869": "slide_preview_m.png",
  "9083f795f8010eba4bf9bc897b49f1c7": "slide_setup_m.png",
  "c0961d67e258497c5b7696f8a09d1357": "slide_decide_m.png",
  "d6c548f7a8539ba27f1200964621a6ac": "slide_guide.png",
  "16391ee3883e4cc10713eb44349addba": "slide_present.png",
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
