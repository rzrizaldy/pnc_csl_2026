"""Draft voice-over (macOS `say`) and the timing that drives the film.

    python3 vo.py tts     # one TTS clip per line -> measure -> write each scene's dur into shots.json -> mix -> .srt
    python3 vo.py mix     # keep the durs in shots.json as they are (hand-edited, say) and only rebuild the mix and .srt
    python3 vo.py mix --src rec   # same, with the lines cut from a real recording by ingest.py

A scene lasts  dur = max(min, speech + air + hold)  seconds, and its line starts `lead` seconds after the scene starts.
Clips go to video/build/vo/, the mixed track to video/build/vo_<src>.wav (48 kHz stereo, -16 LUFS integrated),
the cues to video/archive/family_table_vo_cues.srt (scene start + 0.3 s to scene end - 0.3 s).
"""
import argparse, json, re, subprocess, sys, wave
from pathlib import Path

HERE = Path(__file__).resolve().parent
VIDEO = HERE.parent
BUILD = VIDEO / "build"
CLIPS = BUILD / "vo"
SHOTS = HERE / "shots.json"
SRT = VIDEO / "archive" / "family_table_vo_cues.srt"
LIMIT = 120.0


def ff(*args, check=True):
    r = subprocess.run(["ffmpeg", "-y", "-hide_banner", *args], capture_output=True, text=True)
    if check and r.returncode:
        sys.exit("ffmpeg failed:\n" + r.stderr[-1200:])
    return r


def load():
    return json.loads(SHOTS.read_text())


def save(cfg):
    SHOTS.write_text(json.dumps(cfg, indent=1, ensure_ascii=False) + "\n")


def wav_seconds(p: Path) -> float:
    with wave.open(str(p)) as w:
        return w.getnframes() / w.getframerate()


def clip_path(i, sc, src):
    return CLIPS / f"{src}_{i + 1:02d}_{sc['id']}.wav"


def retime(cfg):
    """dur = max(min, speech + air + hold), rounded to whole frames."""
    fps = cfg["fps"]
    for sc in cfg["scenes"]:
        d = max(sc.get("min", 0), sc["speech"] + cfg["air"] + sc.get("hold", 0))
        sc["dur"] = round(round(d * fps) / fps, 3)


def starts(cfg):
    t, out = 0.0, []
    for sc in cfg["scenes"]:
        out.append(t)
        t += sc["dur"]
    return out, t


def stamp(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def write_srt(cfg):
    st, _ = starts(cfg)
    rows = []
    for i, (sc, s) in enumerate(zip(cfg["scenes"], st), 1):
        rows.append(f"{i}\n{stamp(s + 0.3)} --> {stamp(s + sc['dur'] - 0.3)}\n{sc['line']}\n")
    SRT.write_text("\n".join(rows))


def loudnorm(src: Path, dst: Path, target=-16.0):
    """Two-pass EBU R128 normalisation to `target` LUFS, true peak -1.5 dBTP, 48 kHz stereo."""
    probe = ff("-i", str(src), "-af", f"loudnorm=I={target}:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-").stderr
    m = json.loads(probe[probe.rfind("{"):probe.rfind("}") + 1])
    ff("-i", str(src), "-af",
       f"loudnorm=I={target}:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
       f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
       "aresample=48000", "-ac", "2", "-c:a", "pcm_s16le", str(dst))


def mix(cfg, src):
    """Every line at its scene start + lead, on a silent bed exactly as long as the film."""
    st, total = starts(cfg)
    inputs, chains = [], []
    for i, (sc, s) in enumerate(zip(cfg["scenes"], st)):
        p = clip_path(i, sc, src)
        if not p.exists():
            sys.exit(f"missing clip {p.name}: run `python3 vo.py tts` or `python3 ingest.py <recording>` first")
        inputs += ["-i", str(p)]
        ms = int(round((s + cfg["lead"]) * 1000))
        chains.append(f"[{i + 1}:a]aformat=sample_rates=48000:channel_layouts=mono,adelay={ms}[a{i}]")
    n = len(cfg["scenes"])
    graph = ";".join(chains) + ";[0:a]" + "".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n + 1}:normalize=0:duration=first[m]"
    raw = BUILD / f"vo_{src}_raw.wav"
    ff("-f", "lavfi", "-t", f"{total:.3f}", "-i", "anullsrc=r=48000:cl=mono", *inputs,
       "-filter_complex", graph, "-map", "[m]", "-c:a", "pcm_s16le", str(raw))
    out = BUILD / f"vo_{src}.wav"
    loudnorm(raw, out)
    raw.unlink()
    return out, total


def report(cfg):
    st, total = starts(cfg)
    print(f"{'#':>2} {'scene':9} {'start':>7} {'speech':>7} {'dur':>6}")
    for i, (sc, s) in enumerate(zip(cfg["scenes"], st), 1):
        print(f"{i:2d} {sc['id']:9} {s:7.2f} {sc['speech']:7.2f} {sc['dur']:6.2f}")
    words = sum(len(re.findall(r"[\w'’-]+", sc["line"])) for sc in cfg["scenes"])
    print(f"total {total:.2f} s, {words} words")
    if total > LIMIT:
        sys.exit(f"Over {LIMIT:.0f} s. Tighten the script (or trim `hold`/`min` in shots.json); don't speed the voice up.")
    return total


def tts(cfg):
    CLIPS.mkdir(parents=True, exist_ok=True)
    v = cfg["voice"]
    for i, sc in enumerate(cfg["scenes"]):
        aiff = CLIPS / f"tmp_{i + 1:02d}.aiff"
        subprocess.run(["say", "-v", v["say"], "-r", str(v["rate"]), "-o", str(aiff), sc["tts"]], check=True)
        out = clip_path(i, sc, "tts")
        # trim the synthesiser's leading/trailing silence so `speech` is the spoken length only
        ff("-i", str(aiff), "-af",
           "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse,"
           "aresample=48000", "-ac", "1", "-c:a", "pcm_s16le", str(out))
        aiff.unlink()
        sc["speech"] = round(wav_seconds(out), 2)
    retime(cfg)
    save(cfg)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["tts", "mix"])
    ap.add_argument("--src", default="tts", choices=["tts", "rec"])
    a = ap.parse_args()
    cfg = load()
    if a.cmd == "tts":
        tts(cfg)
    total = report(cfg)
    out, _ = mix(cfg, "tts" if a.cmd == "tts" else a.src)
    write_srt(cfg)
    print(f"mix: {out.relative_to(VIDEO.parent)}  ({total:.2f} s)\ncues: {SRT.relative_to(VIDEO.parent)}")


if __name__ == "__main__":
    main()
