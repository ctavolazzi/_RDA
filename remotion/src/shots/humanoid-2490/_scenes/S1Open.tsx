import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { C, F, rise, Scene, Eyebrow } from '../../../lib/rda';
import { Drift, HeadlineStrip, PenPath, PriceTag, circlePath, underlinePath } from '../../../lib/news';
import { cueAt, layout } from '../_layout';

// =============================================================================
// S1 · Cold open. A card says "Humanoid robot", the price tag slaps on, the red
// pen circles it. Three real headlines (exact titles, outlets named) arrive as
// cutouts, and each one's price gets underlined: every headline led with it.
// =============================================================================
export const S1_L = layout(1);
const TAG = cueAt(S1_L, 0, 'for under');
const STRIPS = [0, 1, 2].map((i) => S1_L.starts[1] + i * 14);
const UNDER = cueAt(S1_L, 1, 'led with');
export const S1_DUR = S1_L.dur;
export const S1_CUES = { vo: S1_L.starts, card: 4, tag: TAG, circle: TAG + 16, strips: STRIPS, underline: UNDER };

const Price: React.FC<{ at: number }> = ({ at }) => (
  <span style={{ position: 'relative', display: 'inline-block' }}>
    $2,490
    <PenPath d={underlinePath(118)} at={at} w={118} h={20} width={5} style={{ left: 0, bottom: -14 }} />
  </span>
);

const HEADLINES: Array<{ outlet: string; title: (at: number) => React.ReactNode }> = [
  { outlet: 'TNW', title: (at) => <>Faraday Future unveils a <Price at={at} /> humanoid robot for developers and schools</> },
  { outlet: 'Runtime Wire', title: (at) => <>FFR prices Nova at <Price at={at} /> and caps its first run at 100 robots</> },
  { outlet: 'StreetInsider', title: (at) => <>FF EAI Robotics launches humanoid robot at <Price at={at} />, acquires FF assets</> },
];

export const S1Open: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene dur={S1_DUR}>
      <Drift dur={S1_DUR}>
        <AbsoluteFill>
          <div style={{ position: 'absolute', top: 330, left: 110, width: 720, ...rise(f, S1_CUES.card, 30) }}>
            <div style={{ background: C.sheet, border: `2px solid ${C.rule}`, borderRadius: 16, padding: '56px 56px 150px', boxShadow: '0 18px 48px rgba(20, 30, 25, 0.10)' }}>
              <Eyebrow>For sale</Eyebrow>
              <div style={{ font: `800 112px/1.02 ${F.display}`, letterSpacing: '-0.03em', color: C.ink, marginTop: 22 }}>Humanoid robot</div>
            </div>
            <div style={{ position: 'absolute', left: 230, bottom: -46 }}>
              <PriceTag text="$2,490" at={S1_CUES.tag} size={104} />
              <PenPath d={circlePath(470, 190)} at={S1_CUES.circle} w={470} h={190} style={{ left: -30, top: -26 }} />
            </div>
          </div>
          {HEADLINES.map((h, i) => (
            <HeadlineStrip
              key={h.outlet}
              outlet={h.outlet}
              title={h.title(S1_CUES.underline + i * 6)}
              at={S1_CUES.strips[i]}
              tilt={[-2, 1.5, -1][i]}
              width={860}
              style={{ position: 'absolute', left: 960, top: 250 + i * 215 }}
            />
          ))}
        </AbsoluteFill>
      </Drift>
    </Scene>
  );
};
