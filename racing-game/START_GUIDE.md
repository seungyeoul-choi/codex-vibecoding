# Racing Game Start Guide

`racing-game` is a standalone browser game, so you do not need to install any package before starting it.

## Quick start

1. Move into the project folder.

```bash
cd racing-game
```

2. Start a small local web server.

```bash
python3 -m http.server 8000
```

3. Open your browser and go to:

```text
http://localhost:8000
```

4. The game starts automatically after the page loads.

## Controls

- `Arrow Up` or `W`: accelerate
- `Arrow Down` or `S`: brake
- `Arrow Left` or `A`: steer left
- `Arrow Right` or `D`: steer right
- `R`: restart after the race ends

## Alternative launch method

If your browser allows it, you can also open `index.html` directly without running a server.  
The local server method is still recommended because it matches the most reliable browser setup.

## What you should see

- A title screen labeled `Rival Rush`
- A 3D-style road with AI rivals
- HUD panels for speed, lap, position, and time
- A short countdown, then the race begins

## Troubleshooting

- If nothing appears, make sure you opened the browser at `http://localhost:8000`.
- If port `8000` is already in use, run:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

- If keyboard input does not respond, click once inside the browser window and try again.
