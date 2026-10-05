import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Img } from 'remotion';
import { Box, X, ArrowRight } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP, lib } from '../../lib/kit';

// =============================================================================
// 5.4/5.5 — v2: reveal the example gallery ON "some more examples", not before
// (P1/P2). Master span 134.5–151.7. Cues (master s -> local f @ start 134.5):
//   Three.js concept (already being said)      -> chip early (f10)
//   "still we are not using any AI models here" 142.60 -> f243 (callout)
//   "and you can see here some more examples"   146.48 -> f359 (gallery reveals)
//   "it's really awesome"                       150.91 -> f492 (hold)
// =============================================================================
export const compositionConfig = { id: 'Level2Gallery', durationInSeconds: 17.5, fps: 30, width: 1920, height: 1080 };

const TILES = ['projects/example/examples/rocket.webp', 'projects/example/examples/l2_headphones.png', 'projects/example/examples/l2_tree.webp', 'projects/example/examples/l2_crystal.png'];
const CALLOUT = 243;
const GALLERY = 359;

const Level2Gallery: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  const r = (a: number, b: number, from = 0, to = 1, e = EASINGS.easeOut) => interpolate(frame, [a, b], [from, to], { ...CLAMP, easing: e });

  // gallery progress drives the concept block sliding up to make room
  const g = r(GALLERY, GALLERY + 22, 0, 1, EASINGS.easeInOut);
  const conceptY = interpolate(g, [0, 1], [340, 150]);

  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent2} />

      {/* ---- concept block (slides up when gallery reveals) ---- */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: conceptY, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 3, color: COLORS.accent2, marginBottom: 16 }}>LEVEL&nbsp;2&nbsp;·&nbsp;3D&nbsp;RENDERS</div>
        <h1 style={{ ...rise(10), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 76, color: COLORS.ink, margin: 0, marginBottom: 22 }}>3D renders, straight from code</h1>

        {/* tech chip: Three.js */}
        <div style={{ ...rise(18, 12), display: 'flex', alignItems: 'center', gap: 12, background: COLORS.ink, color: COLORS.paper, borderRadius: RADIUS.pill, padding: '12px 24px' }}>
          <Box size={24} color={COLORS.signalAlt} strokeWidth={2.2} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 26 }}>powered by Three.js</span>
        </div>

        {/* "still no AI models" callout — on its cue (f243) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginTop: 26,
          background: `${COLORS.danger}14`, border: `1px solid ${COLORS.danger}44`, borderRadius: RADIUS.pill, padding: '14px 28px',
          opacity: r(CALLOUT, CALLOUT + 14),
          transform: `translateY(${r(CALLOUT, CALLOUT + 14, 20, 0)}px)`,
        }}>
          <X size={24} color={COLORS.danger} strokeWidth={3} />
          <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: 30, color: COLORS.ink }}>Still no AI image models</span>
        </div>
      </div>

      {/* ---- example gallery — reveals on "some more examples" (f359) ---- */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: g }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, fontFamily: FONT_MONO, fontSize: 24, letterSpacing: 2, color: COLORS.muted }}>
          MORE&nbsp;EXAMPLES <ArrowRight size={22} color={COLORS.muted} strokeWidth={2.2} />
        </div>
        <div style={{ display: 'flex', gap: 24 }}>
          {TILES.map((t, i) => {
            const start = GALLERY + 10 + i * 9;
            const op = interpolate(frame, [start, start + 16], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [start, start + 16], [30, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const sc = interpolate(frame, [start, start + 16], [0.94, 1], { ...CLAMP, easing: EASINGS.easeOut });
            return (
              <div key={t} style={{ width: 360, height: 360, borderRadius: RADIUS.card, overflow: 'hidden', border: `1px solid ${COLORS.line}`, boxShadow: SHADOW.card, opacity: op, transform: `translateY(${y}px) scale(${sc})`, background: COLORS.cream }}>
                <Img src={lib(t)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default Level2Gallery;
