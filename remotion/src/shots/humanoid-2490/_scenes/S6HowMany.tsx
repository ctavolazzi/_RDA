import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, iio, rise, Scene, Headline } from '../../../lib/rda';
import { BarRow, ChapterSlide, PenPath } from '../../../lib/news';
import { layout } from '../_layout';

// =============================================================================
// S6 · How many. Chapter two opens on a slide. Three research firms, the same six
// months, three totals, drawn to one scale; a red-pen bracket marks the gap
// between the lowest and the highest (25,000 - 19,100 = 5,900).
// =============================================================================
export const S6_L = layout(6, { pauses: { 0: 20 } });
export const S6_DUR = S6_L.dur;
export const S6_CUES = { vo: S6_L.starts, slideOut: S6_L.ends[0] + 8, bars: [S6_L.starts[2], S6_L.starts[3], S6_L.starts[4]], gap: S6_L.starts[5] };

const MAX = 26000;
const W = 1150;
const BARS = [
  { label: 'Smart Analytics Global', value: 19100, prefix: 'about', source: 'via Bloomberg · Aug 2026' },
  { label: 'Counterpoint Research', value: 22000, prefix: 'over', source: 'its own release · Aug 2026' },
  { label: 'IDC', value: 25000, prefix: 'nearly', source: 'via Forbes · Sep 2026' },
];

export const S6HowMany: React.FC = () => {
  const f = useCurrentFrame();
  const x = (v: number) => 110 + (v / MAX) * W;
  return (
    <Scene dur={S6_DUR}>
      <AbsoluteFill>
        <Headline size={76} style={{ position: 'absolute', top: 150, left: 110, ...rise(f, S6_L.starts[1], 30) }}>
          How many shipped in the first half of 2026?
        </Headline>
        <div style={{ position: 'absolute', top: 300, left: 110, display: 'flex', flexDirection: 'column', gap: 40 }}>
          {BARS.map((b, i) => (
            <BarRow key={b.label} label={b.label} value={b.value} max={MAX} width={W} at={S6_CUES.bars[i]} prefix={b.prefix} source={b.source} accent={i === 2} />
          ))}
        </div>
        <div style={{ position: 'absolute', top: 724, left: x(19100), width: x(25000) - x(19100), height: 40 }}>
          <PenPath d={`M 0 0 L 0 22 L ${x(25000) - x(19100)} 22 L ${x(25000) - x(19100)} 0`} at={S6_CUES.gap} w={x(25000) - x(19100)} h={40} width={6} />
        </div>
        <span style={{ position: 'absolute', top: 780, left: x(19100), font: `700 40px/1 ${F.body}`, color: C.pen, ...rise(f, S6_CUES.gap + 10, 10) }}>
          about 5,900 robots apart
        </span>
        <ChapterSlide kicker="Part 2" text="The bigger story" at={0} out={S6_CUES.slideOut} />
        <span style={{ position: 'absolute', left: 110, bottom: 70, font: `400 20px/1 ${F.mono}`, color: C.muted, opacity: iio(f, [S6_CUES.bars[0], S6_CUES.bars[0] + 8], [0, 1]) }}>
          Bars drawn to one scale. Totals as each firm reported them.
        </span>
      </AbsoluteFill>
    </Scene>
  );
};
