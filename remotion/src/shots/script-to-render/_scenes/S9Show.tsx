import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, rise, Scene, Eyebrow, Headline } from '../../../lib/rda';

// =============================================================================
// S9 · Steps 11 and 12, record and show (5s). The host's own words, from
// 2026-10-18, after a report that had numbers and no video. They are why the
// skill ends with the video itself.
// =============================================================================
export const S9_DUR = 150;
export const S9_CUES = { rail: [10, 18], quote: 26 };

export const S9Show: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Scene dur={S9_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow style={rise(f, 6)}>Steps 11 and 12 · Record, then show</Eyebrow>
          <Headline style={rise(f, 12)}>Write it down. Then show it.</Headline>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 350,
            left: 110,
            background: C.sheet,
            border: `2px solid ${C.rule}`,
            borderLeft: `8px solid ${C.form}`,
            borderRadius: 14,
            padding: '34px 52px',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxShadow: '0 18px 48px rgba(20, 30, 25, 0.10)',
            ...rise(f, S9_CUES.quote, 30),
          }}
        >
          <span style={{ font: `800 88px/1 ${F.display}`, letterSpacing: '-0.02em', color: C.ink }}>“Show me please”</span>
          <span style={{ font: `400 26px/1 ${F.mono}`, color: C.muted }}>The host, after a report with only numbers</span>
        </div>

        <p style={{ position: 'absolute', top: 650, left: 110, margin: 0, font: `400 44px/1.3 ${F.body}`, color: C.ink, ...rise(f, 60) }}>
          So the process now ends with the video, not a report.
        </p>
      </AbsoluteFill>
    </Scene>
  );
};
