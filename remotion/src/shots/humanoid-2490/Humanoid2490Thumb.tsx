import React from 'react';
import { AbsoluteFill } from 'remotion';
import { F, T, useRdaFonts } from '../../lib/rda';
import { RobotFigure } from '../../lib/news';

// =============================================================================
// THUMBNAIL A · "THAT'S IT?" (style bible section 8: night ground, one signal hook
// that is not in the title, props in paper). The hero is the honest version of the
// catch: the robot diagram at its real 49.7 cm against a 180 cm ruler, both at
// 3.3 px per cm. The video delivers exactly this (S4).
// Render: cd remotion && node scripts/render-one.mjs humanoid-2490 Humanoid2490Thumb --still 0 --scale=1
// =============================================================================
export const compositionConfig = {
  id: 'Humanoid2490Thumb',
  durationInSeconds: 1,
  fps: 30,
  width: 1280,
  height: 720,
};

const PX = 3.3;
const FLOOR = 668;
const RULER_X = 150;

const Humanoid2490Thumb: React.FC = () => {
  useRdaFonts();
  const ticks = [];
  for (let c = 0; c <= 180; c += 10) {
    const major = c % 50 === 0;
    ticks.push(
      <div key={c} style={{ position: 'absolute', left: RULER_X - (major ? 40 : 20), top: FLOOR - c * PX - 2, width: major ? 40 : 20, height: 4, background: T.paper }}>
        {major ? <span style={{ position: 'absolute', right: 52, top: -15, font: `600 28px/1 ${F.mono}`, color: T.paper }}>{c}</span> : null}
      </div>,
    );
  }
  const line = FLOOR - 49.7 * PX;
  return (
    <AbsoluteFill style={{ backgroundColor: T.night }}>
      <div style={{ position: 'absolute', left: RULER_X, top: FLOOR - 180 * PX, width: 5, height: 180 * PX, background: T.paper }} />
      {ticks}
      <div style={{ position: 'absolute', left: RULER_X, top: FLOOR, width: 430, height: 5, background: T.paper }} />
      <div style={{ position: 'absolute', left: RULER_X + 10, top: line - 2, width: 400, borderTop: `5px dashed ${T.flare}` }} />
      <span style={{ position: 'absolute', left: RULER_X + 190, top: line - 70, font: `800 52px/1 ${F.display}`, color: T.flare }}>49.7 cm</span>
      <div style={{ position: 'absolute', left: RULER_X + 40, top: FLOOR - 49.7 * PX * 1.3, height: 49.7 * PX * 1.3, lineHeight: 0 }}>
        <RobotFigure height={49.7 * PX} style={{ filter: 'drop-shadow(0 0 18px rgba(62, 224, 138, 0.35))' }} />
      </div>
      <div style={{ position: 'absolute', left: 640, top: 96, display: 'flex', flexDirection: 'column' }}>
        <span style={{ font: `800 200px/0.92 ${F.display}`, letterSpacing: '-0.04em', color: T.signal }}>THAT'S</span>
        <span style={{ font: `800 200px/0.92 ${F.display}`, letterSpacing: '-0.04em', color: T.signal }}>
          IT<span style={{ color: T.flare }}>?</span>
        </span>
      </div>
    </AbsoluteFill>
  );
};

export default Humanoid2490Thumb;
