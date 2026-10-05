import React from 'react';
import { AbsoluteFill, Audio, Sequence, useCurrentFrame } from 'remotion';
import { C, MUSIC, SFX, iio, PaperChrome } from '../../lib/rda';
import { S1Open, S1_DUR } from './_scenes/S1Open';
import { S2Format, S2_DUR } from './_scenes/S2Format';
import { S3Promise, S3_DUR, S3_MARKS } from './_scenes/S3Promise';
import { S4Seal, S4_DUR, S4_CUES } from './_scenes/S4Seal';
import { S5Tool, S5_DUR, S5_LINE_AT, S5_STAMP } from './_scenes/S5Tool';
import { S6Handoff, S6_DUR, S6_TRAVEL } from './_scenes/S6Handoff';
import { S7Outro, S7_DUR, S7_HIT } from './_scenes/S7Outro';

// =============================================================================
// COMPOSITION CONFIG · RDA explainer: what the RDA kit is, in 60 seconds.
// No narration (no voice key on file): every idea is carried by on-screen text,
// sized and timed to be read. Music bed: docu-pluck (63s, fits under 60s).
// =============================================================================
export const compositionConfig = {
  id: 'RdaExplainer',
  durationInSeconds: 60,
  fps: 30,
  width: 1920,
  height: 1080,
};

// =============================================================================
// SCENE TIMELINE
// =============================================================================
const SCENES: Array<{ C: React.FC; dur: number }> = [
  { C: S1Open, dur: S1_DUR },
  { C: S2Format, dur: S2_DUR },
  { C: S3Promise, dur: S3_DUR },
  { C: S4Seal, dur: S4_DUR },
  { C: S5Tool, dur: S5_DUR },
  { C: S6Handoff, dur: S6_DUR },
  { C: S7Outro, dur: S7_DUR },
];
const STARTS = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].dur], []);
const TOTAL = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].dur; // 1800
const at = (scene: number, local: number) => STARTS[scene] + local;

// =============================================================================
// SOUND · every cue lands on a frame the scenes export, so retiming a scene
// moves its sound with it. Light touch: clicks for marks, one stamp per verdict.
// =============================================================================
const CUES: Array<{ f: number; id: string; vol: number }> = [
  { f: at(0, 110), id: 'stamp-hit', vol: 0.55 },
  ...[0, 1, 2, 3, 4].map((i) => ({ f: at(1, 40 + i * 16), id: 'ui-click-soft', vol: 0.28 })),
  ...S3_MARKS.map((m) => ({ f: at(2, m), id: 'pop-reveal', vol: 0.3 })),
  { f: at(3, S4_CUES.whoosh), id: 'whoosh-soft', vol: 0.45 },
  ...S4_CUES.cards.map((c) => ({ f: at(3, c), id: 'pop-reveal', vol: 0.24 })),
  { f: at(3, S4_CUES.ok), id: 'ui-click-soft', vol: 0.4 },
  ...[1, 2, 3, 4, 5].map((i) => ({ f: at(4, S5_LINE_AT(i)), id: 'ui-click-soft', vol: 0.2 })),
  { f: at(4, 186), id: 'whoosh-soft', vol: 0.4 },
  { f: at(4, S5_STAMP), id: 'stamp-hit', vol: 0.55 },
  { f: at(4, S5_STAMP + 4), id: 'chime-reward', vol: 0.4 },
  { f: at(5, S6_TRAVEL), id: 'whoosh-soft', vol: 0.45 },
  { f: at(6, S7_HIT), id: 'impact-soft', vol: 0.4 },
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const RdaExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const scene = STARTS.reduce((cur, s, i) => (frame >= s ? i : cur), 0);

  return (
    <AbsoluteFill style={{ backgroundColor: C.paper }}>
      <AbsoluteFill style={{ opacity: iio(frame, [0, 10], [0, 1]) }}>
        <PaperChrome page={scene + 1} of={SCENES.length} />
      </AbsoluteFill>

      {SCENES.map(({ C: Scene, dur }, i) => (
        <Sequence key={i} from={STARTS[i]} durationInFrames={dur}>
          <Scene />
        </Sequence>
      ))}

      {/* No voice to sit under, so the bed carries the audio: 0.8 is about -2 dB on a ~-20 LUFS
          library clip. Master the export to -16 LUFS / -1.5 dBTP (ffmpeg loudnorm, video copied). */}
      <Audio src={MUSIC('docu-pluck')} volume={(f) => iio(f, [0, 20, TOTAL - 60, TOTAL], [0, 0.8, 0.8, 0])} />
      {CUES.map((cue, i) => (
        <Sequence key={`sfx-${i}`} from={cue.f} durationInFrames={60}>
          <Audio src={SFX(cue.id)} volume={cue.vol} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

export default RdaExplainer;
