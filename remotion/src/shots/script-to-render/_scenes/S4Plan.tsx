import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, EASE, iio, rise, Scene, Eyebrow, Headline } from '../../../lib/rda';
import { S1_DUR } from './S1Open';
import { S2_DUR } from './S2Brief';
import { S3_DUR } from './S3Script';
import { S5_DUR } from './S5Build';
import { S6_DUR } from './S6Stills';
import { S7_DUR } from './S7Measure';
import { S8_DUR } from './S8Thumb';
import { S9_DUR } from './S9Show';
import { S10_DUR } from './S10Outro';

// =============================================================================
// S4 · Step 3, the plan (7s). This video's own scene table, drawn to scale from
// the durations the scene files export, so the bar cannot disagree with the cut.
// =============================================================================
export const S4_DUR = 210;
export const S4_CUES = { in: 0, rail: [10], sweep: [92, 128], segments: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => 24 + i * 6) };

const DURS = [S1_DUR, S2_DUR, S3_DUR, S4_DUR, S5_DUR, S6_DUR, S7_DUR, S8_DUR, S9_DUR, S10_DUR];
const TOTAL = DURS.reduce((a, b) => a + b, 0);
const STARTS = DURS.map((_, i) => DURS.slice(0, i).reduce((a, b) => a + b, 0));
const BAR_W = 1700;
const px = (frames: number) => (frames / TOTAL) * BAR_W;
const PLAYHEAD = S4_CUES.sweep;

export const S4Plan: React.FC = () => {
  const f = useCurrentFrame();
  const head = iio(f, PLAYHEAD, [0, 1], EASE.inOut);

  return (
    <Scene dur={S4_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow style={rise(f, 6)}>Step 3 · Plan</Eyebrow>
          <Headline style={rise(f, 12)}>Plan to the frame.</Headline>
        </div>

        {/* the bar, one segment per scene, to scale */}
        <div style={{ position: 'absolute', top: 400, left: 110, width: BAR_W, height: 110, border: `3px solid ${C.ink}`, background: C.sheet, opacity: iio(f, [16, 24], [0, 1]) }}>
          {DURS.map((d, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: px(STARTS[i]),
                top: 0,
                width: px(d),
                height: '100%',
                borderRight: i < DURS.length - 1 ? `3px solid ${C.ink}` : undefined,
                background: i === 3 ? C.formSoft : 'transparent',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '0 10px 12px',
                boxSizing: 'border-box',
                transformOrigin: 'left center',
                transform: `scaleX(${iio(f, [S4_CUES.segments[i], S4_CUES.segments[i] + 10], [0, 1], EASE.out)})`,
              }}
            >
              <span style={{ font: `600 26px/1 ${F.mono}`, color: C.form }}>S{i + 1}</span>
            </div>
          ))}
          {/* playhead */}
          <div style={{ position: 'absolute', top: -14, left: head * (BAR_W - 4), width: 4, height: 138, background: C.pen, opacity: iio(f, [PLAYHEAD[0] - 4, PLAYHEAD[0], PLAYHEAD[1], PLAYHEAD[1] + 8], [0, 1, 1, 0]) }} />
        </div>

        {/* start frame of each scene */}
        {STARTS.map((s) => (
          <span key={s} style={{ position: 'absolute', top: 530, left: 110 + px(s) + 4, font: `400 20px/1 ${F.mono}`, color: C.muted, opacity: iio(f, [88, 96], [0, 1]) }}>
            {s}
          </span>
        ))}

        <div style={{ position: 'absolute', top: 600, left: 110, display: 'flex', alignItems: 'baseline', gap: 30 }}>
          <span style={{ font: `800 76px/1 ${F.display}`, color: C.ink, letterSpacing: '-0.02em', opacity: iio(f, [PLAYHEAD[0] - 4, PLAYHEAD[0]], [0, 1]) }}>
            {Math.round(head * TOTAL)} frames
          </span>
          <span style={{ font: `600 34px/1 ${F.mono}`, color: C.muted, ...rise(f, 130) }}>
            {TOTAL / 30} seconds at 30 fps
          </span>
        </div>

        <p style={{ position: 'absolute', top: 730, left: 110, margin: 0, font: `400 44px/1.3 ${F.body}`, color: C.ink, ...rise(f, 138) }}>
          Every sound sits on a frame a scene exports.
        </p>
      </AbsoluteFill>
    </Scene>
  );
};
