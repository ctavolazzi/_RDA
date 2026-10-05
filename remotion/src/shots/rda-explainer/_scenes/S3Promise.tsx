import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, EASE, iio, rise, Scene, Eyebrow, Headline, Bubble } from '../_kit';

// =============================================================================
// S3 · The promise (6s). Three rules, each marked like an answer-sheet bubble.
// =============================================================================
export const S3_DUR = 180;
export const S3_MARKS = [50, 80, 110];

const RULES = ['The clock is real, and on screen.', 'The exam is locked before studying starts.', 'The score comes straight from the scorer.'];

export const S3Promise: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene dur={S3_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 190, left: 110, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Eyebrow style={rise(f, 6)}>The promise</Eyebrow>
          <Headline size={92} style={rise(f, 12)}>
            It only works if the test is real.
          </Headline>
        </div>
        <div style={{ position: 'absolute', top: 500, left: 110, display: 'flex', flexDirection: 'column', gap: 46 }}>
          {RULES.map((rule, i) => {
            const at = S3_MARKS[i];
            return (
              <div key={rule} style={{ display: 'flex', alignItems: 'center', gap: 34, ...rise(f, at - 8, 18) }}>
                <Bubble fill={iio(f, [at, at + 8], [0, 1], EASE.overshoot)} size={64} label={String.fromCharCode(65 + i)} />
                <span style={{ font: `600 58px/1.1 ${F.body}`, color: C.ink }}>{rule}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
