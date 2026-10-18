import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { evolvePath } from '@remotion/paths';
import { C, F, EASE, iio, rise, Scene, Eyebrow } from '../../../lib/rda';

// =============================================================================
// S1 · Open (5s). Three lines say what this is; the red pen underlines
// "receipts", because every later scene shows one. The step rail appears at
// S1_CUES.rail (drawn by the composition).
// =============================================================================
export const S1_DUR = 150;
export const S1_CUES = { underline: 84, rail: 100 };

const LINES = ['Claude Code made this video.', 'Here is every step.'];
const UNDERLINE = 'M 0 10 C 90 2, 190 16, 286 6';

export const S1Open: React.FC = () => {
  const f = useCurrentFrame();
  const pen = evolvePath(iio(f, [S1_CUES.underline, S1_CUES.underline + 16], [0, 1], EASE.out), UNDERLINE);
  const line = { margin: 0, font: `800 104px/1.05 ${F.display}`, letterSpacing: '-0.025em', color: C.ink } as const;

  return (
    <Scene dur={S1_DUR}>
      <AbsoluteFill style={{ padding: '0 110px 140px', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <Eyebrow style={rise(f, 4)}>How this video was made</Eyebrow>
          {LINES.map((text, i) => (
            <h1 key={text} style={{ ...line, ...rise(f, 10 + i * 24, 30) }}>
              {text}
            </h1>
          ))}
          <h1 style={{ ...line, ...rise(f, 58, 30) }}>
            With{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              receipts
              <svg
                viewBox="0 0 296 24"
                preserveAspectRatio="none"
                style={{ position: 'absolute', left: 0, bottom: -16, width: '100%', height: 24, overflow: 'visible' }}
              >
                <path
                  d={UNDERLINE}
                  fill="none"
                  stroke={C.pen}
                  strokeWidth={7}
                  strokeLinecap="round"
                  strokeDasharray={pen.strokeDasharray}
                  strokeDashoffset={pen.strokeDashoffset}
                />
              </svg>
            </span>
            .
          </h1>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
