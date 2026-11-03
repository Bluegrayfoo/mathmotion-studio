# MathMotion Studio

A local, visual studio for making mathematical explainer animations inspired by the clarity and dark-canvas aesthetic of 3Blue1Brown. Create scenes in your browser, animate objects, and export your own videos. An original independent project; not affiliated with 3Blue1Brown and not a Manim frontend.

## Install with TLIB

Requires Python 3.10+ and [TLIB](https://github.com/Bluegrayfoo/TLIB). No pip or npm dependencies.

```sh
tlib install Bluegrayfoo/mathmotion-studio
mathmotion
```

The command opens http://127.0.0.1:8765 in your default browser. Stop the server with Ctrl+C. TLIB downloads public repositories, so this repository is public.

```sh
mathmotion --port 9000       # choose another port
mathmotion --port 0          # choose an available port
mathmotion --no-browser      # print URL without opening browser
tlib update Bluegrayfoo/mathmotion-studio
```

## Download and run

Download and extract the GitHub ZIP, open a terminal in the folder, then run:

```sh
python3 server.py
```

Or clone it:

```sh
git clone https://github.com/Bluegrayfoo/mathmotion-studio.git
cd mathmotion-studio
python3 server.py
```

Windows: use `py -3 server.py` if `python3` is unavailable. TLIB itself requires zsh; the downloaded studio can run without TLIB.

## Make a video

1. Start with a circle-and-sine scene, moving vectors, or a parabola.
2. Add text, circles, vectors, rectangles, and function curves. Select objects in the left panel.
3. Change colors, size, start/end coordinates, appearance time, drawing duration, and end time in the inspector. Text accepts Unicode math symbols such as π, ∑, ∫, and ².
4. Play or scrub the timeline. Objects draw in, then smoothly move from their start position to their end position. Layer order follows the object list. Coordinates use x from −8 to 8 and y from −4.5 to 4.5.
5. Click **Export video**. Keep the tab visible during recording. A 1920×1080 video downloads after one scene duration.
6. **Save project** downloads editable JSON. **Open project** restores it. Browser storage also autosaves the current scene, but a downloaded project is the portable backup.

Export uses the browser's MediaRecorder and canvas capture at a requested 30 fps. Chromium browsers are recommended. WebM is preferred; MP4 is used if that is the supported format. Recording runs in real time and may drop frames on slow computers or background tabs. There is no audio track. For MP4 conversion with optional FFmpeg installed:

```sh
ffmpeg -i your-video.webm -c:v libx264 -pix_fmt yuv420p your-video.mp4
```

This first version supports 2D scenes, five object types, four preset curves, and up to 100 objects / 120 seconds per project. It does not yet support arbitrary formulas, LaTeX typesetting, 3D, voiceover, or Manim Python imports. The starter scenes illustrate the primitives; the circle scene does not simulate a rotating point driving the sine wave.

## Privacy and architecture

All assets ship with the app. No accounts, telemetry, external fonts, CDN requests, or cloud render service. The Python standard-library server binds only to `127.0.0.1` and serves an explicit asset allowlist. Project JSON is validated and never executed as code. The canvas renderer and editor run in the browser.

- `web/engine.js`: scene model, validation, interpolation, canvas rendering.
- `web/app.js`: editor, local saves, JSON imports, recording.
- `server.py`: local launcher/server.
- `build.py`: bundles the server and assets into a relocatable executable zipapp.
- `info.xml`: TLIB build/install contract. The installed `mathmotion` command contains all assets and remains usable if TLIB's download cache is removed.

## Development and tests

Python 3.10+ and Node 22+ (Node is only needed for tests):

```sh
node --test tests/*.test.js
python3 -m unittest discover -s tests
python3 build.py
./dist/mathmotion
```

Tests cover project validation, timing, starter serialization, curve values, relocation of the built executable, asset serving, and rejection of non-asset paths. Browser export requires a manual browser check; it is not covered by these automated tests.

MIT licensed.
