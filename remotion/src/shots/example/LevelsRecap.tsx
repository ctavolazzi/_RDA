import React from 'react';
import { useCurrentFrame, interpolate, AbsoluteFill, Img } from 'remotion';
import { Check } from 'lucide-react';
import { COLORS, EASINGS, RADIUS, SHADOW } from '../../brand';
import { FONT_DISPLAY, FONT_BODY, FONT_MONO } from '../../fonts';
import { BrandBg, useRise, CLAMP, lib } from '../../lib/kit';

// 6.9 recap — v2: the example image inside each card, checkmark overlaid on
// top of the image (#10).
export const compositionConfig = { id: 'LevelsRecap', durationInSeconds: 6.8, fps: 30, width: 1920, height: 1080 };

const LEVELS = [
  { n: '01', title: 'Code-driven', color: COLORS.accent, img: 'projects/example/examples/level1.webp' },
  { n: '02', title: '3D · Code', color: COLORS.accent2, img: 'projects/example/examples/l2_tree.webp' },
  { n: '03', title: 'Real AI', color: COLORS.signal, img: 'projects/example/cat-astronaut.png' },
];

const LevelsRecap: React.FC = () => {
  const frame = useCurrentFrame();
  const rise = useRise();
  return (
    <AbsoluteFill style={{ fontFamily: FONT_BODY }}>
      <BrandBg glow={COLORS.accent} />
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...rise(4, 14), fontFamily: FONT_MONO, fontSize: 26, letterSpacing: 3, color: COLORS.accent, marginBottom: 20 }}>NOW&nbsp;YOU&nbsp;CAN</div>
        <h1 style={{ ...rise(10), fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 84, color: COLORS.ink, margin: 0, marginBottom: 46 }}>Generate images 3 ways</h1>

        <div style={{ display: 'flex', gap: 34 }}>
          {LEVELS.map((lv, i) => {
            const start = 30 + i * 12;
            const op = interpolate(frame, [start, start + 14], [0, 1], { ...CLAMP, easing: EASINGS.easeOut });
            const y = interpolate(frame, [start, start + 14], [26, 0], { ...CLAMP, easing: EASINGS.easeOut });
            const checkStart = 80 + i * 14;
            const checkScale = interpolate(frame, [checkStart, checkStart + 14], [0, 1], { ...CLAMP, easing: EASINGS.overshoot });
            const scrimOp = interpolate(frame, [checkStart, checkStart + 12], [0, 1], { ...CLAMP });
            return (
              <div key={lv.n} style={{
                width: 420, position: 'relative', overflow: 'hidden',
                background: COLORS.paper, border: `1px solid ${COLORS.line}`,
                borderRadius: RADIUS.card, boxShadow: SHADOW.card,
                opacity: op, transform: `translateY(${y}px)`,
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: 6, width: '100%', background: lv.color, zIndex: 2 }} />
                {/* example image (contain — fits fully) with the check overlaid */}
                <div style={{ position: 'relative', height: 250, background: '#f6f1e3', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Img src={lib(lv.img)} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', inset: 0, background: `rgba(26,26,46,${0.28 * scrimOp})` }} />
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: `translate(-50%, -50%) scale(${checkScale})`,
                    width: 84, height: 84, borderRadius: '50%', background: COLORS.signal,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(26,26,46,0.35)',
                  }}>
                    <Check size={46} color="#fff" strokeWidth={3.4} />
                  </div>
                </div>
                <div style={{ padding: '22px 30px 26px' }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 22, letterSpacing: 2, color: COLORS.muted }}>LEVEL&nbsp;{lv.n}</div>
                  <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 42, color: COLORS.ink, marginTop: 4 }}>{lv.title}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          ...rise(140, 18), marginTop: 42,
          fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 44, color: '#fff',
          background: COLORS.signal, borderRadius: RADIUS.pill, padding: '14px 40px', letterSpacing: 0.5,
        }}>
          Totally for free
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
export default LevelsRecap;
