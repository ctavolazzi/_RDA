import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, rise, Scene, Headline } from '../../../lib/rda';
import { CountUp, CUTOUT_SHADOW, PenPath, SourceTag, useSlap } from '../../../lib/news';
import { layout } from '../_layout';

// =============================================================================
// S7 · What for. IDC and Smart Analytics Global describe almost the same share
// (69% and over 70%) of two different markets. The red pen puts a question mark
// between them.
// =============================================================================
export const S7_L = layout(7);
export const S7_DUR = S7_L.dur;
export const S7_CUES = { vo: S7_L.starts, cards: [S7_L.starts[1], S7_L.starts[2]], mark: S7_L.starts[3] };

const Card: React.FC<{ at: number; firm: string; value: number; prefix: string; what: string; source: string; tilt: number; left: number }> = ({
  at,
  firm,
  value,
  prefix,
  what,
  source,
  tilt,
  left,
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
      <span style={{ font: `600 26px/1 ${F.mono}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.form }}>{firm}</span>
      <span style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
        {prefix ? <span style={{ font: `400 40px/1 ${F.body}`, color: C.muted }}>{prefix}</span> : null}
        <span style={{ font: `800 150px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.ink }}>
          <CountUp to={value} at={at} dur={24} />%
        </span>
      </span>
      <span style={{ font: `400 42px/1.25 ${F.body}`, color: C.ink }}>{what}</span>
      <SourceTag at={at + 10} style={{ marginTop: 10, alignSelf: 'flex-start' }}>
        {source}
      </SourceTag>
    </div>
  );
};

export const S7WhatFor: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene dur={S7_DUR}>
      <AbsoluteFill>
        <Headline size={86} style={{ position: 'absolute', top: 150, left: 110, ...rise(f, S7_L.starts[0], 30) }}>
          What are they for?
        </Headline>
        <Card at={S7_CUES.cards[0]} firm="IDC" value={69} prefix="" what="research, education, shows and government data collection" source="IDC H1 2026, as reported" tilt={-1.5} left={110} />
        <Card at={S7_CUES.cards[1]} firm="Smart Analytics Global" value={70} prefix="over" what="industrial and commercial work" source="via Bloomberg · Aug 2026" tilt={1.5} left={1090} />
        <div style={{ position: 'absolute', left: 880, top: 470, width: 160, height: 220 }}>
          <PenPath d="M 30 60 C 30 0, 130 0, 128 60 C 126 110, 80 110, 80 150 M 80 196 L 80 200" at={S7_CUES.mark} w={160} h={220} width={11} dur={18} />
        </div>
        <p style={{ position: 'absolute', top: 900, left: 110, margin: 0, font: `700 48px/1 ${F.body}`, color: C.ink, ...rise(f, S7_CUES.mark + 8) }}>
          Two counts. Two different pictures.
        </p>
      </AbsoluteFill>
    </Scene>
  );
};
