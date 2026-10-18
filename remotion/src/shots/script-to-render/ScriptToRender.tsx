import React from 'react';
import { AbsoluteFill, Audio, Sequence, useCurrentFrame } from 'remotion';
import { C, MUSIC, SFX, iio, Bubble, PaperChrome } from '../../lib/rda';
import { S1Open, S1_DUR, S1_CUES } from './_scenes/S1Open';
import { S2Brief, S2_DUR, S2_CUES } from './_scenes/S2Brief';
import { S3Script, S3_DUR, S3_CUES } from './_scenes/S3Script';
import { S4Plan, S4_DUR, S4_CUES } from './_scenes/S4Plan';
import { S5Build, S5_DUR, S5_CUES } from './_scenes/S5Build';
import { S6Stills, S6_DUR, S6_CUES } from './_scenes/S6Stills';
import { S7Measure, S7_DUR, S7_CUES } from './_scenes/S7Measure';
import { S8Thumb, S8_DUR, S8_CUES } from './_scenes/S8Thumb';
import { S9Show, S9_DUR, S9_CUES } from './_scenes/S9Show';
import { S10Outro, S10_DUR, S10_CUES } from './_scenes/S10Outro';

// =============================================================================
// COMPOSITION CONFIG · how this video was made, by the script-to-render skill
// (_workbench/.claude/skills/script-to-render), on its first full run, 2026-10-18.
// Text-led: no voice key in the session. Script: videos/script-to-render/script/script.md.
// Render: cd remotion && node scripts/render-one.mjs script-to-render ScriptToRender
// =============================================================================
export const compositionConfig = {
  id: 'ScriptToRender',
  durationInSeconds: 60,
  fps: 30,
  width: 1920,
  height: 1080,
};

// =============================================================================
// SCENE TIMELINE · durations come from the scene files
// =============================================================================
const SCENES: Array<{ C: React.FC; dur: number }> = [
  { C: S1Open, dur: S1_DUR },
  { C: S2Brief, dur: S2_DUR },
  { C: S3Script, dur: S3_DUR },
  { C: S4Plan, dur: S4_DUR },
  { C: S5Build, dur: S5_DUR },
  { C: S6Stills, dur: S6_DUR },
  { C: S7Measure, dur: S7_DUR },
  { C: S8Thumb, dur: S8_DUR },
  { C: S9Show, dur: S9_DUR },
  { C: S10Outro, dur: S10_DUR },
];
const STARTS = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur], []);
const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].dur; // 1800
const at = (scene: number, local: number) => STARTS[scene] + local;

// =============================================================================
// STEP RAIL · the skill's 13 stages (0 to 12) as answer bubbles. It appears at
// S1_CUES.rail; each bubble fills at a frame its scene exports (SN_CUES.rail),
// in stage order: S2 holds 0 and 1, S3 holds 2, ... S9 holds 11 and 12.
// =============================================================================
const RAIL_IN = at(0, S1_CUES.rail);
const FILL_AT = [
  ...S2_CUES.rail.map((f) => at(1, f)),
  ...S3_CUES.rail.map((f) => at(2, f)),
  ...S4_CUES.rail.map((f) => at(3, f)),
  ...S5_CUES.rail.map((f) => at(4, f)),
  ...S6_CUES.rail.map((f) => at(5, f)),
  ...S7_CUES.rail.map((f) => at(6, f)),
  ...S8_CUES.rail.map((f) => at(7, f)),
  ...S9_CUES.rail.map((f) => at(8, f)),
];

const StepRail: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        top: 962,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        gap: 24,
        opacity: iio(frame, [RAIL_IN, RAIL_IN + 10], [0, 1]),
        transform: `translateY(${iio(frame, [RAIL_IN, RAIL_IN + 10], [16, 0])}px)`,
      }}
    >
      {FILL_AT.map((f, stage) => (
        <Bubble key={stage} fill={iio(frame, [f, f + 6], [0, 1])} size={46} label={String(stage)} />
      ))}
    </div>
  );
};

// =============================================================================
// SOUND · every cue is a frame a scene exports, the rail's included, so a
// retimed scene carries its sound with it. Version 2 (2026-10-18, CT: "add sound
// and quiet background music"): the bed sits low (0.3, about 8.5 dB under the
// first mix) and the effects come forward, with foley that matches what is on
// screen: typing under typed commands, a shutter per still, pencil on red-pen
// marks, a page flip for the script sheet, a whoosh at each scene change.
// `dur` cuts a clip to the action it covers (frames); the default is 60.
// =============================================================================
const BED = 0.3;
const FX = 2; // one gain on every effect, tuned by measurement after mastering
const SCENE_IN = [S2_CUES.in, S3_CUES.in, S4_CUES.in, S5_CUES.in, S6_CUES.in, S7_CUES.in, S8_CUES.in, S9_CUES.in, S10_CUES.in];
const span = (r: number[]) => r[1] - r[0];
const CUES: Array<{ f: number; id: string; vol: number; dur?: number }> = [
  ...SCENE_IN.map((f, i) => ({ f: at(i + 1, f), id: 'whoosh-soft', vol: 0.35 })),
  ...S1_CUES.lines.map((f) => ({ f: at(0, f), id: 'pop-reveal', vol: 0.3 })),
  { f: at(0, S1_CUES.underline), id: 'pencil-scribble', vol: 0.55, dur: 22 },
  { f: RAIL_IN, id: 'pop-reveal', vol: 0.35 },
  ...FILL_AT.map((f) => ({ f, id: 'ui-click-soft', vol: 0.22 })),
  { f: at(1, S2_CUES.type1[0]), id: 'keys-typing-soft', vol: 0.38, dur: span(S2_CUES.type1) },
  { f: at(1, S2_CUES.out1), id: 'ui-click-soft', vol: 0.3 },
  { f: at(1, S2_CUES.type2[0]), id: 'keys-typing-soft', vol: 0.38, dur: span(S2_CUES.type2) },
  { f: at(1, S2_CUES.out2), id: 'ui-click-soft', vol: 0.3 },
  { f: at(1, S2_CUES.chips), id: 'pop-reveal', vol: 0.45 },
  { f: at(2, S3_CUES.card), id: 'page-flip', vol: 0.6 },
  ...S3_CUES.lines.map((f) => ({ f: at(2, f), id: 'ui-click-soft', vol: 0.16 })),
  ...S4_CUES.segments.map((f) => ({ f: at(3, f), id: 'ui-click-soft', vol: 0.18 })),
  { f: at(3, S4_CUES.sweep[0]), id: 'riser-soft', vol: 0.3, dur: span(S4_CUES.sweep) + 6 },
  { f: at(4, S5_CUES.swatches), id: 'pop-reveal', vol: 0.45 },
  { f: at(4, S5_CUES.type[0]), id: 'keys-typing-soft', vol: 0.38, dur: span(S5_CUES.type) },
  { f: at(4, S5_CUES.listing), id: 'ui-click-soft', vol: 0.3 },
  ...S6_CUES.tiles.map((f) => ({ f: at(5, f), id: 'camera-shutter', vol: 0.45 })),
  { f: at(5, S6_CUES.defect), id: 'pop-reveal', vol: 0.45 },
  { f: at(5, S6_CUES.pen), id: 'pencil-scribble', vol: 0.55, dur: 22 },
  ...S7_CUES.rows.map((f) => ({ f: at(6, f), id: 'ui-click-soft', vol: 0.26 })),
  { f: at(6, S7_CUES.stamp), id: 'stamp-hit', vol: 0.7 },
  { f: at(7, S8_CUES.thumb), id: 'pop-reveal', vol: 0.45 },
  { f: at(7, S8_CUES.small), id: 'whoosh-soft', vol: 0.45 },
  { f: at(7, S8_CUES.title), id: 'ui-click-soft', vol: 0.26 },
  { f: at(8, S9_CUES.quote), id: 'pop-reveal', vol: 0.45 },
  { f: at(9, S10_CUES.hit), id: 'impact-soft', vol: 0.55 },
];

const ScriptToRender: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = STARTS.reduce((cur, s, i) => (frame >= s ? i : cur), 0);

  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <AbsoluteFill style={{ opacity: iio(frame, [0, 10], [0, 1]) }}>
        <PaperChrome page={scene + 1} of={SCENES.length} label="Script to render · How this video was made" />
      </AbsoluteFill>

      {SCENES.map(({ C: Scene, dur }, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={dur}>
          <Scene />
        </Sequence>
      ))}

      <StepRail />

      {/* Quiet background music under the effects (BED), then master to -16 LUFS / -1.5 dBTP. */}
      <Audio src={MUSIC('docu-pluck')} volume={(f) => iio(f, [0, 20, TOTAL - 60, TOTAL], [0, BED, BED, 0])} />
      {CUES.map((cue, i) => (
        <Sequence key={`sfx-${i}`} from={cue.f} durationInFrames={cue.dur ?? 60}>
          <Audio src={SFX(cue.id)} volume={Math.min(1, cue.vol * FX)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default ScriptToRender;
