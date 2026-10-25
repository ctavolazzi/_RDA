import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, EASE, iio, rise, Scene } from '../../../lib/rda';
import { CUTOUT_SHADOW, PenPath, underlinePath, useSlap } from '../../../lib/news';
import { cueAt, layout } from '../_layout';

// =============================================================================
// S2 · The hook. "There's a catch." Then the bigger story in one picture: the
// three research firms' totals for the same six months, each with a question mark.
// =============================================================================
export const S2_L = layout(2, { pauses: { 0: 10 } });
const CARDS = [0, 1, 2].map((i) => cueAt(S2_L, 1, 'count these') + i * 12);
export const S2_DUR = S2_L.dur;
export const S2_CUES = { vo: S2_L.starts, underline: S2_L.starts[0] + 18, lift: S2_L.starts[1], cards: CARDS, whatFor: cueAt(S2_L, 1, 'or what') };

const NumberCard: React.FC<{ n: string; q: string; at: number; tilt: number }> = ({ n, q, at, tilt }) => {
  const s = useSlap(at, 12);
  return (
    <div
      style={{
        background: C.sheet,
        border: `2px solid ${C.rule}`,
        borderRadius: 16,
        padding: '34px 46px',
        font: `800 110px/1 ${F.display}`,
        letterSpacing: '-0.03em',
        color: C.ink,
        filter: CUTOUT_SHADOW,
        opacity: Math.min(1, s * 1.5),
        transform: `rotate(${tilt}deg) scale(${1.5 - 0.5 * s})`,
      }}
    >
      <div style={{ font: `400 30px/1 ${F.body}`, color: C.muted, letterSpacing: 0, marginBottom: 14 }}>{q}</div>
      {n}
      <span style={{ color: C.pen }}>?</span>
    </div>
  );
};

export const S2Hook: React.FC = () => {
  const f = useCurrentFrame();
  const lift = iio(f, [S2_CUES.lift, S2_CUES.lift + 16], [0, 1], EASE.inOut);
  return (
    <Scene dur={S2_DUR}>
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: 110,
            top: iio(lift, [0, 1], [420, 150]),
            font: `800 ${iio(lift, [0, 1], [170, 76])}px/1.05 ${F.display}`,
            letterSpacing: '-0.03em',
            color: C.ink,
            ...rise(f, S2_L.starts[0], 30),
          }}
        >
          There's a{' '}
          <span style={{ position: 'relative', display: 'inline-block' }}>
            catch
            <PenPath d={underlinePath(300)} at={S2_CUES.underline} w={300} h={24} width={9} style={{ left: 0, bottom: -18, width: '100%' }} />
          </span>
          .
        </div>
        <div style={{ position: 'absolute', top: 410, left: 110, right: 110, display: 'flex', justifyContent: 'space-between' }}>
          {[['about', '19,100'], ['over', '22,000'], ['nearly', '25,000']].map(([q, n], i) => (
            <NumberCard key={n} n={n} q={q} at={S2_CUES.cards[i]} tilt={[-3, 2, -1.5][i]} />
          ))}
        </div>
        <p style={{ position: 'absolute', top: 770, left: 110, margin: 0, font: `400 52px/1.3 ${F.body}`, color: C.ink, ...rise(f, S2_CUES.whatFor) }}>
          How many humanoid robots shipped? And what are they for?
        </p>
      </AbsoluteFill>
    </Scene>
  );
};
