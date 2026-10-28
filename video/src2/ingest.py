"""Drop in Nindy's recording (one take, a 1-2 s pause between the 13 lines), get the final film.

    python3 ingest.py ~/Desktop/voiceover.m4a                 # split on the pauses, re-time, render, mux
    python3 ingest.py take.mov --cuts '0.4-5.1,6.9-12.6,...'  # give the 13 line boundaries by hand (seconds)
    python3 ingest.py take.m4a --no-render                    # only split, re-time and mix; render later

1. Loudness-normalises the take (-16 LUFS) and splits it on silence into exactly as many lines as shots.json has
   scenes. If it finds a different number it prints what it found and stops: re-record, or pass --cuts,
   or tune --min-gap (shorter pauses) / --noise-db (noisier room).
2. Writes each line's spoken length into shots.json, so every scene's dur = max(min, speech + air + hold).
3. Mixes the lines onto a track as long as the film (video/build/vo_rec.wav) and rewrites the .srt.
4. Renders (node render.js video --audio rec) -> video/family_table_final.mp4, plus a fresh family_table_silent.mp4.
Fails loudly instead of guessing.
"""
import argparse, re, subprocess, sys
from pathlib import Path

import vo

HERE = Path(__file__).resolve().parent


def speech_segments(wav: Path, noise_db: int, min_gap: float):
    log = vo.ff("-i", str(wav), "-af", f"silencedetect=noise={noise_db}dB:d={min_gap}", "-f", "null", "-").stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    total = vo.wav_seconds(wav)
    edges, t = [], 0.0  # speech = the gaps between silences
    for s, e in zip(starts, ends + [total]):
        if s - t > 0.25:
            edges.append((t, s))
        t = e
    if total - t > 0.25:
        edges.append((t, total))
    return edges


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("recording")
    ap.add_argument("--cuts", help="manual line boundaries, e.g. '0.4-5.1,6.9-12.6,...' (seconds in the original take)")
    ap.add_argument("--noise-db", type=int, default=-38)
    ap.add_argument("--min-gap", type=float, default=0.9, help="shortest pause between lines, seconds")
    ap.add_argument("--no-render", action="store_true")
    a = ap.parse_args()

    cfg = vo.load()
    n = len(cfg["scenes"])
    vo.CLIPS.mkdir(parents=True, exist_ok=True)
    clean = vo.BUILD / "rec_clean.wav"
    vo.ff("-i", a.recording, "-vn", "-ac", "1", "-af", "highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000", "-c:a", "pcm_s16le", str(clean))

    segs = ([tuple(map(float, c.split("-"))) for c in a.cuts.split(",")] if a.cuts
            else speech_segments(clean, a.noise_db, a.min_gap))
    print(f"found {len(segs)} spoken lines; the script has {n}")
    if len(segs) != n:
        for i, (s, e) in enumerate(segs, 1):
            print(f"  {i:2d}: {s:7.2f}-{e:7.2f} s ({e - s:4.1f} s)")
        sys.exit("Line count doesn't match. Re-record with a clear 2 s pause between lines, pass --cuts with the "
                 f"{n} boundaries, or retry with --min-gap 0.6 (shorter pauses) / --noise-db -32 (noisier room).")

    for i, (sc, (s, e)) in enumerate(zip(cfg["scenes"], segs)):
        if not a.cuts:
            s, e = max(0.0, s - 0.08), e + 0.12  # keep the breath in and the tail of the last word
        out = vo.clip_path(i, sc, "rec")
        vo.ff("-ss", f"{s:.3f}", "-to", f"{e:.3f}", "-i", str(clean), "-af",
              f"afade=t=in:d=0.02,afade=t=out:st={max(0.0, e - s - 0.06):.3f}:d=0.06", "-c:a", "pcm_s16le", str(out))
        sc["speech"] = round(vo.wav_seconds(out), 2)
    vo.retime(cfg)
    vo.save(cfg)
    total = vo.report(cfg)  # exits if over 120 s
    mix, _ = vo.mix(cfg, "rec")
    vo.write_srt(cfg)
    print(f"mix: {mix.name}, {total:.2f} s; cues rewritten")
    if not a.no_render:
        subprocess.run(["node", "render.js", "video", "--audio", "rec"], cwd=HERE, check=True)


if __name__ == "__main__":
    main()
