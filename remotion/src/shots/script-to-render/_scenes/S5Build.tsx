import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, iio, rise, typed, Scene, Eyebrow, Headline, Terminal } from '../../../lib/rda';

// =============================================================================
// S5 · Steps 4 and 5, design and build (6s). Left: the palette and type from
// docs/style-bible.md, as the kit (lib/rda.tsx) defines them. Right: the real
// listing of this video's _scenes/ folder (COLUMNS=44 ls, run 2026-10-18).
// =============================================================================
export const S5_DUR = 180;
export const S5_CUES = { in: 0, rail: [10, 18], swatches: 20, type: [50, 66], listing: 70 };

const SWATCHES: Array<[string, string]> = [
  ['paper', C.paper],
  ['ink', C.ink],
  ['form', C.form],
  ['pen', C.pen],
  ['pass', C.pass],
];
const CMD = '$ ls _scenes/';
const LISTING = `S10Outro.tsx  S4Plan.tsx     S8Thumb.tsx
S1Open.tsx    S5Build.tsx    S9Show.tsx
S2Brief.tsx   S6Stills.tsx
S3Script.tsx  S7Measure.tsx`;

export const S5Build: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <Scene dur={S5_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow style={rise(f, 6)}>Steps 4 and 5 · Design, then build</Eyebrow>
          <Headline style={rise(f, 12)}>One kit. One file per scene.</Headline>
        </div>

        <div style={{ position: 'absolute', top: 350, left: 110, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', gap: 18, ...rise(f, S5_CUES.swatches) }}>
            {SWATCHES.map(([name, hex]) => (
              <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 150 }}>
                <div style={{ height: 90, borderRadius: 12, background: hex, border: `2px solid ${C.rule}` }} />
                <span style={{ font: `600 22px/1 ${F.mono}`, color: C.ink }}>{name}</span>
              </div>
            ))}
          </div>
          <span style={{ font: `800 52px/1.1 ${F.display}`, letterSpacing: '-0.02em', color: C.ink, marginTop: 14, ...rise(f, 36) }}>Bricolage Grotesque</span>
          <span style={{ font: `400 40px/1.1 ${F.body}`, color: C.ink, ...rise(f, 42) }}>Source Sans 3</span>
          <span style={{ font: `600 32px/1.1 ${F.mono}`, color: C.form, ...rise(f, 48) }}>IBM Plex Mono</span>
        </div>

        <Terminal width={790} title="remotion/src/shots/script-to-render" style={{ position: 'absolute', top: 350, left: 1020, ...rise(f, 30) }}>
          <div style={{ color: C.termDim }}>{typed(f, CMD, S5_CUES.type[0], S5_CUES.type[1]) || ' '}</div>
          <div style={{ opacity: iio(f, [S5_CUES.listing, S5_CUES.listing + 6], [0, 1]) }}>{LISTING}</div>
        </Terminal>
      </AbsoluteFill>
    </Scene>
  );
};
