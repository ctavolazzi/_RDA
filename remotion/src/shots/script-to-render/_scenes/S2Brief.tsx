import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, iio, rise, typed, Scene, Eyebrow, Headline, Terminal } from '../../../lib/rda';

// =============================================================================
// S2 · Steps 0 and 1, orient and brief (7s). The idea gets parked, then the
// environment check that decided the format: no .env, so no voice key, so the
// narrator is a free voice run locally (Kokoro, tools/narrate.py; mixes 1 and 2
// were text-led). Both outputs are the real ones from 2026-10-18.
// =============================================================================
export const S2_DUR = 210;
export const S2_CUES = { in: 0, rail: [10, 18], vo: 12, type1: [20, 80], out1: 84, type2: [92, 110], out2: 114, chips: 132 };

const CMD1 = '$ rda idea "A video that shows how it was made: …"';
const CMD2 = '$ ls .env';
const CHIPS = ['60 s', '1920x1080', '30 fps', 'free voice'];

export const S2Brief: React.FC = () => {
  const f = useCurrentFrame();
  const show = (at: number) => ({ opacity: iio(f, [at, at + 6], [0, 1]) });

  return (
    <Scene dur={S2_DUR}>
      <AbsoluteFill>
        <div style={{ position: 'absolute', top: 150, left: 110, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Eyebrow style={rise(f, 6)}>Steps 0 and 1 · Orient, then brief</Eyebrow>
          <Headline style={rise(f, 12)}>Check what you have.</Headline>
        </div>

        <Terminal width={1010} title="python tools/rda.py" style={{ position: 'absolute', top: 340, left: 110, ...rise(f, 14) }}>
          <div style={{ color: C.termDim }}>{typed(f, CMD1, S2_CUES.type1[0], S2_CUES.type1[1]) || ' '}</div>
          <div style={show(S2_CUES.out1)}>parked in docs/ideas.md</div>
          <div style={{ color: C.termDim, marginTop: 14 }}>{typed(f, CMD2, S2_CUES.type2[0], S2_CUES.type2[1]) || ' '}</div>
          <div style={{ color: '#e06c5a', ...show(S2_CUES.out2) }}>ls: cannot access '.env': No such file or directory</div>
        </Terminal>

        <div style={{ position: 'absolute', top: 360, left: 1190, width: 620, display: 'flex', flexDirection: 'column', gap: 30 }}>
          <p style={{ margin: 0, font: `400 44px/1.3 ${F.body}`, color: C.ink, ...rise(f, 120) }}>
            No voice key here, so the voice is free and local.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {CHIPS.map((chip, i) => (
              <span
                key={chip}
                style={{
                  font: `600 24px/1 ${F.mono}`,
                  color: C.form,
                  background: C.formSoft,
                  border: `2px solid ${C.form}`,
                  borderRadius: 999,
                  padding: '8px 14px',
                  ...rise(f, S2_CUES.chips + i * 4, 12),
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </AbsoluteFill>
    </Scene>
  );
};
