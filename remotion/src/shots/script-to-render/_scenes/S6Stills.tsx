import React from 'react';
import { AbsoluteFill, Img, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { C, F, P, EASE, iio, rise, Scene, Eyebrow, Headline, Bubble } from '../../../lib/rda';

// =============================================================================
// S6 · Step 6, stills (7s). Top: five stills of this video (S1 to S5), rendered
// and read before the first full render. Bottom: a real defect those reads
// caught, cropped from the first S7 still (frame 1340, before the fix): the note
// sat 11 px under the receipt card, inside its shadow. Fixed by moving it down.
// =============================================================================
export const S6_DUR = 210;
export const S6_CUES = { rail: [10], tiles: [0, 1, 2, 3, 4].map((i) => 24 + i * 12), defect: 90, pen: 106 };

const W = 320;
const H = 180;
const GAP = 25;
// a loose oval around the note and the card edge above it, in the crop's own pixels (820x150)
const CIRCLE = 'M 300 64 C 520 54, 640 78, 630 104 C 620 136, 300 142, 40 132 C -10 124, -6 80, 60 70 C 140 60, 230 62, 330 66';

export const S6Stills: React.FC = () => {
  const f = useCurrentFrame();
  const pen = evolvePath(iio(f, [S6_CUES.pen, S6_CUES.pen + 16], [0, 1], EASE.out), CIRCLE);

  return (
    <Scene dur={S6_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow style={rise(f, 6)}>Step 6 · Stills</Eyebrow>
          <Headline style={rise(f, 12)}>Read every still.</Headline>
        </div>

        {S6_CUES.tiles.map((at, i) => (
          <div key={i} style={{ position: 'absolute', top: 336, left: 110 + i * (W + GAP), width: W, ...rise(f, at, 16) }}>
            <Img
              src={P('script-to-render', `stills/s${i + 1}.jpg`)}
              style={{ width: W, height: H, display: 'block', borderRadius: 10, border: `2px solid ${C.rule}`, boxSizing: 'border-box' }}
            />
            <div style={{ position: 'absolute', right: -12, bottom: 22, background: C.paper, borderRadius: '50%', padding: 3 }}>
              <Bubble fill={iio(f, [at + 10, at + 16], [0, 1])} size={40} />
            </div>
            <span style={{ display: 'block', marginTop: 12, font: `600 22px/1 ${F.mono}`, color: C.muted }}>S{i + 1}</span>
          </div>
        ))}

        <div style={{ position: 'absolute', top: 594, left: 110, ...rise(f, S6_CUES.defect, 16) }}>
          <span style={{ display: 'block', marginBottom: 14, font: `600 22px/1 ${F.mono}`, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.pen }}>
            Caught on the S7 still, before the fix
          </span>
          <div style={{ position: 'relative', width: 820, height: 150 }}>
            <Img
              src={P('script-to-render', 'defect-s7-note.jpg')}
              style={{ width: 820, height: 150, display: 'block', borderRadius: 10, border: `2px solid ${C.rule}`, boxSizing: 'border-box' }}
            />
            <svg viewBox="0 0 820 150" style={{ position: 'absolute', inset: 0, width: 820, height: 150, overflow: 'visible' }}>
              <path d={CIRCLE} fill="none" stroke={C.pen} strokeWidth={6} strokeLinecap="round" strokeDasharray={pen.strokeDasharray} strokeDashoffset={pen.strokeDashoffset} />
            </svg>
          </div>
        </div>

        <p style={{ position: 'absolute', top: 636, left: 990, width: 820, margin: 0, font: `400 42px/1.3 ${F.body}`, color: C.ink, ...rise(f, S6_CUES.defect + 10) }}>
          A note sat 11 px under a card, inside its shadow. Moved down before the first render.
        </p>
      </AbsoluteFill>
    </Scene>
  );
};
