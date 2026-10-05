import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, EASE, iio, rise, typed, Scene, Eyebrow, Headline, Terminal, Stamp } from '../_kit';

// =============================================================================
// S5 · The tool (12s). Part A: `rda status` ticks through the checklist and
// names the next step. Part B: `rda score` lands the result. Numbers are the
// dry run's sample exam, and the card says so.
// =============================================================================
export const S5_DUR = 360;

type Line = { text: string; kind: 'head' | 'done' | 'open' | 'blank' | 'next' };
const LINES: Line[] = [
  { text: '001-nursing-entrance', kind: 'head' },
  { text: 'exam card filled', kind: 'done' },
  { text: 'exam frozen and intact', kind: 'done' },
  { text: 'clock started', kind: 'done' },
  { text: 'test finished', kind: 'done' },
  { text: 'scored: 8 of 10, PASS', kind: 'done' },
  { text: 'payoff filmed', kind: 'open' },
  { text: 'script written', kind: 'open' },
  { text: '', kind: 'blank' },
  { text: 'next: film the payoff b-roll', kind: 'next' },
];
export const S5_LINE_AT = (i: number) => 40 + i * 12;
export const S5_STAMP = 290;
const SWAP = 192;

const TALLY: Array<[string, number, number]> = [
  ['Math', 5, 5],
  ['Reading', 3, 5],
];

export const S5Tool: React.FC = () => {
  const f = useCurrentFrame();
  const aOut = iio(f, [SWAP - 8, SWAP], [1, 0]);
  const bIn = iio(f, [SWAP, SWAP + 8], [0, 1]);

  return (
    <Scene dur={S5_DUR}>
      {/* ── Part A: status ───────────────────────────────────────────── */}
      <AbsoluteFill style={{ opacity: aOut }}>
        <Terminal width={980} title="python tools/rda.py status" style={{ position: 'absolute', top: 170, left: 110, ...rise(f, 4) }}>
          <div style={{ color: C.termDim }}>{typed(f, '$ rda status', 10, 30) || ' '}</div>
          {LINES.map((line, i) => {
            const at = S5_LINE_AT(i);
            const o = iio(f, [at, at + 6], [0, 1]);
            if (line.kind === 'blank') return <div key={i}>{' '}</div>;
            if (line.kind === 'head') return <div key={i} style={{ opacity: o, fontWeight: 600 }}>{line.text}</div>;
            if (line.kind === 'next')
              return (
                <div key={i} style={{ opacity: o, color: '#5fcf8c', fontWeight: 600, background: `rgba(95, 207, 140, ${0.16 * iio(f, [150, 160], [0, 1])})`, borderRadius: 6, margin: '0 -10px', padding: '0 10px' }}>
                  {line.text}
                </div>
              );
            const done = line.kind === 'done';
            return (
              <div key={i} style={{ opacity: o }}>
                {'  '}
                <span style={{ color: done ? '#5fcf8c' : C.termDim, fontWeight: 600 }}>{done ? '[x]' : '[ ]'}</span> {line.text}
              </div>
            );
          })}
        </Terminal>

        <div style={{ position: 'absolute', top: 260, left: 1170, width: 640, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <Eyebrow style={rise(f, 20)}>Start every session with</Eyebrow>
          <Headline size={88} style={{ fontFamily: F.mono, fontWeight: 600, letterSpacing: '-0.02em', ...rise(f, 26) }}>
            rda status
          </Headline>
          <p style={{ margin: 0, font: `400 44px/1.3 ${F.body}`, color: C.ink, ...rise(f, 46) }}>
            It reads what is on disk and names the next step, in whatever order you work.
          </p>
        </div>
      </AbsoluteFill>

      {/* ── Part B: score ────────────────────────────────────────────── */}
      <AbsoluteFill style={{ opacity: bIn, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, width: 1100, marginTop: 40 }}>
          <Eyebrow style={rise(f, SWAP + 4)}>Then, on camera: rda score</Eyebrow>
          <div
            style={{
              position: 'relative',
              background: C.sheet,
              border: `2px solid ${C.rule}`,
              borderRadius: 14,
              padding: '40px 52px',
              display: 'flex',
              flexDirection: 'column',
              gap: 26,
              boxShadow: '0 18px 48px rgba(20, 30, 25, 0.10)',
              ...rise(f, SWAP + 8, 30),
            }}
          >
            <span style={{ font: `600 22px/1 ${F.mono}`, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted }}>Sample exam from the dry run</span>
            <span style={{ font: `800 50px/1.1 ${F.display}`, color: C.ink }}>Nursing Entrance Practice</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 40, ...rise(f, SWAP + 22) }}>
              <span style={{ font: `800 150px/1 ${F.display}`, color: C.ink, letterSpacing: '-0.03em' }}>8 of 10</span>
              <span style={{ font: `600 36px/1.2 ${F.mono}`, color: C.muted }}>pass line 7 of 10</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {TALLY.map(([topic, got, of], i) => {
                const at = SWAP + 50 + i * 12;
                return (
                  <div key={topic} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 90px', alignItems: 'center', gap: 22, opacity: iio(f, [at, at + 6], [0, 1]) }}>
                    <span style={{ font: `600 32px/1 ${F.body}`, color: C.ink }}>{topic}</span>
                    <div style={{ height: 22, background: C.formSoft, borderRadius: 11, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(got / of) * 100 * iio(f, [at, at + 24], [0, 1], EASE.out)}%`, background: C.form, borderRadius: 11 }} />
                    </div>
                    <span style={{ font: `600 30px/1 ${F.mono}`, color: C.ink, textAlign: 'right' }}>
                      {got}/{of}
                    </span>
                  </div>
                );
              })}
            </div>
            <Stamp at={S5_STAMP} text="Pass" size={92} style={{ position: 'absolute', top: 34, right: 52 }} />
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
