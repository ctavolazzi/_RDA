import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, EASE, iio, rise, Scene, Headline } from '../../../lib/rda';
import { CUTOUT_SHADOW, IconMilk, PersonFigure, RobotFigure, Ruler, SourceTag, useSlap } from '../../../lib/news';
import { cueAt, layout } from '../_layout';

// =============================================================================
// S4 · The catch. The robot shrinks from its S3 size to its real height next to a
// ruler and a 175 cm adult, both diagrams drawn to scale (3.5 px per cm): 49.7 cm,
// level with the knee. Then its weight against a gallon of milk (3.785 L at about
// 1.03 kg per litre, about 3.9 kg).
// =============================================================================
export const S4_L = layout(4, { pauses: { 0: 14 } });
const SHRINK = S4_L.starts[1];
export const S4_DUR = S4_L.dur;
export const S4_CUES = {
  vo: S4_L.starts,
  riser: [S4_L.starts[0], SHRINK],
  shrink: SHRINK,
  height: Math.max(cueAt(S4_L, 1, 'forty-nine'), SHRINK + 26),
  knee: cueAt(S4_L, 1, 'About knee'),
  weight: S4_L.starts[2],
  milk: cueAt(S4_L, 2, 'Less than'),
};

const PX = 3.5; // px per cm
const FLOOR = 950;
const ROBOT_CM = 49.7;

export const S4Catch: React.FC = () => {
  const f = useCurrentFrame();
  const t = iio(f, [SHRINK, SHRINK + 26], [0, 1], EASE.inOut);
  const robotH = iio(t, [0, 1], [600, ROBOT_CM * PX]);
  const robotX = iio(t, [0, 1], [1100, 830]);
  const scale = iio(f, [SHRINK + 6, SHRINK + 26], [0, 1], EASE.out);
  const label = useSlap(S4_CUES.height, 12);
  const weight = useSlap(S4_CUES.weight, 14);
  const lineY = FLOOR - ROBOT_CM * PX;
  return (
    <Scene dur={S4_DUR}>
      <AbsoluteFill>
        <Headline size={96} style={{ position: 'absolute', top: 150, left: 110, ...rise(f, S4_L.starts[0], 30) }}>
          Here's the catch.
        </Headline>
        <div style={{ position: 'absolute', left: 300, top: FLOOR - 180 * PX, opacity: scale }}>
          <Ruler cm={180} pxPerCm={PX} />
        </div>
        <div style={{ position: 'absolute', left: 470, top: FLOOR - 175 * PX, opacity: scale }}>
          <PersonFigure height={175 * PX} />
        </div>
        <div style={{ position: 'absolute', left: 300, right: 860, top: FLOOR, height: 3, background: C.ink, opacity: scale }} />
        <div
          style={{
            position: 'absolute',
            left: 425,
            width: iio(f, [S4_CUES.height, S4_CUES.height + 14], [0, 520]),
            top: lineY,
            borderTop: `3px dashed ${C.pen}`,
          }}
        />
        <div style={{ position: 'absolute', left: robotX, top: FLOOR - robotH * 1.3, height: robotH * 1.3, lineHeight: 0 }}>
          <RobotFigure height={robotH} />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 640,
            top: lineY - 150,
            font: `800 84px/1 ${F.display}`,
            letterSpacing: '-0.02em',
            color: C.pen,
            opacity: Math.min(1, label * 1.4),
            transform: `scale(${1.4 - 0.4 * label})`,
            transformOrigin: 'left bottom',
          }}
        >
          49.7 cm
        </div>
        <span style={{ position: 'absolute', left: 642, top: lineY - 62, font: `600 34px/1 ${F.body}`, color: C.ink, ...rise(f, S4_CUES.knee, 10) }}>
          About knee high
        </span>
        <div
          style={{
            position: 'absolute',
            left: 1180,
            top: 380,
            width: 630,
            background: C.sheet,
            border: `2px solid ${C.rule}`,
            borderRadius: 16,
            padding: '34px 40px',
            filter: CUTOUT_SHADOW,
            opacity: Math.min(1, weight * 1.4),
            transform: `rotate(1.5deg) translateY(${(1 - weight) * 40}px)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 26,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
            <RobotFigure height={78} style={{ filter: 'none' }} />
            <span style={{ font: `800 72px/1 ${F.display}`, color: C.ink }}>2.8 kg</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 26, ...rise(f, S4_CUES.milk, 12) }}>
            <IconMilk size={96} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ font: `600 40px/1 ${F.body}`, color: C.ink }}>A gallon of milk</span>
              <span style={{ font: `400 32px/1 ${F.mono}`, color: C.muted }}>about 3.9 kg</span>
            </div>
          </div>
        </div>
        <span style={{ position: 'absolute', left: 300, top: FLOOR + 22, font: `400 20px/1 ${F.mono}`, color: C.muted, opacity: scale }}>
          Diagrams, drawn to scale: a 175 cm adult and a 49.7 cm robot
        </span>
        <SourceTag at={S4_CUES.height} style={{ position: 'absolute', right: 110, bottom: 70 }}>
          Product page, via Unite.AI and humanoid.guide
        </SourceTag>
      </AbsoluteFill>
    </Scene>
  );
};
