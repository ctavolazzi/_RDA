import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, iio, rise, Scene, Eyebrow, Headline, Stamp } from '../../../lib/rda';
import receipt from '../_receipt.json';

// =============================================================================
// S7 · Steps 7 and 8, render and measure (8s). A receipt with this video's own
// numbers. They are measured on the first full render and written to
// _receipt.json; the second render adds them to the screen and changes nothing
// else (checked frame by frame outside this scene).
// =============================================================================
export const S7_DUR = 240;
export const S7_CUES = { rail: [10, 18], rows: [0, 1, 2, 3, 4, 5, 6].map((i) => 40 + i * 14), stamp: 150 };

const v = (x: number | null, fmt: (n: number) => string) => (x === null ? 'pending' : fmt(x));
const ROWS: Array<[string, string]> = [
  ['Render exit code', v(receipt.exitCode, (n) => String(n))],
  ['Frames, counted by ffprobe', v(receipt.frames, (n) => String(n))],
  ['Length, ffprobe', v(receipt.seconds, (n) => `${n.toFixed(1)} s`)],
  ['Loudness as rendered, ebur128', v(receipt.lufsRendered, (n) => `${n.toFixed(1)} LUFS`)],
  ['Loudness mastered, master_audio.py', v(receipt.lufsMastered, (n) => `${n.toFixed(1)} LUFS`)],
  ['True peak mastered', v(receipt.truePeakMastered, (n) => `${n.toFixed(1)} dBTP`)],
  ['Render time, wall clock', v(receipt.renderSeconds, (n) => `${Math.round(n)} s`)],
];

export const S7Measure: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Scene dur={S7_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow style={rise(f, 6)}>Steps 7 and 8 · Render, then measure</Eyebrow>
          <Headline style={rise(f, 12)}>Nothing counts until it is measured.</Headline>
        </div>

        <p style={{ position: 'absolute', top: 336, left: 110, margin: 0, font: `600 22px/1 ${F.mono}`, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, ...rise(f, 20) }}>
          Measured on this video's first render
        </p>

        <div
          style={{
            position: 'absolute',
            top: 376,
            left: 110,
            width: 1150,
            background: C.sheet,
            border: `2px solid ${C.rule}`,
            borderRadius: 14,
            padding: '22px 44px',
            boxShadow: '0 18px 48px rgba(20, 30, 25, 0.10)',
            ...rise(f, 26, 30),
          }}
        >
          {ROWS.map(([label, value], i) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                padding: '9px 0',
                borderBottom: i < ROWS.length - 1 ? `2px dashed ${C.rule}` : undefined,
                opacity: iio(f, [S7_CUES.rows[i], S7_CUES.rows[i] + 6], [0, 1]),
              }}
            >
              <span style={{ font: `400 32px/1.2 ${F.body}`, color: C.ink }}>{label}</span>
              <span style={{ font: `600 32px/1.2 ${F.mono}`, color: C.ink }}>{value}</span>
            </div>
          ))}
        </div>

        <Stamp at={S7_CUES.stamp} text="Measured" size={72} style={{ position: 'absolute', top: 520, left: 1320 }} />

        <p style={{ position: 'absolute', top: 884, left: 110, margin: 0, font: `600 22px/1 ${F.mono}`, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, ...rise(f, 170) }}>
          This render only added these numbers
        </p>
      </AbsoluteFill>
    </Scene>
  );
};
