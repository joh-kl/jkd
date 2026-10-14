"""
The chrome texture, after his reference (15 Oct 2026): liquid chrome flowing
diagonally, nested contour rings, deep blacks, a faint iridescent shimmer
(teal, violet, olive) in the reflections. Domain-warped flow (noise fed into
noise, as fluid looks), mapped through a studio environment and a thin-film
tint. Built from whole-frequency sines, so it tiles seamlessly.

  python3 make_chrome.py     writes textures/chrome.png and the Swift resource
"""
import numpy as np
from PIL import Image
from pathlib import Path

N = 1024
rng = np.random.default_rng(7)
Y, X = np.mgrid[0:N, 0:N] / N * 2 * np.pi
# integer wave vectors only, so every function below tiles

def field(octaves=4, aniso=(1, 3)):
    waves = []
    for o in range(octaves):
        k = 2 ** o
        for _ in range(5):
            a = int(rng.integers(-k * aniso[0], k * aniso[0] + 1))
            b = int(rng.integers(-k * aniso[1], k * aniso[1] + 1))
            if a == 0 and b == 0:
                b = 1
            waves.append((a, b, rng.uniform(0, 2 * np.pi), 1 / (k * 1.7)))
    def f(x, y):
        v = sum(w * np.sin(a * x + b * y + p) for a, b, p, w in waves)
        return v / sum(w for *_, w in waves)
    return f

f1, f2, f3, f4 = field(2, (1, 1)), field(2, (1, 1)), field(2, (1, 1)), field(3, (1, 2))
# domain warp twice, gently: big smooth currents rather than small wobbles
qx, qy = f1(X, Y), f2(X, Y)
rx, ry = f3(X + 2.4 * qx, Y + 2.4 * qy), f4(X + 2.4 * qx + 1.7, Y + 2.4 * qy + 9.2)
# the currents run diagonally: a slanted sweep (whole turns per tile, so it
# still tiles), bent by the warped flow
h = (X + Y) / (2 * np.pi) * 2 + 1.25 * f4(X + 2.8 * rx, Y + 2.8 * ry) + 0.45 * rx

def env(t):
    """Studio environment, wrapped: bright, a dark band, mid, near black, bright."""
    t = np.mod(t, 1.0)
    stops = [(0.00, 0.92), (0.16, 0.70), (0.24, 0.12), (0.30, 0.03), (0.40, 0.35),
             (0.55, 0.80), (0.62, 0.98), (0.70, 0.55), (0.80, 0.18), (0.88, 0.45), (1.00, 0.92)]
    out = np.zeros_like(t)
    for (a, va), (b, vb) in zip(stops, stops[1:]):
        m = (t >= a) & (t <= b)
        u = (t[m] - a) / (b - a)
        out[m] = va + (vb - va) * (u * u * (3 - 2 * u))
    return out

v = env(h)
# nested contour rings: thin bright and dark lines following the surface
rings = 0.5 + 0.5 * np.cos(h * 2 * np.pi * 9)
v = v * (0.92 + 0.08 * rings) + 0.05 * (rings ** 16)
# specular glints where the surface is steep
gy, gx = np.gradient(h)
steep = np.hypot(gx, gy) * N / 40
v = np.clip(v + 0.25 * np.clip(steep - 0.6, 0, 1) * (v > 0.5), 0, 1)
# thin-film iridescence: a faint hue that turns with the surface, stronger in the mids
phase = h * 2 * np.pi * 1.5
tint = np.stack([np.cos(phase), np.cos(phase + 2.1), np.cos(phase + 4.2)], -1)
mid = (v * (1 - v) * 4)[..., None]
rgb = v[..., None] + 0.02 * tint * mid + np.array([-0.005, 0.005, 0.01])
rgb += rng.normal(0, 0.006, rgb.shape)              # the faint grain of a render
img = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8))
here = Path(__file__).parent
img.save(here / "textures/chrome.png")
img.save(here.parent / "swift/Sources/JKDDesign/Resources/chrome.png")
img.resize((384, 384), Image.LANCZOS).save(here / "textures/chrome-preview.png")
print("ok")
