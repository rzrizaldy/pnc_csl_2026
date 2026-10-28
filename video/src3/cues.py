"""Writes video/family_table_<version>_cues.srt from shots.json: one cue per scene, from scene start + lead to scene end - 0.3 s.

    python3 cues.py [version]     (default v6; earlier versions' files are never overwritten)
"""
import json, pathlib, sys
D = pathlib.Path(__file__).parent
cfg = json.loads((D / "shots.json").read_text())
ts = lambda s: "%02d:%02d:%02d,%03d" % (s // 3600, s % 3600 // 60, s % 60, round(s % 1 * 1000))
t, out = 0.0, []
for i, s in enumerate(cfg["scenes"], 1):
    out.append(f"{i}\n{ts(t + cfg['lead'])} --> {ts(t + s['dur'] - .3)}\n{s['line']}\n")
    t += s["dur"]
ver = sys.argv[1] if len(sys.argv) > 1 else "v6"
out_path = D.parent / f"family_table_{ver}_cues.srt"
if out_path.exists() and ver != "v6": sys.exit(f"{out_path.name} exists; not overwriting")
out_path.write_text("\n".join(out))
print(f"{len(out)} cues, {t:.1f} s")
