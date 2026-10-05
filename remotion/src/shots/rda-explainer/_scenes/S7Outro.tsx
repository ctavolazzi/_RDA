import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, iio, rise, typed, Scene, Eyebrow, Headline, Terminal } from '../_kit';

// =============================================================================
// S7 · How we start (6s). The first command, the ask, the sign-off.
// =============================================================================
export const S7_DUR = 180;
export const S7_HIT = 76;

const CMD = '$ python tools/rda.py idea "your idea"';

export const S7Outro: React.FC = () => {
  const f = useCurrentFrame();
  const cursorOn = Math.floor(f / 15) % 2 === 0 ? 1 : 0;
  const text = typed(f, CMD, 16, 58);

  return (
    <Scene dur={S7_DUR + 8}>
      <AbsoluteFill>
        <Eyebrow style={{ position: 'absolute', top: 180, left: 110, ...rise(f, 6) }}>How we start</Eyebrow>
        <Terminal width={1300} title="_RDA" style={{ position: 'absolute', top: 250, left: 110, ...rise(f, 8) }}>
          <div>
            {text}
            <span style={{ display: 'inline-block', width: 16, height: 30, background: C.termFg, marginLeft: 4, verticalAlign: 'middle', opacity: cursorOn }} />
          </div>
          <div style={{ color: C.termDim, opacity: iio(f, [62, 68], [0, 1]) }}>parked in docs/ideas.md</div>
        </Terminal>

        <div style={{ position: 'absolute', top: 580, left: 110, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Headline size={128} style={rise(f, S7_HIT, 30)}>
            Bring an idea.
          </Headline>
          <p style={{ margin: 0, font: `600 48px/1.2 ${F.body}`, color: C.muted, ...rise(f, S7_HIT + 18) }}>Episode 001 starts with picking the exam.</p>
        </div>

        <div style={{ position: 'absolute', bottom: 80, right: 110, display: 'flex', alignItems: 'baseline', gap: 18, ...rise(f, 112) }}>
          <span style={{ font: `800 72px/1 ${F.display}`, color: C.form, letterSpacing: '-0.03em' }}>RDA</span>
          <span style={{ font: `400 24px/1 ${F.mono}`, color: C.muted }}>Rapid Domain Acquisition</span>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
