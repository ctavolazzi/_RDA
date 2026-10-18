# Script to render: how this video was made

Made with the `script-to-render` skill (`_workbench/.claude/skills/script-to-render/`), on its first full run.
CT's ask, 2026-10-18: "Once you’re ready, output a finished video explaining the steps you took to make it".

## Brief

For: the channel; a short behind-the-scenes piece on how an AI agent makes a video as code.
Viewer: someone curious about AI tools who has never seen a video built from code.
Length: 60 s at 30 fps, 1920x1080 (1800 frames).
Voice: none, text-led. There is no `.env` in this session, so no voice key (checked: `ls .env` fails).
Music: `docu-pluck` (63 s) at 0.8 with no voice, mastered to -16 LUFS / -1.5 dBTP.
Real versus sample: everything on screen is real. The script lines are this file. The scene plan is this video's.
The stills are this video's. The numbers in S7 are measured on this video's first full render; the second render
only adds them to the screen.
Environment limits: no API keys; the cloud proxy blocks Google Fonts in headless Chrome (local fonts only).
Thumbnail hook (not in the title): "13 STEPS".

## Script

Scene durations add to 1800 frames: 5 + 7 + 6 + 7 + 6 + 7 + 8 + 6 + 5 + 3 = 60 s.

### S1 Open (5 s)
On screen:
- Claude Code made this video.
- Here is every step.
- With receipts.
Notes: "receipts" gets the red-pen underline. The step rail (13 bubbles, 0 to 12) appears.

### S2 Orient and brief, steps 0 and 1 (7 s)
On screen:
- Check what you have.
- No voice key here, so the words on screen carry it.
- Terminal: `rda idea "A video that shows how it was made: …"` then `parked in docs/ideas.md`; `ls .env` then
  `ls: cannot access '.env': No such file or directory`.
- Brief chips: 60 s, 1920x1080, 30 fps, text-led.

### S3 Script, step 2 (6 s)
On screen:
- Words before code.
- Every line you read was written here first.
- A sheet titled `videos/script-to-render/script.md` showing the S1 lines above.

### S4 Plan, step 3 (7 s)
On screen:
- Plan to the frame.
- A bar to scale: ten scenes, S1 to S10, with their frame numbers.
- 1800 frames. 60 seconds at 30 fps.
- Every sound sits on a frame a scene exports.

### S5 Design and build, steps 4 and 5 (6 s)
On screen:
- One kit. One file per scene.
- Palette swatches and the three typefaces from the style bible.
- Terminal: `ls _scenes/` listing the ten scene files.

### S6 Stills, step 6 (7 s)
On screen:
- Read every still.
- Before the full render. Layout bugs show up here, not in the code.
- Five real stills of this video (S1 to S5), each marked as read. A defect, if one was found and fixed, is shown with the
  red pen and named. None is invented.

### S7 Render and measure, steps 7 and 8 (8 s)
On screen:
- Render, then measure.
- Terminal: the render command with its log file, `echo $?` and `0`; the frame count; the loudness before and
  after mastering.
- Stamp: MEASURED.
- Label, muted mono caps: Measured on this video's first render. This render only added the numbers.

### S8 Thumbnail and package, steps 9 and 10 (6 s)
On screen:
- Every video ships with a thumbnail.
- The thumbnail at full size, then at 320 px wide: it still reads.
- The working title under it.

### S9 Record and show, steps 11 and 12 (5 s)
On screen:
- Write it down. Then show it.
- Quote card: "Show me please". The host, after a report with only numbers.
- So the process now ends with the video, not a report.

### S10 Outro (3 s)
On screen:
- script-to-render
- Every run makes the next one better.
