"""Writes video/family_table_v5_cues.srt from shots.json: one cue per scene, from scene start + lead to scene end - 0.3 s.

    python3 cues.py
"""
import json, pathlib
D = pathlib.Path(__file__).parent
cfg = json.loads((D / "shots.json").read_text())
ts = lambda s: "%02d:%02d:%02d,%03d" % (s // 3600, s % 3600 // 60, s % 60, round(s % 1 * 1000))
t, out = 0.0, []
for i, s in enumerate(cfg["scenes"], 1):
    out.append(f"{i}\n{ts(t + cfg['lead'])} --> {ts(t + s['dur'] - .3)}\n{s['line']}\n")
    t += s["dur"]
(D.parent / "family_table_v5_cues.srt").write_text("\n".join(out))
print(f"{len(out)} cues, {t:.1f} s")
