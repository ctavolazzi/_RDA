import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, iio, rise, Scene, Eyebrow, Headline } from '../../../lib/rda';

// =============================================================================
// S3 · Step 2, the script (6s). The sheet shows the first lines of this video's
// own script file, exactly as written in videos/script-to-render/script/script.md.
// =============================================================================
export const S3_DUR = 180;
export const S3_CUES = { in: 0, rail: [10], vo: 12, card: 20, lines: [34, 44, 54, 64, 74] };

const PATH = 'videos/script-to-render/script/script.md';
const LINES: Array<{ text: string; head?: boolean }> = [
  { text: '### S1 Open (5 s)', head: true },
  { text: 'On screen:' },
  { text: '- Claude Code made this video.' },
  { text: '- Here is every step.' },
  { text: '- With receipts.' },
];

export const S3Script: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Scene dur={S3_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow style={rise(f, 6)}>Step 2 · Script</Eyebrow>
          <Headline style={rise(f, 12)}>Words before code.</Headline>
        </div>

        <div
          style={{
            position: 'absolute',
            top: 340,
            left: 110,
            width: 1010,
            background: C.sheet,
            border: `2px solid ${C.rule}`,
            borderRadius: 14,
            padding: '28px 40px 34px',
            boxShadow: '0 18px 48px rgba(20, 30, 25, 0.10)',
            ...rise(f, S3_CUES.card, 30),
          }}
        >
          <div style={{ font: `400 22px/1 ${F.mono}`, color: C.muted, paddingBottom: 18, marginBottom: 20, borderBottom: `2px solid ${C.rule}` }}>
            {PATH}
          </div>
          {LINES.map((line, i) => (
            <div
              key={line.text}
              style={{
                font: `${line.head ? 600 : 400} 32px/1.6 ${F.mono}`,
                color: line.head ? C.form : C.ink,
                whiteSpace: 'pre',
                opacity: iio(f, [S3_CUES.lines[i], S3_CUES.lines[i] + 6], [0, 1]),
              }}
            >
              {line.text}
            </div>
          ))}
        </div>

        <p style={{ position: 'absolute', top: 380, left: 1190, width: 620, margin: 0, font: `400 44px/1.3 ${F.body}`, color: C.ink, ...rise(f, 90) }}>
          Every line you read was written here first.
        </p>
      </AbsoluteFill>
    </Scene>
  );
};
