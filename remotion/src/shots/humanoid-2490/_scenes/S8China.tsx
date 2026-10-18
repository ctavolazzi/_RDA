import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, rise, Scene, Headline } from '../../../lib/rda';
import { Check, CountUp, CUTOUT_SHADOW, SourceTag, useSlap } from '../../../lib/news';
import { layout } from '../_layout';

// =============================================================================
// S8 · China's share. About 78% of the robots were bought in China and over 95%
// were built by Chinese companies (both IDC data, via Forbes). Different
// questions, so both can be true; checks land on both when the voice says so.
// =============================================================================
export const S8_L = layout(8);
export const S8_DUR = S8_L.dur;
export const S8_CUES = { vo: S8_L.starts, cards: [S8_L.starts[1], S8_L.starts[2]], both: S8_L.starts[3] };

const Card: React.FC<{ at: number; q: string; prefix: string; value: number; what: string; left: number; tilt: number; checkAt: number }> = ({
  at,
  q,
  prefix,
  value,
  what,
  left,
  tilt,
  checkAt,
}) => {
  const s = useSlap(at, 14);
  return (
    <div
      style={{
        position: 'absolute',
        top: 330,
        left,
        width: 720,
        background: C.sheet,
        border: `2px solid ${C.rule}`,
        borderRadius: 16,
        padding: '40px 48px 44px',
        filter: CUTOUT_SHADOW,
        opacity: Math.min(1, s * 1.4),
        transform: `rotate(${tilt}deg) translateY(${(1 - s) * 50}px)`,
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ font: `600 26px/1 ${F.mono}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.form }}>{q}</span>
        <Check at={checkAt} size={54} />
      </span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        <span style={{ font: `400 40px/1 ${F.body}`, color: C.muted }}>{prefix}</span>
        <span style={{ font: `800 150px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.ink }}>
          <CountUp to={value} at={at} dur={24} />%
        </span>
      </span>
      <span style={{ font: `400 46px/1.2 ${F.body}`, color: C.ink }}>{what}</span>
    </div>
  );
};

export const S8China: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene dur={S8_DUR}>
      <AbsoluteFill>
        <Headline size={86} style={{ position: 'absolute', top: 150, left: 110, ...rise(f, S8_L.starts[0], 30) }}>
          China's share?
        </Headline>
        <Card at={S8_CUES.cards[0]} q="Where they went" prefix="about" value={78} what="bought in China" left={110} tilt={-1.2} checkAt={S8_CUES.both} />
        <Card at={S8_CUES.cards[1]} q="Who built them" prefix="over" value={95} what="built by Chinese companies" left={1090} tilt={1.2} checkAt={S8_CUES.both + 6} />
        <p style={{ position: 'absolute', top: 800, left: 110, margin: 0, font: `700 56px/1 ${F.body}`, color: C.ink, ...rise(f, S8_CUES.both) }}>
          Different questions. Both can be true.
        </p>
        <SourceTag at={S8_CUES.cards[0]} style={{ position: 'absolute', left: 110, bottom: 70 }}>
          IDC data, via Forbes · Sep 2026. Smart Analytics Global puts the builders at over 97%
        </SourceTag>
      </AbsoluteFill>
    </Scene>
  );
};
