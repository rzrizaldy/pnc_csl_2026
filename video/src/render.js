#!/usr/bin/env node
// Renders video/family_table_silent.mp4 from the prototype, frame by frame, with Playwright and ffmpeg.
//   node render.js            full render (about 7 to 10 minutes), writes the .srt and runs the checks
//   node render.js stills     steps through every frame, saves 3 stills per shot and two contact sheets
// Options: --port 4320  --dsf 1|2 (deviceScaleFactor; 2 renders sharper text and downsizes with lanczos)
// Env: CHROME=/path/to/chrome-headless-shell to override Playwright's own executable.
const fs = require("fs"), path = require("path"), { spawn, spawnSync, execSync } = require("child_process");
const { chromium } = require("playwright-core");

const SRC = __dirname, VIDEO = path.resolve(SRC, ".."), ROOT = path.resolve(VIDEO, "..");
const argv = process.argv.slice(2), opt = (k, d) => { const i = argv.indexOf("--" + k); return i >= 0 ? argv[i + 1] : d; };
const MODE = argv.includes("stills") ? "stills" : "render";
const PORT = +opt("port", 4320), DSF = +opt("dsf", 1);
const BASE = `http://localhost:${PORT}`;
const shotsJson = JSON.parse(fs.readFileSync(path.join(SRC, "shots.json"), "utf8"));
const FPS = shotsJson.fps || 60;
const OUT_VIDEO = path.join(VIDEO, "family_table_silent.mp4"), OUT_SRT = path.join(VIDEO, "family_table_vo_cues.srt");
const PREVIEW = path.join(SRC, "preview"); fs.mkdirSync(path.join(PREVIEW, "stills"), { recursive: true });

const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- static server (repo root) ----------
function startServer() {
  try { execSync(`curl -sf -o /dev/null ${BASE}/prototype/`, { stdio: "ignore" }); log("server already up on", PORT); return null; } catch (e) {}
  const p = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1"], { cwd: ROOT, stdio: "ignore" });
  const t0 = Date.now();
  while (Date.now() - t0 < 10000) { try { execSync(`curl -sf -o /dev/null ${BASE}/prototype/`, { stdio: "ignore" }); return p; } catch (e) { spawnSync("sleep", ["0.2"]); } }
  throw new Error("http.server did not start");
}

// ---------- fonts: Google Fonts is often blocked, so serve Barlow and JetBrains Mono from @fontsource ----------
function fontCss() {
  const face = (fam, file, w) => `@font-face{font-family:"${fam}";font-style:normal;font-weight:${w};font-display:block;src:url(${BASE}/video/src/node_modules/@fontsource/${file}) format("woff2")}`;
  return [300, 400, 500, 600, 700].map(w => face("Barlow", `barlow/files/barlow-latin-${w}-normal.woff2`, w)).join("\n")
    + "\n" + face("JetBrains Mono", "jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2", 400);
}

// ---------- voice-over cues ----------
function scriptLines() {
  const md = fs.readFileSync(path.join(VIDEO, "RECORDING_SCRIPT.md"), "utf8").split("\n"), lines = {};
  for (let i = 0; i < md.length; i++) {
    const m = md[i].match(/^### (\d+) ·/); if (!m) continue;
    let j = i + 1; while (j < md.length && !md[j].trim()) j++;
    lines[+m[1]] = md[j].trim();
  }
  return lines;
}
const ts = s => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = Math.floor(s % 60), ms = Math.round((s - Math.floor(s)) * 1000); return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(ms).padStart(3, "0")}`; };
function writeSrt(scenes) {
  const L = scriptLines(); let out = "", n = 0;
  for (const sc of scenes) { n++; out += `${n}\n${ts(sc.start + .4)} --> ${ts(sc.start + sc.dur - .4)}\n${L[sc.line] || ""}\n\n`; }
  fs.writeFileSync(OUT_SRT, out); return OUT_SRT;
}

// ---------- scene table from shots.json ----------
function sceneTable() { let t = 0; return shotsJson.scenes.map(sc => { const r = { id: sc.id, line: sc.line, start: t, dur: sc.dur }; t += sc.dur; return r; }); }
const fmt = s => `${Math.floor(s / 60)}:${String((s % 60).toFixed(1)).padStart(4, "0")}`;

// ---------- ffmpeg ----------
function ffmpegPipe(tmpOut) {
  const scale = DSF !== 1 ? ["-vf", "scale=1920:1080:flags=lanczos"] : [];
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-", ...scale,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", "-r", String(FPS), tmpOut], { stdio: ["pipe", "inherit", "inherit"] });
  const write = buf => new Promise(r => ff.stdin.write(buf) ? r() : ff.stdin.once("drain", r));
  const end = () => new Promise((r, j) => { ff.on("close", c => c === 0 ? r() : j(new Error("ffmpeg exit " + c))); ff.stdin.end(); });
  return { write, end };
}
function addSilence(tmpOut) {
  const r = spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmpOut, "-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000",
    "-c:v", "copy", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", OUT_VIDEO], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("ffmpeg mux failed");
  fs.unlinkSync(tmpOut);
}

// ---------- checks ----------
function checks(scenes) {
  const res = {};
  const probe = JSON.parse(execSync(`ffprobe -v error -print_format json -show_format -show_streams "${OUT_VIDEO}"`).toString());
  const v = probe.streams.find(s => s.codec_type === "video"), a = probe.streams.find(s => s.codec_type === "audio");
  res.duration = +probe.format.duration; res.video = v && `${v.codec_name} ${v.width}x${v.height} ${v.r_frame_rate} ${v.pix_fmt}`; res.audio = a && `${a.codec_name} ${a.sample_rate} Hz ${a.channels} ch`;
  res.ok_duration = res.duration <= 120.0; res.ok_video = v && v.codec_name === "h264" && v.width === 1920 && v.height === 1080 && v.r_frame_rate === "60/1"; res.ok_audio = !!a && a.codec_name === "aac";
  const sc = spawnSync("ffmpeg", ["-i", OUT_VIDEO, "-vf", "select='gt(scene,0.3)',showinfo", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  res.hard_cuts = [...sc.matchAll(/pts_time:([\d.]+)/g)].map(m => +m[1]);
  const fz = spawnSync("ffmpeg", ["-i", OUT_VIDEO, "-vf", "freezedetect=n=0.002:d=2.5", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  res.freezes = [...fz.matchAll(/freeze_start: ([\d.]+)/g)].map(m => +m[1]).filter(t => t < res.duration - 3);
  res.ok_cuts = res.hard_cuts.length === 0; res.ok_freeze = res.freezes.length === 0;
  return res;
}

// ---------- contact sheets ----------
function contactSheets(stills) {
  const py = `
import sys, json
from PIL import Image, ImageDraw
items = json.load(open(sys.argv[1]))
W, H = 640, 360
def sheet(rows, out):
    im = Image.new("RGB", (W*3 + 40, (H+28)*len(rows) + 20), "white"); d = ImageDraw.Draw(im)
    for r, row in enumerate(rows):
        y = 20 + r*(H+28); d.text((10, y-2), row["label"], fill="black")
        for c, f in enumerate(row["files"]):
            im.paste(Image.open(f).convert("RGB").resize((W, H), Image.LANCZOS), (10 + c*(W+10), y+12))
    im.save(out)
half = (len(items)+1)//2
sheet(items[:half], sys.argv[2]); sheet(items[half:], sys.argv[3])
`;
  const j = path.join(PREVIEW, "stills.json"); fs.writeFileSync(j, JSON.stringify(stills));
  const r = spawnSync("python3", ["-I", "-c", py, j, path.join(PREVIEW, "contact_sheet_1.png"), path.join(PREVIEW, "contact_sheet_2.png")], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("contact sheet failed");
}

(async () => {
  const server = startServer();
  const exe = process.env.CHROME || undefined;
  const browser = await chromium.launch({ executablePath: exe, args: ["--disable-gpu-vsync", "--font-render-hinting=none", "--hide-scrollbars"] });
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: DSF, reducedMotion: "no-preference" });
  const page = await ctx.newPage();
  page.on("console", m => { if (m.type() === "warning" || m.type() === "error") log("[page]", m.text()); });
  page.on("pageerror", e => log("[pageerror]", e.message));
  await ctx.route(/fonts\.googleapis\.com/, r => r.fulfill({ status: 200, contentType: "text/css", body: fontCss() }));
  await ctx.route(/fonts\.gstatic\.com/, r => r.abort());
  // View transitions can't be seeked; the stage does the dissolves.
  await ctx.addInitScript(() => { try { delete Document.prototype.startViewTransition; } catch (e) {} });
  const T0 = new Date("2026-10-28T12:00:00Z").getTime();
  await page.clock.install({ time: T0 });
  await page.goto(`${BASE}/video/src/stage.html`, { waitUntil: "load" });
  await page.evaluate(() => stageReady());
  await page.clock.pauseAt(T0 + 120000);
  const plan = await page.evaluate(j => setPlan(j), shotsJson);
  const scenes = sceneTable();
  log(`plan: ${plan.shots.length} shots, ${fmt(plan.total)} total`);
  scenes.forEach(s => log(`  ${fmt(s.start).padStart(6)}  ${s.id} (line ${s.line}, ${s.dur}s)`));
  if (plan.total > 120) throw new Error("over 2:00");

  const cdp = await ctx.newCDPSession(page);
  const shot = async () => Buffer.from((await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true })).data, "base64");
  const N = Math.round(plan.total * FPS);
  const stillTimes = new Map();   // frame -> [shotIdx, pos]
  if (MODE === "stills") plan.shots.forEach((s, i) => [["start", s.start + .6], ["mid", s.start + s.dur / 2], ["end", s.start + s.dur - .08]].forEach(([pos, t]) => stillTimes.set(Math.min(N - 1, Math.round(t * FPS)), [i, pos])));
  const ff = MODE === "render" ? ffmpegPipe(path.join(PREVIEW, "video_only.mp4")) : null;
  const stills = plan.shots.map((s, i) => ({ label: `${i + 1}. ${s.scene} ${s.kind} ${s.route || s.card}  ${fmt(s.start)} +${s.dur.toFixed(1)}s`, files: [] }));
  const t0 = Date.now();
  for (let f = 0; f < N; f++) {
    const t = f / FPS;
    await page.evaluate(t => frame(t), t);
    if (MODE === "render") await ff.write(await shot());
    else if (stillTimes.has(f)) { const [i, pos] = stillTimes.get(f); const p = path.join(PREVIEW, "stills", `${String(i + 1).padStart(2, "0")}_${pos}.png`); fs.writeFileSync(p, await shot()); stills[i].files.push(p); }
    await page.clock.runFor(Math.round((f + 1) * 1000 / FPS) - Math.round(f * 1000 / FPS));
    if (f % (FPS * 10) === 0) log(`frame ${f}/${N}  t=${fmt(t)}  ${((Date.now() - t0) / 1000).toFixed(0)}s elapsed`);
  }
  await browser.close();
  if (server) server.kill();
  if (MODE === "stills") { contactSheets(stills); log("contact sheets:", path.join(PREVIEW, "contact_sheet_1.png"), path.join(PREVIEW, "contact_sheet_2.png")); return; }
  await ff.end();
  addSilence(path.join(PREVIEW, "video_only.mp4"));
  const srt = writeSrt(scenes);
  const res = checks(scenes);
  log("video:", OUT_VIDEO); log("cues: ", srt);
  log("checks:", JSON.stringify(res, null, 1));
  fs.writeFileSync(path.join(PREVIEW, "report.json"), JSON.stringify({ scenes, checks: res }, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
