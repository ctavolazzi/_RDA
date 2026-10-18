import React from 'react';
import { AbsoluteFill, Audio, Sequence, getInputProps, useCurrentFrame } from 'remotion';
import { C, MUSIC, P, SFX, iio, PaperChrome } from '../../lib/rda';
import type { Layout } from './_layout';
import { S1Open, S1_DUR, S1_CUES, S1_L } from './_scenes/S1Open';
import { S2Hook, S2_DUR, S2_CUES, S2_L } from './_scenes/S2Hook';
import { S3Launch, S3_DUR, S3_CUES, S3_L } from './_scenes/S3Launch';
import { S4Catch, S4_DUR, S4_CUES, S4_L } from './_scenes/S4Catch';
import { S5ForWho, S5_DUR, S5_CUES, S5_L } from './_scenes/S5ForWho';
import { S6HowMany, S6_DUR, S6_CUES, S6_L } from './_scenes/S6HowMany';
import { S7WhatFor, S7_DUR, S7_CUES, S7_L } from './_scenes/S7WhatFor';
import { S8China, S8_DUR, S8_CUES, S8_L } from './_scenes/S8China';
import { S9Chores, S9_DUR, S9_CUES, S9_L } from './_scenes/S9Chores';
import { S10Watch, S10_DUR, S10_CUES, S10_L } from './_scenes/S10Watch';
import { S11Payoff, S11_DUR, S11_CUES, S11_L } from './_scenes/S11Payoff';

// =============================================================================
// THE $2,490 HUMANOID · a current-event explainer, first cut (2026-10-18), made from
// docs/current-event-video.md after CT's "Give it a shot". Graphics, a scratch voice
// (Kokoro, tools/narrate.py) and library music only: no borrowed footage reaches the
// cloud container, and CT's camera and interviews are slots for the full version
// (listed in videos/humanoid-2490/script/script.md).
// Every scene's length comes from its measured voice lines (_layout.ts), so the
// total does too. Voice: python tools/narrate.py videos/humanoid-2490
// Render: cd remotion && node scripts/render-one.mjs humanoid-2490 Humanoid2490
// =============================================================================
const SCENES: Array<{ C: React.FC; dur: number; L: Layout }> = [
  { C: S1Open, dur: S1_DUR, L: S1_L },
  { C: S2Hook, dur: S2_DUR, L: S2_L },
  { C: S3Launch, dur: S3_DUR, L: S3_L },
  { C: S4Catch, dur: S4_DUR, L: S4_L },
  { C: S5ForWho, dur: S5_DUR, L: S5_L },
  { C: S6HowMany, dur: S6_DUR, L: S6_L },
  { C: S7WhatFor, dur: S7_DUR, L: S7_L },
  { C: S8China, dur: S8_DUR, L: S8_L },
  { C: S9Chores, dur: S9_DUR, L: S9_L },
  { C: S10Watch, dur: S10_DUR, L: S10_L },
  { C: S11Payoff, dur: S11_DUR, L: S11_L },
];
const FPS = 30;
const STARTS = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur], []);
const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].dur;
const at = (scene: number, local: number) => STARTS[scene] + local;

// The length is computed from the measured voice, so the registry's manifest shows its 5 s
// default; Root reads this object at runtime and gets the real length.
export const compositionConfig = {
  id: 'Humanoid2490',
  durationInSeconds: TOTAL / FPS,
  fps: 30,
  width: 1920,
  height: 1080,
};

// =============================================================================
// VOICE · every sentence on the frame its scene's layout gives it
// =============================================================================
const VOICE = SCENES.flatMap((s, i) => s.L.starts.map((st, j) => ({ f: at(i, st), dur: s.L.ends[j] - st, src: P('humanoid-2490', s.L.files[j]) })));

// =============================================================================
// MUSIC · three acts, one 63 s library track each, under the voice (BED, dipping
// to DUCK of itself while a line plays). Act 1 enters on the price tag's slap and
// fades with the track's end, leaving a beat of quiet before the chapter slide;
// act 2 starts on the slide; act 3 is the last stretch of its track, so the music
// ends with the video.
// =============================================================================
const TRACK = Math.floor(63.05 * FPS);
const BED = 0.3;
const DUCK = 0.35;
const duck = (f: number) => VOICE.reduce((m, v) => Math.min(m, iio(f, [v.f - 6, v.f, v.f + v.dur, v.f + v.dur + 12], [1, DUCK, DUCK, 1])), 1);
const ACT1_IN = at(0, S1_CUES.tag);
const ACTS = [
  { id: 'docu-pluck', from: ACT1_IN, dur: Math.min(TRACK, STARTS[5] - ACT1_IN), fadeIn: 4, fadeOut: 30, trim: 0 },
  { id: 'tech-pulse', from: STARTS[5], dur: STARTS[8] - STARTS[5] + 20, fadeIn: 12, fadeOut: 20, trim: 0 },
  { id: 'cinematic-min', from: STARTS[8], dur: TOTAL - STARTS[8], fadeIn: 20, fadeOut: 45, trim: Math.max(0, TRACK - (TOTAL - STARTS[8])) },
];

// =============================================================================
// SOUND · effects at the style bible's levels (x1: the voice leads). Every frame
// below is one a scene exports.
// =============================================================================
const CUES: Array<{ f: number; id: string; vol: number; dur?: number }> = [
  ...[1, 2, 3, 4, 6, 7, 8, 9, 10].map((i) => ({ f: at(i, 0), id: 'whoosh-soft', vol: 0.35 })),
  { f: at(0, S1_CUES.card), id: 'pop-reveal', vol: 0.26 },
  { f: at(0, S1_CUES.tag), id: 'impact-soft', vol: 0.4 },
  { f: at(0, S1_CUES.circle), id: 'pencil-scribble', vol: 0.5, dur: 18 },
  ...S1_CUES.strips.map((f) => ({ f: at(0, f), id: 'pop-reveal', vol: 0.24 })),
  { f: at(0, S1_CUES.underline), id: 'pencil-scribble', vol: 0.4, dur: 24 },
  { f: at(1, S2_CUES.underline), id: 'pencil-scribble', vol: 0.5, dur: 16 },
  ...S2_CUES.cards.map((f) => ({ f: at(1, f), id: 'pop-reveal', vol: 0.3 })),
  ...S3_CUES.lines.map((f) => ({ f: at(2, f), id: 'ui-click-soft', vol: 0.3 })),
  { f: at(2, S3_CUES.miniTag), id: 'pop-reveal', vol: 0.3 },
  { f: at(3, S4_CUES.riser[0]), id: 'riser-soft', vol: 0.3, dur: S4_CUES.riser[1] - S4_CUES.riser[0] + 6 },
  { f: at(3, S4_CUES.height), id: 'impact-soft', vol: 0.4 },
  { f: at(3, S4_CUES.weight), id: 'pop-reveal', vol: 0.28 },
  { f: at(3, S4_CUES.milk), id: 'ui-click-soft', vol: 0.25 },
  ...S5_CUES.checks.map((f) => ({ f: at(4, f), id: 'ui-click-soft', vol: 0.3 })),
  { f: at(4, S5_CUES.strike), id: 'pencil-scribble', vol: 0.5, dur: 16 },
  { f: at(5, 0), id: 'whoosh-soft', vol: 0.45 },
  { f: at(5, S6_CUES.slideOut), id: 'whoosh-soft', vol: 0.35 },
  ...S6_CUES.bars.map((f) => ({ f: at(5, f), id: 'pop-reveal', vol: 0.28 })),
  { f: at(5, S6_CUES.gap), id: 'pencil-scribble', vol: 0.45, dur: 16 },
  ...S7_CUES.cards.map((f) => ({ f: at(6, f), id: 'pop-reveal', vol: 0.3 })),
  { f: at(6, S7_CUES.mark), id: 'pencil-scribble', vol: 0.5, dur: 18 },
  ...S8_CUES.cards.map((f) => ({ f: at(7, f), id: 'pop-reveal', vol: 0.3 })),
  { f: at(7, S8_CUES.both), id: 'ui-click-soft', vol: 0.3 },
  { f: at(8, S9_CUES.stamp), id: 'stamp-hit', vol: 0.55 },
  { f: at(8, S9_CUES.board), id: 'pop-reveal', vol: 0.26 },
  ...S9_CUES.rows.map((f) => ({ f: at(8, f + 4), id: 'ui-click-soft', vol: 0.3 })),
  ...S10_CUES.items.map((f) => ({ f: at(9, f), id: 'ui-click-soft', vol: 0.3 })),
  ...S10_CUES.chips.map((f) => ({ f: at(9, f), id: 'pop-reveal', vol: 0.28 })),
  { f: at(10, S11_CUES.yes), id: 'ui-click-soft', vol: 0.3 },
  { f: at(10, S11_CUES.notYet), id: 'impact-soft', vol: 0.4 },
  { f: at(10, S11_CUES.underline), id: 'pencil-scribble', vol: 0.5, dur: 16 },
];

const Humanoid2490: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = STARTS.reduce((cur, s, i) => (frame >= s ? i : cur), 0);
  const { mute = [] } = getInputProps() as { mute?: string[] };

  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <AbsoluteFill style={{ opacity: iio(frame, [0, 10], [0, 1]) }}>
        <PaperChrome page={scene + 1} of={SCENES.length} label="News, with receipts · Humanoid robots" />
      </AbsoluteFill>

      {SCENES.map(({ C: Scene, dur }, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={dur}>
          <Scene />
        </Sequence>
      ))}

      {!mute.includes('bed') &&
        ACTS.map((a) => (
          <Sequence key={a.id} from={a.from} durationInFrames={a.dur}>
            <Audio
              src={MUSIC(a.id)}
              trimBefore={a.trim}
              volume={(f) => BED * iio(f, [0, a.fadeIn, a.dur - a.fadeOut, a.dur], [0, 1, 1, 0]) * duck(a.from + f)}
            />
          </Sequence>
        ))}
      {!mute.includes('fx') &&
        CUES.map((cue, i) => (
          <Sequence key={`sfx-${i}`} from={cue.f} durationInFrames={cue.dur ?? 60}>
            <Audio src={SFX(cue.id)} volume={cue.vol} />
          </Sequence>
        ))}
      {!mute.includes('voice') &&
        VOICE.map((v, i) => (
          <Sequence key={`vo-${i}`} from={v.f} durationInFrames={v.dur}>
            <Audio src={v.src} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};

export default Humanoid2490;
