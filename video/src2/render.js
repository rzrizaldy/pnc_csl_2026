// Renders the voice-over film from stage.html, deterministically.
//
//   node render.js stills [--only id,id]   start, middle and end stills of every scene, plus contact sheets,
//                                          in video/build/stills/ (cheap: frames are simulated, only stills captured)
//   node render.js video  [--audio tts|rec] 60 fps picture, then the muxes:
//                                          video/family_table_silent.mp4    picture + silent AAC 48 kHz stereo
//                                          video/family_table_vo_draft.mp4  picture + build/vo_tts.wav (TTS draft)
//                                          video/family_table_final.mp4     picture + build/vo_rec.wav (with --audio rec)
//
// Time is fake: Playwright's clock drives every timer, requestAnimationFrame and Date in the stage and the app iframes,
// and the stage pauses and seeks the app's CSS animations each frame. View Transitions are removed. Frames are captured
// at device scale 2 (3840×2160) and downscaled with lanczos, so camera push-ins stay sharp.
const { chromium } = require("playwright-core");
const { spawn, execFileSync } = require("child_process");
const fs = require("fs"), path = require("path"), http = require("http");

const DIR = __dirname, ROOT = path.resolve(DIR, "../.."), VIDEO = path.resolve(DIR, ".."), BUILD = path.join(VIDEO, "build");
const BIN = process.env.CHROME_BIN || path.join(process.env.HOME, "Library/Caches/ms-playwright/chromium_headless_shell-1234/chrome-headless-shell-mac-arm64/chrome-headless-shell");
const arg = (name, def) => { const i = process.argv.indexOf("--" + name); return i > 0 ? process.argv[i + 1] : def; };
const MODE = process.argv[2] || "stills", DSF = +arg("dsf", 2);
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
  await page.goto(`http://127.0.0.1:${port}/video/src2/stage.html`, { waitUntil: "load" });
  const shots = await page.evaluate(() => window.boot());
  await page.clock.pauseAt(T0 + 120000);
  const total = await page.evaluate(() => window.TOTAL), frames = Math.round(total * FPS);
  console.log(`${shots.length} shots, ${total.toFixed(3)} s, ${frames} frames`);
  const cdp = await ctx.newCDPSession(page);
  const grab = async () => Buffer.from((await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 93, optimizeForSpeed: true })).data, "base64");

  // scene windows
  let t = 0; const scenes = CFG.scenes.map(s => { const o = { id: s.id, start: t, end: t + s.dur }; t += s.dur; return o; });
  let clockMs = 0;
  const step = async f => { const ms = Math.round(f * 1000 / FPS); if (ms > clockMs) await page.clock.runFor(ms - clockMs); clockMs = ms; await page.evaluate(x => window.frame(x), f / FPS); };

  if (MODE === "stills") {
    const only = arg("only") ? arg("only").split(",") : null, out = path.join(BUILD, "stills");
    fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
    const want = new Map();
    scenes.forEach((s, i) => { if (only && !only.includes(s.id)) return;
      const n = String(i + 1).padStart(2, "0"), at = [s.start + .45, (s.start + s.end) / 2, s.end - .4];
      at.forEach((x, k) => want.set(Math.round(x * FPS), `${n}_${s.id}_${"abc"[k]}`));
      (arg("extra") || "").split(",").filter(Boolean).forEach(x => { const v = +x; if (v >= s.start && v < s.end) want.set(Math.round(v * FPS), `${n}_${s.id}_t${v.toFixed(2)}`); });
    });
    const keep = f => !only || scenes.some(s => only.includes(s.id) && f / FPS >= s.start - 1 && f / FPS <= s.end);
    for (let f = 0; f < frames; f++) {
      if (!keep(f)) continue;
      await step(f);
      if (want.has(f)) fs.writeFileSync(path.join(out, want.get(f) + ".jpg"), await grab());
    }
    // contact sheets: three stills per scene, five scenes per sheet
    const files = fs.readdirSync(out).filter(x => /_[abc]\.jpg$/.test(x)).sort();
    for (let i = 0; i * 15 < files.length; i++) {
      const list = files.slice(i * 15, i * 15 + 15), rows = Math.ceil(list.length / 3);
      const inputs = list.flatMap(x => ["-i", path.join(out, x)]);
      const graph = list.map((_, k) => `[${k}:v]scale=640:360:flags=lanczos[v${k}]`).join(";") + ";" + list.map((_, k) => `[v${k}]`).join("") +
        `xstack=inputs=${list.length}:layout=${list.map((_, k) => `${(k % 3) * 640}_${Math.floor(k / 3) * 360}`).join("|")}:fill=black[o]`;
      if (list.length === 1) ff(...inputs, "-vf", "scale=640:360", path.join(out, `sheet_${i + 1}.jpg`));
      else ff(...inputs, "-filter_complex", graph, "-map", "[o]", "-frames:v", "1", "-q:v", "3", path.join(out, `sheet_${i + 1}.jpg`));
      console.log(`sheet_${i + 1}.jpg: ${rows} scenes`);
    }
    console.log("stills in", path.relative(ROOT, out));
  } else {
    fs.mkdirSync(BUILD, { recursive: true });
    const pic = path.join(BUILD, "picture.mp4");
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
    const dur = (frames / FPS).toFixed(3);
    const aac = ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2"];
    ff("-i", pic, "-f", "lavfi", "-t", dur, "-i", "anullsrc=r=48000:cl=stereo", "-map", "0:v", "-map", "1:a", "-c:v", "copy", ...aac, "-t", dur, "-movflags", "+faststart", path.join(VIDEO, "family_table_silent.mp4"));
    const src = arg("audio", "tts"), wav = path.join(BUILD, `vo_${src}.wav`), name = src === "rec" ? "family_table_final.mp4" : "family_table_vo_draft.mp4";
    if (fs.existsSync(wav)) ff("-i", pic, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", ...aac, "-t", dur, "-movflags", "+faststart", path.join(VIDEO, name));
    else console.log(`no ${path.relative(ROOT, wav)}: run vo.py first for ${name}`);
    console.log(`done in ${((Date.now() - t0) / 60000).toFixed(1)} min: video/family_table_silent.mp4` + (fs.existsSync(wav) ? `, video/${name}` : ""));
  }
  await browser.close(); srv.close();
})().catch(e => { console.error(e); process.exit(1); });
