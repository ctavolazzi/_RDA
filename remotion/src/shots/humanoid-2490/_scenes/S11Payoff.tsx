import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, EASE, iio, rise, Scene } from '../../../lib/rda';
import { Check, PenPath, RobotFigure, underlinePath } from '../../../lib/news';
import { layout } from '../_layout';

// =============================================================================
// S11 · Payoff. The robot from S3 tips over and gets back up once more (the
// callback), then the verdict in two lines. A long tail lets the music finish.
// =============================================================================
export const S11_L = layout(11, { tail: 75 });
export const S11_DUR = S11_L.dur;
export const S11_CUES = { vo: S11_L.starts, tip: 4, yes: S11_L.starts[0] + 6, notYet: S11_L.starts[1], underline: S11_L.starts[1] + 22, end: S11_L.ends[1] + 12 };

export const S11Payoff: React.FC = () => {
  const f = useCurrentFrame();
  const tip = iio(f, [S11_CUES.tip, S11_CUES.tip + 10, S11_CUES.tip + 20, S11_CUES.tip + 40], [0, 1, 1, 0], EASE.inOut);
  return (
    <Scene dur={S11_DUR + 8}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', left: 300, top: 330 }}>
          <RobotFigure height={420} tip={tip} />
        </div>
        <div style={{ position: 'absolute', left: 120, top: 880, width: 620, height: 3, background: C.ink }} />
        <div style={{ position: 'absolute', left: 900, top: 300, display: 'flex', flexDirection: 'column', gap: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, ...rise(f, S11_CUES.yes - 6, 16) }}>
            <span style={{ font: `800 100px/1 ${F.display}`, letterSpacing: '-0.03em', color: C.ink }}>Cheap: yes.</span>
            <Check at={S11_CUES.yes} size={80} />
          </div>
          <div style={{ position: 'relative', ...rise(f, S11_CUES.notYet, 16) }}>
            <div style={{ font: `800 100px/1.05 ${F.display}`, letterSpacing: '-0.03em', color: C.ink }}>Useful at home:</div>
            <span style={{ position: 'relative', display: 'inline-block', font: `800 100px/1.05 ${F.display}`, letterSpacing: '-0.03em', color: C.pen }}>
              not yet.
              <PenPath d={underlinePath(330)} at={S11_CUES.underline} w={330} h={24} width={9} style={{ left: 0, bottom: -16 }} />
            </span>
          </div>
        </div>
        <span style={{ position: 'absolute', left: 900, top: 840, font: `600 26px/1 ${F.mono}`, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, ...rise(f, S11_CUES.end) }}>
          Sources in the description
        </span>
      </AbsoluteFill>
    </Scene>
  );
};
