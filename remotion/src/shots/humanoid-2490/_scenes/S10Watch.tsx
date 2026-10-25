import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, rise, Scene, Eyebrow, Headline } from '../../../lib/rda';
import { SourceTag } from '../../../lib/news';
import { cueAt, layout } from '../_layout';

// =============================================================================
// S10 · What to watch. Nova beyond its first 100 units; the full-year counts,
// forecast at over 50,000 (Counterpoint) and about 60,000 (Smart Analytics Global).
// =============================================================================
export const S10_L = layout(10);
export const S10_DUR = S10_L.dur;
export const S10_CUES = { vo: S10_L.starts, items: [S10_L.starts[0] + 20, S10_L.starts[1]], chips: [cueAt(S10_L, 1, 'over fifty'), cueAt(S10_L, 1, 'about sixty')] };

const Chip: React.FC<{ at: number; firm: string; text: string }> = ({ at, firm, text }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, background: C.formSoft, border: `2px solid ${C.form}`, borderRadius: 14, padding: '20px 28px', ...rise(f, at, 14) }}>
      <span style={{ font: `600 22px/1 ${F.mono}`, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.form }}>{firm}</span>
      <span style={{ font: `800 56px/1 ${F.display}`, color: C.ink, letterSpacing: '-0.02em' }}>{text}</span>
    </div>
  );
};

export const S10Watch: React.FC = () => {
  const f = useCurrentFrame();
  const item = (n: string, text: string, at: number) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 28, ...rise(f, at, 16) }}>
      <span style={{ font: `800 64px/1 ${F.display}`, color: C.form }}>{n}</span>
      <span style={{ font: `600 54px/1.15 ${F.body}`, color: C.ink }}>{text}</span>
    </div>
  );
  return (
    <Scene dur={S10_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow style={rise(f, 6)}>What to watch</Eyebrow>
          <Headline size={86} style={rise(f, 10, 30)}>Next.</Headline>
        </div>
        <div style={{ position: 'absolute', top: 400, left: 110, display: 'flex', flexDirection: 'column', gap: 50 }}>
          {item('1', 'Nova ships beyond its first 100 units', S10_CUES.items[0])}
          {item('2', 'The full-year counts', S10_CUES.items[1])}
          <div style={{ display: 'flex', gap: 30, marginLeft: 66 }}>
            <Chip at={S10_CUES.chips[0]} firm="Counterpoint" text="over 50,000" />
            <Chip at={S10_CUES.chips[1]} firm="Smart Analytics Global" text="about 60,000" />
          </div>
        </div>
        <SourceTag at={S10_CUES.chips[0]} style={{ position: 'absolute', left: 110, bottom: 70 }}>
          Forecasts for 2026: Counterpoint's release, Aug 2026; Smart Analytics Global via Bloomberg, Aug 2026
        </SourceTag>
      </AbsoluteFill>
    </Scene>
  );
};
