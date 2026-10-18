import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, EASE, iio, rise, Scene, Headline } from '../../../lib/rda';
import { Check, PenPath, RobotFigure } from '../../../lib/news';
import { cueAt, layout } from '../_layout';

// =============================================================================
// S5 · Who it is for. Not a gimmick: a robot that can fall and get back up is a
// good way to learn. Built for classrooms and developers; the red pen strikes
// "your kitchen".
// =============================================================================
export const S5_L = layout(5, { tail: 40 });
const FALL = cueAt(S5_L, 1, 'fall over');
const UP = cueAt(S5_L, 1, 'get back up');
export const S5_DUR = S5_L.dur;
export const S5_CUES = {
  vo: S5_L.starts,
  fall: FALL,
  up: UP,
  board: S5_L.starts[2],
  checks: [cueAt(S5_L, 2, 'classrooms'), cueAt(S5_L, 2, 'developers')],
  notFor: cueAt(S5_L, 2, 'Not for'),
  strike: cueAt(S5_L, 2, 'kitchen'),
};

export const S5ForWho: React.FC = () => {
  const f = useCurrentFrame();
  const tip = iio(f, [FALL, FALL + 10, UP, UP + 20], [0, 1, 1, 0], EASE.inOut);
  const row = (text: string, at: number) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, ...rise(f, at - 6, 12) }}>
      <Check at={at} size={46} />
      <span style={{ font: `600 54px/1 ${F.body}`, color: C.ink }}>{text}</span>
    </div>
  );
  return (
    <Scene dur={S5_DUR}>
      <AbsoluteFill>
        <Headline size={96} style={{ position: 'absolute', top: 150, left: 110, ...rise(f, S5_L.starts[0], 30) }}>
          Not a gimmick.
        </Headline>
        <div style={{ position: 'absolute', left: 300, top: 491, ...rise(f, S5_L.starts[1] - 6, 20) }}>
          <RobotFigure height={330} tip={tip} />
        </div>
        <div style={{ position: 'absolute', left: 120, top: 920, width: 640, height: 3, background: C.ink, opacity: iio(f, [S5_L.starts[1] - 6, S5_L.starts[1]], [0, 1]) }} />
        <span style={{ position: 'absolute', left: 120, top: 940, font: `400 20px/1 ${F.mono}`, color: C.muted, opacity: iio(f, [S5_L.starts[1], S5_L.starts[1] + 8], [0, 1]) }}>
          Diagram
        </span>
        <div style={{ position: 'absolute', left: 980, top: 380, display: 'flex', flexDirection: 'column', gap: 30 }}>
          <span style={{ font: `600 26px/1 ${F.mono}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.form, ...rise(f, S5_CUES.board) }}>Built for</span>
          {row('Classrooms', S5_CUES.checks[0])}
          {row('Developers', S5_CUES.checks[1])}
          <span style={{ font: `600 26px/1 ${F.mono}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.pen, marginTop: 40, ...rise(f, S5_CUES.notFor - 4) }}>
            Not built for
          </span>
          <div style={{ position: 'relative', display: 'inline-block', width: 'fit-content', ...rise(f, S5_CUES.notFor, 12) }}>
            <span style={{ font: `600 54px/1 ${F.body}`, color: C.ink }}>Your kitchen</span>
            <PenPath d="M -10 34 C 90 26, 200 40, 310 28" at={S5_CUES.strike} w={300} h={60} width={8} style={{ left: 0, top: 0 }} />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
