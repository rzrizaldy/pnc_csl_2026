"""Lays a recorded take (voice, or voice plus a face video) over the v6 film, Loom style.

The take stays one continuous, uncut recording, so lips and voice stay in sync. The film is time-warped
instead: every scene starts exactly when its line starts. render.js renders the warp frame by frame, so
nothing is duplicated or dropped.

    python3 take.py plan <take>          finds the 12 line starts, writes take.json (scene durations, offset)
    node render.js video --take take.json  renders the warped picture to video/build3/picture_take.mp4
    python3 take.py mux <take> [--ver v6]  face bubble (bottom left) + cleaned voice -> video/family_table_<ver>_final.mp4

Line starts: the take's pauses (silencedetect) are matched to where each line should end if the reader
kept an even pace (word counts from shots.json), so a long pause inside a line doesn't count as a break.
"""
import json, pathlib, re, subprocess, sys

D = pathlib.Path(__file__).parent
VIDEO = D.parent
CFG = json.loads((D / "shots.json").read_text())
LEAD, MAX_TOTAL, END_MIN, END_MAX = 0.4, 119.9, 4.2, 5.0


def ff(*a):
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *a], check=True)


def probe(path, key):
    return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", f"format={key}", "-of", "default=nw=1:nk=1", path]).decode())


def pauses(path, noise="-35dB", d=0.45):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", f"silencedetect=noise={noise}:d={d}", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
    st = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", err)]
    en = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", err)]
    return list(zip(st, en + [probe(path, "duration")] * (len(st) - len(en))))


def plan(take):
    lines = [s["line"] for s in CFG["scenes"]]
    words = [len(l.split()) for l in lines]
    ps = pauses(take)
    dur = probe(take, "duration")
    first = ps[0][1] if ps and ps[0][0] < 0.05 else 0.0                    # speech starts after any lead-in silence
    last = ps[-1][0] if ps and ps[-1][1] >= dur - 0.05 else dur              # and ends before any tail silence
    inner = [p for p in ps if first < p[0] and p[1] < last and p[1] - p[0] >= 0.55]
    starts, used, cum = [first], set(), 0
    for i in range(len(lines) - 1):
        cum += words[i]
        want = first + (last - first) * cum / sum(words)
        cands = [(abs(p[1] - want), j) for j, p in enumerate(inner) if j not in used and p[1] > starts[-1] + 1.0]
        if not cands:
            sys.exit(f"couldn't find the break after line {i + 1}; expected one near {want:.1f} s")
        _, j = min(cands)
        used.add(j); starts.append(inner[j][1])
    durs = [starts[i + 1] - starts[i] for i in range(len(starts) - 1)]
    film_last = sum(durs)                                                    # film time where the last line starts, minus lead
    end = max(min(END_MAX, MAX_TOTAL - film_last), last - starts[-1] + LEAD + 0.6, END_MIN)
    durs.append(round(end, 3))
    out = {"take": str(pathlib.Path(take).resolve()), "offset": round(starts[0] - LEAD, 3), "lead": LEAD,
           "line_starts": [round(s, 3) for s in starts], "durs": [round(x, 3) for x in durs], "total": round(sum(durs), 3),
           "speed": [round(s["dur"] / x, 3) for s, x in zip(CFG["scenes"], durs)]}
    (D / "take.json").write_text(json.dumps(out, indent=1) + "\n")
    print(f"take.json: total {out['total']} s; film speed per scene {out['speed']}")
    for i, (s, l) in enumerate(zip(starts, lines), 1):
        print(f"  {i:2d}  take {s:6.2f} s  ->  film {sum(durs[:i - 1]) + LEAD:6.2f} s   {l[:60]}")


def mux(take, ver="v6"):
    T = json.loads((D / "take.json").read_text())
    pic = VIDEO / "build3" / "picture_take.mp4"
    out = VIDEO / f"family_table_{ver}_final.mp4"
    if out.exists():
        out = out.with_name(out.stem + "_new.mp4"); print(f"final exists; writing {out.name}")
    total, off = T["total"], T["offset"]
    has_video = "video" in subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type", "-of", "csv=p=0", take]).decode()
    # the voice: cleaned, levelled, faded at the very end with the picture
    a = (f"[1:a]atrim=start={off},asetpts=PTS-STARTPTS,highpass=f=75,lowpass=f=14000,"
         f"acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2,loudnorm=I=-16:TP=-1.5:LRA=9,"
         f"aresample=48000,apad,atrim=0:{total},afade=t=out:st={total - 0.8}:d=0.8[a]")
    if not has_video:
        ff("-i", str(pic), "-i", take, "-filter_complex", a, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out))
        print(out); return
    # the face: a circle cropped around the head, a white rim and a soft shadow, bottom left (the one corner the
    # film keeps clear), fading in after the first frame and out with the picture
    W = 210; R = W // 2
    mk = VIDEO / "build3"
    from PIL import Image, ImageDraw, ImageFilter
    S = 4
    m = Image.new("L", (W * S, W * S), 0); ImageDraw.Draw(m).ellipse([0, 0, W * S - 1, W * S - 1], fill=255); m = m.resize((W, W), Image.LANCZOS); m.save(mk / "bubble_mask.png")
    P = 24; F = W + 2 * P
    sh = Image.new("RGBA", (F, F), (0, 0, 0, 0)); ImageDraw.Draw(sh).ellipse([P, P + 8, P + W, P + W + 8], fill=(3, 8, 26, 120)); sh = sh.filter(ImageFilter.GaussianBlur(10))
    ring = Image.new("RGBA", (F * S, F * S), (0, 0, 0, 0)); ImageDraw.Draw(ring).ellipse([(P - 3) * S, (P - 3) * S, (P + W + 3) * S, (P + W + 3) * S], outline=(255, 255, 255, 255), width=5 * S)
    ring = ring.resize((F, F), Image.LANCZOS); sh.alpha_composite(ring); sh.save(mk / "bubble_frame.png")
    x, y = 40, 1080 - 40 - W
    v = (f"[1:v]trim=start={off},setpts=PTS-STARTPTS,crop=760:760:160:230,scale={W}:{W}:flags=lanczos,format=rgba[f0];"
         f"[f0][2:v]alphamerge,fade=t=in:st=0.15:d=0.5:alpha=1,fade=t=out:st={total - 0.8}:d=0.75:alpha=1[face];"
         f"[3:v]format=rgba,fade=t=in:st=0.15:d=0.5:alpha=1,fade=t=out:st={total - 0.8}:d=0.75:alpha=1[rim];"
         f"[0:v][rim]overlay={x - P}:{y - P}:eof_action=pass[b0];[b0][face]overlay={x}:{y}:eof_action=pass:shortest=0,format=yuv420p[v]")
    ff("-i", str(pic), "-i", take, "-loop", "1", "-i", str(mk / "bubble_mask.png"), "-loop", "1", "-i", str(mk / "bubble_frame.png"),
       "-filter_complex", v + ";" + a, "-map", "[v]", "-map", "[a]", "-t", str(total), "-r", "60",
       "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
       "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out))
    print(out)


if __name__ == "__main__":
    cmd, take = sys.argv[1], sys.argv[2]
    ver = sys.argv[sys.argv.index("--ver") + 1] if "--ver" in sys.argv else "v6"
    plan(take) if cmd == "plan" else mux(take, ver)
