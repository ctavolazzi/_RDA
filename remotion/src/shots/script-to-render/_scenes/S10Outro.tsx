import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, rise, Scene } from '../../../lib/rda';

// =============================================================================
// S10 · Outro (3s). The skill's name and its one promise. The step rail, full,
// stays on from the composition.
// =============================================================================
export const S10_DUR = 90;
export const S10_CUES = { in: 0, hit: 8, vo: 16 };

export const S10Outro: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Scene dur={S10_DUR + 8}>
      <AbsoluteFill style={{ padding: '0 110px 140px', justifyContent: 'center', alignItems: 'center', gap: 28 }}>
        <span style={{ font: `600 104px/1 ${F.mono}`, letterSpacing: '-0.02em', color: C.ink, ...rise(f, S10_CUES.hit, 30) }}>script-to-render</span>
        <span style={{ font: `400 50px/1.2 ${F.body}`, color: C.ink, ...rise(f, S10_CUES.hit + 14) }}>Every run makes the next one better.</span>
      </AbsoluteFill>
    </Scene>
  );
};
