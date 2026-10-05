import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, EASE, iio, rise, Scene, Eyebrow, Headline } from '../_kit';

// =============================================================================
// S2 · The format (12s). The five-phase bar, drawn to scale over 10:00, then
// three highlights walk through what each stretch is for.
// =============================================================================
export const S2_DUR = 360;

const BAR_W = 1700;
const UNITS = 600; // seconds on the bar: 0:00 to ~10:00
const px = (s: number) => (s / UNITS) * BAR_W;

const SEGS = [
  { id: 'B1', s: 45, label: '' },
  { id: 'B2', s: 30, label: '' },
  { id: 'B3', s: 45, label: '' },
  { id: 'B4', s: 360, label: 'Debrief' },
  { id: 'B5', s: 120, label: 'Sponsor + next' },
];
const TICKS: Array<[number, string]> = [
  [0, '0:00'],
  [120, '2:00'],
  [300, '5:00'],
  [480, '8:00'],
  [600, '~10:00'],
];

// highlight phases: [start frame, end frame, from second, to second, caption, segments lit]
const PHASES: Array<{ a: number; b: number; from: number; to: number; text: string; lit: number[] }> = [
  { a: 150, b: 225, from: 0, to: 120, text: 'First two minutes: the exam, the stakes, the score.', lit: [0, 1, 2] },
  { a: 225, b: 295, from: 120, to: 480, text: 'Then six minutes on what the exam actually tested.', lit: [3] },
  { a: 295, b: 9999, from: 480, to: 600, text: 'Then the sponsor, and a hint of the next field.', lit: [4] },
];

const win = (f: number, a: number, b: number) => Math.min(iio(f, [a, a + 8], [0, 1]), iio(f, [b, b + 8], [1, 0]));

export const S2Format: React.FC = () => {
  const f = useCurrentFrame();

  const bracketLeft = px(iio(f, [150, 225, 235, 295, 305], [0, 0, 120, 120, 480], EASE.inOut));
  const bracketRight = px(iio(f, [150, 225, 235, 295, 305], [120, 120, 480, 480, 600], EASE.inOut));
  const bracketOn = iio(f, [146, 156], [0, 1]);

  let x = 0;
  return (
    <Scene dur={S2_DUR}>
      <AbsoluteFill style={{ padding: '0 110px' }}>
        <div style={{ position: 'absolute', top: 170, left: 110, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Eyebrow style={rise(f, 6)}>The format</Eyebrow>
          <Headline style={rise(f, 12)}>Every episode runs the same five phases.</Headline>
        </div>

        {/* highlight bracket above the bar */}
        <div
          style={{
            position: 'absolute',
            top: 432,
            left: 110 + bracketLeft,
            width: bracketRight - bracketLeft,
            height: 10,
            background: C.form,
            borderRadius: 5,
            opacity: bracketOn,
          }}
        />

        {/* the bar */}
        <div
          style={{
            position: 'absolute',
            top: 460,
            left: 110,
            width: BAR_W,
            height: 130,
            border: `3px solid ${C.ink}`,
            background: C.sheet,
            opacity: iio(f, [26, 36], [0, 1]),
          }}
        >
          {SEGS.map((seg, i) => {
            const left = px(x);
            x += seg.s;
            const at = 40 + i * 16;
            const lit = Math.max(0, ...PHASES.map((p) => (p.lit.includes(i) ? win(f, p.a, p.b) : 0)));
            return (
              <div
                key={seg.id}
                style={{
                  position: 'absolute',
                  left,
                  top: 0,
                  width: px(seg.s),
                  height: '100%',
                  borderRight: i < SEGS.length - 1 ? `3px solid ${C.ink}` : undefined,
                  background: lit > 0 ? `rgba(29, 107, 88, ${0.16 * lit})` : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '0 14px 14px',
                  boxSizing: 'border-box',
                  transformOrigin: 'left center',
                  transform: `scaleX(${iio(f, [at, at + 12], [0, 1], EASE.out)})`,
                }}
              >
                <span style={{ font: `600 30px/1 ${F.mono}`, color: C.form }}>{seg.id}</span>
                {seg.label ? <span style={{ font: `700 34px/1.1 ${F.display}`, color: C.ink, marginTop: 8 }}>{seg.label}</span> : null}
              </div>
            );
          })}
        </div>

        {/* axis */}
        {TICKS.map(([s, label], i) => (
          <span
            key={label}
            style={{
              position: 'absolute',
              top: 610,
              left: 110 + px(s),
              transform: `translateX(${i === 0 ? 0 : i === TICKS.length - 1 ? -100 : -50}%)`,
              font: `400 26px/1 ${F.mono}`,
              color: C.muted,
              opacity: iio(f, [120, 132], [0, 1]),
            }}
          >
            {label}
          </span>
        ))}

        {/* captions, one per phase */}
        {PHASES.map((p) => (
          <p
            key={p.text}
            style={{
              position: 'absolute',
              top: 720,
              left: 110,
              right: 110,
              margin: 0,
              font: `700 60px/1.15 ${F.display}`,
              letterSpacing: '-0.01em',
              color: C.ink,
              opacity: win(f, p.a, p.b),
              transform: `translateY(${iio(f, [p.a, p.a + 10], [16, 0], EASE.out)}px)`,
            }}
          >
            {p.text}
          </p>
        ))}
      </AbsoluteFill>
    </Scene>
  );
};
