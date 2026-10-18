import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, rise, Scene, Headline, Stamp } from '../../../lib/rda';
import { Check, CUTOUT_SHADOW, IconGardenBot, IconMower, IconVacuum, RobotFigure } from '../../../lib/news';
import { cueAt, layout } from '../_layout';

// =============================================================================
// S9 · Your chores. A household humanoid gets a red NOT YET stamp; the narrow
// robots already working in homes get checks as the voice names them. FarmBot is
// named, so the disclosure is on screen (CT runs Johnny Autoseed).
// =============================================================================
export const S9_L = layout(9);
export const S9_DUR = S9_L.dur;
export const S9_CUES = {
  vo: S9_L.starts,
  stamp: S9_L.starts[1] + 8,
  board: S9_L.starts[2],
  rows: [cueAt(S9_L, 2, 'vacuums'), cueAt(S9_L, 2, 'lawn mowers'), cueAt(S9_L, 2, 'garden robots')],
  jobs: S9_L.starts[3],
  disclosure: cueAt(S9_L, 2, 'FarmBot'),
};

const ROWS: Array<{ Icon: React.FC<{ size?: number }>; name: string; job: string }> = [
  { Icon: IconVacuum, name: 'Robot vacuums', job: 'floors' },
  { Icon: IconMower, name: 'Robot lawn mowers', job: 'grass' },
  { Icon: IconGardenBot, name: 'Garden robots, like FarmBot', job: 'garden beds' },
];

export const S9Chores: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene dur={S9_DUR}>
      <AbsoluteFill>
        <Headline size={86} style={{ position: 'absolute', top: 150, left: 110, ...rise(f, S9_L.starts[0], 30) }}>
          Will one do your chores?
        </Headline>
        <div
          style={{
            position: 'absolute',
            top: 320,
            left: 110,
            width: 1060,
            background: C.sheet,
            border: `2px solid ${C.rule}`,
            borderRadius: 16,
            padding: '34px 44px',
            filter: CUTOUT_SHADOW,
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
            ...rise(f, S9_CUES.board - 6, 30),
          }}
        >
          <span style={{ font: `600 26px/1 ${F.mono}`, letterSpacing: '0.14em', textTransform: 'uppercase', color: C.form }}>Working in homes today</span>
          {ROWS.map(({ Icon, name, job }, i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 26, ...rise(f, S9_CUES.rows[i] - 4, 12) }}>
              <Icon size={84} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                <span style={{ font: `600 46px/1 ${F.body}`, color: C.ink }}>{name}</span>
                <span style={{ font: `400 28px/1 ${F.mono}`, color: C.muted, ...rise(f, S9_CUES.jobs + i * 8, 8) }}>one job: {job}, on a schedule</span>
              </div>
              <Check at={S9_CUES.rows[i] + 4} size={56} />
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', top: 330, left: 1330, width: 480, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, ...rise(f, S9_L.starts[0] + 10, 30) }}>
          <RobotFigure height={330} />
          <span style={{ font: `600 34px/1.2 ${F.body}`, color: C.ink, textAlign: 'center' }}>A humanoid that does your chores</span>
          <span style={{ font: `400 20px/1 ${F.mono}`, color: C.muted }}>Diagram</span>
        </div>
        <Stamp at={S9_CUES.stamp} text="Not yet" color={C.pen} size={80} style={{ position: 'absolute', top: 520, left: 1400 }} />
        <span style={{ position: 'absolute', left: 110, bottom: 70, font: `400 21px/1.3 ${F.mono}`, color: C.muted, ...rise(f, S9_CUES.disclosure, 6) }}>
          Disclosure: this channel's creator runs Johnny Autoseed, a company that works with FarmBot.
        </span>
      </AbsoluteFill>
    </Scene>
  );
};
