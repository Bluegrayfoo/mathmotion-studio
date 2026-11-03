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

This first version supports 2D scenes, eight object types, four preset curves, and up to 100 objects / 120 seconds per project. It does not yet support arbitrary formulas, LaTeX typesetting, 3D, voiceover, or Manim Python imports. The starter scenes illustrate the primitives; the circle scene does not simulate a rotating point driving the sine wave.

## Per-page backgrounds

Use **Background pages** to give a title screen and the rest of a video different backgrounds:

1. Select Page 1, turn off **Show grid**, and choose a background color.
2. Scrub to where the next page should start (for example, 3 seconds).
3. Click **+ Page here**. The new page initially copies the preceding background.
4. Turn its grid on or choose different background, grid-line, and axis colors.

Each page lasts until the next page starts, or the end of the video. The page selector jumps to its start. Rename pages, edit their start times without crossing adjacent pages, or delete pages with **Delete page**. The first page always begins at zero. If you shorten the video, first move or delete pages beyond the new duration.

Pages control backgrounds; object appearance and disappearance still use the shared video timeline. Background settings are included in saved projects, autosaves, preview, and video exports. Older projects automatically become a single background page with their existing grid setting.

## Object styling and calculus scenes

The inspector includes line width, opacity, rotation, fade-out duration, and movement easing (smooth, linear, or ease-in). Text supports serif, sans-serif, and monospace typefaces. The new **area** object draws midpoint rectangles under the selected curve, with an editable rectangle count (2–100).

Choose **Area under a curve** for a black canvas, white serif heading, cyan curve, green rectangles, and yellow mathematical annotation. The visual direction draws from the thumbnail and official lesson for [The Essence of Calculus](https://www.3blue1brown.com/lessons/essence-of-calculus/); it is an original preset, not a reproduction of the video.

**Apply classic math style** changes only the current page to a black background with gray axes and no grid. **Show axes** and **Show grid** are independent, so a title page can have neither and a graph page can have axes without a full grid. Object colors are set individually. Turn off axes as well as the grid for a completely plain title background.

## Refinements from the supplied calculus clip

The calculus starters now use off-center numbered axes, thin curves, and blue-to-green diagrams on a black background. These controls are editable:

- **Axis origin X/Y** moves the axes independently of scene objects; **Axis numbers** adds unit ticks, labels, and x/y labels. Position graph objects at the same origin to align them.
- **Graph X min/max** sets the domain for curves and area rectangles.
- **Color gradient**, **End color**, and **Fill opacity** control area rectangles and concentric rings.
- **A circle made of rings** is a new starter. Its **rings** object has an editable ring count and progressively reveals from the center outward.
- Text accepts multiple lines and an **Italic text** setting for mathematical labels.

These are original diagrams inspired by the supplied reference. The app does not include the reference video or extracted frames. Rings currently reveal as concentric bands; they do not morph into rectangles. Text still uses browser fonts rather than LaTeX typesetting.

## Pi presenters

Click **+ pi** to add an original canvas-drawn pi character, or choose **Meet your pi presenter** for a ready-made scene. Customize its color, size, position and movement using the regular object controls.

The inspector adds **Expression** (happy, thinking, surprised, sad, talking), **Look X/Y** (−1 to 1), **Auto blink**, and a multiline **Speech bubble** (up to 120 characters). Talking animates the mouth; it does not generate speech or synchronize to audio. Blinks and mouth motion use timeline time, so scrubbing and export use the same animation. The bubble stays attached to the character; keep room above and to its right.

To change expression during a scene, duplicate the character, give the copies consecutive appearance/end times, and change the second expression. This is an independently drawn pi presenter, not an imported 3Blue1Brown character asset.

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
