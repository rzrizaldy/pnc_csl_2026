"""Original score for the Family Table film, synthesized here (no samples, royalty-free).

    python3 music.py  -> score.wav (120.0 s, 48 kHz stereo, loudness-normalized by render step)

96 BPM, so one bar is 2.5 s and every scene cut in film.html lands on a bar line.
D minor, i-VI-III-VII (Dm, Bb, F, C). Cues follow STORYBOARD.md:
  0-22.5   heartbeat pulse and dark pad, sub booms at 2.5, 10 and 18.75
  22.5-30  riser and snare roll into the title
  30       big boom; 30-45 open pad, light groove from 35, hits at 40, 41.25, 42.5
  45-92.5  full groove for the features, whooshes on the camera moves
  92.5-100 break: pad and drone only
  100-107.5 build, boom at 107.5; 107.5-115 bright groove
  115      final hit, then decay to silence at 120
"""
import wave
import numpy as np

SR = 48000
DUR = 120.0
BPM = 96
BEAT = 60 / BPM
BAR = 4 * BEAT
N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
rng = np.random.default_rng(11)


def hz(m):
    return 440 * 2 ** ((m - 69) / 12)


def add(sig, start, gain=1.0, pan=0.0):
    i = int(round(start * SR))
    if i >= N or i < 0:
        return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * (1 - max(0.0, pan))
    R[i:i + len(sig)] += sig * (1 + min(0.0, pan))


def t_(sec):
    return np.arange(int(sec * SR)) / SR


def adsr(sec, a=0.01, d=0.2, s=0.6, r=0.2):
    t = t_(sec)
    e = np.minimum(1, t / max(a, 1e-4)) * (s + (1 - s) * np.exp(-np.maximum(0, t - a) / d))
    k = min(int(r * SR), len(e))
    e[len(e) - k:] *= np.linspace(1, 0, k)
    return e


def pad(notes, sec, bright=0.0):
    t = t_(sec)
    x = np.zeros_like(t)
    for m in notes:
        for det in (-0.004, 0.0, 0.004):
            f = hz(m) * (1 + det)
            for k in range(1, 7):
                x += np.sin(2 * np.pi * f * k * t + k) / k ** (1.9 - bright)
    return x / (len(notes) * 9) * adsr(sec, a=0.8, d=2.0, s=0.85, r=0.8)


def sub_boom(sec=3.0):
    t = t_(sec)
    f = 32 + 70 * np.exp(-t * 6)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.4)
    n = rng.standard_normal(len(t))
    n = np.convolve(n, np.ones(40) / 40, "same") * np.exp(-t * 3) * 0.5
    return np.tanh((body + n) * 1.6)


def kick(sec=0.4):
    t = t_(sec)
    f = 45 + 110 * np.exp(-t * 35)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)


def heartbeat():
    return kick(0.35) * 0.9


def hat(sec=0.05):
    x = np.diff(rng.standard_normal(int(sec * SR)), prepend=0)
    return x * np.exp(-t_(sec) * 80) * 0.18


def clap():
    x = rng.standard_normal(int(0.2 * SR))
    x = np.convolve(x, np.ones(8) / 8, "same")
    return x * np.exp(-t_(0.2) * 18) * 0.55


def snare():
    t = t_(0.18)
    return (rng.standard_normal(len(t)) * 0.6 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t * 25)


def bass(m, sec):
    t = t_(sec)
    f = hz(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t)
    return np.tanh(x * 1.3) * adsr(sec, a=0.005, d=0.25, s=0.5, r=0.08) * 0.5


def riser(sec):
    t = t_(sec)
    n = rng.standard_normal(len(t))
    # sweep a simple resonant lowpass upward by mixing progressively less-smoothed noise
    out = np.zeros_like(n)
    for k, w in enumerate((200, 80, 30, 10, 3)):
        seg = np.convolve(n, np.ones(w) / w, "same")
        lo, hi = k / 5, (k + 1) / 5
        mask = np.clip((t / sec - lo) / (hi - lo), 0, 1) * np.clip((hi + 0.2 - t / sec) / 0.2, 0, 1)
        out += seg * mask
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * t / sec)) / SR) * 0.25
    return (out * 0.6 + tone) * (t / sec) ** 2


def whoosh(sec=0.9):
    t = t_(sec)
    n = np.convolve(rng.standard_normal(len(t)), np.ones(25) / 25, "same")
    return n * np.sin(np.pi * t / sec) ** 2 * 0.6


def pluck(m, sec=0.4):
    t = t_(sec)
    f = hz(m)
    return sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t * (6 + 4 * k)) / k for k in range(1, 6)) * 0.35


CHORDS = [[62, 65, 69], [58, 62, 65], [65, 69, 72], [60, 64, 67]]   # Dm Bb F C
ROOTS = [38, 34, 41, 36]


def chord_at(t):
    return int(t // BAR) % 4


# --- pads across the whole film (quiet in the hook, open after the title, bright at the end)
t = 0.0
while t < 115:
    i = chord_at(t)
    g = 0.22 if t < 22.5 else 0.30 if t < 92.5 else 0.34
    bright = 0.0 if t < 30 else 0.25 if t < 107.5 else 0.45
    notes = CHORDS[i] if t >= 30 else [CHORDS[i][0] - 12, CHORDS[i][0]]
    add(pad(notes, BAR + 0.8, bright), t, g, pan=-0.15)
    add(pad([n + 12 for n in notes[1:]], BAR + 0.8, bright), t, g * 0.45, pan=0.2)
    t += BAR
add(pad([50, 57, 62, 65, 69], 5.0, 0.4), 115, 0.38)        # final chord, decays with the fade

# --- hook: heartbeat (two thumps per bar) 0-22.5, booms
t = 0.0
while t < 22.5:
    add(heartbeat(), t, 0.55); add(heartbeat(), t + 0.32, 0.38)
    t += BAR
for at, g in ((2.5, 0.9), (10.0, 0.9), (18.75, 0.75)):
    add(sub_boom(), at, g)

# --- riser and snare roll 22.5-30
add(riser(7.4), 22.6, 0.55)
k = 0
t = 27.5
while t < 30:
    step = BEAT / (2 if t < 28.75 else 4)
    add(snare(), t, 0.15 + 0.35 * (t - 27.5) / 2.5)
    t += step

# --- title boom
add(sub_boom(4.0), 30.0, 1.0)
add(whoosh(1.2), 29.0, 0.5)

# --- light groove 35-45, hits on the three words
t = 35.0
while t < 45:
    add(kick(), t, 0.5)
    add(hat(), t + BEAT / 2, 0.8, pan=0.3)
    t += BEAT
for at in (40.0, 41.25, 42.5):
    add(sub_boom(1.4), at, 0.55)
    add(clap(), at, 0.6)


def groove(t0, t1, gain=1.0, arp=True):
    t = t0
    b = 0
    while t < t1 - 1e-6:
        add(kick(), t, 0.75 * gain)
        add(hat(), t + BEAT / 2, 1.0 * gain, pan=0.35)
        if b % 2 == 1:
            add(clap(), t, 0.7 * gain, pan=-0.1)
        if b % 4 == 0:
            i = chord_at(t)
            add(bass(ROOTS[i], BEAT * 0.9), t, 0.9 * gain)
            add(bass(ROOTS[i], BEAT * 0.45), t + BEAT * 2.5, 0.7 * gain)
        if arp:
            i = chord_at(t)
            notes = CHORDS[i] + [CHORDS[i][0] + 12]
            add(pluck(notes[b % 4] + 12, 0.35), t + BEAT / 2, 0.55 * gain, pan=0.25 * (1 if b % 2 else -1))
        t += BEAT
        b += 1


groove(45.0, 92.5, 1.0)
for at in (48.8, 52.6, 60.2, 63.4, 65.2, 72.6, 81.4, 88.0):     # camera moves
    add(whoosh(), at - 0.3, 0.35)
for at in (45.0, 57.5, 70.0, 80.0):                              # section starts
    add(sub_boom(1.6), at, 0.4)

# --- break 92.5-100: drone only, a reverse swell into the build
t = t_(7.5)
drone = np.sin(2 * np.pi * hz(38) * t) * 0.18 * np.sin(np.pi * t / 7.5)
add(drone, 92.5, 1.0)
add(sub_boom(2.0), 92.5, 0.5)
add(riser(2.4), 97.6, 0.4)

# --- build 100-107.5, boom, bright groove 107.5-115
t = 100.0
while t < 107.5:
    add(kick(), t, 0.6)
    if t >= 102.5:
        add(hat(), t + BEAT / 2, 0.9, pan=0.3)
    t += BEAT
for k in range(5):
    add(whoosh(0.5), 100.2 + k * 0.5, 0.25)                      # layers dropping
add(riser(5.0), 102.5, 0.45)
add(sub_boom(3.0), 107.5, 0.95)
groove(107.5, 115.0, 1.05)

# --- final hit
add(sub_boom(5.0), 115.0, 1.0)
add(clap(), 115.0, 0.5)

# --- master: gentle compression, fade out, normalize
mix = np.stack([L, R], axis=1)
fade = np.ones(N)
k = int(1.2 * SR)
fade[-k:] = np.linspace(1, 0, k) ** 2
mix *= fade[:, None]
mix = np.tanh(mix * 1.4) / np.tanh(1.4)
mix /= np.max(np.abs(mix)) + 1e-9
mix *= 0.9
pcm = (mix * 32767).astype(np.int16)
with wave.open("score.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("score.wav", DUR, "s")
