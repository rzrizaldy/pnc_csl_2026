// node render.js preview [t1,t2,...]  -> stills in preview/ at the given times (default: key moments)
// node render.js video                -> 3600 frames at 30 fps piped to ffmpeg, then the music muxed in
const { chromium } = require("playwright-core");
const { spawn, execFileSync } = require("child_process");
const fs = require("fs"), path = require("path");
const DIR = __dirname, FPS = 30;
const BIN = path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const KEY = [2.6, 5, 11, 17, 20.5, 28.5, 32.5, 38, 43.5, 47.5, 50.8, 54.5, 61.8, 66.8, 74.5, 80.2, 84.8, 90, 96.8, 106, 113.5, 118];
(async () => {
  const mode = process.argv[2] || "preview";
  const b = await chromium.launch({ executablePath: BIN, args: ["--no-sandbox", "--hide-scrollbars"] });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto("file://" + path.join(DIR, "film.html"), { waitUntil: "networkidle" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.images].map(i => i.complete || new Promise(r => { i.onload = i.onerror = r; }))));
  const total = await p.evaluate(() => window.DURATION);
  if (mode === "preview") {
    const times = process.argv[3] ? process.argv[3].split(",").map(Number) : KEY;
    fs.mkdirSync(path.join(DIR, "preview"), { recursive: true });
    for (const t of times) { await p.evaluate(x => window.seek(x), t); await p.screenshot({ path: path.join(DIR, "preview", `t${String(t).padStart(5, "0")}.jpg`), type: "jpeg", quality: 80 }); }
    console.log("preview done:", times.length, "stills");
  } else {
    const silent = path.join(DIR, "silent.mp4");
    const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-preset", "medium", silent], { stdio: ["pipe", "inherit", "inherit"] });
    const frames = Math.round(total * FPS);
    for (let f = 0; f < frames; f++) {
      await p.evaluate(x => window.seek(x), f / FPS);
      const buf = await p.screenshot({ type: "jpeg", quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
      if (f % 300 === 0) console.log(`frame ${f}/${frames}`);
    }
    ff.stdin.end(); await new Promise(r => ff.on("close", r));
    const out = path.join(DIR, "..", "family_table_film.mp4");
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", silent, "-i", path.join(DIR, "score.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", out]);
    console.log("video done:", out);
  }
  await b.close();
})();
