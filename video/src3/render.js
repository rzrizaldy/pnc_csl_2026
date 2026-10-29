// Renders the final film (v6; silent, cut to RECORDING_SCRIPT_v6.md) from stage.html, deterministically.
//
//   node render.js stills [--every 2] [--from 0] [--to 116] [--at 3,10.5]
//                         stills at those film times plus contact sheets in video/build3/stills/
//   node render.js video [--ver v6]  60 fps picture -> video/family_table_<ver>_silent.mp4 (picture + silent AAC 48 kHz stereo).
//                         Refuses to overwrite an existing file; earlier versions are kept.
//
// Time is fake: Playwright's clock drives every timer, requestAnimationFrame and Date in the stage and the app iframes,
// and the stage pauses and seeks the app's CSS animations each frame. View Transitions are removed. Frames are captured
// at device scale 2 (3840×2160) and downscaled with lanczos, so push-ins on the devices stay sharp.
const { chromium } = require("playwright-core");
const { spawn, execFileSync } = require("child_process");
const fs = require("fs"), path = require("path"), http = require("http");

const DIR = __dirname, ROOT = path.resolve(DIR, "../.."), VIDEO = path.resolve(DIR, ".."), BUILD = path.join(VIDEO, "build3");
const BIN = process.env.CHROME_BIN || path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const arg = (name, def) => { const i = process.argv.indexOf("--" + name); return i > 0 ? process.argv[i + 1] : def; };
const MODE = process.argv[2] || "stills", DSF = +arg("dsf", MODE === "video" ? 2 : 1);
const CFG = JSON.parse(fs.readFileSync(path.join(DIR, "shots.json"), "utf8")), FPS = CFG.fps;

const TYPES = { html: "text/html", js: "text/javascript", css: "text/css", json: "application/json", jpg: "image/jpeg", png: "image/png", svg: "image/svg+xml" };
function serve() {
  const srv = http.createServer((q, r) => {
    const f = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
    if (!f.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
    fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { "content-type": TYPES[f.split(".").pop()] || "application/octet-stream", "cache-control": "max-age=3600" }); r.end(b); });
  });
  return new Promise(res => srv.listen(0, "127.0.0.1", () => res(srv)));
}
const ff = (...a) => execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...a], { stdio: "inherit" });

(async () => {
  const srv = await serve(), port = srv.address().port;
  const browser = await chromium.launch({ executablePath: BIN, args: ["--hide-scrollbars", "--force-color-profile=srgb", "--font-render-hinting=none"] });
  const ctx = await browser.newContext({ viewport: { width: CFG.width, height: CFG.height }, deviceScaleFactor: DSF });
  await ctx.addInitScript(() => { try { delete Document.prototype.startViewTransition; } catch (e) {} });
  const page = await ctx.newPage();
  page.on("pageerror", e => console.error("page error:", e.message));
  page.on("console", m => { if (m.type() === "error") console.error("console:", m.text()); });
  const T0 = new Date("2026-10-28T14:00:00Z").getTime();
  await page.clock.install({ time: T0 });
  await page.goto(`http://127.0.0.1:${port}/video/src3/stage.html`, { waitUntil: "load" });
  const shots = await page.evaluate(() => window.boot());
  await page.clock.pauseAt(T0 + 120000);
  // --take take.json (from take.py plan): film time is warped so every scene starts when its line starts in the take
  const story = await page.evaluate(() => window.TOTAL), TAKE = arg("take") ? JSON.parse(fs.readFileSync(arg("take"), "utf8")) : null;
  let total = story, warp = t => t;
  if (TAKE) {
    let s0 = 0, t0 = 0; const segs = CFG.scenes.map((s, i) => { const g = { s0, t0, d: s.dur, D: TAKE.durs[i] }; s0 += s.dur; t0 += TAKE.durs[i]; return g; });
    total = t0; warp = t => { const g = segs.find(g => t < g.t0 + g.D) || segs[segs.length - 1]; return Math.min(story - 1e-6, g.s0 + (t - g.t0) * g.d / g.D); };
  }
  const frames = Math.round(total * FPS);
  // --subs cues.json (from take.py subs): subtitles in film time
  if (arg("subs")) await page.evaluate(c => { window.SUBS = c; }, JSON.parse(fs.readFileSync(arg("subs"), "utf8")));
  console.log(`${shots.length} device shots, ${total.toFixed(3)} s, ${frames} frames`);
  const cdp = await ctx.newCDPSession(page);
  const grab = async () => Buffer.from((await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 93, optimizeForSpeed: true })).data, "base64");
  let clockMs = 0;
  const step = async f => { const tau = warp(f / FPS), ms = Math.round(tau * 1000); if (ms > clockMs) await page.clock.runFor(ms - clockMs); clockMs = Math.max(clockMs, ms); await page.evaluate(([x, o]) => window.frame(x, o), [tau, f / FPS]); };

  if (MODE === "stills") {
    const out = path.join(BUILD, "stills"); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
    const every = +arg("every", 2), from = +arg("from", 0), to = Math.min(+arg("to", total), total - 1 / FPS);
    const at = arg("at") ? arg("at").split(",").map(Number) : [...Array(Math.floor((to - from) / every) + 1).keys()].map(i => from + i * every);
    const want = new Map(at.map(x => [Math.round(x * FPS), "t" + x.toFixed(2).padStart(6, "0")]));
    const last = Math.max(...want.keys());
    // frames run in order from 0 (the app state depends on every earlier action); only the wanted ones are captured
    for (let f = 0; f <= last; f++) { await step(f); if (want.has(f)) fs.writeFileSync(path.join(out, want.get(f) + ".jpg"), await grab()); }
    const files = fs.readdirSync(out).filter(x => x.endsWith(".jpg")).sort();
    for (let i = 0; i * 12 < files.length; i++) {
      const list = files.slice(i * 12, i * 12 + 12), inputs = list.flatMap(x => ["-i", path.join(out, x)]);
      const lab = () => "setsar=1";   // this ffmpeg has no drawtext; sheets read left to right, top to bottom, in time order
      if (list.length === 1) { ff(...inputs, "-vf", `scale=640:360,${lab(0)}`, path.join(out, `sheet_${i + 1}.png`)); continue; }
      const graph = list.map((_, k) => `[${k}:v]scale=640:360:flags=lanczos,${lab(k)}[v${k}]`).join(";") + ";" + list.map((_, k) => `[v${k}]`).join("") +
        `xstack=inputs=${list.length}:layout=${list.map((_, k) => `${(k % 3) * 640}_${Math.floor(k / 3) * 360}`).join("|")}:fill=black[o]`;
      ff(...inputs, "-filter_complex", graph, "-map", "[o]", "-frames:v", "1", path.join(out, `sheet_${i + 1}.png`));
    }
    console.log("stills in", path.relative(ROOT, out));
  } else {
    fs.mkdirSync(BUILD, { recursive: true });
    const pic = path.join(BUILD, arg("pic", TAKE ? "picture_take.mp4" : "picture.mp4"));
    const enc = spawn("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
      "-vf", `scale=${CFG.width}:${CFG.height}:flags=lanczos:out_color_matrix=bt709,format=yuv420p`,
      "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-r", String(FPS), "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
      "-movflags", "+faststart", pic], { stdio: ["pipe", "inherit", "inherit"] });
    const t0 = Date.now();
    for (let f = 0; f < frames; f++) {
      await step(f);
      const buf = await grab();
      if (!enc.stdin.write(buf)) await new Promise(r => enc.stdin.once("drain", r));
      if (f % 600 === 0) console.log(`frame ${f}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    enc.stdin.end(); await new Promise(r => enc.on("close", r));
    if (TAKE) { console.log(`warped picture: ${path.relative(ROOT, pic)} (${total.toFixed(2)} s); next: python3 take.py mux <take>`); await browser.close(); srv.close(); return; }
    const dur = (frames / FPS).toFixed(3), outp0 = path.join(VIDEO, `family_table_${arg("ver", "v6")}_silent.mp4`);
    let outp = outp0;
    if (fs.existsSync(outp) && !process.argv.includes("--force")) { outp = outp0.replace(/\.mp4$/, `_${Date.now()}.mp4`); console.log(`${path.basename(outp0)} exists; writing ${path.basename(outp)} instead`); }
    ff("-i", pic, "-f", "lavfi", "-t", dur, "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2", "-t", dur, "-movflags", "+faststart", outp);
    console.log(`done in ${((Date.now() - t0) / 60000).toFixed(1)} min: ${path.relative(ROOT, outp)}`);
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
