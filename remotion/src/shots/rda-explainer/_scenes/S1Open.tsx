import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { C, F, EASE, iio, rise, Scene } from '../../../lib/rda';

// =============================================================================
// S1 · Cold open (6s). Three short lines state the format, then the title lands
// like a grading stamp.
// =============================================================================
export const S1_DUR = 180;

const LINES = ['Learn a field from zero.', 'Take the real exam.', 'Live with the result.'];
const UNDERLINE = 'M 0 10 C 90 2, 190 16, 286 6';

export const S1Open: React.FC = () => {
  const f = useCurrentFrame();
  const linesOut = iio(f, [100, 112], [1, 0], EASE.inOut);
  const pen = evolvePath(iio(f, [78, 94], [0, 1], EASE.out), UNDERLINE);

  const titleT = iio(f, [110, 119], [0, 1], EASE.out);

  return (
    <Scene dur={S1_DUR}>
      <AbsoluteFill style={{ padding: '0 110px', justifyContent: 'center', opacity: linesOut }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          {LINES.map((line, i) => (
            <h1 key={line} style={{ margin: 0, font: `800 104px/1.05 ${F.display}`, letterSpacing: '-0.025em', color: C.ink, ...rise(f, 10 + i * 26, 30) }}>
              {i === 2 ? (
                <span style={{ position: 'relative', display: 'inline-block' }}>
                  {line}
                  <svg width={296} height={24} viewBox="0 0 296 24" style={{ position: 'absolute', left: 562, bottom: -18 }}>
                    <path d={UNDERLINE} fill="none" stroke={C.pen} strokeWidth={7} strokeLinecap="round" strokeDasharray={pen.strokeDasharray} strokeDashoffset={pen.strokeDashoffset} />
                  </svg>
                </span>
              ) : (
                line
              )}
            </h1>
          ))}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: titleT }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              font: `800 300px/0.9 ${F.display}`,
              letterSpacing: '-0.03em',
              color: C.form,
              transform: `rotate(${iio(f, [110, 119], [-6, -2], EASE.out)}deg) scale(${iio(f, [110, 119], [1.5, 1], EASE.out)})`,
            }}
          >
            RDA
          </div>
          <p style={{ margin: 0, font: `700 58px/1.1 ${F.display}`, color: C.ink, ...rise(f, 124) }}>Rapid Domain Acquisition</p>
          <p style={{ margin: 0, font: `400 30px/1.2 ${F.mono}`, color: C.muted, ...rise(f, 136) }}>a video series, and the tool that runs it</p>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
