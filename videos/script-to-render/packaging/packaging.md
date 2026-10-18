# Packaging: how this video was made (script-to-render)

Draft, 2026-10-18. Not uploaded. A 60 s behind-the-scenes piece: an AI agent (Claude Code) makes a video as code and
shows each step with its own evidence. Built by hand following `/thumbnail` and `/packaging` rules (no Gemini key and
no face kit in the session); run `/packaging` for the full three-bet treatment once there is click-through data.

## Title

**How an AI Agent Made This Video, From Script to Render**

Alternates: "This Video Shows How It Was Made, Step by Step" · "I Let Claude Code Make a Video. Here Are the Receipts."
Rule kept: the thumbnail hook ("13 STEPS") does not appear in the title.

## Thumbnail A (rendered)

`thumb-A.jpg` (1280x720, 73 KB), source `remotion/src/shots/script-to-render/ScriptToRenderThumb.tsx`.

- **Hook:** "13 STEPS" in signal green: the skill's stages 0 to 12, which the video's step rail walks through.
- **Hero:** the real first lines of the video's script on a paper sheet, "receipts" underlined in red pen.
- **Hierarchy:** hook, then sheet; a row of 13 filled bubbles echoes the rail. Bottom-right is clear for the timestamp.
- **Honesty:** every element is in the video: the 13 stages, the script lines, the underline.
- **Checked:** read at 1280 and at 320 px wide. The hook reads at 320; the sheet becomes texture, which is fine for a
  prop. First render had a half-empty sheet and an underline running past the word; both fixed.

Re-render: `cd remotion && node scripts/render-one.mjs script-to-render ScriptToRenderThumb --still 0 --scale=1`, then
convert `out/stills/ScriptToRenderThumb-f0.png` to JPG.

## Ideas for B and C

- **B, the receipt:** the S7 receipt card large, with the MEASURED stamp. Hook word: "RECEIPTS".
- **C, the face:** the host next to the thumbnail-inside-the-thumbnail. Needs the face kit and `/thumbnail`.

## Description (draft)

```
Claude Code made this video, and the video shows how: the brief, the script, the plan to the frame, the
design, the stills it read (and the bug they caught), the render, the measurements, and the thumbnail.

Every number on screen was measured on the video's own first render. Nothing is a mock-up.

The workflow is a skill I keep improving after every video. Tell me what you'd want an AI agent to make next.
```
