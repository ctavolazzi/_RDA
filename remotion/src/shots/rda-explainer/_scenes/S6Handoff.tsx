import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { C, F, EASE, iio, rise, typed, Scene, Eyebrow, Headline } from '../../../lib/rda';

// =============================================================================
// S6 · The handoff (6s). _RDA hands the episode to the video pipeline; the
// numbers ride along in episode.json.
// =============================================================================
export const S6_DUR = 180;
export const S6_TRAVEL = 64;

const ARROW = 'M 0 20 L 330 20';

const Repo: React.FC<{ name: string; items: string[]; at: number; style: React.CSSProperties }> = ({ name, items, at, style }) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        background: C.sheet,
        border: `2px solid ${C.rule}`,
        borderRadius: 14,
        padding: '30px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        boxSizing: 'border-box',
        ...rise(f, at, 30),
        ...style,
      }}
    >
      <span style={{ font: `600 38px/1 ${F.mono}`, color: C.form }}>{name}</span>
      {items.map((item) => (
        <span key={item} style={{ font: `600 38px/1.1 ${F.body}`, color: C.ink }}>
          {item}
        </span>
      ))}
    </div>
  );
};

export const S6Handoff: React.FC = () => {
  const f = useCurrentFrame();
  const arrow = evolvePath(iio(f, [44, 60], [0, 1], EASE.out), ARROW);
  const travel = iio(f, [S6_TRAVEL, S6_TRAVEL + 44], [0, 1], EASE.inOut);

  return (
    <Scene dur={S6_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 170, left: 110, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Eyebrow style={rise(f, 6)}>Then it hands off</Eyebrow>
          <Headline style={rise(f, 12)}>From the plan to the edit.</Headline>
        </div>

        <Repo name="_RDA" items={['The formula', 'The frozen exam', 'The result']} at={18} style={{ top: 400, left: 110, width: 560 }} />
        <Repo name="claude-youtube-editor" items={['The cut', 'Visuals and cards', 'Sound and upload']} at={30} style={{ top: 400, left: 1110, width: 700 }} />

        {/* command over the arrow */}
        <div
          style={{
            position: 'absolute',
            top: 470,
            left: 720,
            background: C.termBg,
            color: C.termFg,
            font: `400 26px/1 ${F.mono}`,
            padding: '14px 18px',
            borderRadius: 10,
            whiteSpace: 'pre',
            opacity: iio(f, [32, 40], [0, 1]),
          }}
        >
          {typed(f, '$ rda handoff', 38, 52) || ' '}
        </div>
        <svg width={360} height={40} viewBox="0 0 360 40" style={{ position: 'absolute', top: 560, left: 720 }}>
          <path d={ARROW} fill="none" stroke={C.form} strokeWidth={6} strokeLinecap="round" strokeDasharray={arrow.strokeDasharray} strokeDashoffset={arrow.strokeDashoffset} />
          <path d="M 330 6 L 354 20 L 330 34 Z" fill={C.form} opacity={iio(f, [58, 62], [0, 1])} />
        </svg>

        {/* episode.json riding the arrow */}
        <div
          style={{
            position: 'absolute',
            top: 612,
            left: 720 + travel * 130,
            font: `600 26px/1 ${F.mono}`,
            color: C.form,
            background: C.formSoft,
            border: `2px solid ${C.form}`,
            borderRadius: 999,
            padding: '10px 16px',
            opacity: Math.min(iio(f, [S6_TRAVEL - 4, S6_TRAVEL + 4], [0, 1]), iio(f, [S6_TRAVEL + 40, S6_TRAVEL + 52], [1, 0])),
          }}
        >
          episode.json
        </div>

        <p style={{ position: 'absolute', top: 860, left: 110, right: 110, margin: 0, font: `600 44px/1.25 ${F.body}`, color: C.ink, ...rise(f, 104, 16) }}>
          The score, the timings and the topic tally travel with it, ready for on-screen cards.
        </p>
      </AbsoluteFill>
    </Scene>
  );
};
